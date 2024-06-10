import ProtocolBase from "../ProtocolBase";
import {
    CreateAdapterDefaultParamsResponse,
    CreateAdapterDefaultParams,
    CreateAdapterDefaultParamsForAmm,
    CreateAdapterDefaultParamsForAmmV4,
    AdapterIdParamsResponse,
    AdapterQuotationResponse
} from "../../../models/Adapters";
import {
    CreateProtocolDefaultParams,
    CreateProtocolDefaultParamsResponse,
    InstancePoolDataV3,
    InstancePoolData
} from "../../../models/Protocols";
import { DEXSPAN_SWAP_ADAPTER_ID, BRIDGE_ADAPTER_ID } from "../../../../constant/constants";
import { service as adapterService } from "../../../adapterService/AdapterService";
import { service as PoolService } from "../../../poolDataService/PoolDataService";
import { TokenData } from "../../../models/CommonModels";
import {
    sortTokens,
    getContract,
    divideAmountToTokens,
    getTokenReverseValue,
    getTokensInBytes32,
    getTokenDecimal,
    getReserveToken,
    isTokenNativeOrWrapped
} from "../../../../utils";
import {
    ThrusterV2RouterFeePointOne,
    ThrusterV2RouterFeePointThree,
    ThrusterV3PoolFactory
} from "../../../../constant/contractMapping";
import { WrappedNativeMapping, NativTokenMapping } from "../../../../constant/contractMapping";
import ThrusterV2PoolAdapter from "../../../adapterService/Adapters/amm/thruster/v2_deposit";
import { ThrusterV3PoolFactoryAbi } from "../../../../abis/ThrusterV3PoolFactory";
import ThrusterV3PoolAdapter from "../../../adapterService/Adapters/amm/thruster/v3_deposit";
import { ThrusterV2PoolFactoryAbi } from "../../../../abis/ThrusterV2PoolFactory";
import { ThrusterV2PoolAbi } from "../../../../abis/ThrusterV2Pool";
import { ThrusterV3PoolAbi } from "../../../../abis/ThrusterV3Pool";
class ThrusterProtocol extends ProtocolBase
{
    CreateQuoteAndParams(
        data: CreateProtocolDefaultParams
    ): Promise<CreateProtocolDefaultParamsResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const protocolActions = data.action;
                let currentChain = data.sourceChain;
                let currentToken = data.srcToken;
                let currentAmount: string | number = data.amount;

                let isCrossChain = false;

                const adapterParamsQueue: Array<AdapterIdParamsResponse> = [];
                const adapterQuoteQueue: Array<AdapterQuotationResponse> = [];

                const quotationType: string = "BatchTransaction";
                let time = 0;

                const wNative = WrappedNativeMapping[Number(data.destinationChain)];
                const native = NativTokenMapping[Number(data.destinationChain)];

                let tokenA = data.destToken[0];
                let tokenB = data.destToken[1];

                let PARTNER_ID = 122;
                let pTokenA =
                    tokenA.address.toLowerCase() == native.address.toLowerCase() ? wNative : tokenA;
                let pTokenB =
                    tokenB.address.toLowerCase() == native.address.toLowerCase() ? wNative : tokenB;
                if (protocolActions == "deposit_v3")
                {
                    PARTNER_ID = 122;
                    const protocolData = data.protocolData;

                    if (tokenA.address == tokenB.address || tokenA.chainId !== tokenB.chainId)
                    {
                        throw "Destination Tokens not defined correctly";
                    }
                    const ammAdapterId = `${data.protocolId}_deposit_v3`;
                    [pTokenA, pTokenB] = await sortTokens(pTokenA, pTokenB);
                    [tokenA, tokenB] = await sortTokens(tokenA, tokenB);
                    const instancePoolParams = {
                        tokenA: pTokenA,
                        tokenB: pTokenB,
                        destChainId: data.destinationChain,
                        fee: data.protocolData.fee
                    };
                    const destReserveAsset = await getReserveToken(
                        [pTokenA, pTokenB],
                        data.destinationChain
                    );
                    if (String(data.sourceChain) !== String(data.destinationChain))
                    {
                        isCrossChain = true;
                        const bridgeParams: CreateAdapterDefaultParams = {
                            adapterId: BRIDGE_ADAPTER_ID,
                            sourceChain: currentChain,
                            destinationChain: data.destinationChain,
                            amount: currentAmount,
                            srcToken: data.srcToken,
                            destToken: destReserveAsset,
                            refundAddress: data.refundAddress,
                            partnerId: PARTNER_ID
                        };
                        const brideAdapter = await adapterService.SelectAdapter(BRIDGE_ADAPTER_ID);
                        const bridgeQuote = await brideAdapter.GetQuote(bridgeParams);
                        currentAmount = bridgeQuote.quotation.amountReceived;
                        currentChain = bridgeQuote.currentChain;
                        currentToken = bridgeQuote.currentToken;
                        adapterParamsQueue.push(bridgeQuote.adapterData);
                        adapterQuoteQueue.push(bridgeQuote.quotation);
                        time += bridgeQuote.quotation.estimatedTime;
                    }
                    const instancePoolData: InstancePoolDataV3 = await this.getInstancePoolDataV3(
                        instancePoolParams.tokenA,
                        instancePoolParams.tokenB,
                        instancePoolParams.destChainId,
                        instancePoolParams.fee
                    );
                    instancePoolData.upperTick = protocolData.upperTick;
                    instancePoolData.lowerTick = protocolData.lowerTick;
                    const [tokenAAmountCal, tokenBAmountCal] = await divideAmountToTokens(
                        instancePoolData.reserveA,
                        instancePoolData.reserveB,
                        String(currentAmount),
                        pTokenA,
                        pTokenB,
                        currentToken
                    );

                    let [tokenAAmountMinReceived, tokenBAmountMinReceived] = [
                        tokenAAmountCal,
                        tokenBAmountCal
                    ];

                    const swapAdapter = await adapterService.SelectAdapter(DEXSPAN_SWAP_ADAPTER_ID);

                    if (pTokenA.address.toLowerCase() != currentToken.address.toLowerCase())
                    {
                        if (
                            isTokenNativeOrWrapped(data.destinationChain, pTokenA.address) &&
                            isTokenNativeOrWrapped(currentChain, currentToken.address)
                        )
                        {
                        }
                        else
                        {
                            const swapParamsTokenA: CreateAdapterDefaultParams = {
                                adapterId: DEXSPAN_SWAP_ADAPTER_ID,
                                sourceChain: currentChain,
                                destinationChain: data.destinationChain,
                                amount: String(tokenAAmountCal),
                                srcToken: currentToken,
                                destToken: tokenA,
                                refundAddress: data.refundAddress,
                                partnerId: PARTNER_ID,
                                protocolData: {
                                    slippageTolerance: 3
                                }
                            };
                            const swapQuoteTokenA = await swapAdapter.GetQuote(swapParamsTokenA);
                            adapterParamsQueue.push(swapQuoteTokenA.adapterData);
                            adapterQuoteQueue.push(swapQuoteTokenA.quotation);
                            time += swapQuoteTokenA.quotation.estimatedTime;
                            tokenAAmountMinReceived = String(
                                swapQuoteTokenA.quotation.amountReceived
                            );
                        }
                    }
                    if (pTokenB.address.toLowerCase() != currentToken.address.toLowerCase())
                    {
                        if (
                            isTokenNativeOrWrapped(data.destinationChain, pTokenB.address) &&
                            isTokenNativeOrWrapped(currentChain, currentToken.address)
                        )
                        {
                        }
                        else
                        {
                            const swapParamsTokenB: CreateAdapterDefaultParams = {
                                adapterId: DEXSPAN_SWAP_ADAPTER_ID,
                                sourceChain: currentChain,
                                destinationChain: data.destinationChain,
                                amount: String(tokenBAmountCal),
                                srcToken: currentToken,
                                destToken: tokenB,
                                refundAddress: data.refundAddress,
                                partnerId: PARTNER_ID,
                                protocolData: {
                                    slippageTolerance: 3
                                }
                            };

                            const swapQuoteTokenB = await swapAdapter.GetQuote(swapParamsTokenB);
                            adapterParamsQueue.push(swapQuoteTokenB.adapterData);
                            adapterQuoteQueue.push(swapQuoteTokenB.quotation);
                            currentChain = swapQuoteTokenB.currentChain;
                            currentToken = swapQuoteTokenB.currentToken;
                            time += swapQuoteTokenB.quotation.estimatedTime;

                            tokenBAmountMinReceived = String(
                                swapQuoteTokenB.quotation.amountReceived
                            );
                        }
                    }

                    if (
                        !isCrossChain &&
                        data.srcToken.address.toLowerCase() == native.address.toLowerCase()
                    )
                    {
                        if (tokenA.address.toLowerCase() == wNative.address.toLowerCase())
                        {
                            tokenA = native;
                        }

                        if (tokenB.address.toLowerCase() == wNative.address.toLowerCase())
                        {
                            tokenB = native;
                        }
                    }

                    const ammParams: CreateAdapterDefaultParamsForAmmV4 = {
                        adapterId: ammAdapterId,
                        chain: data.destinationChain,
                        tokenAAmountCal: String(tokenAAmountCal),
                        tokenBAmountCal: String(tokenBAmountCal),
                        tokenAAmount: String(tokenAAmountMinReceived),
                        tokenBAmount: String(tokenBAmountMinReceived),
                        pool: instancePoolData.poolAddress,
                        tokenA: !isCrossChain ? tokenA : pTokenA,
                        tokenB: !isCrossChain ? tokenB : pTokenB,
                        refundAddress: data.refundAddress,
                        reservePoolData: instancePoolData,
                        partnerId: PARTNER_ID
                    };

                    const ammAdapter = new ThrusterV3PoolAdapter();
                    const ammQuote = await ammAdapter.GetQuoteForAmm(ammParams);
                    adapterParamsQueue.push(ammQuote.adapterData);
                    adapterQuoteQueue.push(ammQuote.quotation);
                    currentChain = ammQuote.currentChain;
                    currentToken = ammQuote.currentToken;

                    time += ammQuote?.quotation?.estimatedTime ?? 0;
                }
                else if (protocolActions == "deposit_v2")
                {
                    PARTNER_ID = 122;
                    if (tokenA.address == tokenB.address || tokenA.chainId !== tokenB.chainId)
                    {
                        throw "Destination Tokens not defined correctly";
                    }
                    const instancePoolParams = {
                        tokenA: pTokenA,
                        tokenB: pTokenB,
                        fee: data.protocolData.fee,
                        destChainId: data.destinationChain
                    };
                    const ammAdapterId = `${data.protocolId}_deposit_v2`;
                    [pTokenA, pTokenB] = await sortTokens(pTokenA, pTokenB);
                    [tokenA, tokenB] = await sortTokens(tokenA, tokenB);

                    const destReserveAsset = await getReserveToken(
                        [pTokenA, pTokenB],
                        data.destinationChain
                    );
                    if (String(data.sourceChain) !== String(data.destinationChain))
                    {
                        isCrossChain = true;
                        const bridgeParams: CreateAdapterDefaultParams = {
                            adapterId: BRIDGE_ADAPTER_ID,
                            sourceChain: currentChain,
                            destinationChain: data.destinationChain,
                            amount: currentAmount,
                            srcToken: data.srcToken,
                            destToken: destReserveAsset,
                            refundAddress: data.refundAddress,
                            partnerId: PARTNER_ID
                        };
                        const brideAdapter = await adapterService.SelectAdapter(BRIDGE_ADAPTER_ID);
                        const bridgeQuote = await brideAdapter.GetQuote(bridgeParams);
                        currentAmount = bridgeQuote.quotation.amountReceived;
                        currentChain = bridgeQuote.currentChain;
                        currentToken = bridgeQuote.currentToken;
                        adapterParamsQueue.push(bridgeQuote.adapterData);
                        adapterQuoteQueue.push(bridgeQuote.quotation);
                        time += bridgeQuote.quotation.estimatedTime;
                    }

                    const instancePoolData = await this.getInstancePoolDataV2(
                        instancePoolParams.tokenA,
                        instancePoolParams.tokenB,
                        instancePoolParams.fee,
                        instancePoolParams.destChainId
                    );
                    const [tokenAAmountCal, tokenBAmountCal] = await divideAmountToTokens(
                        instancePoolData.reserveA,
                        instancePoolData.reserveB,
                        String(currentAmount),
                        pTokenA,
                        pTokenB,
                        currentToken
                    );

                    let [tokenAAmountMinReceived, tokenBAmountMinReceived] = [
                        tokenAAmountCal,
                        tokenBAmountCal
                    ];

                    const swapAdapter = await adapterService.SelectAdapter(DEXSPAN_SWAP_ADAPTER_ID);

                    if (pTokenA.address.toLowerCase() != currentToken.address.toLowerCase())
                    {
                        if (
                            isTokenNativeOrWrapped(data.destinationChain, pTokenA.address) &&
                            isTokenNativeOrWrapped(currentChain, currentToken.address)
                        )
                        {
                        }
                        else
                        {
                            const swapParamsTokenA: CreateAdapterDefaultParams = {
                                adapterId: DEXSPAN_SWAP_ADAPTER_ID,
                                sourceChain: currentChain,
                                destinationChain: data.destinationChain,
                                amount: String(tokenAAmountCal),
                                srcToken: currentToken,
                                destToken: tokenA,
                                refundAddress: data.refundAddress,
                                partnerId: PARTNER_ID,
                                protocolData: {
                                    slippageTolerance: 3
                                }
                            };
                            const swapQuoteTokenA = await swapAdapter.GetQuote(swapParamsTokenA);
                            adapterParamsQueue.push(swapQuoteTokenA.adapterData);
                            adapterQuoteQueue.push(swapQuoteTokenA.quotation);
                            time += swapQuoteTokenA.quotation.estimatedTime;
                            tokenAAmountMinReceived = String(
                                swapQuoteTokenA.quotation.amountReceived
                            );
                        }
                    }

                    if (pTokenB.address.toLowerCase() != currentToken.address.toLowerCase())
                    {
                        if (
                            isTokenNativeOrWrapped(data.destinationChain, pTokenB.address) &&
                            isTokenNativeOrWrapped(currentChain, currentToken.address)
                        )
                        {
                        }
                        else
                        {
                            const swapParamsTokenB: CreateAdapterDefaultParams = {
                                adapterId: DEXSPAN_SWAP_ADAPTER_ID,
                                sourceChain: currentChain,
                                destinationChain: data.destinationChain,
                                amount: String(tokenBAmountCal),
                                srcToken: currentToken,
                                destToken: tokenB,
                                refundAddress: data.refundAddress,
                                partnerId: PARTNER_ID,
                                protocolData: {
                                    slippageTolerance: 3
                                }
                            };

                            const swapQuoteTokenB = await swapAdapter.GetQuote(swapParamsTokenB);
                            adapterParamsQueue.push(swapQuoteTokenB.adapterData);
                            adapterQuoteQueue.push(swapQuoteTokenB.quotation);
                            currentChain = swapQuoteTokenB.currentChain;
                            currentToken = swapQuoteTokenB.currentToken;
                            time += swapQuoteTokenB.quotation.estimatedTime;

                            tokenBAmountMinReceived = String(
                                swapQuoteTokenB.quotation.amountReceived
                            );
                        }
                    }

                    if (
                        !isCrossChain &&
                        data.srcToken.address.toLowerCase() == native.address.toLowerCase()
                    )
                    {
                        if (tokenA.address.toLowerCase() == wNative.address.toLowerCase())
                        {
                            tokenA = native;
                        }

                        if (tokenB.address.toLowerCase() == wNative.address.toLowerCase())
                        {
                            tokenB = native;
                        }
                    }

                    // const pairTokenDecimal = await getTokenDecimal(
                    //     String(instancePoolData.poolAddress),
                    //     data.destinationChain
                    // );
                    // const pairPoolTokenData: TokenData = {
                    //     chainId: String(data.destinationChain),
                    //     address: String(instancePoolData.poolAddress),
                    //     decimals: pairTokenDecimal
                    // };

                    const ammParams: CreateAdapterDefaultParamsForAmmV4 = {
                        adapterId: ammAdapterId,
                        chain: data.destinationChain,
                        tokenAAmountCal: String(tokenAAmountCal),
                        tokenBAmountCal: String(tokenBAmountCal),
                        tokenAAmount: String(tokenAAmountMinReceived),
                        tokenBAmount: String(tokenBAmountMinReceived),
                        pool: undefined,
                        tokenA: !isCrossChain ? tokenA : pTokenA,
                        tokenB: !isCrossChain ? tokenB : pTokenB,
                        refundAddress: data.refundAddress,
                        reservePoolData: instancePoolData,
                        partnerId: PARTNER_ID
                    };

                    const ammAdapter = new ThrusterV2PoolAdapter();
                    const ammQuote = await ammAdapter.GetQuoteForAmm(ammParams);
                    adapterParamsQueue.push(ammQuote.adapterData);
                    adapterQuoteQueue.push(ammQuote.quotation);
                    currentChain = ammQuote.currentChain;
                    currentToken = ammQuote.currentToken;

                    time += ammQuote?.quotation?.estimatedTime ?? 0;
                }
                else
                {
                    const error = {
                        title: "Action not implemented"
                    };
                    throw error;
                }
                const response: CreateProtocolDefaultParamsResponse = {
                    quotationType: quotationType,
                    currentChain: currentChain,
                    currentToken: currentToken,
                    currentAmount: currentAmount,
                    isCrossChain: isCrossChain,
                    quotationData: adapterQuoteQueue,
                    adapterData: adapterParamsQueue,
                    estimatedTime: time,
                    partnerId: PARTNER_ID
                };
                resolve(response);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    private getInstancePoolDataV3(
        tokenA: TokenData,
        tokenB: TokenData,
        destChainId: number,
        feeTier: number
    ): Promise<InstancePoolDataV3>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const poolFactoryAddress = ThrusterV3PoolFactory[destChainId];
                const poolFactoryContract = await getContract(
                    ThrusterV3PoolFactoryAbi,
                    poolFactoryAddress,
                    destChainId
                );
                const getPoolAddress = await poolFactoryContract.getPool(
                    tokenA.address,
                    tokenB.address,
                    feeTier
                );

                const poolContract = await getContract(
                    ThrusterV3PoolAbi,
                    getPoolAddress,
                    destChainId
                );

                const code = await poolContract.getDeployedCode();

                if (code === "0x" || !code)
                {
                    const error = {
                        title: "Pool Does Not Exist",
                        message: "Pool for this pair doesn't exist"
                    };
                    reject(error);
                }

                const response: InstancePoolDataV3 = {
                    tokenA: tokenA,
                    tokenB: tokenB,
                    chainId: destChainId,
                    poolAddress: getPoolAddress,
                    poolFactory: poolFactoryAddress,
                    tick: Number(0),
                    fee: Number(0),
                    lowerTick: "",
                    upperTick: "",
                    initialized: true
                };
                resolve(response);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    private getInstancePoolDataV2(
        tokenA: TokenData,
        tokenB: TokenData,
        feeTier: number,
        destChainId: number
    ): Promise<InstancePoolDataV3>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const poolFactoryAddress =
                    feeTier === 10000
                        ? ThrusterV2RouterFeePointOne[destChainId]
                        : ThrusterV2RouterFeePointThree[destChainId];
                const poolFactoryContract = await getContract(
                    ThrusterV2PoolFactoryAbi,
                    poolFactoryAddress,
                    destChainId
                );
                const getPoolAddress = await poolFactoryContract.getPair(
                    tokenA.address,
                    tokenB.address
                );

                const poolContract = await getContract(
                    ThrusterV2PoolAbi,
                    getPoolAddress,
                    destChainId
                );

                const code = await poolContract.getDeployedCode();

                if (code === "0x" || !code)
                {
                    const error = {
                        title: "Pool Does Not Exist",
                        message: "Pool for this pair doesn't exist"
                    };
                    reject(error);
                }
                const response: InstancePoolDataV3 = {
                    tokenA: tokenA,
                    tokenB: tokenB,
                    chainId: destChainId,
                    poolAddress: getPoolAddress,
                    poolFactory: poolFactoryAddress,
                    reserveA: String(1),
                    reserveB: String(1),
                    fee: feeTier,
                    tick: Number(0)
                };
                resolve(response);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }
}

export default ThrusterProtocol;
