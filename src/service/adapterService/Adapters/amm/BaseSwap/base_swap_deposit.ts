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
    CreateAdapterDefaultParamsForAmmV4
} from "../../../../models/Adapters";
import { formatEther, getMinimumAmount, getEpochTime, MAX_UINT_256 } from "../../../../../utils";
import { abiEncode } from "../../../../../utils";
import { TokenData } from "../../../../models/CommonModels";
interface BaseSwapV3SupplyData
{
    token0: TokenData;
    token1: TokenData;
    tickLower: string;
    tickUpper: string;
    amount0Desired: string;
    amount1Desired: string;
    amount0Min: string;
    amount1Min: string;
    recipient: string;
    deadline: number;
    fee: number;
    token0Reserve: string;
    token1Reserve: string;
}
class BaseSwapV3PoolAdapter extends AmmAdapterBase
{
    GetQuote(data: CreateAdapterDefaultParams): Promise<CreateAdapterDefaultParamsResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            throw "not implemented";
        });
    }

    GetQuoteForAmm(
        data: CreateAdapterDefaultParamsForAmmV4
    ): Promise<CreateAdapterDefaultParamsResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const tokenAAmountMin = await getMinimumAmount(String(data.tokenAAmount));
                const tokenBAmountMin = await getMinimumAmount(String(data.tokenBAmount));
                const deadline = await getEpochTime(1);
                const quoteData: BaseSwapV3SupplyData = {
                    token0: data.tokenA,
                    token1: data.tokenB,
                    tickLower: data.reservePoolData.lowerTick,
                    tickUpper: data.reservePoolData.upperTick,
                    amount0Desired: String(data.tokenAAmount),
                    amount1Desired: String(data.tokenBAmount),
                    amount0Min: tokenAAmountMin,
                    amount1Min: tokenBAmountMin,
                    recipient: data.refundAddress,
                    deadline: deadline,
                    token0Reserve: data.reservePoolData.reserveA,
                    token1Reserve: data.reservePoolData.reserveB,
                    fee: data.reservePoolData.fee
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
                const adapterData: BaseSwapV3SupplyData = adapterOptions.data;
                const target = adapterDetails.chains[adapter.sourceChainId].adapterAddress;
                const callType = 2; //  can be changed
                const value = 0; //  can be changed
                const uintMax = MAX_UINT_256;
                const mintParamsIface =
                    "tuple(address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline) MintParams";

                const calldata = abiEncode(
                    [mintParamsIface],
                    [
                        {
                            token0: adapterData.token0.address,
                            token1: adapterData.token1.address,
                            fee: adapterData.fee,
                            tickLower: adapterData.tickLower,
                            tickUpper: adapterData.tickUpper,
                            amount0Desired: uintMax,
                            amount1Desired: uintMax,
                            amount0Min: adapterData.amount0Min,
                            amount1Min: adapterData.amount1Min,
                            recipient: adapterData.recipient,
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

export default BaseSwapV3PoolAdapter;
