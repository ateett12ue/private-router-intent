import ProtocolBase from "../ProtocolBase";
import {
    CreateAdapterDefaultParamsResponse,
    CreateAdapterDefaultParams,
    CreateAdapterDefaultParamsForAmm,
    AdapterIdParamsResponse,
    AdapterQuotationResponse
} from "../../../models/Adapters";
import {
    CreateProtocolDefaultParams,
    CreateProtocolDefaultParamsResponse,
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
    getRemainderValue,
    getReserveToken,
    isTokenNativeOrWrapped
} from "../../../../utils";
import {
    AeroDromePoolFactory,
    WrappedNativeMapping,
    NativTokenMapping
} from "../../../../constant/contractMapping";
import { aerodromePoolFactoryAbi } from "../../../../abis/AerodromePoolFactory";
import { aerodromePoolAbi } from "../../../../abis/AerodromePool";
import AerodromePoolAdapter from "../../../adapterService/Adapters/amm/aerodrome/deposit";
import e = require("express");
class AerodromeProtocol extends ProtocolBase
{
    CreateQuoteAndParams(
        data: CreateProtocolDefaultParams
    ): Promise<CreateProtocolDefaultParamsResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const PARTNER_ID = 50;
                const poolData = await PoolService.GetPool(data.poolId);
                const protocolActions = data.action;
                const pairTokenOut = poolData.underlyingTokens["tokenOut"];

                let currentChain = data.sourceChain;
                let currentToken = data.srcToken;
                let currentAmount: string | number = data.amount;

                const tokenA = data.destToken[0];
                const tokenB = data.destToken[1];

                const wNative = WrappedNativeMapping[Number(data.destinationChain)];
                const native = NativTokenMapping[Number(data.destinationChain)];

                const pTokenA =
                    tokenA.address.toLowerCase() == native.address.toLowerCase() ? wNative : tokenA;
                const pTokenB =
                    tokenB.address.toLowerCase() == native.address.toLowerCase() ? wNative : tokenB;

                if (tokenA.address == tokenB.address || tokenA.chainId !== tokenB.chainId)
                {
                    throw "Destination Tokens not defined correctly";
                }

                let ethWethConversionTokenA = false;
                let ethWethConversionTokenB = false;
                let isCrossChain = false;

                const adapterParamsQueue: Array<AdapterIdParamsResponse> = [];
                const adapterQuoteQueue: Array<AdapterQuotationResponse> = [];

                const quotationType: string = "BatchTransaction";
                let time = 0;
                if (protocolActions == "deposit")
                {
                    const ammAdapterId = `${data.protocolId}_deposit`;
                    const instancePoolParams = {
                        tokenA: pTokenA,
                        tokenB: pTokenB,
                        stable: data.protocolData?.stable,
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
                    const instancePoolData = await this.getInstancePoolData(
                        instancePoolParams.tokenA,
                        instancePoolParams.tokenB,
                        instancePoolParams.stable,
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
                            ethWethConversionTokenA = true;
                        }
                        else
                        {
                            const swapParamsTokenA: CreateAdapterDefaultParams = {
                                adapterId: DEXSPAN_SWAP_ADAPTER_ID,
                                sourceChain: currentChain,
                                destinationChain: data.destinationChain,
                                amount: String(tokenAAmountCal),
                                srcToken: currentToken,
                                destToken: pTokenA,
                                refundAddress: data.refundAddress,
                                partnerId: PARTNER_ID
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
                            ethWethConversionTokenB = true;
                        }
                        else
                        {
                            const swapParamsTokenB: CreateAdapterDefaultParams = {
                                adapterId: DEXSPAN_SWAP_ADAPTER_ID,
                                sourceChain: currentChain,
                                destinationChain: data.destinationChain,
                                amount: String(tokenBAmountCal),
                                srcToken: currentToken,
                                destToken: pTokenB,
                                refundAddress: data.refundAddress,
                                partnerId: PARTNER_ID
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

                    const ammParams: CreateAdapterDefaultParamsForAmm = {
                        adapterId: ammAdapterId,
                        chain: data.destinationChain,
                        tokenAAmountCal: String(tokenAAmountCal),
                        tokenBAmountCal: String(tokenBAmountCal),
                        tokenAAmount: String(tokenAAmountMinReceived),
                        tokenBAmount: String(tokenBAmountMinReceived),
                        pairPoolToken: pairTokenOut,
                        tokenA: ethWethConversionTokenA ? tokenA : pTokenA,
                        tokenB: ethWethConversionTokenB ? tokenB : pTokenB,
                        refundAddress: data.refundAddress,
                        reservePoolData: instancePoolData,
                        stable: instancePoolParams.stable
                    };

                    const ammAdapter = new AerodromePoolAdapter();
                    const ammQuote = await ammAdapter.GetQuoteForAmm(ammParams);
                    adapterParamsQueue.push(ammQuote.adapterData);
                    adapterQuoteQueue.push(ammQuote.quotation);
                    currentChain = ammQuote.currentChain;
                    currentToken = ammQuote.currentToken;

                    time += ammQuote?.quotation?.estimatedTime ?? 0;
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
        stable: boolean,
        destChainId: number
    ): Promise<InstancePoolData>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const poolFactoryAddress = AeroDromePoolFactory[destChainId];
                const poolExist = true;
                const poolFactoryContract = await getContract(
                    aerodromePoolFactoryAbi,
                    poolFactoryAddress,
                    destChainId
                );
                const getPoolAddress = await poolFactoryContract.getPool(
                    tokenA.address,
                    tokenB.address,
                    stable
                );

                const poolContract = await getContract(
                    aerodromePoolAbi,
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
                const newPoolReserve = {
                    _reserve0: 1,
                    _reserve1: 1
                };
                const reserveData = poolExist ? await poolContract.getReserves() : newPoolReserve;
                // const reserveData = await poolContract.currentCumulativePrices();

                const response: InstancePoolData = {
                    tokenA: tokenA,
                    tokenB: tokenB,
                    chainId: destChainId,
                    poolAddress: getPoolAddress,
                    poolFactory: poolFactoryAddress,
                    stable: stable,
                    reserveA: String(reserveData._reserve0),
                    reserveB: String(reserveData._reserve1)
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

export default AerodromeProtocol;
