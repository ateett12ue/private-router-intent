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
import { DEXSPAN_SWAP_ADAPTER_ID, BRIDGE_ADAPTER_ID } from "../../../../constant/constants";
import { service as adapterService } from "../../../adapterService/AdapterService";
import { service as PoolService } from "../../../poolDataService/PoolDataService";
class StaderProtocol extends ProtocolBase
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
                const poolData = await PoolService.GetPool(data.poolId);
                const protocolActions = data.action;
                const pairTokenIn = poolData.underlyingTokens["tokenIn"];
                const pairTokenOut = poolData.underlyingTokens["tokenOut"];
                // poolData.token[data.destinationChain][data.destToken.address]; //Ethx

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
                    const stakeAdapterId = `${data.protocolId}_stake`;
                    if (String(data.sourceChain) == String(data.destinationChain))
                    {
                        if (
                            currentToken.address.toLowerCase() !=
                            data.srcToken.address.toLowerCase()
                        )
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
                    const stakeAdapter = await adapterService.SelectAdapter(stakeAdapterId);
                    const stakeParams: CreateAdapterDefaultParams = {
                        adapterId: stakeAdapterId,
                        sourceChain: currentChain,
                        destinationChain: data.destinationChain,
                        amount: currentAmount,
                        srcToken: currentToken,
                        destToken: pairTokenOut,
                        refundAddress: data.refundAddress
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
}

export default StaderProtocol;
