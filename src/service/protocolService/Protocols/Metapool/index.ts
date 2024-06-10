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
class MetapoolProtocol extends ProtocolBase
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

                const quotationType: string = "BatchTransaction";

                let currentChain = data.sourceChain;
                let currentToken = pairTokenIn;
                let currentAmount: string | number = data.amount;

                let isCrossChain = false;
                const adapterParamsQueue: Array<AdapterIdParamsResponse> = [];
                const adapterQuoteQueue: Array<AdapterQuotationResponse> = [];

                let time = 0;
                if (protocolActions == "stake")
                {
                    const stakeAdapterId = `${data.protocolId}_stake`;
                    if (data.sourceChain == data.destinationChain)
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
                const response: CreateProtocolDefaultParamsResponse = {
                    quotationType: quotationType,
                    currentChain: currentChain,
                    currentToken: currentToken,
                    currentAmount: currentAmount,
                    isCrossChain: isCrossChain,
                    quotationData: adapterQuoteQueue,
                    adapterData: adapterParamsQueue,
                    estimatedTime: time
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

export default MetapoolProtocol;
