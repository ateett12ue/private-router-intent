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
    getMinimumAmount
} from "../../../../utils";
import { abiEncode, GetBatchHandlerAddress } from "../../../../utils";
import { TokenData } from "../../../models/CommonModels";
import { CHAIN_IDS } from "../../../../constant/ChainIdsEnum";

interface SwapData
{
    tokens: Array<string>;
    flags: Array<string>;
    dataTx: Array<string>;
    sourceStableReserveAmount: string;
    sourceStableReserveToken: TokenData;
    slippageTolerance: number;
}
class DexspanSwapAdapter extends AdapterBase
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
                    partnerId: data.partnerId ?? 0,
                    slippageTolerance: data.protocolData?.slippageTolerance
                };
                const adapterQuotation: AdapterQuotationApiResponse =
                    await this.GetAdapterEstimates(quotationParams);

                const receiverAddress: `0x${string}` = GetBatchHandlerAddress(
                    data.destinationChain
                );
                adapterParams.adapterOptions.amountOut = String(adapterQuotation.amountReceived);
                adapterParams.adapterOptions.receiverAddress = receiverAddress;
                adapterParams.adapterOptions.data = {
                    ...adapterQuotation?.data,
                    ...adapterParams.adapterOptions.data
                };
                delete adapterQuotation?.data;
                const response: CreateAdapterDefaultParamsResponse = {
                    currentChain: data.destinationChain,
                    currentToken: data.destToken,
                    adapterData: adapterParams,
                    quotation: {
                        ...adapterQuotation,
                        srcToken: data.srcToken.address,
                        destToken: data.destToken.address,
                        adapterId: data.adapterId,
                        estimatedTime: adapterQuotation.estimatedTime
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
                let slippageTolerance = data.slippageTolerance ?? 3;
                if (String(data.destinationChain) == String(CHAIN_IDS.LINEA))
                {
                    slippageTolerance = 3;
                }
                if (String(data.destinationChain) == String(CHAIN_IDS.SCROLL))
                {
                    slippageTolerance = 2;
                }
                const getExchangePrice: number = 1;
                const seqQuoteParams: QuoteParams = {
                    fromTokenAddress: data.srcToken.address,
                    toTokenAddress: data.destToken.address,
                    amount: String(data.amount),
                    fromTokenChainId: data.sourceChain,
                    toTokenChainId: data.destinationChain,
                    partnerId: data.partnerId ?? 0,
                    slippageTolerance: slippageTolerance
                };
                const isMainnetChain = isMainnet(data.sourceChain);

                const quotation = isMainnetChain
                    ? await SeqMainnetApi.QuoteApi(seqQuoteParams)
                    : await SeqTestnetApi.QuoteApi(seqQuoteParams);

                const amountReceived = quotation.destination.tokenAmount;
                const tokenReceived = quotation.destination.asset;
                const formatAmount: number = Number(
                    formatEther(String(amountReceived), tokenReceived.decimals || 18)
                );
                const finalAmount: string = (formatAmount / getExchangePrice).toFixed(6);
                const weiAmount: number = Number(
                    parseAmount(String(finalAmount), data.destDecimal)
                );
                const checkedPath = await checkPathForNativeToken(
                    data.destToken.address,
                    data.srcToken.address,
                    data.sourceChain,
                    data.destinationChain,
                    quotation?.source?.path
                );
                const swapData: SwapData = {
                    tokens: checkedPath,
                    flags: quotation?.source?.flags,
                    dataTx: quotation?.source?.dataTx,
                    sourceStableReserveAmount: quotation?.destination.tokenAmount,
                    sourceStableReserveToken: quotation?.destination.asset,
                    slippageTolerance: quotation.slippageTolerance
                };
                const response: AdapterQuotationApiResponse = {
                    amountSent: data.amount,
                    amountReceived: amountReceived,
                    amountReceivedInEther: finalAmount,
                    exchangeRate: getExchangePrice,
                    data: swapData,
                    estimatedTime: quotation.estimatedTime,
                    slippageTolerance: quotation.slippageTolerance
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
                const swapData: SwapData = adapter.adapterOptions.data;
                const partnerId = adapter.adapterOptions.data?.partnerId ?? 0;
                const target = adapterDetails.chains[adapter.sourceChainId].adapterAddress;
                const callType = 2; //  can be changed
                const value = 0; //  can be changed
                const swapParamsIface =
                    "tuple(address[] tokens,uint256 widgetId, uint256 amount,uint256 minReturn,uint256[] flags,bytes[] dataTx, address recipient) SwapParams";

                // const srcReserveTokenWithSlippage = calculateSlippage(
                //     swapData.sourceStableReserveAmount,
                //     swapData.slippageTolerance.toString(),
                //     10
                // );
                const srcReserveTokenWithSlippage = await getMinimumAmount(
                    swapData.sourceStableReserveAmount
                );
                const calldata = abiEncode(
                    [swapParamsIface],
                    [
                        {
                            tokens: swapData.tokens,
                            widgetId: partnerId,
                            amount: adapterOptions.amountIn,
                            minReturn: srcReserveTokenWithSlippage,
                            flags: swapData.flags,
                            dataTx: swapData.dataTx,
                            recipient: adapterOptions.receiverAddress
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

export default DexspanSwapAdapter;
