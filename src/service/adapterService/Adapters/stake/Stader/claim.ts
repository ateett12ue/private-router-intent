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
    estimateGasPrice,
    getEncodedFunctionValue,
    getContract
} from "../../../../../utils";
import { abiEncode, GetBatchHandlerAddress } from "../../../../../utils";
import { staderWithdrawAbi } from "../../../../../abis/StaderWithdraw";
interface userWithdrawRequests
{
    requestId: string;
    owner: string;
    ethXAmount: string;
    ethExpected: string;
    ethFinalized: string;
    requestBlock: string;
}
class StaderClaimAdapter extends AdapterBase
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
                    adapterType: "claim",
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
                    sourceChain: data.sourceChain,
                    quotationData: adapterParams.adapterOptions.data
                };
                const adapterQuotation: AdapterQuotationApiResponse =
                    await this.GetAdapterEstimates(quotationParams);

                const receiverAddress: string = data.refundAddress;
                adapterParams.adapterOptions.amountOut = String(adapterQuotation.amountReceived);
                adapterParams.adapterOptions.receiverAddress = receiverAddress;

                // const time = await getTransactionTime(data.sourceChain);
                const response: CreateAdapterDefaultParamsResponse = {
                    currentChain: data.destinationChain,
                    currentToken: data.destToken,
                    adapterData: adapterParams,
                    quotation: {
                        ...adapterQuotation,
                        srcToken: data.srcToken.address,
                        destToken: data.destToken.address,
                        adapterId: data.adapterId,
                        estimatedTime: 0
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
                // fetch all requestId for userAddress
                const contractAddress = data.quotationData.contractAddress;
                const clientAddress = data.quotationData.refundAddress;
                const withdrawContract = await getContract(
                    staderWithdrawAbi,
                    contractAddress,
                    data.sourceChain
                );

                const requesIdByUser = await withdrawContract.getRequestIdsByUser(clientAddress);
                const requestData: Array<userWithdrawRequests> = [];
                if (requesIdByUser.length > 0)
                {
                    for (let i = 0, len = requesIdByUser.length; i < len; i++)
                    {
                        const requestDetails = await withdrawContract.userWithdrawRequests(
                            requesIdByUser[i]
                        );
                        const withdrawRequest: userWithdrawRequests = {
                            requestId: String(requesIdByUser[i]),
                            owner: String(requestDetails[0]),
                            ethXAmount: String(requestDetails[1]),
                            ethExpected: String(requestDetails[2]),
                            ethFinalized: String(requestDetails[3]),
                            requestBlock: String(requestDetails[4])
                        };
                        requestData.push(withdrawRequest);
                    }
                }
                const response: AdapterQuotationApiResponse = {
                    amountSent: 0,
                    amountReceived: 0,
                    amountReceivedInEther: 0,
                    data: requestData
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
                throw "not implemented for direct claim";
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
                const requestId = adapter.adapterOptions.data.requestId;
                const encodedData = await getEncodedFunctionValue(staderWithdrawAbi, "claim", [
                    requestId
                ]);
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

export default StaderClaimAdapter;
