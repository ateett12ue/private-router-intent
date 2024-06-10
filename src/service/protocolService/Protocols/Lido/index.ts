import ProtocolBase from "../ProtocolBase";
import {
    CreateAdapterDefaultParamsResponse,
    CreateAdapterDefaultParams,
    AdapterIdParamsResponse,
    AdapterQuotationResponse
} from "../../../models/Adapters";
import {
    CreateProtocolDefaultParams,
    CreateProtocolDefaultParamsResponse
} from "../../../models/Protocols";
import { TokenData } from "../../../models/CommonModels";
import {
    DEXSPAN_SWAP_ADAPTER_ID,
    BRIDGE_ADAPTER_ID,
    LIDO_CANONICAL_BRIDGE
} from "../../../../constant/constants";
import { service as adapterService } from "../../../adapterService/AdapterService";
import { service as PoolService } from "../../../poolDataService/PoolDataService";
import BigNumber from "bignumber.js";
import { getCommonDecimalComputedValue } from "../../../../utils/index";
import e = require("express");
import { BridgeChainEnum } from "../../../../constant/BridgeChainEnum";
interface privateGetData
{
    currentAmount: string | number;
    currentChain: number;
    currentToken: TokenData;
    adapterParamsQueue: Array<any>;
    adapterQuoteQueue: Array<any>;
    time: number;
    isCrossChain: boolean;
}

interface compareData
{
    amount: string | number;
    token: TokenData;
}
class LidoProtocol extends ProtocolBase
{
    CreateQuoteAndParams(
        data: CreateProtocolDefaultParams
    ): Promise<CreateProtocolDefaultParamsResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                // const protocolDetails = await this.GetProtocol(data.protocolId);
                const partnerId = 6;
                const poolData = await PoolService.GetPool(data.poolId);
                const protocolActions = data.action;
                const pairTokenIn = poolData.underlyingTokens["tokenIn"];
                const pairTokenOut = poolData.underlyingTokens["tokenOut"];

                // poolData.token[data.destinationChain][data.destToken.address]; //Eth

                let currentChain = data.sourceChain;
                let currentToken = pairTokenIn;
                let currentAmount: string | number = data.amount;

                let isCrossChain = false;
                const adapterParamsQueue: Array<AdapterIdParamsResponse> = [];
                const adapterQuoteQueue: Array<AdapterQuotationResponse> = [];

                let quotationType: string = "BatchTransaction";
                let time = 0;
                if (protocolActions == "stake")
                {
                    if (!data.protocolData.bridgeChain)
                    {
                        data.protocolData.bridgeChain = 1;
                    }
                    const stakingResponse = await this.GetStakingData(data);
                    // {isCrossChain, currentChain, currentAmount, adapterParamsQueue, adapterQuoteQueue}
                    isCrossChain = stakingResponse.isCrossChain;
                    currentChain = stakingResponse.currentChain;
                    currentAmount = stakingResponse.currentAmount;
                    currentToken = stakingResponse.currentToken;
                    adapterParamsQueue.push(...stakingResponse.adapterParamsQueue);
                    adapterQuoteQueue.push(...stakingResponse.adapterQuoteQueue);
                    time += stakingResponse.time;

                    if (
                        data.protocolData.bridgeChain != String(BridgeChainEnum.NO_SUPPLY_CHAIN) &&
                        data.protocolData.bridgeChain != String(BridgeChainEnum.SEPOLIA_CHAIN_ID)
                    )
                    {
                        const canonicalAdapter = await adapterService.SelectAdapter(
                            LIDO_CANONICAL_BRIDGE
                        );
                        const canonicalParams: CreateAdapterDefaultParams = {
                            adapterId: LIDO_CANONICAL_BRIDGE,
                            sourceChain: currentChain,
                            destinationChain: Number(data.protocolData.bridgeChain),
                            amount: currentAmount,
                            srcToken: pairTokenOut,
                            destToken: currentToken,
                            refundAddress: data.refundAddress,
                            partnerId: partnerId,
                            protocolData: data.protocolData
                        };
                        const canonicalQuote = await canonicalAdapter.GetQuote(canonicalParams);
                        adapterParamsQueue.push(canonicalQuote.adapterData);
                        adapterQuoteQueue.push(canonicalQuote.quotation);
                        currentAmount = canonicalQuote.quotation.amountReceived;
                        currentChain = canonicalQuote.currentChain;
                        currentToken = canonicalQuote.currentToken;
                        time += canonicalQuote.quotation.estimatedTime;
                    }
                }
                else if (protocolActions == "express-stake")
                {
                    if (!data.protocolData.bridgeChain)
                    {
                        data.protocolData.bridgeChain = 1;
                    }

                    let stakingResponse;
                    try
                    {
                        stakingResponse = await this.GetStakingData(data);
                    }
                    catch (ex)
                    {
                        if (
                            ex.title.toLowerCase() == "amount too low" &&
                            Number(data.protocolData.bridgeChain) !== 1
                        )
                        {
                            stakingResponse = {
                                isCrossChain: false,
                                currentAmount: 0,
                                currentChain: 1,
                                currentToken: currentToken,
                                adapterParamsQueue: adapterParamsQueue,
                                adapterQuoteQueue: adapterQuoteQueue,
                                time: time
                            };
                        }
                        else
                        {
                            throw ex;
                        }
                    }

                    if (
                        Number(data.protocolData.bridgeChain) == 1 &&
                        stakingResponse.currentAmount !== 0
                    )
                    {
                        isCrossChain = stakingResponse.isCrossChain;
                        currentChain = stakingResponse.currentChain;
                        currentAmount = stakingResponse.currentAmount;
                        currentToken = stakingResponse.currentToken;
                        adapterParamsQueue.push(...stakingResponse.adapterParamsQueue);
                        adapterQuoteQueue.push(...stakingResponse.adapterQuoteQueue);
                    }
                    else
                    {
                        const expressStakingResponse = await this.GetExpressStakingData(data);
                        // {isCrossChain, currentChain, currentAmount, adapterParamsQueue, adapterQuoteQueue}
                        const staking: compareData = {
                            amount: stakingResponse.currentAmount,
                            token: stakingResponse.currentToken
                        };

                        const expressStaking: compareData = {
                            amount: expressStakingResponse.currentAmount,
                            token: expressStakingResponse.currentToken
                        };
                        const comparedStaking = await this.comparedStaking(staking, expressStaking);
                        // const comparedStaking = true;

                        if (comparedStaking)
                        {
                            isCrossChain = stakingResponse.isCrossChain;
                            currentChain = stakingResponse.currentChain;
                            currentAmount = stakingResponse.currentAmount;
                            currentToken = stakingResponse.currentToken;
                            adapterParamsQueue.push(...stakingResponse.adapterParamsQueue);
                            adapterQuoteQueue.push(...stakingResponse.adapterQuoteQueue);
                            time = stakingResponse.time;

                            const canonicalAdapter = await adapterService.SelectAdapter(
                                LIDO_CANONICAL_BRIDGE
                            );
                            const canonicalParams: CreateAdapterDefaultParams = {
                                adapterId: LIDO_CANONICAL_BRIDGE,
                                sourceChain: currentChain,
                                destinationChain: Number(data.protocolData.bridgeChain),
                                amount: currentAmount,
                                srcToken: pairTokenOut,
                                destToken: currentToken,
                                refundAddress: data.refundAddress,
                                partnerId: partnerId,
                                protocolData: data.protocolData
                            };
                            const canonicalQuote = await canonicalAdapter.GetQuote(canonicalParams);
                            adapterParamsQueue.push(canonicalQuote.adapterData);
                            adapterQuoteQueue.push(canonicalQuote.quotation);
                            currentAmount = canonicalQuote.quotation.amountReceived;
                            currentChain = canonicalQuote.currentChain;
                            currentToken = canonicalQuote.currentToken;
                        }
                        else
                        {
                            isCrossChain = expressStakingResponse.isCrossChain;
                            currentChain = expressStakingResponse.currentChain;
                            currentAmount = expressStakingResponse.currentAmount;
                            currentToken = expressStakingResponse.currentToken;
                            adapterParamsQueue.push(...expressStakingResponse.adapterParamsQueue);
                            adapterQuoteQueue.push(...expressStakingResponse.adapterQuoteQueue);
                            time = expressStakingResponse.time;
                        }
                    }
                }
                else if (protocolActions == "express-unstake")
                {
                    const destinationChain = data.destToken[0].chainId;

                    if (String(data.sourceChain) == String(destinationChain))
                    {
                        // dexspan call
                        const swapAdapter = await adapterService.SelectAdapter(
                            DEXSPAN_SWAP_ADAPTER_ID
                        );
                        const swapParams: CreateAdapterDefaultParams = {
                            adapterId: DEXSPAN_SWAP_ADAPTER_ID,
                            sourceChain: currentChain,
                            destinationChain: Number(destinationChain),
                            amount: data.amount,
                            srcToken: pairTokenOut,
                            destToken: data.destToken[0],
                            refundAddress: data.refundAddress
                        };
                        const swapQuote = await swapAdapter.GetQuote(swapParams);
                        adapterParamsQueue.push(swapQuote.adapterData);
                        adapterQuoteQueue.push(swapQuote.quotation);
                        currentAmount = swapQuote.quotation.amountReceived;
                        currentChain = swapQuote.currentChain;
                        currentToken = swapQuote.currentToken;
                        time = swapQuote.quotation.estimatedTime;
                    }
                    else
                    {
                        // forwarder call
                        // encoding iDeposit function here
                        isCrossChain = true;
                        const bridgeParams: CreateAdapterDefaultParams = {
                            adapterId: BRIDGE_ADAPTER_ID,
                            sourceChain: currentChain,
                            destinationChain: Number(destinationChain),
                            amount: currentAmount,
                            srcToken: pairTokenOut,
                            destToken: data.destToken[0],
                            refundAddress: data.refundAddress
                        };
                        const brideAdapter = await adapterService.SelectAdapter(BRIDGE_ADAPTER_ID);
                        const bridgeQuote = await brideAdapter.GetQuote(bridgeParams);
                        currentAmount = bridgeQuote.quotation.amountReceived;
                        currentChain = bridgeQuote.currentChain;
                        currentToken = bridgeQuote.currentToken;
                        adapterParamsQueue.push(bridgeQuote.adapterData);
                        adapterQuoteQueue.push(bridgeQuote.quotation);
                        time = bridgeQuote.quotation.estimatedTime;
                    }
                }
                else if (protocolActions == "unstake")
                {
                    quotationType = "ContractTransaction";
                    if (String(currentChain) !== String(data.destinationChain))
                    {
                        throw "Switch to correct netork";
                    }
                    const unstakeAdapterId = `${data.protocolId}_unstake`;
                    const unstakeAdapter = await adapterService.SelectAdapter(unstakeAdapterId);
                    const unstakeParams: CreateAdapterDefaultParams = {
                        adapterId: unstakeAdapterId,
                        sourceChain: currentChain,
                        destinationChain: data.destinationChain,
                        amount: currentAmount,
                        srcToken: pairTokenOut,
                        destToken: pairTokenIn,
                        refundAddress: data.refundAddress
                    };
                    const unstakeQuote = await unstakeAdapter.GetQuote(unstakeParams);
                    adapterParamsQueue.push(unstakeQuote.adapterData);
                    adapterQuoteQueue.push(unstakeQuote.quotation);
                    currentAmount = unstakeQuote.quotation.amountReceived;
                    currentChain = unstakeQuote.currentChain;
                    currentToken = unstakeQuote.currentToken;
                }
                else if (protocolActions == "claim")
                {
                    quotationType = "ContractTransaction";
                    const claimAdapterId = `${data.protocolId}_claim`;
                    const claimAdapter = await adapterService.SelectAdapter(claimAdapterId);
                    const claimParams: CreateAdapterDefaultParams = {
                        adapterId: claimAdapterId,
                        sourceChain: currentChain,
                        destinationChain: data.destinationChain,
                        amount: currentAmount,
                        srcToken: pairTokenOut,
                        destToken: pairTokenIn,
                        refundAddress: data.refundAddress
                    };
                    const claimQuote = await claimAdapter.GetQuote(claimParams);
                    adapterParamsQueue.push(claimQuote.adapterData);
                    adapterQuoteQueue.push(claimQuote.quotation);
                    currentAmount = claimQuote.quotation.amountReceived;
                    currentChain = claimQuote.currentChain;
                    currentToken = claimQuote.currentToken;
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
                    partnerId: partnerId
                };
                resolve(response);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    private GetStakingData(data: CreateProtocolDefaultParams): Promise<privateGetData>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const partnerId = 6;
                let time = 0;

                const destinationChain = data.protocolData.bridgeChain ?? 1;
                const bridgePoolIdBridge = data.protocolData.bridgePoolId;
                const bridgePoolId = `${bridgePoolIdBridge}_${destinationChain}`;

                const poolId =
                    Number(data.protocolData.bridgeChain) !== 1 ? bridgePoolId : data.poolId;
                const poolData = await PoolService.GetPool(poolId);

                const pairTokenIn = poolData.underlyingTokens["tokenIn"];
                const pairTokenOut = poolData.underlyingTokens["tokenOut"];

                let currentChain = data.sourceChain;
                let currentToken = pairTokenIn;
                let currentAmount: string | number = data.amount;

                let isCrossChain = false;
                const adapterParamsQueue: Array<AdapterIdParamsResponse> = [];
                const adapterQuoteQueue: Array<AdapterQuotationResponse> = [];
                const stakeAdapterId = `${data.protocolId}_stake`;
                if (String(data.sourceChain) == String(data.destinationChain))
                {
                    if (currentToken.address.toLowerCase() != data.srcToken.address.toLowerCase())
                    {
                        const swapAdapter = await adapterService.SelectAdapter(
                            DEXSPAN_SWAP_ADAPTER_ID
                        );
                        const swapParams: CreateAdapterDefaultParams = {
                            adapterId: DEXSPAN_SWAP_ADAPTER_ID,
                            sourceChain: currentChain,
                            destinationChain: data.destinationChain,
                            amount: data.amount,
                            srcToken: data.srcToken,
                            destToken: pairTokenIn,
                            refundAddress: data.refundAddress,
                            partnerId: partnerId
                        };
                        const swapQuote = await swapAdapter.GetQuote(swapParams);
                        adapterParamsQueue.push(swapQuote.adapterData);
                        adapterQuoteQueue.push(swapQuote.quotation);
                        currentAmount = swapQuote.quotation.amountReceived;
                        currentChain = swapQuote.currentChain;
                        currentToken = swapQuote.currentToken;

                        time = swapQuote.quotation.estimatedTime;
                    }
                }
                else
                {
                    isCrossChain = true;
                    const bridgeParams: CreateAdapterDefaultParams = {
                        adapterId: BRIDGE_ADAPTER_ID,
                        sourceChain: currentChain,
                        destinationChain: data.destinationChain,
                        amount: currentAmount,
                        srcToken: data.srcToken,
                        destToken: currentToken,
                        refundAddress: data.refundAddress,
                        partnerId: partnerId
                    };
                    const brideAdapter = await adapterService.SelectAdapter(BRIDGE_ADAPTER_ID);
                    const bridgeQuote = await brideAdapter.GetQuote(bridgeParams);
                    currentAmount = bridgeQuote.quotation.amountReceived;
                    currentChain = bridgeQuote.currentChain;
                    currentToken = bridgeQuote.currentToken;
                    adapterParamsQueue.push(bridgeQuote.adapterData);
                    adapterQuoteQueue.push(bridgeQuote.quotation);
                    time = bridgeQuote.quotation.estimatedTime;
                }
                const stakeAdapter = await adapterService.SelectAdapter(stakeAdapterId);
                const stakeParams: CreateAdapterDefaultParams = {
                    adapterId: stakeAdapterId,
                    sourceChain: currentChain,
                    destinationChain: data.destinationChain,
                    amount: currentAmount,
                    srcToken: currentToken,
                    destToken: pairTokenOut,
                    refundAddress: data.refundAddress,
                    partnerId: partnerId,
                    protocolData: data?.protocolData
                };
                const stakeQuote = await stakeAdapter.GetQuote(stakeParams);
                adapterParamsQueue.push(stakeQuote.adapterData);
                adapterQuoteQueue.push(stakeQuote.quotation);
                currentAmount = stakeQuote.quotation.amountReceived;
                currentChain = stakeQuote.currentChain;
                currentToken = stakeQuote.currentToken;

                time = isCrossChain
                    ? time + stakeQuote.quotation.estimatedTime
                    : stakeQuote.quotation.estimatedTime;

                const response: privateGetData = {
                    isCrossChain: isCrossChain,
                    currentAmount: currentAmount,
                    currentChain: currentChain,
                    currentToken: currentToken,
                    adapterParamsQueue: adapterParamsQueue,
                    adapterQuoteQueue: adapterQuoteQueue,
                    time: time
                };
                resolve(response);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    private GetExpressStakingData(data: CreateProtocolDefaultParams): Promise<privateGetData>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const partnerId = 6;
                let time = 0;
                const destinationChain = data.protocolData.bridgeChain ?? 1;
                const bridgePoolIdBridge = data.protocolData.bridgePoolId;
                const poolId = `${bridgePoolIdBridge}_${destinationChain}`;
                const poolData = await PoolService.GetPool(poolId);
                const pairTokenIn = data.srcToken;
                const pairTokenOut = poolData.underlyingTokens["tokenOut"];

                let currentChain = data.sourceChain;
                let currentToken = pairTokenIn;
                let currentAmount: string | number = data.amount;

                let isCrossChain = false;
                const adapterParamsQueue: Array<AdapterIdParamsResponse> = [];
                const adapterQuoteQueue: Array<AdapterQuotationResponse> = [];

                if (String(data.sourceChain) == String(destinationChain))
                {
                    // dexspan call
                    const swapAdapter = await adapterService.SelectAdapter(DEXSPAN_SWAP_ADAPTER_ID);
                    const swapParams: CreateAdapterDefaultParams = {
                        adapterId: DEXSPAN_SWAP_ADAPTER_ID,
                        sourceChain: currentChain,
                        destinationChain: Number(destinationChain),
                        amount: data.amount,
                        srcToken: currentToken,
                        destToken: pairTokenOut,
                        refundAddress: data.refundAddress,
                        partnerId: partnerId
                    };
                    const swapQuote = await swapAdapter.GetQuote(swapParams);
                    adapterParamsQueue.push(swapQuote.adapterData);
                    adapterQuoteQueue.push(swapQuote.quotation);
                    currentAmount = swapQuote.quotation.amountReceived;
                    currentChain = swapQuote.currentChain;
                    currentToken = swapQuote.currentToken;
                    time = swapQuote.quotation.estimatedTime;
                }
                else
                {
                    // forwarder call
                    // encoding iDeposit function here
                    isCrossChain = true;
                    const bridgeParams: CreateAdapterDefaultParams = {
                        adapterId: BRIDGE_ADAPTER_ID,
                        sourceChain: currentChain,
                        destinationChain: Number(destinationChain),
                        amount: currentAmount,
                        srcToken: currentToken,
                        destToken: pairTokenOut,
                        refundAddress: data.refundAddress,
                        partnerId: partnerId
                    };
                    const brideAdapter = await adapterService.SelectAdapter(BRIDGE_ADAPTER_ID);
                    const bridgeQuote = await brideAdapter.GetQuote(bridgeParams);
                    currentAmount = bridgeQuote.quotation.amountReceived;
                    currentChain = bridgeQuote.currentChain;
                    currentToken = bridgeQuote.currentToken;
                    adapterParamsQueue.push(bridgeQuote.adapterData);
                    adapterQuoteQueue.push(bridgeQuote.quotation);
                    time = bridgeQuote.quotation.estimatedTime;
                }

                const response: privateGetData = {
                    isCrossChain: isCrossChain,
                    currentAmount: currentAmount,
                    currentChain: currentChain,
                    currentToken: currentToken,
                    adapterParamsQueue: adapterParamsQueue,
                    adapterQuoteQueue: adapterQuoteQueue,
                    time: time
                };
                resolve(response);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    private comparedStaking(staking: compareData, expressStaking: compareData): Promise<boolean>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                if (staking.amount == 0)
                {
                    resolve(false);
                }
                if (staking.token.decimals === expressStaking.token.decimals)
                {
                    const stakingAmount = new BigNumber(staking.amount);
                    const expressStakingAmount = new BigNumber(expressStaking.amount);

                    const compare = stakingAmount.isGreaterThan(expressStakingAmount);
                    resolve(compare);
                }
                else
                {
                    const commondecimal = Math.max(
                        staking.token.decimals,
                        expressStaking.token.decimals
                    );
                    const stakingAmount = new BigNumber(
                        getCommonDecimalComputedValue(
                            String(staking.amount),
                            staking.token.decimals,
                            commondecimal
                        )
                    );
                    const expstakingAmount = new BigNumber(
                        getCommonDecimalComputedValue(
                            String(expressStaking.amount),
                            expressStaking.token.decimals,
                            commondecimal
                        )
                    );
                    const compare = stakingAmount.isGreaterThan(expstakingAmount);
                    resolve(compare);
                }
            }
            catch (ex)
            {
                throw ex;
            }
        });
    }
}

export default LidoProtocol;
