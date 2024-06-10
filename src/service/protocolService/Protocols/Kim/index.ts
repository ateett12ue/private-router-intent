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
    isTokenNativeOrWrapped,
    getCommonDecimalComputedValue
} from "../../../../utils";
import {
    KimV4PoolFactory,
    KimV2PoolFactory,
    RESERVED_TOKENS
} from "../../../../constant/contractMapping";
import { KimV4PoolFactoryAbi } from "../../../../abis/KimV4PoolFactory";
import { KimV2PoolFactoryAbi } from "../../../../abis/KimV2PoolFactory";
import { KimV4PoolAbi } from "../../../../abis/KimV4Pool";
import { KimV2PoolAbi } from "../../../../abis/KimV2Pool";
import KimPoolAdapterV4 from "../../../adapterService/Adapters/amm/kim/v4_deposit";
import KimPoolAdapterV2 from "../../../adapterService/Adapters/amm/kim/v2_deposit";
import { WrappedNativeMapping, NativTokenMapping } from "../../../../constant/contractMapping";
interface KimGlobalParams
{
    price: string; // The square root of the current price in Q64.96 format
    tick: number; // The current tick (price(tick) <= current price)
    lastFee: number; // The last fee in hundredths of a bip, i.e. 1e-6 (so 100 is 0.01%)
    pluginConfig: number; // The current plugin config as a bitmap
    communityFee: number; // The community fee represented as a percent of all collected fee in thousandths (1e-3) (so 100 is 10%)
    unlocked: boolean;
}
class KimProtocol extends ProtocolBase
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

                let PARTNER_ID = 102;
                let pTokenA =
                    tokenA.address.toLowerCase() == native.address.toLowerCase() ? wNative : tokenA;
                let pTokenB =
                    tokenB.address.toLowerCase() == native.address.toLowerCase() ? wNative : tokenB;

                const sourceTokenReserve = RESERVED_TOKENS[data.sourceChain][0];

                let sourceTokenDollarValue = String(data.amount);
                if (
                    sourceTokenReserve.address.toLowerCase() != data.srcToken.address.toLowerCase()
                )
                {
                    const dollarParams = {
                        tokenIn: data.srcToken,
                        tokenOut: sourceTokenReserve,
                        amount: data.amount
                    };
                    sourceTokenDollarValue = await getTokenReverseValue(
                        dollarParams.tokenIn,
                        dollarParams.tokenOut,
                        String(dollarParams.amount)
                    );
                }
                if (
                    Number(
                        getCommonDecimalComputedValue(
                            sourceTokenDollarValue,
                            sourceTokenReserve.decimals,
                            6
                        )
                    ) < 10000000
                )
                {
                    const error = {
                        title: "Try with at least $10 worth of tokens",
                        message: "Low amount, transaction may fail at destination"
                    };
                    throw error;
                }
                if (protocolActions == "deposit_v4")
                {
                    PARTNER_ID = 102;
                    const protocolData = data.protocolData;

                    if (tokenA.address == tokenB.address || tokenA.chainId !== tokenB.chainId)
                    {
                        throw "Destination Tokens not defined correctly";
                    }
                    const ammAdapterId = `${data.protocolId}_deposit_v4`;
                    [pTokenA, pTokenB] = await sortTokens(pTokenA, pTokenB);
                    [tokenA, tokenB] = await sortTokens(tokenA, tokenB);
                    const instancePoolParams = {
                        tokenA: pTokenA,
                        tokenB: pTokenB,
                        destChainId: data.destinationChain
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
                    const instancePoolData: InstancePoolDataV3 = await this.getInstancePoolDataV4(
                        instancePoolParams.tokenA,
                        instancePoolParams.tokenB,
                        instancePoolParams.destChainId
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

                    const ammAdapter = new KimPoolAdapterV4();
                    const ammQuote = await ammAdapter.GetQuoteForAmm(ammParams);
                    adapterParamsQueue.push(ammQuote.adapterData);
                    adapterQuoteQueue.push(ammQuote.quotation);
                    currentChain = ammQuote.currentChain;
                    currentToken = ammQuote.currentToken;

                    time += ammQuote?.quotation?.estimatedTime ?? 0;
                }
                else if (protocolActions == "deposit_v2")
                {
                    PARTNER_ID = 101;
                    if (tokenA.address == tokenB.address || tokenA.chainId !== tokenB.chainId)
                    {
                        throw "Destination Tokens not defined correctly";
                    }
                    const instancePoolParams = {
                        tokenA: pTokenA,
                        tokenB: pTokenB,
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

                    const ammParams: CreateAdapterDefaultParamsForAmm = {
                        adapterId: ammAdapterId,
                        chain: data.destinationChain,
                        tokenAAmountCal: String(tokenAAmountCal),
                        tokenBAmountCal: String(tokenBAmountCal),
                        tokenAAmount: String(tokenAAmountMinReceived),
                        tokenBAmount: String(tokenBAmountMinReceived),
                        pairPoolToken: undefined,
                        tokenA: !isCrossChain ? tokenA : pTokenA,
                        tokenB: !isCrossChain ? tokenB : pTokenB,
                        refundAddress: data.refundAddress,
                        reservePoolData: undefined,
                        partnerId: PARTNER_ID
                    };

                    const ammAdapter = new KimPoolAdapterV2();
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

    private getInstancePoolDataV4(
        tokenA: TokenData,
        tokenB: TokenData,
        destChainId: number
    ): Promise<InstancePoolDataV3>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const poolFactoryAddress = KimV4PoolFactory[destChainId];
                const poolFactoryContract = await getContract(
                    KimV4PoolFactoryAbi,
                    poolFactoryAddress,
                    destChainId
                );
                const getPoolAddress = await poolFactoryContract.poolByPair(
                    tokenA.address,
                    tokenB.address
                );

                const poolContract = await getContract(KimV4PoolAbi, getPoolAddress, destChainId);

                const code = await poolContract.getDeployedCode();

                if (code === "0x" || !code)
                {
                    const error = {
                        title: "Pool Does Not Exist",
                        message: "Pool for this pair doesn't exist"
                    };
                    reject(error);
                }
                const globalVariable: KimGlobalParams = await poolContract.globalState();
                const reserve = await poolContract.getReserves();
                const response: InstancePoolDataV3 = {
                    tokenA: tokenA,
                    tokenB: tokenB,
                    chainId: destChainId,
                    poolAddress: getPoolAddress,
                    poolFactory: poolFactoryAddress,
                    reserveA: String(reserve[0]),
                    reserveB: String(reserve[1]),
                    fee: Number(globalVariable.lastFee),
                    tick: Number(globalVariable.tick),
                    lowerTick: "",
                    upperTick: ""
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
        destChainId: number
    ): Promise<InstancePoolData>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const poolFactoryAddress = KimV2PoolFactory[destChainId];
                const poolFactoryContract = await getContract(
                    KimV2PoolFactoryAbi,
                    poolFactoryAddress,
                    destChainId
                );
                const getPoolAddress = await poolFactoryContract.getPair(
                    tokenA.address,
                    tokenB.address
                );

                const poolContract = await getContract(KimV2PoolAbi, getPoolAddress, destChainId);

                const code = await poolContract.getDeployedCode();

                if (code === "0x" || !code)
                {
                    const error = {
                        title: "Pool Does Not Exist",
                        message: "Pool for this pair doesn't exist"
                    };
                    reject(error);
                }
                const response: InstancePoolData = {
                    tokenA: tokenA,
                    tokenB: tokenB,
                    chainId: destChainId,
                    poolAddress: getPoolAddress,
                    poolFactory: poolFactoryAddress,
                    reserveA: String(1),
                    reserveB: String(1)
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

export default KimProtocol;
