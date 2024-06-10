import AdapterBase from "../AdapterBase";
import {
    CreateAdapterDefaultParams,
    CreateAdapterDefaultParamsResponse,
    AdapterIdParamsResponse,
    AdapterQuotationParams,
    AdapterQuotationApiResponse,
    CalldataResponse,
    NoBatchCalldataResponse
} from "../../../models/Adapters";
import {
    service as SeqTestnetApi,
    QuoteParams
} from "../../../../serviceclients/sequencerApi/testnet";
import { service as SeqMainnetApi } from "../../../../serviceclients/sequencerApi/mainnet";
import {
    formatEther,
    parseAmount,
    checkPathForNativeToken,
    calculateSlippage,
    isMainnet,
    getMinimumAmount,
    getContract
} from "../../../../utils";
import { abiEncode, GetBatchHandlerAddress } from "../../../../utils";
import { TokenData } from "../../../models/CommonModels";
import { CHAIN_IDS } from "../../../../constant/ChainIdsEnum";
import { MaxUint256 } from "ethers";
import { ThirdFyQuoterAbi } from "../../../../abis/ThirdFyQuoter";
import { ThirdfyQuoterFactory } from "../../../../constant/contractMapping";
interface ThirdFySwapQuoteParams
{
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    tokenOutDecimals: number;
    slippageTolerance: number;
}

interface ThirdFySwapData
{
    tokenIn: TokenData;
    tokenOut: TokenData;
    recipient: string;
    amountIn: string;
    amountOutMinimum: string;
}

class ThirdFySwapAdapter extends AdapterBase
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
                    adapterType: "swap",
                    sourceChainId: data.sourceChain,
                    destChainId: data.destinationChain,
                    adapterOptions: {
                        srcToken: data.srcToken,
                        amountIn: String(data.amount),
                        amountOut: String(data.amount),
                        destToken: data.destToken,
                        receiverAddress: "",
                        data: {
                            partnerId: data.partnerId ?? 0,
                            ...data.protocolData
                        }
                    },
                    adapters: []
                };

                const quotationParams: AdapterQuotationParams = {
                    amount: data.amount,
                    sourceChain: data.sourceChain,
                    destinationChain: data.destinationChain,
                    destDecimal: data.destToken.decimals,
                    srcToken: data.srcToken,
                    destToken: data.destToken,
                    slippageTolerance: data.protocolData?.slippageTolerance
                };

                const adapterQuotation: AdapterQuotationApiResponse =
                    await this.GetAdapterEstimates(quotationParams);

                const receiverAddress: `0x${string}` = GetBatchHandlerAddress(
                    Number(CHAIN_IDS.ARTHERA)
                );
                adapterParams.adapterOptions.amountOut = String(adapterQuotation.amountReceived);
                adapterParams.adapterOptions.receiverAddress = receiverAddress;
                adapterParams.adapterOptions.data = {
                    ...adapterQuotation,
                    ...adapterParams.adapterOptions.data
                };
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
                const slippageTolerance = data.slippageTolerance ?? 1;

                const getExchangePrice: number = 1;
                const quoteParams: ThirdFySwapQuoteParams = {
                    tokenIn: data.srcToken.address,
                    tokenOut: data.destToken.address,
                    tokenOutDecimals: data.destDecimal,
                    amountIn: String(data.amount),
                    slippageTolerance
                };

                const isMainnetChain = isMainnet(data.sourceChain);

                if (!isMainnetChain) throw new Error("Only Arthera Mainnet chain");

                const xx = ThirdfyQuoterFactory[CHAIN_IDS.ARTHERA];
                const contract = await getContract(ThirdFyQuoterAbi, xx, Number(CHAIN_IDS.ARTHERA));

                const quotation = await contract.quoteExactInputSingle(
                    quoteParams.tokenIn,
                    quoteParams.tokenOut,
                    quoteParams.amountIn,
                    0
                );

                const amountReceived = quotation[0];
                const formatAmount: number = Number(
                    formatEther(String(amountReceived), quoteParams.tokenOutDecimals || 18)
                );
                const finalAmount: string = (formatAmount / getExchangePrice).toFixed(6);

                const response: AdapterQuotationApiResponse = {
                    amountSent: data.amount,
                    amountReceived: amountReceived.toString(),
                    amountReceivedInEther: finalAmount,
                    exchangeRate: getExchangePrice,
                    slippageTolerance: slippageTolerance
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
                const amountOutMinimum = await calculateSlippage(
                    adapter.adapterOptions.amountOut,
                    adapter.adapterOptions.data.slippageTolerance
                );

                const adapterData: ThirdFySwapData = {
                    tokenIn: adapterOptions.srcToken,
                    tokenOut: adapterOptions.destToken,
                    recipient: adapterOptions.receiverAddress,
                    amountIn: adapterOptions.amountIn,
                    amountOutMinimum: amountOutMinimum.toString()
                };

                const target = adapterDetails.chains[adapter.sourceChainId].adapterAddress;
                const callType = 2; //  can be changed
                const value = 0; //  can be changed
                const uintMax = MaxUint256;
                const swapParamsIface =
                    "tuple(address tokenIn, address tokenOut, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 limitSqrtPrice) ExactInputSingleParams";

                const calldata = abiEncode(
                    [swapParamsIface],
                    [
                        {
                            tokenIn: adapterData.tokenIn.address,
                            tokenOut: adapterData.tokenOut.address,
                            recipient: adapterData.recipient,
                            deadline: MaxUint256,
                            amountIn: uintMax,
                            amountOutMinimum: adapterData.amountOutMinimum,
                            limitSqrtPrice: 0
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

    GetAdapterSteps(adapter: AdapterIdParamsResponse): Promise<any>
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

export default ThirdFySwapAdapter;
