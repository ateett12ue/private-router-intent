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
    getContract,
    divideAmountToTokens,
    getReserveToken,
    isTokenNativeOrWrapped,
    getTokenReverseValue,
    getCommonDecimalComputedValue,
    estimateTime
} from "../../../../utils";
import {
    LynexPoolFactory,
    LynexGaugePoolFactory,
    WrappedNativeMapping,
    NativTokenMapping,
    RESERVED_TOKENS
} from "../../../../constant/contractMapping";
import { lynexPoolFactoryAbi } from "../../../../abis/LynexPoolFactory";
import { lynexGaugeFactoryAbi } from "../../../../abis/LynexGaugeFactory";
import { lynexPoolAbi } from "../../../../abis/LynexPool";
import LynexV2PoolAdapter from "../../../adapterService/Adapters/amm/lynex/v2_deposit";

interface GaugePoolFactory
{
    poolToken: string;
    gaugePoolAddress: string;
}
class LynexProtocol extends ProtocolBase
{
    CreateQuoteAndParams(
        data: CreateProtocolDefaultParams
    ): Promise<CreateProtocolDefaultParamsResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const PARTNER_ID = 108;
                const poolData = await PoolService.GetPool(data.poolId);
                const protocolActions = data.action;
                const pairTokenOut = poolData ? poolData?.underlyingTokens["tokenOut"] : undefined;

                let crossChainTime = 0;

                let currentChain = data.sourceChain;
                let currentToken = data.srcToken;
                let currentAmount: string | number = data.amount;

                let quotationType: string = "BatchTransaction";
                let time = 0;
                let isCrossChain = false;

                const adapterParamsQueue: Array<AdapterIdParamsResponse> = [];
                const adapterQuoteQueue: Array<AdapterQuotationResponse> = [];

                if (protocolActions == "deposit")
                {
                    let tokenA = data.destToken[0];
                    let tokenB = data.destToken[1];

                    const wNative = WrappedNativeMapping[Number(data.destinationChain)];
                    const native = NativTokenMapping[Number(data.destinationChain)];

                    tokenA =
                        tokenA.address.toLowerCase() == wNative.address.toLowerCase()
                            ? native
                            : tokenA;
                    tokenB =
                        tokenB.address.toLowerCase() == wNative.address.toLowerCase()
                            ? native
                            : tokenB;

                    const pTokenA =
                        tokenA.address.toLowerCase() == native.address.toLowerCase()
                            ? wNative
                            : tokenA;
                    const pTokenB =
                        tokenB.address.toLowerCase() == native.address.toLowerCase()
                            ? wNative
                            : tokenB;

                    if (tokenA.address == tokenB.address || tokenA.chainId !== tokenB.chainId)
                    {
                        throw "Destination Tokens not defined correctly";
                    }
                    const ammAdapterId = `${data.protocolId}_deposit`;
                    const instancePoolParams = {
                        tokenA: pTokenA,
                        tokenB: pTokenB,
                        stable: data.protocolData?.stable ?? true,
                        destChainId: data.destinationChain
                    };

                    const destReserveAsset = await getReserveToken(
                        [tokenA, tokenB],
                        data.destinationChain
                    );

                    const sourceTokenReserve = RESERVED_TOKENS[data.sourceChain][0];

                    let sourceTokenDollarValue = String(data.amount);
                    if (
                        sourceTokenReserve.address.toLowerCase() !=
                        data.srcToken.address.toLowerCase()
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
                        crossChainTime = bridgeQuote.quotation.estimatedTime;
                        time = estimateTime(
                            true,
                            bridgeQuote.quotation.estimatedTime,
                            time,
                            crossChainTime
                        );
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

                    // const ammAdapter = await adapterService.SelectAdapter(ammAdapterId);
                    const ammParams: CreateAdapterDefaultParamsForAmm = {
                        adapterId: ammAdapterId,
                        chain: data.destinationChain,
                        tokenAAmountCal: String(tokenAAmountCal),
                        tokenBAmountCal: String(tokenBAmountCal),
                        tokenAAmount: String(tokenAAmountMinReceived),
                        tokenBAmount: String(tokenBAmountMinReceived),
                        pairPoolToken: pairTokenOut,
                        tokenA: tokenA,
                        tokenB: tokenB,
                        refundAddress: data.refundAddress,
                        reservePoolData: instancePoolData,
                        stable: instancePoolParams.stable,
                        partnerId: PARTNER_ID
                    };

                    const ammAdapter = new LynexV2PoolAdapter();
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
                else if (protocolActions == "stake")
                {
                    quotationType = "ContractTransaction";

                    const poolData = await PoolService.GetPool(data.poolId);
                    const pairTokenOut = poolData.underlyingTokens["tokenOut"];

                    const gaugePoolData = await this.getGaugePoolData(
                        data.srcToken.address,
                        data.sourceChain
                    );
                    const stakeAdapterId = `${data.protocolId}_stake`;
                    const stakeAdapter = await adapterService.SelectAdapter(stakeAdapterId);
                    const stakeParams: CreateAdapterDefaultParams = {
                        adapterId: stakeAdapterId,
                        sourceChain: currentChain,
                        destinationChain: data.destinationChain,
                        amount: currentAmount,
                        srcToken: data.srcToken,
                        destToken: pairTokenOut,
                        refundAddress: data.refundAddress,
                        protocolData: {
                            gaugeData: gaugePoolData
                        }
                    };
                    const stakeQuote = await stakeAdapter.GetQuote(stakeParams);
                    adapterParamsQueue.push(stakeQuote.adapterData);
                    adapterQuoteQueue.push(stakeQuote.quotation);
                    currentAmount = stakeQuote.quotation.amountReceived;
                    currentChain = stakeQuote.currentChain;
                    currentToken = stakeQuote.currentToken;
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
                const poolFactoryAddress = LynexPoolFactory[destChainId];
                const poolExist = true;
                const poolFactoryContract = await getContract(
                    lynexPoolFactoryAbi,
                    poolFactoryAddress,
                    destChainId
                );
                const getPoolAddress = await poolFactoryContract.getPair(
                    tokenA.address,
                    tokenB.address,
                    stable
                );

                const poolContract = await getContract(lynexPoolAbi, getPoolAddress, destChainId);

                const code = await poolContract.getDeployedCode();

                if (code === "0x" || !code)
                {
                    const error = {
                        title: "Pool Does Not Exist",
                        message: "Pool for this pair doesn't exist"
                    };
                    reject(error);
                }

                const reserveData = await poolContract.getReserves();
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

    private getGaugePoolData(poolToken: string, chainId: number): Promise<GaugePoolFactory>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const gaugePoolFactoryAddress = LynexGaugePoolFactory[chainId];
                const gaugePoolFactoryContract = await getContract(
                    lynexGaugeFactoryAbi,
                    gaugePoolFactoryAddress,
                    chainId
                );
                const getGaugePoolAddress = await gaugePoolFactoryContract.gauges(poolToken);

                const gaugeContract = await getContract(lynexPoolAbi, getGaugePoolAddress, chainId);

                const code = await gaugeContract.getDeployedCode();

                if (code === "0x" || !code)
                {
                    const error = {
                        title: "Gauge Pool Does Not Exist",
                        message: "Gauge Pool for this pair doesn't exist"
                    };
                    reject(error);
                }

                const response: GaugePoolFactory = {
                    poolToken: poolToken,
                    gaugePoolAddress: getGaugePoolAddress
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

export default LynexProtocol;
