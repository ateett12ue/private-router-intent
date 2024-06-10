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
class ParifiProtocol extends ProtocolBase
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
                const partnerId = 71;
                const poolData = data.poolId ? await PoolService.GetPool(data.poolId) : undefined;
                const protocolActions = data.action;
                const pairTokenIn = poolData
                    ? poolData?.underlyingTokens["tokenIn"]
                    : data.srcToken;
                const pairTokenOut = poolData
                    ? poolData?.underlyingTokens["tokenOut"]
                    : data.destToken[0];

                let currentChain = data.sourceChain;
                let currentToken = pairTokenIn;
                let currentAmount: string | number = data.amount;

                let isCrossChain = false;
                const adapterParamsQueue: Array<AdapterIdParamsResponse> = [];
                const adapterQuoteQueue: Array<AdapterQuotationResponse> = [];

                const quotationType: string = "BatchTransaction";

                let time = 0;
                if (protocolActions == "deposit")
                {
                    const depositAdapterId = `${data.protocolId}_deposit`;
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
                                destToken: currentToken,
                                refundAddress: data.refundAddress,
                                partnerId: partnerId
                            };
                            const swapQuote = await swapAdapter.GetQuote(swapParams);
                            adapterParamsQueue.push(swapQuote.adapterData);
                            adapterQuoteQueue.push(swapQuote.quotation);
                            currentAmount = swapQuote.quotation.amountReceived;
                            currentChain = swapQuote.currentChain;
                            currentToken = swapQuote.currentToken;

                            time += swapQuote.quotation.estimatedTime;
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
                        time += bridgeQuote.quotation.estimatedTime;
                    }
                    const depositAdapter = await adapterService.SelectAdapter(depositAdapterId);
                    const depositParams: CreateAdapterDefaultParams = {
                        adapterId: depositAdapterId,
                        sourceChain: currentChain,
                        destinationChain: data.destinationChain,
                        amount: String(currentAmount),
                        srcToken: currentToken,
                        destToken: pairTokenOut,
                        refundAddress: data.refundAddress,
                        partnerId: partnerId
                    };
                    const depositQuote = await depositAdapter.GetQuote(depositParams);
                    adapterParamsQueue.push(depositQuote.adapterData);
                    adapterQuoteQueue.push(depositQuote.quotation);
                    currentAmount = String(depositQuote.quotation.amountReceived);
                    currentChain = depositQuote.currentChain;
                    currentToken = depositQuote.currentToken;

                    time += depositQuote.quotation.estimatedTime;
                }
                else if (protocolActions == "openPosition")
                {
                    const positionAdapterId = `${data.protocolId}_openPosition`;
                    const destToken = data.destToken[0];
                    const sourceToken = data.srcToken;
                    if (String(destToken.chainId) !== String(data.destinationChain))
                    {
                        const error = {
                            title: "incorrect token chainId",
                            message: `Destination chainId should be same for protocol and destination token`
                        };
                        throw error;
                    }
                    if (String(currentChain) == String(data.destinationChain))
                    {
                        if (
                            destToken &&
                            sourceToken.address.toLowerCase() != destToken.address.toLowerCase()
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
                                srcToken: sourceToken,
                                destToken: destToken,
                                refundAddress: data.refundAddress,
                                partnerId: partnerId
                            };
                            const swapQuote = await swapAdapter.GetQuote(swapParams);
                            adapterParamsQueue.push(swapQuote.adapterData);
                            adapterQuoteQueue.push(swapQuote.quotation);
                            currentAmount = swapQuote.quotation.amountReceived;
                            currentChain = swapQuote.currentChain;
                            currentToken = swapQuote.currentToken;
                            time += swapQuote.quotation.estimatedTime;
                        }
                    }
                    else
                    {
                        if (!destToken)
                        {
                            const error = {
                                title: "Destination Token Missing",
                                message: "Destination Token Needed for Cross chain"
                            };
                            throw error;
                        }
                        isCrossChain = true;
                        const bridgeParams: CreateAdapterDefaultParams = {
                            adapterId: BRIDGE_ADAPTER_ID,
                            sourceChain: currentChain,
                            destinationChain: data.destinationChain,
                            amount: currentAmount,
                            srcToken: sourceToken,
                            destToken: destToken,
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
                        time += bridgeQuote.quotation.estimatedTime;
                    }
                    const openPositionAdapter = await adapterService.SelectAdapter(
                        positionAdapterId
                    );
                    const openPositionParams: CreateAdapterDefaultParams = {
                        adapterId: positionAdapterId,
                        sourceChain: currentChain,
                        destinationChain: data.destinationChain,
                        amount: String(currentAmount),
                        srcToken: currentToken,
                        destToken: currentToken,
                        refundAddress: data.refundAddress,
                        partnerId: partnerId,
                        protocolData: data.protocolData
                    };
                    const positionQuote = await openPositionAdapter.GetQuote(openPositionParams);
                    adapterParamsQueue.push(positionQuote.adapterData);
                    adapterQuoteQueue.push(positionQuote.quotation);
                    currentAmount = String(positionQuote.quotation.amountReceived);
                    currentChain = positionQuote.currentChain;
                    currentToken = positionQuote.currentToken;

                    time += positionQuote.quotation.estimatedTime;
                }
                const response: CreateProtocolDefaultParamsResponse = {
                    quotationType: quotationType,
                    currentChain: currentChain,
                    currentToken: currentToken,
                    currentAmount: String(currentAmount),
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
}

export default ParifiProtocol;
