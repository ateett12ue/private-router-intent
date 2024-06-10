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
import { service as StaderPriceApi } from "../../../../../serviceclients/adapterPriceApi/stake/StaderApi";
import { CHAIN_IDS } from "../../../../../constant/ChainIdsEnum";
import {
    formatEther,
    parseAmount,
    getTransactionTime,
    getEncodedFunctionValue
} from "../../../../../utils";
import { staderWithdrawAbi } from "../../../../../abis/StaderWithdraw";
class StaderUnstakeAdapter extends AdapterBase
{
    GetQuote(data: CreateAdapterDefaultParams): Promise<CreateAdapterDefaultParamsResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const adapterDetails = await this.GetAdapter(data.adapterId);
                const contractAddress = adapterDetails.chains[data.sourceChain].adapterAddress;
                const adapterParams: AdapterIdParamsResponse = {
                    adapterId: data.adapterId,
                    adapterType: "unstake",
                    sourceChainId: data.sourceChain,
                    destChainId: data.destinationChain,
                    adapterOptions: {
                        srcToken: data.srcToken,
                        amountIn: String(data.amount),
                        amountOut: String(data.amount),
                        destToken: data.destToken,
                        receiverAddress: "",
                        data: {
                            refundAddress: data.refundAddress,
                            contractAddress: contractAddress
                        }
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

                const receiverAddress: string = data.refundAddress;
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
                let getExchangePrice: number = 1;
                if (
                    String(data.destinationChain) == CHAIN_IDS.ETH ||
                    String(data.destinationChain) == CHAIN_IDS.ETH_GOERLI
                )
                {
                    getExchangePrice = await StaderPriceApi.PriceApiEth();
                }
                else if (
                    String(data.destinationChain) == CHAIN_IDS.POLYGON ||
                    String(data.destinationChain) == CHAIN_IDS.POLYGON_MUMBAI
                )
                {
                    getExchangePrice = await StaderPriceApi.PriceApiMatic();
                }
                const formatAmount: number = Number(
                    formatEther(String(data.amount), data.destDecimal || 18)
                );
                const finalAmount: string = (formatAmount * getExchangePrice).toFixed(6);
                const weiAmount: number = Number(
                    parseAmount(String(finalAmount), data.destDecimal)
                );
                const response: AdapterQuotationApiResponse = {
                    amountSent: data.amount,
                    amountReceived: weiAmount,
                    amountReceivedInEther: finalAmount,
                    exchangeRate: getExchangePrice
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
                throw "not implemented";
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
                const contractAddress = adapter.adapterOptions.data.contractAddress;
                const ethxAmount = adapter.adapterOptions.amountIn;
                const receiverAddress = adapter.adapterOptions.receiverAddress;
                const encodedData = await getEncodedFunctionValue(
                    staderWithdrawAbi,
                    "requestWithdraw",
                    [ethxAmount, receiverAddress]
                );
                const value = "0x00";
                const prioritySteps = await this.GetAdapterSteps(adapter);
                const response: NoBatchCalldataResponse = {
                    calldata: encodedData,
                    value: value,
                    contractAddress: contractAddress,
                    contractName: "StaderWithdrawManager",
                    prioritySteps: prioritySteps
                };
                resolve(response);
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

export default StaderUnstakeAdapter;
