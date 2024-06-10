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
import { service as LidoPriceApi } from "../../../../../serviceclients/adapterPriceApi/stake/LidoApi";
import { CHAIN_IDS } from "../../../../../constant/ChainIdsEnum";
import {
    formatEther,
    parseAmount,
    getTransactionTime,
    calculateSlippage,
    MAX_UINT_256,
    getContract
} from "../../../../../utils";
import { abiEncode, GetBatchHandlerAddress } from "../../../../../utils";
import { BridgeChainEnum } from "../../../../../constant/BridgeChainEnum";
import e = require("express");
import { recoverAddress } from "ethers";
import BigNumber from "bignumber.js";
import { zkSyncContract, lidoWethContract } from "../../../../../constant/contractMapping";
import { ZKSyncAbi } from "../../../../../abis/ZKSync";
import { LidoWethAbi } from "../../../../../abis/LidoWeth";
class LidoStakeAdapter extends AdapterBase
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
                if (
                    String(data.destinationChain) == CHAIN_IDS.ETH ||
                    String(data.destinationChain) == CHAIN_IDS.ETH_GOERLI ||
                    String(data.destinationChain) == CHAIN_IDS.ETH_SEPOLIA
                )
                {
                    const bridgeChain = data.quotationData.bridgeChain ?? 1;
                    const bridgeChainFee = new BigNumber(
                        await this.GetBridgeFee(bridgeChain, data.sourceChain)
                    );
                    const amountIn = new BigNumber(data.amount);
                    const amountAfterFeeDeduction = amountIn.minus(bridgeChainFee).toString();
                    const getExchangePrice = await LidoPriceApi.PriceApiEth(
                        Number(amountAfterFeeDeduction)
                    );
                    const formatAmount: number = Number(
                        formatEther(String(amountAfterFeeDeduction), data.destDecimal || 18)
                    );

                    const finalAmount: string =
                        Number(bridgeChain) == 1
                            ? getExchangePrice
                            : await this.GetWrapQuote(getExchangePrice);
                    const weiAmount: number = Number(
                        formatEther(String(finalAmount), data.destDecimal)
                    );
                    const response: AdapterQuotationApiResponse = {
                        amountSent: data.amount,
                        amountReceived: finalAmount,
                        amountReceivedInEther: weiAmount,
                        exchangeRate: getExchangePrice
                    };
                    resolve(response);
                }
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
                const slippageTolerance = 0;

                const brigeChain = adapter.adapterOptions?.data?.protocolData?.bridgeChain ?? 1;
                const refundAddress = adapter.adapterOptions?.data?.refundAddress;
                // sourceAmountReserve
                // destinationAmount == Soruce(Reserve)withSlipage -fee
                // destinationAmount --  slippage (2);

                // const destinationAmount = String(
                //     calculateSlippage(adapterOptions.amountIn, String(3), 10)
                // );

                // const feeAmount = String(
                //     new BigNumber(adapterOptions.amountIn.toString())
                //         .minus(destinationAmountFormated)
                //         .toFixed(0)
                // );
                const { bridgeData, bridgeChainUsed } = await this.CreateBridgeChainData(
                    brigeChain,
                    refundAddress
                );
                const slippageDestinationAmount = calculateSlippage(
                    adapterOptions.amountIn,
                    String(slippageTolerance),
                    10
                );

                const amountMax256 = MAX_UINT_256;

                const calldata = abiEncode(
                    ["address", "uint256", "uint256", "bytes"],
                    [adapterOptions.receiverAddress, amountMax256, bridgeChainUsed, bridgeData] //min amount
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

    private CreateBridgeChainData(
        chainId: number,
        recipient: string
    ): Promise<{ bridgeData: string; bridgeChainUsed: number }>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                let bridgeData = "";
                let bridgeChainUsed = chainId;
                const amountMax256 = MAX_UINT_256;
                if (
                    chainId == Number(BridgeChainEnum.NO_SUPPLY_CHAIN) ||
                    chainId == Number(BridgeChainEnum.SEPOLIA_CHAIN_ID)
                )
                {
                    bridgeData = "0x";
                    bridgeChainUsed = 0;
                }
                else if (chainId == Number(BridgeChainEnum.ARBITRUM_CHAIN_ID))
                {
                    const maxGas = "88543";
                    const gasPrice = "100000000";
                    const maxSubmissionCost = "1117588711172000";
                    bridgeData = abiEncode(
                        ["address", "uint256", "uint256", "uint256", "uint256"],
                        [recipient, amountMax256, maxGas, gasPrice, maxSubmissionCost]
                    );
                }
                else if (
                    chainId == Number(BridgeChainEnum.OPTIMISM_CHAIN_ID) ||
                    chainId == Number(BridgeChainEnum.MANTLE_CHAIN_ID) ||
                    chainId == Number(BridgeChainEnum.BASE_CHAIN_ID)
                )
                {
                    const l2Gas = "200000";
                    const data = "0x";
                    bridgeData = abiEncode(
                        ["address", "uint256", "uint256", "bytes"],
                        [recipient, amountMax256, l2Gas, data]
                    );
                }
                else if (chainId == Number(BridgeChainEnum.ZKSYNC_CHAIN_ID))
                {
                    const l2Gas = "416250";
                    bridgeData = abiEncode(
                        ["address", "address", "uint256", "uint256"],
                        [recipient, recipient, amountMax256, l2Gas]
                    );
                }
                else if (chainId == Number(BridgeChainEnum.LINEA_CHAIN_ID))
                {
                    bridgeData = abiEncode(["address", "uint256"], [recipient, amountMax256]);
                }
                else if (chainId == Number(BridgeChainEnum.SCROLL_SEPOLIA))
                {
                    bridgeData = abiEncode(["address", "uint256"], [recipient, amountMax256]);
                }
                else
                {
                    bridgeData = "0x";
                }
                resolve({ bridgeData, bridgeChainUsed });
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    private GetBridgeFee(destChainId: number, chainId: number): Promise<string>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                let fees = "0";
                if (destChainId == BridgeChainEnum.ARBITRUM_CHAIN_ID)
                {
                    const maxGas = new BigNumber("88543");
                    const gasPrice = new BigNumber("100000000");
                    const maxSubmissionCost = new BigNumber("1117588711172000");
                    fees = maxGas.plus(gasPrice).plus(maxSubmissionCost).toString();
                }
                else if (destChainId == BridgeChainEnum.ZKSYNC_CHAIN_ID)
                {
                    const zkSyncContractAdd = zkSyncContract[chainId];
                    const zkContract = await getContract(ZKSyncAbi, zkSyncContractAdd, 1);

                    const avgGasPrice = 100;
                    const _l2TxGasLimit = 416250;
                    const _l2GasPerPubdataByteLimit = 800;

                    fees = await zkContract.l2TransactionBaseCost(
                        avgGasPrice,
                        _l2TxGasLimit,
                        _l2GasPerPubdataByteLimit
                    );
                }
                resolve(fees);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    private GetWrapQuote(amount: string): Promise<string>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const wethContractAddress = lidoWethContract[1];
                const lidoWeth = await getContract(LidoWethAbi, wethContractAddress, 1);

                const wethAmount = await lidoWeth.getWstETHByStETH(String(amount));

                resolve(wethAmount.toString());
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }
}

export default LidoStakeAdapter;
