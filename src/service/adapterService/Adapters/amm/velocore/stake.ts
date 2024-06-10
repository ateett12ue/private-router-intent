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
    getContract,
    toToken32Bit
} from "../../../../../utils";
import { toPoolId32Bit, tokenInformationAmountEncoded32Bit } from "../../../../../utils";
import { velocoreStakeAbi } from "../../../../../abis/VelocoreStake";

interface velocoreOperations
{
    poolId: string;
    tokenInformations: Array<string>;
    data: string;
}

interface executeParams
{
    tokenRef: Array<string>;
    deposit: Array<number>;
    velocoreOperation: Array<velocoreOperations>;
}
class VelocoreStakeAdapter extends AdapterBase
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
                    adapterType: "stake",
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

                const tokens = [];
                tokens[0] = toToken32Bit("erc20", 0, adapter.adapterOptions.srcToken.address); // LVC-ETH-VLP
                tokens[1] = toToken32Bit("erc20", 0, adapter.adapterOptions.destToken.address); // LVC

                const vcPool = adapter.adapterOptions.srcToken.address;
                const toPoolId = toPoolId32Bit("0x01", vcPool);
                const toTokenInformation = [];
                toTokenInformation[0] = tokenInformationAmountEncoded32Bit(
                    "0x00",
                    "exactly",
                    adapter.adapterOptions.amountIn
                ); // amount of Pool TOkens
                toTokenInformation[1] = tokenInformationAmountEncoded32Bit("0x01", "at most", "0"); ////we don't know how much VC we'd harvest in this action. so just use AT_MOST 0 .
                const data: executeParams = {
                    tokenRef: tokens, // LVC TOken, pool pair
                    deposit: [0, 0], // 0,0
                    velocoreOperation: [
                        {
                            poolId: toPoolId, // pool address with 0x01
                            tokenInformations: toTokenInformation,
                            data: "0x00" // 0x00
                        }
                    ]
                };
                const encodedData = await getEncodedFunctionValue(velocoreStakeAbi, "execute", [
                    data.tokenRef,
                    data.deposit,
                    data.velocoreOperation
                ]);
                const value = "0x00";
                const prioritySteps = await this.GetAdapterSteps(adapter);
                const response: NoBatchCalldataResponse = {
                    calldata: encodedData,
                    value: value,
                    contractAddress: contractAddress,
                    contractName: "VelocoreSwapFacet",
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

export default VelocoreStakeAdapter;
