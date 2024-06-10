import ProtocolBase from "../ProtocolBase";
import {
    CreateAdapterDefaultParams,
    CreateAdapterDefaultParamsForAmmV4,
    AdapterIdParamsResponse,
    AdapterQuotationResponse
} from "../../../models/Adapters";
import {
    CreateProtocolDefaultParams,
    CreateProtocolDefaultParamsResponse,
    InstancePoolDataV3
} from "../../../models/Protocols";
import { DEXSPAN_SWAP_ADAPTER_ID, BRIDGE_ADAPTER_ID } from "../../../../constant/constants";
import { service as adapterService } from "../../../adapterService/AdapterService";
import { TokenData } from "../../../models/CommonModels";
import {
    sortTokens,
    getContract,
    divideAmountToTokens,
    getReserveToken,
    isTokenNativeOrWrapped,
    estimateTime
} from "../../../../utils";
import { BaseSwapPoolFactory } from "../../../../constant/contractMapping";
import { BaseSwapPoolFactoryAbi } from "../../../../abis/BaseSwapPoolFactory";
import BaseSwapV3PoolAdapter from "../../../adapterService/Adapters/amm/BaseSwap/base_swap_deposit";
import { WrappedNativeMapping, NativTokenMapping } from "../../../../constant/contractMapping";
import { BaseSwapPoolAbi } from "../../../../abis/BaseSwapPool";

class BaseSwapProtocol extends ProtocolBase
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
                let crossChainTime = 0;
                let isCrossChain = false;

                const adapterParamsQueue: Array<AdapterIdParamsResponse> = [];
                const adapterQuoteQueue: Array<AdapterQuotationResponse> = [];

                const quotationType: string = "BatchTransaction";
                let time = 0;

                // let ethWethConversionTokenA = false;
                // let ethWethConversionTokenB = false;
                const wNative = WrappedNativeMapping[Number(data.destinationChain)];
                const native = NativTokenMapping[Number(data.destinationChain)];

                let tokenA = data.destToken[0];
                let tokenB = data.destToken[1];

                // convert weth to eth
                tokenA =
                    tokenA.address.toLowerCase() == wNative.address.toLowerCase() ? native : tokenA;
                tokenB =
                    tokenB.address.toLowerCase() == wNative.address.toLowerCase() ? native : tokenB;

                const pTokenA =
                    tokenA.address.toLowerCase() == native.address.toLowerCase() ? wNative : tokenA;
                const pTokenB =
                    tokenB.address.toLowerCase() == native.address.toLowerCase() ? wNative : tokenB;
                if (protocolActions == "deposit")
                {
                    const PARTNER_ID = 104;
                    const protocolData = data.protocolData;

                    if (tokenA.address == tokenB.address || tokenA.chainId !== tokenB.chainId)
                    {
                        throw "Destination Tokens not defined correctly";
                    }
                    const ammAdapterId = `${data.protocolId}_deposit`;

                    const instancePoolParams = {
                        tokenA: pTokenA,
                        tokenB: pTokenB,
                        destChainId: data.destinationChain,
                        fee: data.protocolData.fee
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

                        // time += bridgeQuote.quotation.estimatedTime;
                        crossChainTime = bridgeQuote.quotation.estimatedTime;
                        time = estimateTime(
                            true,
                            bridgeQuote.quotation.estimatedTime,
                            time,
                            crossChainTime
                        );
                    }
                    const instancePoolData: InstancePoolDataV3 = await this.getInstancePoolData(
                        instancePoolParams.tokenA,
                        instancePoolParams.tokenB,
                        instancePoolParams.destChainId,
                        instancePoolParams.fee
                    );
                    instancePoolData.upperTick = protocolData.tickUpper;
                    instancePoolData.lowerTick = protocolData.tickLower;
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
                            // ethWethConversionTokenA = true;
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
                            // time += swapQuoteTokenA.quotation.estimatedTime;
                            tokenAAmountMinReceived = String(
                                swapQuoteTokenA.quotation.amountReceived
                            );
                            time = estimateTime(
                                false,
                                swapQuoteTokenA.quotation.estimatedTime,
                                time,
                                crossChainTime
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
                            // ethWethConversionTokenB = true;
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
                            tokenBAmountMinReceived = String(
                                swapQuoteTokenB.quotation.amountReceived
                            );
                            time = estimateTime(
                                false,
                                swapQuoteTokenB.quotation.estimatedTime,
                                time,
                                crossChainTime
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

                    const ammAdapter = new BaseSwapV3PoolAdapter();
                    const ammQuote = await ammAdapter.GetQuoteForAmm(ammParams);
                    adapterParamsQueue.push(ammQuote.adapterData);
                    adapterQuoteQueue.push(ammQuote.quotation);
                    currentChain = ammQuote.currentChain;
                    currentToken = ammQuote.currentToken;

                    // time += ammQuote?.quotation?.estimatedTime ?? 0;
                    time = estimateTime(
                        false,
                        ammQuote.quotation.estimatedTime ?? 0,
                        time,
                        crossChainTime
                    );
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
                    partnerId: 0
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
        destChainId: number,
        feeTier: number
    ): Promise<InstancePoolDataV3>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const poolFactoryAddress = BaseSwapPoolFactory[destChainId];
                const poolFactoryContract = await getContract(
                    BaseSwapPoolFactoryAbi,
                    poolFactoryAddress,
                    destChainId
                );
                const getPoolAddress = await poolFactoryContract.getPool(
                    tokenA.address,
                    tokenB.address,
                    feeTier
                );

                const poolContract = await getContract(
                    BaseSwapPoolAbi,
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
                const [liquidity, slot0, fee] = await Promise.all([
                    poolContract.liquidity(),
                    poolContract.slot0(),
                    poolContract.fee()
                ]);
                const response: InstancePoolDataV3 = {
                    tokenA: tokenA,
                    tokenB: tokenB,
                    chainId: destChainId,
                    poolAddress: getPoolAddress,
                    poolFactory: poolFactoryAddress,
                    fee: Number(fee),
                    tick: Number(slot0.tick),
                    lowerTick: "",
                    upperTick: "",
                    liquidity: liquidity.toString(),
                    sqrtPriceX96: slot0.sqrtPriceX96.toString(),
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
}

export default BaseSwapProtocol;
