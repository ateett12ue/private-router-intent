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
import {
    formatEther,
    getTransactionTime,
    parseAmount,
    abiEncode,
    GetBatchHandlerAddress,
    getContract,
    MAX_UINT_256
} from "../../../../../utils";
import BigNumber from "bignumber.js";
import { BridgeChainEnum } from "../../../../../constant/BridgeChainEnum";
import { LayerZeroChainMapping } from "../../../../../constant/LayerZeroChainMapping";
import { StakeStoneTokenAbi } from "../../../../../abis/StakeStone";
import { StakeStoneTokenContract } from "../../../../../constant/contractMapping";

class StakeStoneStakeAdapter extends AdapterBase
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
                            partnerId: data.partnerId,
                            protocolData: data.protocolData ?? null
                        }
                    },
                    adapters: []
                };
                const quotationParams: AdapterQuotationParams = {
                    amount: data.amount,
                    destinationChain: data.destinationChain,
                    destDecimal: data.destToken.decimals,
                    sourceChain: data.sourceChain,
                    quotationData: { bridgeChain: data.protocolData.bridgeChain }
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
                // const getExchangePrice = await StakeStoneApi.PriceApiEthereum();;
                const bridgeChain = data.quotationData.bridgeChain ?? 1;
                const bridgeChainFee = new BigNumber(
                    await this.GetBridgeFee(bridgeChain, data.sourceChain, String(data.amount))
                );
                const amountIn = new BigNumber(data.amount);
                const amountAfterFeeDeduction = amountIn.minus(bridgeChainFee).toString();
                const getExchangePrice = 1.0134;
                const formatAmount: number = Number(
                    formatEther(String(amountAfterFeeDeduction), data.destDecimal || 18)
                );
                const finalAmount: string = (formatAmount / getExchangePrice).toFixed(6);
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
                const adapterDetails = await this.GetAdapter(adapter.adapterId);
                const adapterOptions = adapter.adapterOptions;
                const target = adapterDetails.chains[adapter.sourceChainId].adapterAddress;
                const callType = 2; //  can be changed
                const value = 0; //  can be changed

                // (address , uint256 , uint16, tuple(uint256 ,address))
                // const crossChainData = defaultAbiCoder.encode(["uint256", "address"], [nativeFee, refundAddress]);

                const brigeChain = adapter.adapterOptions?.data?.protocolData?.bridgeChain ?? 1;
                const refundAddress = adapter.adapterOptions?.data?.refundAddress;

                const { dstEid, nativeFee, crossChainData } = await this.CreateBridgeChainData(
                    brigeChain,
                    refundAddress,
                    adapterOptions.amountIn
                );

                const calldata = abiEncode(
                    ["address", "uint256", "uint16", "bytes"],
                    [adapterOptions.receiverAddress, MAX_UINT_256, dstEid, crossChainData]
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

    private GetBridgeFee(destChainId: number, chainId: number, amount: string): Promise<string>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                let fees = "0";
                if (
                    destChainId == BridgeChainEnum.SEPOLIA_CHAIN_ID ||
                    destChainId == BridgeChainEnum.NO_SUPPLY_CHAIN
                )
                {
                    fees = "0";
                }
                else if (destChainId == BridgeChainEnum.MANTA_CHAIN_ID)
                {
                    const lzContract = await getContract(
                        StakeStoneTokenAbi,
                        StakeStoneTokenContract[1],
                        1
                    );
                    const estimateParams = {
                        dstEid: LayerZeroChainMapping.MANTA,
                        toAddress: abiEncode(["address"], [StakeStoneTokenContract[1]]),
                        amount: amount,
                        useZro: false,
                        adapterParams: "0x"
                    };

                    const estimateFee = await lzContract.estimateSendFee(
                        estimateParams.dstEid,
                        estimateParams.toAddress,
                        estimateParams.amount,
                        estimateParams.useZro,
                        estimateParams.adapterParams
                    );

                    fees = estimateFee[0];
                }
                else if (destChainId == BridgeChainEnum.SCROLL)
                {
                    const lzContract = await getContract(
                        StakeStoneTokenAbi,
                        StakeStoneTokenContract[1],
                        1
                    );
                    const estimateParams = {
                        dstEid: LayerZeroChainMapping.SCROLL,
                        toAddress: abiEncode(["address"], [StakeStoneTokenContract[1]]),
                        amount: amount,
                        useZro: false,
                        adapterParams: "0x"
                    };

                    const estimateFee = await lzContract.estimateSendFee(
                        estimateParams.dstEid,
                        estimateParams.toAddress,
                        estimateParams.amount,
                        estimateParams.useZro,
                        estimateParams.adapterParams
                    );

                    fees = estimateFee[0];
                }
                resolve(fees);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    private CreateBridgeChainData(
        chainId: number,
        refundAddress: string,
        amount: string
    ): Promise<{ dstEid: string; nativeFee: string; crossChainData: string }>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                let crossChainData = "";
                const bridgeChainUsed = chainId;
                let dstEid;
                let nativeFee;
                const amountMax256 = MAX_UINT_256;
                if (
                    chainId == Number(BridgeChainEnum.NO_SUPPLY_CHAIN) ||
                    chainId == Number(BridgeChainEnum.SEPOLIA_CHAIN_ID)
                )
                {
                    dstEid = "0";
                    nativeFee = "0";
                    crossChainData = abiEncode(["uint256", "address"], [nativeFee, refundAddress]);
                }
                else if (chainId == Number(BridgeChainEnum.MANTA_CHAIN_ID))
                {
                    dstEid = String(LayerZeroChainMapping.MANTA);
                    nativeFee = await this.GetBridgeFee(chainId, 1, String(amount));
                    crossChainData = abiEncode(["uint256", "address"], [nativeFee, refundAddress]);
                }
                else if (chainId == Number(BridgeChainEnum.SCROLL))
                {
                    dstEid = String(LayerZeroChainMapping.SCROLL);
                    nativeFee = await this.GetBridgeFee(chainId, 1, String(amount));
                    crossChainData = abiEncode(["uint256", "address"], [nativeFee, refundAddress]);
                }
                else
                {
                    dstEid = "0";
                    nativeFee = "0";
                    crossChainData = abiEncode(["uint256", "address"], [nativeFee, refundAddress]);
                }
                resolve({ dstEid, nativeFee, crossChainData });
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
}

export default StakeStoneStakeAdapter;
