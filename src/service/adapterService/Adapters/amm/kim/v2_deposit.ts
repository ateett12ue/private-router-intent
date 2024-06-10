import AmmAdapterBase from "../../AmmAdaptersBase";
import {
    CreateAdapterDefaultParams,
    CreateAdapterDefaultParamsResponse,
    AdapterIdParamsResponse,
    AdapterQuotationParams,
    AdapterQuotationApiResponse,
    CalldataResponse,
    PrioritySteps,
    NoBatchCalldataResponse,
    CreateAdapterDefaultParamsForAmm
} from "../../../../models/Adapters";
import { service as StaderPriceApi } from "../../../../../serviceclients/adapterPriceApi/stake/StaderApi";
import { CHAIN_IDS } from "../../../../../constant/ChainIdsEnum";
import {
    formatEther,
    parseAmount,
    getTransactionTime,
    getMinimumAmount,
    getEpochTime,
    getTokenDecimal,
    MAX_UINT_256
} from "../../../../../utils";
import { abiEncode, GetBatchHandlerAddress } from "../../../../../utils";
import { TokenData } from "../../../../models/CommonModels";
interface KimV2SupplyData
{
    tokenA: TokenData;
    tokenB: TokenData;
    to: string;
    amountADesired: string;
    amountBDesired: string;
    amountAMin: string;
    amountBMin: string;
    deadline: number;
}
class KimV2PoolAdapter extends AmmAdapterBase
{
    GetQuote(data: CreateAdapterDefaultParams): Promise<CreateAdapterDefaultParamsResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            throw "not implemented";
        });
    }

    GetQuoteForAmm(
        data: CreateAdapterDefaultParamsForAmm
    ): Promise<CreateAdapterDefaultParamsResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const tokenAAmountMin = await getMinimumAmount(String(data.tokenAAmount));
                const tokenBAmountMin = await getMinimumAmount(String(data.tokenBAmount));

                // const tokenAAmountMin = '0';
                // const tokenBAmountMin = '0';

                const deadline = await getEpochTime(1);
                const quoteData: KimV2SupplyData = {
                    tokenA: data.tokenA,
                    tokenB: data.tokenB,
                    to: data.refundAddress,
                    amountADesired: String(data.tokenAAmount),
                    amountBDesired: String(data.tokenBAmount),
                    amountAMin: tokenAAmountMin,
                    amountBMin: tokenBAmountMin,
                    deadline: deadline
                };
                const adapterParams: AdapterIdParamsResponse = {
                    adapterId: data.adapterId,
                    adapterType: "amm",
                    sourceChainId: data.chain,
                    destChainId: data.chain,
                    adapterOptions: {
                        srcToken: undefined,
                        amountIn: undefined,
                        amountOut: undefined,
                        destToken: undefined,
                        receiverAddress: "",
                        data: {
                            refundAddress: data.refundAddress,
                            ...quoteData
                        }
                    },
                    adapters: []
                };
                const quotationParams: AdapterQuotationParams = {
                    amount: 0,
                    destinationChain: data.chain,
                    destDecimal: 0,
                    sourceChain: data.chain,
                    quotationData: {}
                };
                const adapterQuotation: AdapterQuotationApiResponse =
                    await this.GetAdapterEstimates(quotationParams);

                const response: CreateAdapterDefaultParamsResponse = {
                    currentChain: data.chain,
                    currentToken: undefined,
                    adapterData: adapterParams,
                    quotation: {
                        ...adapterQuotation,
                        srcToken: "",
                        destToken: "",
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
                const weiAmount: number = Number(
                    formatEther(String(data.amount), data.destDecimal)
                );
                const quote: AdapterQuotationApiResponse = {
                    amountSent: data.amount,
                    amountReceived: data.amount,
                    amountReceivedInEther: weiAmount
                };
                resolve(quote);
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
                const adapterData: KimV2SupplyData = adapterOptions.data;
                const target = adapterDetails.chains[adapter.sourceChainId].adapterAddress;
                const callType = 2; //  can be changed
                const value = 0; //  can be changed
                const uintMax = MAX_UINT_256;
                const mintParamsIface =
                    "tuple(address tokenA, address tokenB, address to, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, uint256 deadline) KimSupplyData";

                const calldata = abiEncode(
                    [mintParamsIface],
                    [
                        {
                            tokenA: adapterData.tokenA.address,
                            tokenB: adapterData.tokenB.address,
                            to: adapterData.to,
                            amountADesired: uintMax,
                            amountBDesired: uintMax,
                            amountAMin: adapterData.amountAMin,
                            amountBMin: adapterData.amountBMin,
                            deadline: adapterData.deadline
                        }
                    ]
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

export default KimV2PoolAdapter;
