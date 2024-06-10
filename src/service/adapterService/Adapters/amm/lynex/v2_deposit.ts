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
import { formatEther, getMinimumAmount, getEpochTime, MAX_UINT_256 } from "../../../../../utils";
import { abiEncode } from "../../../../../utils";
import { TokenData } from "../../../../models/CommonModels";
import { InstancePoolData } from "../../../../models/Protocols";
interface LynexSupplyData
{
    tokenA: TokenData;
    tokenB: TokenData;
    stable: boolean;
    amountACal: string;
    amountBCal: string;
    amountADesired: string;
    amountBDesired: string;
    amountAMin: string;
    amountBMin: string;
    to: string;
    deadline: number;
    poolData: InstancePoolData;
}
class LynexPoolAdapter extends AmmAdapterBase
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

                const deadline = getEpochTime(1);
                const quoteData: LynexSupplyData = {
                    tokenA: data.tokenA,
                    tokenB: data.tokenB,
                    stable: data.stable,
                    amountACal: String(data.tokenAAmountCal),
                    amountBCal: String(data.tokenBAmountCal),
                    amountADesired: String(data.tokenAAmount),
                    amountBDesired: String(data.tokenBAmount),
                    amountAMin: tokenAAmountMin,
                    amountBMin: tokenBAmountMin,
                    to: data.refundAddress,
                    deadline: deadline,
                    poolData: data.reservePoolData
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
                    currentToken: data.pairPoolToken,
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
                /*
                address tokenA;
                address tokenB;
                bool stable;
                uint256 amountADesired;
                uint256 amountBDesired;
                uint256 amountAMin;
                uint256 amountBMin;
                address to;
                uint256 deadline;
                */
                const adapterDetails = await this.GetAdapter(adapter.adapterId);
                const adapterOptions = adapter.adapterOptions;
                const adapterData: LynexSupplyData = adapterOptions.data;
                const target = adapterDetails.chains[adapter.sourceChainId].adapterAddress;
                const callType = 2; //  can be changed
                const value = 0; //  can be changed
                const uintMax = MAX_UINT_256;
                const calldata = abiEncode(
                    [
                        "address",
                        "address",
                        "bool",
                        "uint256",
                        "uint256",
                        "uint256",
                        "uint256",
                        "address",
                        "uint256"
                    ],
                    [
                        adapterData.tokenA.address,
                        adapterData.tokenB.address,
                        adapterData.stable,
                        uintMax,
                        uintMax,
                        adapterData.amountAMin,
                        adapterData.amountBMin,
                        adapterData.to,
                        adapterData.deadline
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

export default LynexPoolAdapter;
