import { IAdapter } from "../../IAdapter";
import AdapterBase from "../../AdapterBase";
import {
    CreateAdapterDefaultParams,
    CreateAdapterDefaultParamsResponse,
    AdapterIdParamsResponse,
    AdapterQuotationParams,
    AdapterQuotationApiResponse,
    CalldataResponse,
    PrioritySteps,
    NoBatchCalldataResponse
} from "../../../../models/Adapters";
import {
    service as SwellPriceApi,
    PriceResponse
} from "../../../../../serviceclients/adapterPriceApi/stake/SwellApi";
import { CHAIN_IDS } from "../../../../../constant/ChainIdsEnum";
import {
    formatEther,
    parseAmount,
    getTransactionTime,
    estimateGasPrice
} from "../../../../../utils";
import { abiEncode, GetBatchHandlerAddress } from "../../../../../utils";
class SwellStakeAdapter extends AdapterBase
{
    GetQuote(data: CreateAdapterDefaultParams): Promise<CreateAdapterDefaultParamsResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                // const adapterDetails = await this.GetAdapter(data.adapterId);
                const adapterParams: AdapterIdParamsResponse = {
                    adapterId: data.adapterId,
                    adapterType: "stake",
                    sourceChainId: data.sourceChain,
                    destChainId: data.destinationChain,
                    adapterOptions: {
                        srcToken: data.srcToken,
                        amountIn: String(data.amount),
                        amountOut: String(data.amount),
                        destToken: data.destToken,
                        receiverAddress: ""
                    },
                    adapters: []
                };
                const quotationParams: AdapterQuotationParams = {
                    amount: data.amount,
                    destinationChain: data.destinationChain,
                    destDecimal: data.destToken.decimals,
                    sourceChain: data.sourceChain
                };
                const adapterQuotation: AdapterQuotationApiResponse =
                    await this.GetAdapterEstimates(quotationParams);

                const receiverAddress: `0x${string}` = GetBatchHandlerAddress(
                    data.destinationChain
                );
                adapterParams.adapterOptions.amountOut = String(adapterQuotation.amountReceived);
                adapterParams.adapterOptions.receiverAddress = receiverAddress;

                const time = await getTransactionTime(data.sourceChain);
                const response: CreateAdapterDefaultParamsResponse = {
                    currentChain: data.destinationChain,
                    currentToken: data.destToken,
                    adapterData: adapterParams,
                    quotation: {
                        ...adapterQuotation,
                        srcToken: data.srcToken.address,
                        destToken: data.destToken.address,
                        adapterId: data.adapterId,
                        estimatedTime: time
                    }
                };
                resolve(response);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
    GetAdapterEstimates(data: AdapterQuotationParams): Promise<AdapterQuotationApiResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const getExchangeData: PriceResponse = await SwellPriceApi.PriceApiEth();
                const exchangePrice: number = Number(getExchangeData.rate) ?? 1;
                const formatAmount: number = Number(
                    formatEther(String(data.amount), data.destDecimal || 18)
                );
                const finalAmount: number = formatAmount / exchangePrice;
                const weiAmount: number = Number(
                    parseAmount(String(finalAmount), data.destDecimal)
                );
                const response: AdapterQuotationApiResponse = {
                    amountSent: data.amount,
                    amountReceived: weiAmount,
                    amountReceivedInEther: finalAmount,
                    exchangeRate: exchangePrice
                };
                resolve(response);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    ComposeCalldata(adapter: AdapterIdParamsResponse): Promise<CalldataResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const adapterDetails = await this.GetAdapter(adapter.adapterId);
                const adapterOptions = adapter.adapterOptions;
                const target = adapterDetails.chains[adapter.sourceChainId].adapterAddress;
                const callType = 2; //  can be changed
                const value = 0; //  can be changed
                const calldata = abiEncode(
                    ["address", "uint256"],
                    [adapterOptions.receiverAddress, adapterOptions.amountIn]
                );
                const prioritySteps = await this.GetAdapterSteps(adapter);
                const response: CalldataResponse = {
                    target,
                    callType,
                    value,
                    calldata,
                    prioritySteps
                };
                resolve(response);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
    NoBatchComposeCalldata(adapter: AdapterIdParamsResponse): Promise<NoBatchCalldataResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                throw "not implemented";
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    GetAdapterSteps(adapter: AdapterIdParamsResponse): Promise<Array<PrioritySteps>>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                resolve([]);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
}

export default SwellStakeAdapter;
