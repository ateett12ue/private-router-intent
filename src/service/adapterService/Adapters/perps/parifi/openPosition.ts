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
import { EIP712ABI } from "../../../../../abis/EIP712ABI";
import { formatEther, parseAmount, getTransactionTime } from "../../../../../utils";
import { PARIFI_ORDER_MANAGER } from "../../../../../constant/contractMapping";
import { abiEncode, GetBatchHandlerAddress, MAX_UINT_256, getContract } from "../../../../../utils";
class ParifiOpenPositionAdapter extends AdapterBase
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
                    adapterType: "openPosition",
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
                            signatureParams: data.protocolData
                                ? data.protocolData?.signatureParams
                                : null,
                            permitParams: data.protocolData
                                ? data.protocolData?.permitParams
                                : null,
                            transactionData: data.protocolData
                                ? data.protocolData?.transactionData
                                : null // send by users
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
                const response: AdapterQuotationApiResponse = {
                    amountSent: 0,
                    amountReceived: 0,
                    amountReceivedInEther: 0,
                    data: {}
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
                const adapterData = adapter.adapterOptions.data;
                if (
                    !adapterData.transactionData ||
                    !adapterData.permitParams ||
                    !adapterData.signatureParams
                )
                {
                    const error = {
                        title: "Params Missing",
                        message: "Need transactionData, permitParams and signature"
                    };
                    throw error;
                }
                if (
                    !adapterData.permitParams.v ||
                    !adapterData.permitParams.r ||
                    !adapterData.permitParams.s ||
                    !adapterData.permitParams.deadline
                )
                {
                    const error = {
                        title: "permit Params Missing",
                        message: "v, r , s, deadline required in permit params"
                    };
                    throw error;
                }
                const adapterDetails = await this.GetAdapter(adapter.adapterId);

                const target = adapterDetails.chains[adapter.destChainId].adapterAddress;
                const callType = 2; //  can be changed
                const value = 0; //  can be changed
                const txTuple =
                    "tuple(address fromAddress, address toAddress, uint256 txValue, uint256 minGas, uint256 maxGasPrice, uint256 userNonce, uint256 txDeadline, bytes txData)";
                const permitParamsTuple = "tuple(uint256 deadline, bytes32 r, bytes32 s, uint8 v)";
                const transactionData = {
                    fromAddress: adapterData.transactionData.fromAddress,
                    toAddress: adapterData.transactionData.toAddress,
                    txValue: adapterData.transactionData.txValue,
                    minGas: adapterData.transactionData.minGas,
                    maxGasPrice: adapterData.transactionData.maxGasPrice,
                    userNonce: adapterData.transactionData.userNonce,
                    txDeadline: adapterData.transactionData.txDeadline,
                    txData: adapterData.transactionData.txData
                };
                const permitParams = {
                    v: adapterData.permitParams.v,
                    r: adapterData.permitParams.r,
                    s: adapterData.permitParams.s,
                    deadline: adapterData.permitParams.deadline
                };

                const calldata = abiEncode(
                    [txTuple, permitParamsTuple, "bytes"],
                    [transactionData, permitParams, adapterData.signatureParams]
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

export default ParifiOpenPositionAdapter;
