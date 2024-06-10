import AdapterBase from "../AdapterBase";
import {
    CreateAdapterDefaultParams,
    CreateAdapterDefaultParamsResponse,
    AdapterIdParamsResponse,
    AdapterQuotationParams,
    AdapterQuotationApiResponse,
    CalldataResponse,
    PrioritySteps,
    NoBatchCalldataResponse
} from "../../../models/Adapters";
import { service as LidoPriceApi } from "../../../../serviceclients/adapterPriceApi/stake/LidoApi";
import { CHAIN_IDS } from "../../../../constant/ChainIdsEnum";
import {
    formatEther,
    parseAmount,
    getTransactionTime,
    calculateSlippage,
    MAX_UINT_256,
    getContract
} from "../../../../utils";
import { abiEncode, GetBatchHandlerAddress } from "../../../../utils";
import { BridgeChainEnum } from "../../../../constant/BridgeChainEnum";
import e = require("express");
import { recoverAddress } from "ethers";
import BigNumber from "bignumber.js";
import { zkSyncContract, lidoWethContract } from "../../../../constant/contractMapping";
import { ZKSyncAbi } from "../../../../abis/ZKSync";
import { LidoWethAbi } from "../../../../abis/LidoWeth";
class CanonicalBridgeAdapter extends AdapterBase
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
                    adapterType: "#_bridge",
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
                            protocolData: data.protocolData ?? null
                        }
                    },
                    adapters: []
                };

                const isLayerZero = data.protocolData.type == "layerzero" ?? false;
                const quotationParams: AdapterQuotationParams = {
                    amount: data.amount,
                    destinationChain: data.destinationChain,
                    destDecimal: data.destToken.decimals,
                    sourceChain: data.sourceChain,
                    quotationData: {}
                };
                const adapterQuotation: AdapterQuotationApiResponse =
                    await this.GetAdapterEstimates(quotationParams);

                const receiverAddress: `0x${string}` = GetBatchHandlerAddress(
                    data.destinationChain
                );
                adapterParams.adapterOptions.amountOut = String(adapterQuotation.amountReceived);
                adapterParams.adapterOptions.receiverAddress = receiverAddress;

                let time = 0;

                if (isLayerZero)
                {
                    time = 4 * 60;
                }
                else
                {
                    time = await getTransactionTime(data.sourceChain);
                    if (
                        String(data.protocolData.bridgeChain) ==
                        String(BridgeChainEnum.SCROLL_SEPOLIA)
                    )
                    {
                        time = 60 * 30;
                    }
                }
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
                // const bridgeChain = data.quotationData.bridgeChain ?? 1;
                const amountIn = new BigNumber(data.amount);

                const formatAmount: number = Number(
                    formatEther(String(amountIn), data.destDecimal || 18)
                );

                // const finalAmount: string =
                //     Number(bridgeChain) == 1
                //         ? getExchangePrice
                //         : await this.GetWrapQuote(getExchangePrice);
                const weiAmount: number = Number(formatEther(String(amountIn), data.destDecimal));
                const response: AdapterQuotationApiResponse = {
                    amountSent: data.amount,
                    amountReceived: String(amountIn),
                    amountReceivedInEther: weiAmount,
                    exchangeRate: 1
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
                const target = "";
                const callType = 2; //  can be changed
                const value = 0; //  can be changed
                const calldata = "";
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

export default CanonicalBridgeAdapter;
