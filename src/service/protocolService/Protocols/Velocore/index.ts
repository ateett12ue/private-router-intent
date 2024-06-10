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
    getTokensInBytes32,
    getTokenDecimal,
    getReserveToken,
    getCommonDecimalComputedValue
} from "../../../../utils";
import { VelocoresPoolFactory, RESERVED_TOKENS } from "../../../../constant/contractMapping";
import { velocorePoolFactoryAbi } from "../../../../abis/VelocorePoolFactory";
import { velocorePoolAbi } from "../../../../abis/VelocorePool";
import VelocorePoolAdapter from "../../../adapterService/Adapters/amm/velocore/deposit";

class VelocoreProtocol extends ProtocolBase
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
                const PARTNER_ID = 70;
                let isCrossChain = false;

                const adapterParamsQueue: Array<AdapterIdParamsResponse> = [];
                const adapterQuoteQueue: Array<AdapterQuotationResponse> = [];

                let quotationType: string = "BatchTransaction";
                let time = 0;
                if (protocolActions == "deposit")
                {
                    let tokenA = data.destToken[0];
                    let tokenB = data.destToken[1];

                    if (
                        tokenA.address.toLowerCase() == tokenB.address.toLowerCase() ||
                        tokenA.chainId !== tokenB.chainId
                    )
                    {
                        throw "Destination Tokens not defined correctly";
                    }
                    const ammAdapterId = `${data.protocolId}_deposit`;
                    [tokenA, tokenB] = await sortTokens(tokenA, tokenB);

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

                    const instancePoolParams = {
                        tokenA: tokenA,
                        tokenB: tokenB,
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
                    // else
                    // {
                    //     isCrossChain = false;

                    //     if (
                    //         data.srcToken.address.toLowerCase() !==
                    //         destReserveAsset.address.toLowerCase()
                    //     )
                    //     {
                    //         const swapParams: CreateAdapterDefaultParams = {
                    //             adapterId: DEXSPAN_SWAP_ADAPTER_ID,
                    //             sourceChain: currentChain,
                    //             destinationChain: data.destinationChain,
                    //             amount: currentAmount,
                    //             srcToken: data.srcToken,
                    //             destToken: destReserveAsset,
                    //             refundAddress: data.refundAddress,
                    //             partnerId: PARTNER_ID
                    //         };
                    //         const swapAdapter = await adapterService.SelectAdapter(
                    //             DEXSPAN_SWAP_ADAPTER_ID
                    //         );
                    //         const swapQuote = await swapAdapter.GetQuote(swapParams);
                    //         currentAmount = swapQuote.quotation.amountReceived;
                    //         currentChain = swapQuote.currentChain;
                    //         currentToken = swapQuote.currentToken;
                    //         adapterParamsQueue.push(swapQuote.adapterData);
                    //         adapterQuoteQueue.push(swapQuote.quotation);
                    //         time += swapQuote.quotation.estimatedTime;
                    //     }
                    // }

                    // if (Number(currentAmount) < 30000000)
                    // {
                    //     const error = {
                    //         title: "Low Amount",
                    //         message: "Please add token worth more than 20$"
                    //     };
                    //     reject(error);
                    // }

                    const instancePoolData = await this.getInstancePoolData(
                        instancePoolParams.tokenA,
                        instancePoolParams.tokenB,
                        instancePoolParams.destChainId
                    );
                    const [tokenAAmountCal, tokenBAmountCal] = await divideAmountToTokens(
                        instancePoolData.reserveA,
                        instancePoolData.reserveB,
                        String(currentAmount),
                        tokenA,
                        tokenB,
                        currentToken
                    );

                    let [tokenAAmountMinReceived, tokenBAmountMinReceived] = [
                        tokenAAmountCal,
                        tokenBAmountCal
                    ];

                    const swapAdapter = await adapterService.SelectAdapter(DEXSPAN_SWAP_ADAPTER_ID);

                    if (tokenA.address.toLowerCase() != currentToken.address.toLowerCase())
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
                        tokenAAmountMinReceived = String(swapQuoteTokenA.quotation.amountReceived);
                    }

                    // calculating tokenA as primary and remaining amount is sent to Token B
                    // reverseValueForTokenB = await getRemainderValue(
                    //     String(currentAmount),
                    //     currentToken.decimals,
                    //     String(reverseValueForTokenA),
                    //     currentToken.decimals,
                    //     tokenB.decimals
                    // );

                    if (tokenB.address.toLowerCase() != currentToken.address.toLowerCase())
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

                        tokenBAmountMinReceived = String(swapQuoteTokenB.quotation.amountReceived);
                    }

                    // const ammAdapter = await adapterService.SelectAdapter(ammAdapterId);
                    const pairTokenDecimal = await getTokenDecimal(
                        String(instancePoolData.poolAddress),
                        data.destinationChain
                    );
                    const pairPoolTokenData: TokenData = {
                        chainId: String(data.destinationChain),
                        address: String(instancePoolData.poolAddress),
                        decimals: pairTokenDecimal
                    };
                    const ammParams: CreateAdapterDefaultParamsForAmm = {
                        adapterId: ammAdapterId,
                        chain: data.destinationChain,
                        tokenAAmountCal: String(tokenAAmountCal),
                        tokenBAmountCal: String(tokenBAmountCal),
                        tokenAAmount: String(tokenAAmountMinReceived),
                        tokenBAmount: String(tokenBAmountMinReceived),
                        pairPoolToken: pairPoolTokenData,
                        tokenA: tokenA,
                        tokenB: tokenB,
                        refundAddress: data.refundAddress,
                        reservePoolData: instancePoolData,
                        partnerId: PARTNER_ID
                    };

                    const ammAdapter = new VelocorePoolAdapter();
                    const ammQuote = await ammAdapter.GetQuoteForAmm(ammParams);
                    adapterParamsQueue.push(ammQuote.adapterData);
                    adapterQuoteQueue.push(ammQuote.quotation);
                    currentChain = ammQuote.currentChain;
                    currentToken = ammQuote.currentToken;

                    time += ammQuote?.quotation?.estimatedTime ?? 0;
                }
                else if (protocolActions == "stake")
                {
                    quotationType = "ContractTransaction";

                    const poolData = await PoolService.GetPool(data.poolId);
                    const pairTokenIn = poolData.underlyingTokens["tokenIn"];

                    const stakeAdapterId = `${data.protocolId}_stake`;
                    const stakeAdapter = await adapterService.SelectAdapter(stakeAdapterId);
                    const stakeParams: CreateAdapterDefaultParams = {
                        adapterId: stakeAdapterId,
                        sourceChain: currentChain,
                        destinationChain: data.destinationChain,
                        amount: currentAmount,
                        srcToken: data.srcToken,
                        destToken: pairTokenIn,
                        refundAddress: data.refundAddress
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
        destChainId: number
    ): Promise<InstancePoolData>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const poolFactoryAddress = VelocoresPoolFactory[destChainId];
                const poolExist = true;
                const tokenAByte32 = await getTokensInBytes32(tokenA);
                const tokenBByte32 = await getTokensInBytes32(tokenB);
                const poolFactoryContract = await getContract(
                    velocorePoolFactoryAbi,
                    poolFactoryAddress,
                    destChainId
                );
                const getPoolAddress = await poolFactoryContract.pools(tokenAByte32, tokenBByte32);

                const poolContract = await getContract(
                    velocorePoolAbi,
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

export default VelocoreProtocol;
