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
import { TokenData } from "../../../models/CommonModels";
import {
    sortTokens,
    getContract,
    divideAmountToTokens,
    getReserveToken,
    isTokenNativeOrWrapped
} from "../../../../utils";
import { SwapmodePoolFactory } from "../../../../constant/contractMapping";
import { SwapmodeFactoryAbi } from "../../../../abis/SwapmodePoolFactory";
import { SwapmodePoolAbi } from "../../../../abis/SwapmodePool";
import SwapModeV3dapter from "../../../adapterService/Adapters/amm/swapmode/v3_deposit";
import SwapModeV2Adapter from "../../../adapterService/Adapters/amm/swapmode/v2_deposit";
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
class SwapmodeProtocol extends ProtocolBase
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
                let PARTNER_ID = 103;
                const adapterParamsQueue: Array<AdapterIdParamsResponse> = [];
                const adapterQuoteQueue: Array<AdapterQuotationResponse> = [];

                const quotationType: string = "BatchTransaction";
                let time = 0;

                const wNative = WrappedNativeMapping[Number(data.destinationChain)];
                const native = NativTokenMapping[Number(data.destinationChain)];

                let tokenA = data.destToken[0];
                let tokenB = data.destToken[1];

                tokenA =
                    tokenA.address.toLowerCase() == wNative.address.toLowerCase() ? native : tokenA;
                tokenB =
                    tokenB.address.toLowerCase() == wNative.address.toLowerCase() ? native : tokenB;

                [tokenA, tokenB] = await sortTokens(tokenA, tokenB);
                const pTokenA =
                    tokenA.address.toLowerCase() == native.address.toLowerCase() ? wNative : tokenA;
                const pTokenB =
                    tokenB.address.toLowerCase() == native.address.toLowerCase() ? wNative : tokenB;
                if (protocolActions == "deposit_v3")
                {
                    PARTNER_ID = 103;
                    const protocolData = data.protocolData;

                    if (tokenA.address == tokenB.address || tokenA.chainId !== tokenB.chainId)
                    {
                        throw "Destination Tokens not defined correctly";
                    }
                    const ammAdapterId = `${data.protocolId}_deposit`;
                    const instancePoolParams = {
                        tokenA: pTokenA,
                        tokenB: pTokenB,
                        destChainId: data.destinationChain
                    };

                    const destReserveAsset = await getReserveToken(
                        [tokenA, tokenB],
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
                    const instancePoolData: InstancePoolDataV3 = await this.getInstancePoolData(
                        instancePoolParams.tokenA,
                        instancePoolParams.tokenB,
                        instancePoolParams.destChainId
                    );
                    instancePoolData.upperTick = protocolData.upperTick;
                    instancePoolData.lowerTick = protocolData.lowerTick;
                    instancePoolData.fee = protocolData.fee;
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
                                    slippageTolerance: 2
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
                                    slippageTolerance: 2
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
                        tokenA: tokenA,
                        tokenB: tokenB,
                        refundAddress: data.refundAddress,
                        reservePoolData: instancePoolData,
                        partnerId: PARTNER_ID
                    };

                    const ammAdapter = new SwapModeV3dapter();
                    const ammQuote = await ammAdapter.GetQuoteForAmm(ammParams);
                    adapterParamsQueue.push(ammQuote.adapterData);
                    adapterQuoteQueue.push(ammQuote.quotation);
                    currentChain = ammQuote.currentChain;
                    currentToken = ammQuote.currentToken;

                    time += ammQuote?.quotation?.estimatedTime ?? 0;
                }
                if (protocolActions == "deposit_v2")
                {
                    PARTNER_ID = 105;
                    if (tokenA.address == tokenB.address || tokenA.chainId !== tokenB.chainId)
                    {
                        throw "Destination Tokens not defined correctly";
                    }
                    const ammAdapterId = `${data.protocolId}_deposit_v2`;

                    const instancePoolParams = {
                        tokenA: pTokenA,
                        tokenB: pTokenB,
                        destChainId: data.destinationChain
                    };

                    const destReserveAsset = await getReserveToken(
                        [tokenA, tokenB],
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
                    const instancePoolData: InstancePoolDataV3 = await this.getInstancePoolData(
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
                                    slippageTolerance: 2
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
                                    slippageTolerance: 2
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
                        tokenA: tokenA,
                        tokenB: tokenB,
                        refundAddress: data.refundAddress,
                        reservePoolData: instancePoolData,
                        partnerId: PARTNER_ID
                    };

                    const ammAdapter = new SwapModeV2Adapter();
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

    private getInstancePoolData(
        tokenA: TokenData,
        tokenB: TokenData,
        destChainId: number
    ): Promise<InstancePoolDataV3>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const poolFactoryAddress = SwapmodePoolFactory[destChainId];
                const poolFactoryContract = await getContract(
                    SwapmodeFactoryAbi,
                    poolFactoryAddress,
                    destChainId
                );
                const getPoolAddress = await poolFactoryContract.getPair(
                    tokenA.address,
                    tokenB.address
                );

                const poolContract = await getContract(
                    SwapmodePoolAbi,
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

                const reserve = await poolContract.getReserves();
                const response: InstancePoolDataV3 = {
                    tokenA: tokenA,
                    tokenB: tokenB,
                    chainId: destChainId,
                    poolAddress: getPoolAddress,
                    poolFactory: poolFactoryAddress,
                    reserveA: String(reserve[0]),
                    reserveB: String(reserve[1]),
                    fee: Number(0),
                    tick: Number(0),
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
}

export default SwapmodeProtocol;
