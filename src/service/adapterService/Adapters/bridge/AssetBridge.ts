import { IAdapter } from "../IAdapter";
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
import {
    service as SeqMainnetApi,
    QuoteResponse
} from "../../../../serviceclients/sequencerApi/mainnet";
import { estimateGasLimit, formatEther, parseAmount } from "../../../../utils";
import {
    abiEncode,
    GetBatchHandlerAddress,
    checkPathForNativeToken,
    isTokenNativeOrWrapped,
    calculateSlippage,
    isMainnet
} from "../../../../utils";
import {
    RESERVED_TOKENS,
    NativTokenMapping,
    WrappedNativeMapping,
    AssetBridgeContractAddress
} from "../../../../constant/contractMapping";
import { destChainIdBytes } from "../../../../constant/EncodingParamsData";
import { TokenData } from "../../../models/CommonModels";
import BigNumber from "bignumber.js";
import { CHAIN_IDS } from "../../../../constant/ChainIdsEnum";
class AssetBridgeAdapter extends AdapterBase
{
    GetQuote(data: CreateAdapterDefaultParams): Promise<CreateAdapterDefaultParamsResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                // const adapterDetails = await this.GetAdapter(data.adapterId);
                const actionType = await this.GetActionType(
                    data.srcToken.address,
                    data.sourceChain
                );
                if (actionType == -1)
                {
                    throw "error in fetching reserve tokens";
                }
                const adapterParams: AdapterIdParamsResponse = {
                    adapterId: data.adapterId,
                    adapterType: "bridge",
                    sourceChainId: data.sourceChain,
                    destChainId: data.destinationChain,
                    adapterOptions: {
                        srcToken: data.srcToken,
                        amountIn: String(data.amount),
                        amountOut: String(data.amount),
                        destToken: data.destToken,
                        receiverAddress: "",
                        data: {
                            actionType: actionType,
                            refundAddress: data.refundAddress,
                            partnerId: data.partnerId ?? 0
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
                    partnerId: data.partnerId
                };
                const adapterQuotation: AdapterQuotationApiResponse =
                    await this.GetAdapterEstimates(quotationParams);

                const receiverAddress: `0x${string}` = GetBatchHandlerAddress(
                    data.destinationChain
                );
                adapterParams.adapterOptions.amountOut = String(adapterQuotation.amountReceived);
                adapterParams.adapterOptions.receiverAddress = receiverAddress;
                adapterParams.adapterOptions.data.actionType =
                    adapterQuotation.data?.actionType ?? actionType;
                adapterParams.adapterOptions.data = {
                    ...adapterParams.adapterOptions.data,
                    ...adapterQuotation?.data
                };
                const bridgeFee = adapterQuotation?.data.bridgeFee;
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
                        bridgeFee: bridgeFee,
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
                const getExchangePrice: number = 1;
                let actionType = 0;
                let slippage = 2;
                if (String(data.destinationChain) == String(CHAIN_IDS.ARTHERA))
                {
                    slippage = 3;
                }
                let additionalGasLimit = 160000;
                if (data.destinationChain == 10242)
                {
                    additionalGasLimit = 2500000;
                }
                const seqQuoteParams: QuoteParams = {
                    fromTokenAddress: data.srcToken.address,
                    toTokenAddress: data.destToken.address,
                    amount: String(data.amount),
                    fromTokenChainId: data.sourceChain,
                    toTokenChainId: data.destinationChain,
                    partnerId: data.partnerId,
                    additionalGasLimit: additionalGasLimit,
                    slippageTolerance: slippage
                };

                const isMainnetChain = isMainnet(data.sourceChain);
                const quotation = isMainnetChain
                    ? await SeqMainnetApi.QuoteApi(seqQuoteParams)
                    : await SeqTestnetApi.QuoteApi(seqQuoteParams);
                const amountReceived = quotation.destination.tokenAmount;

                if (
                    isTokenNativeOrWrapped(
                        seqQuoteParams.toTokenChainId,
                        seqQuoteParams.toTokenAddress
                    )
                )
                {
                    const native = NativTokenMapping[Number(data.destinationChain)];
                    quotation.destination.asset = native;
                }
                // weth to eth . eth to weth
                const tokenReceived = quotation.destination.asset;

                if (quotation?.source.path.length > 1)
                {
                    actionType = 1;
                }

                const destinationAmountPromised = await this.GetDestinationAmount(quotation);
                const formatAmount: number = Number(
                    formatEther(String(destinationAmountPromised), tokenReceived.decimals || 18)
                );
                const finalAmount: string = (formatAmount / getExchangePrice).toFixed(6);
                const checkedPath = await checkPathForNativeToken(
                    data.destToken.address,
                    data.srcToken.address,
                    data.sourceChain,
                    data.destinationChain,
                    quotation?.source?.path
                );
                const swapData = {
                    tokens: checkedPath,
                    bridgeFee: quotation?.bridgeFee,
                    isMainnet: isMainnetChain,
                    quotationParams: seqQuoteParams,
                    forwarderQuotation: quotation,
                    actionType: actionType,
                    destinationAmount: quotation.destination.tokenAmount,
                    destinationAmountPromised: destinationAmountPromised
                };

                const weiAmount = destinationAmountPromised;
                const response: AdapterQuotationApiResponse = {
                    amountSent: data.amount,
                    amountReceived: weiAmount,
                    amountReceivedInEther: finalAmount,
                    exchangeRate: "",
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
    //
    ComposeCalldata(adapter: AdapterIdParamsResponse): Promise<CalldataResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const partnerId = adapter.adapterOptions.data?.partnerId;

                // const dexspanAddressSoruce = await getDexspanMappedAddress(adapter.sourceChainId);
                // const dexspanAddressDest = await getDexspanMappedAddress(adapter.destChainId);

                const adapterDetails = await this.GetAdapter(adapter.adapterId);
                let actionType = adapter.adapterOptions?.data.actionType;

                // txType = 0 -> assetBridge transferToken
                // txType = 1 -> assetBridge swapAndTransferToken

                const adapterOptions = adapter.adapterOptions;
                const { quotationParams, isMainnet, forwarderQuotation } = adapterOptions?.data; // for seq api

                const target = adapterDetails.chains[adapter.sourceChainId].adapterAddress;
                const callType = 2; //  can be changed
                const value = 0; //  can be changed
                let calldata = "";
                const destGasLimit = await estimateGasLimit(Number(CHAIN_IDS.ARTHERA));

                const message = adapter.adapterOptions.data.message; // contract Message
                const messageAddress = message
                    ? adapter.adapterOptions.receiverAddress
                    : adapterOptions.data.refundAddress; // Contract Address

                const quotation = forwarderQuotation;
                // DestinationAmount Formated in Source Side Decimals for perfect Calculation
                const destinationAmountFormated = new BigNumber(
                    Math.pow(10, quotation?.source?.stableReserveAsset.decimals)
                )
                    .dividedBy(Math.pow(10, quotation?.destination?.stableReserveAsset.decimals))
                    .multipliedBy(
                        new BigNumber(quotation?.destination?.stableReserveAmount.toString())
                    )
                    .toFixed(0);

                let destReserveToken = adapter.adapterOptions.destToken.address;
                const destinationPath = quotation?.destination.path;
                const destination = quotation?.destination;

                const source = quotation?.source;

                if (quotation?.source.path.length > 1)
                {
                    actionType = 1;
                }
                // destination Swap
                if (destinationPath.length > 1)
                {
                    destReserveToken = destinationPath[0];
                }

                const native = NativTokenMapping[Number(destination.chainId)]?.address;
                const wnative = WrappedNativeMapping[Number(destination.chainId)]?.address;

                if (!native || !wnative)
                {
                    const error = {
                        title: "incorrect contract mapping",
                        message: `incorrect contract mapping on chainId ${destination.chainId}`
                    };
                    throw error;
                }

                // converting all wnative to native on the path

                if (
                    adapter.adapterOptions.destToken.address.toLowerCase() === native.toLowerCase()
                )
                {
                    destination.path[destination.path.length - 1] = native.toLowerCase();
                }

                let dstAmountWithSlippage = destination.tokenAmount;

                if (destination.asset.resourceID !== destination.stableReserveAsset.resourceID)
                {
                    dstAmountWithSlippage = String(
                        calculateSlippage(
                            destination.tokenAmount,
                            quotation.slippageTolerance.toString(),
                            10
                        )
                    );
                }

                // min amount
                const srcReserveTokenWithSlippage = source.stableReserveAmount;
                // source.path.length > 1 && destination.path.length > 1
                //     ? source.stableReserveAmount
                //     : calculateSlippage(
                //         source.stableReserveAmount,
                //         (quotation.slippageTolerance / 2.0).toString(),
                //         10
                //     );

                let destSwapEncodedData;

                if (destinationPath.length > 1)
                {
                    // destination swap
                    destSwapEncodedData = abiEncode(
                        [
                            "address[]",
                            "uint256",
                            "bytes[]",
                            "uint256[]",
                            "address",
                            "bool",
                            "bytes"
                        ],
                        [
                            destination.path,
                            dstAmountWithSlippage,
                            destination.dataTx,
                            destination.flags,
                            messageAddress,
                            message != null,
                            message != null ? message : "0x00"
                        ]
                    );
                }
                else
                {
                    // no destination swap
                    destSwapEncodedData = message != null ? message : "0x00";
                }

                // Checking if reserve token is native or wrapped
                const isDestReserveTokenNativeOrWrapped = isTokenNativeOrWrapped(
                    adapter.destChainId,
                    destReserveToken
                );

                const isSourceTokenNativeOrWrapped = isTokenNativeOrWrapped(
                    adapter.sourceChainId,
                    adapter.adapterOptions.srcToken.address
                );

                if (isSourceTokenNativeOrWrapped)
                {
                    const native = NativTokenMapping[adapter.sourceChainId].address;
                    const wnative = WrappedNativeMapping[adapter.sourceChainId].address;
                    source.path = source.path?.map((e: any) =>
                        e.toLowerCase() === wnative.toLowerCase() ? native : e
                    );
                }

                if (actionType == 0)
                {
                    // encode message //
                    // assetBridge TransferToken

                    const assetForwarderTuple =
                        "tuple(bytes32 destChainIdBytes, address srcTokenAddress, uint256 srcTokenAmount, bytes recipient, uint256 partnerId)";

                    const assetForwarderData = {
                        destChainIdBytes: destChainIdBytes[adapter.destChainId],
                        srcTokenAddress: adapterOptions.srcToken.address,
                        srcTokenAmount: adapterOptions.amountIn,
                        recipient: adapterOptions.receiverAddress,
                        partnerId: partnerId
                    };
                    calldata = abiEncode(
                        ["uint8", assetForwarderTuple, "uint64", "bytes"],
                        [actionType, assetForwarderData, destGasLimit, destSwapEncodedData]
                    );
                    if (
                        destination.path.length > 1 &&
                        AssetBridgeContractAddress[adapter.destChainId] == ""
                    )
                    {
                        throw "AssetBridge not deployed for this chain";
                    }
                }
                else if (actionType == 1)
                {
                    // assetBridge swapAndTransferToken

                    const swapTransferPayload = [
                        destChainIdBytes[adapter.destChainId],
                        source.path,
                        source.flags,
                        source.dataTx,
                        source.tokenAmount,
                        srcReserveTokenWithSlippage,
                        messageAddress != null
                            ? destination.path.length > 1
                                ? AssetBridgeContractAddress[adapter.destChainId]
                                : messageAddress
                            : AssetBridgeContractAddress[adapter.destChainId],
                        partnerId
                    ];

                    if (
                        (destination.path.length > 1 || messageAddress == null) &&
                        AssetBridgeContractAddress[adapter.destChainId] == ""
                    )
                    {
                        throw "AssetBridge not deployed for this chain";
                    }
                    calldata = abiEncode(
                        [
                            "uint8",
                            {
                                type: "tuple",
                                name: "swapAndTransferPayload",
                                components: [
                                    { name: "destChainIdBytes", type: "bytes32" },
                                    { name: "tokens", type: "address[]" },
                                    { name: "flags", type: "uint256[]" },
                                    { name: "dataTx", type: "bytes[]" },
                                    { name: "srcTokenAmount", type: "uint256" },
                                    { name: "minToAmount", type: "uint256" },
                                    { name: "recipient", type: "bytes" },
                                    { name: "partnerId", type: "uint256" }
                                ]
                            },
                            "uint64",
                            "bytes"
                        ],
                        [actionType, swapTransferPayload, destGasLimit, destSwapEncodedData]
                    );
                }
                else if (actionType == 2)
                {
                    throw "Action Type not supported";
                }
                else if (actionType == 3)
                {
                    throw "Action Type not supported";
                }
                else
                {
                    throw "Action Type not supported";
                }

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

    GetActionType(tokenAddress: string, fromChain: number): Promise<number>
    {
        return new Promise(async (resolve, reject) =>
        {
            const reservedTokenList = (RESERVED_TOKENS as any)[Number(fromChain)];

            if (!reservedTokenList)
            {
                throw `Reserve Token Mapping Not Available on ${fromChain}`;
            }
            const reservedToken = reservedTokenList.filter(
                (reservedList: TokenData) => reservedList.address === tokenAddress
            );
            let ActionType = -1;

            if (reservedToken.length > 0)
            {
                ActionType = 0;
            }
            else
            {
                ActionType = 1;
            }
            resolve(ActionType);
        });
    }

    GetDestinationAmount(data: QuoteResponse): Promise<string>
    {
        return new Promise(async (resolve, reject) =>
        {
            const sourceSwap = data?.source?.path?.length > 1 ? true : false;
            const destinationSwap = data?.destination?.path?.length > 1 ? true : false;
            const slippageTolerance = 2;
            let destinationAmount = data.destination.tokenAmount; // min amount
            // if ((sourceSwap && destinationSwap) || destinationSwap)
            // {
            //     destinationAmount = String(
            //         calculateSlippage(destinationAmount, String(slippageTolerance), 10)
            //     );
            // }
            // else if (sourceSwap)
            // {
            //     const destinationAmountFormated = new BigNumber(
            //         Math.pow(10, data?.source?.stableReserveAsset.decimals)
            //     )
            //         .dividedBy(Math.pow(10, data?.destination?.stableReserveAsset.decimals))
            //         .multipliedBy(new BigNumber(data?.destination?.stableReserveAmount.toString()))
            //         .toFixed(0);

            //     const feeAmount = String(
            //         new BigNumber(data.source.stableReserveAmount.toString())
            //             .minus(destinationAmountFormated)
            //             .toFixed(0)
            //     );
            //     const feeAmountFormated = new BigNumber(
            //         Math.pow(10, data?.source?.stableReserveAsset.decimals)
            //     )
            //         .dividedBy(Math.pow(10, data?.bridgeFee?.decimals))
            //         .multipliedBy(new BigNumber(data?.bridgeFee?.amount.toString()))
            //         .toFixed(0);
            //     const slippageSourceAmount = calculateSlippage(
            //         data?.source?.stableReserveAmount,
            //         String(slippageTolerance),
            //         10
            //     );

            //     destinationAmount = String(
            //         new BigNumber(slippageSourceAmount?.toString())
            //             .minus(feeAmountFormated)
            //             .toFixed(0)
            //     );

            //     const xx = data.destination.stableReserveAmount;
            // }

            destinationAmount = String(
                calculateSlippage(destinationAmount, String(slippageTolerance / 2), 10)
            );
            resolve(destinationAmount);
        });
    }
}

export default AssetBridgeAdapter;