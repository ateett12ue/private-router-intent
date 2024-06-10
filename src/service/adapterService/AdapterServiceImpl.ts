import { IAdapterService } from "./IAdapterService";
import { IMongoDataStore } from "../../datastore/adapter/mongostore/IMongoDataStore";
import { IDataStore } from "../../datastore/adapter/mysqlstore/IDataStore";
import { AdapterDetails, PoolData, ProtocolDetails } from "../models/DbModels";
import { adapterProvider } from "./AdapterProvider";
import { IAdapter } from "./Adapters/IAdapter";
import { ProtocolParamsResponse } from "../models/Protocols";
import {
    ComposeCalldataResponse,
    PrioritySteps,
    AdapterIdParamsResponse,
    CalldataResponse,
    CalldataGasParmas,
    AdapterChainData,
    AllAdapterDetails,
    AdapterFilter
} from "../models/Adapters";
import {
    GetBatchHandlerAddress,
    isTokenAddressETH,
    GetAllowanceStep,
    TokenAllowanceParams,
    getEncodedFunctionValue,
    estimateGasPrice,
    abiEncode,
    getDexspanMappedAddress,
    getForwarderMappedAddress,
    isMainnet,
    estimateGasLimit
} from "../../utils";
import { BatchTransactionHandlerAbi } from "../../abis/BatchTransHandlerAdapter";
import { service as SeqTestnetService } from "../../serviceclients/sequencerApi/testnet";
import { service as SeqMainnetService } from "../../serviceclients/sequencerApi/mainnet";
import { service as TransactionService } from "../transactionService/TransactionService";

export class AdapterServiceImpl implements IAdapterService
{
    _mongoDataStore: IMongoDataStore;
    _dataStore: IDataStore;

    constructor(mongoDataStore: IMongoDataStore, dataStore: IDataStore)
    {
        this._mongoDataStore = mongoDataStore;
        this._dataStore = dataStore;
    }

    SelectAdapter(adapterId: string): Promise<IAdapter>
    {
        return new Promise(async (res, rej) =>
        {
            try
            {
                const getAdapter = await adapterProvider.GetAdapter(adapterId);
                res(getAdapter);
            }
            catch (e)
            {
                rej(e);
            }
        });
    }

    AddAdapter(data: AdapterDetails): Promise<boolean>
    {
        return new Promise(async (res, rej) =>
        {
            try
            {
                const getAdapter = await this._mongoDataStore.AddAdapter(data);
                res(getAdapter);
            }
            catch (e)
            {
                rej(e);
            }
        });
    }

    GetAdapterDetails(adapterId: string): Promise<AdapterDetails>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const details = await this._mongoDataStore.GetAdapterDetails(adapterId);
                resolve(details);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    GetAllAdapter(filter: AdapterFilter): Promise<Array<AllAdapterDetails>>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const mongoResponse = await this._mongoDataStore.GetAllAdaptersDetails();
                let details = mongoResponse.map(res =>
                {
                    const detail: AllAdapterDetails = {
                        id: res.id,
                        name: res.name,
                        protocolId: res.protocolId,
                        chains: res.chains,
                        icon: res.icon,
                        desc: res.description,
                        active: res.active,
                        tags: res.tags,
                        stars: res.stars,
                        category: res.category,
                        deployedChains: res.deployedChains,
                        action: res.action,
                        contractRepoLink: res.contractRepoLink,
                        backendRepoLink: res.backendRepoLink
                    };
                    return detail;
                });

                if (filter)
                {
                    if (filter.isActive != undefined)
                    {
                        details = details.filter(ada =>
                        {
                            return ada.active == filter.isActive;
                        });
                    }
                }
                resolve(details);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
    ComposeAdapterCalldata(data: ProtocolParamsResponse): Promise<ComposeCalldataResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const tokens = data.sourceTokens.map(token => token.address);
                const amount = data.amount.map(value => String(value));
                const targets: Array<string> = [];
                const callData: Array<string> = [];
                const value = [];
                const callType = [];

                let transactionValue = "0x00";
                const eoaPriorityQueue: Array<PrioritySteps> = [];
                const adapters = data.adapters;
                const adapterLength = adapters.length;

                const batchHandlerAddress: `0x${string}` = GetBatchHandlerAddress(
                    data.sourceChainId
                ); //add vali

                if (!batchHandlerAddress)
                {
                    throw "batch handler not deployed on this address";
                }

                if (data.quotationType == "ContractTransaction")
                {
                    const response = await this.NoBatchComposeAdapterCalldata(data);
                    resolve(response);
                    return;
                }

                for (let i = 0, len = adapterLength; i < len; i++)
                {
                    const composeResponse = await this.ComposerFunction(adapters[i], data.appId);
                    if (composeResponse.target !== "")
                    {
                        targets.push(composeResponse.target);
                        callData.push(composeResponse.calldata);
                        value.push(composeResponse.value);
                        callType.push(composeResponse.callType);
                        eoaPriorityQueue.push(...composeResponse.prioritySteps);
                    }
                }

                for (let i = 0, len = tokens.length; i < len; i++)
                {
                    const token = data.sourceTokens[i];
                    if (!isTokenAddressETH(token.address))
                    {
                        const AllowanceParams: TokenAllowanceParams = {
                            sourceToken: token,
                            sourceChainId: data.sourceChainId,
                            sender: data.senderAddress ? data.senderAddress : data.clientAddress,
                            allowanceTo: batchHandlerAddress,
                            allowanceToName: "Batch Handler Contract",
                            sourceAmount: String(data.amount[i])
                        };
                        const step = await GetAllowanceStep(AllowanceParams);
                        if (step)
                        {
                            eoaPriorityQueue.push(step);
                        }
                    }
                    else
                    {
                        transactionValue = String(data.amount[i]);
                    }
                }

                const batchParams = {
                    appId: data.appId,
                    tokens: tokens,
                    amounts: amount,
                    targets: targets,
                    data: callData,
                    value: value,
                    callType: callType
                };
                const encodedData = await getEncodedFunctionValue(
                    BatchTransactionHandlerAbi,
                    "executeBatchCallsSameChain",
                    [
                        batchParams.appId,
                        batchParams.tokens,
                        batchParams.amounts,
                        batchParams.targets,
                        batchParams.value,
                        batchParams.callType,
                        batchParams.data
                    ]
                );
                let estimateGas;
                try
                {
                    estimateGas = await estimateGasPrice(
                        batchHandlerAddress,
                        encodedData,
                        transactionValue,
                        data.sourceChainId,
                        data.clientAddress
                    );
                }
                catch
                {
                    estimateGas = "Gas Not Fetched";
                }
                const getGasLimit = await estimateGasLimit(data.sourceChainId);
                const { trnxId } = await TransactionService.AddTransaction(
                    data,
                    String(estimateGas)
                );
                const response: ComposeCalldataResponse = {
                    trnxId: trnxId,
                    gasPrice: String(estimateGas),
                    calldata: encodedData,
                    to: batchHandlerAddress,
                    from: data.clientAddress,
                    value: transactionValue,
                    prioritySteps: eoaPriorityQueue,
                    gasLimit: String(getGasLimit)
                };

                resolve(response);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    NoBatchComposeAdapterCalldata(data: ProtocolParamsResponse): Promise<ComposeCalldataResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const eoaPriorityQueue: Array<PrioritySteps> = [];
                const adapters = data.adapters[0];

                let transactionValue = "0x00";
                if (data.adapters.length > 1)
                {
                    throw "Not implement for multiple adapters";
                }

                const selectedAdapter = await this.SelectAdapter(adapters.adapterId);
                const prioritySteps: Array<PrioritySteps> = [];
                const responseData = await selectedAdapter.NoBatchComposeCalldata(adapters);

                prioritySteps.push(...responseData.prioritySteps);

                const token = data.sourceTokens[0];
                if (!isTokenAddressETH(token.address))
                {
                    const AllowanceParams: TokenAllowanceParams = {
                        sourceToken: token,
                        sourceChainId: data.sourceChainId,
                        sender: data.clientAddress,
                        allowanceTo: responseData.contractAddress,
                        allowanceToName: responseData.contractName,
                        sourceAmount: String(data.amount[0])
                    };
                    const step = await GetAllowanceStep(AllowanceParams);
                    if (step)
                    {
                        eoaPriorityQueue.push(step);
                    }
                }
                else
                {
                    transactionValue = String(data.amount[0]);
                }

                let estimateGas;
                try
                {
                    estimateGas = await estimateGasPrice(
                        responseData.contractAddress,
                        responseData.calldata,
                        transactionValue,
                        data.sourceChainId,
                        data.clientAddress
                    );
                }
                catch (ex)
                {
                    estimateGas = undefined;
                }
                const getGasLimit = await estimateGasLimit(data.sourceChainId);

                const response: ComposeCalldataResponse = {
                    gasPrice: String(estimateGas),
                    calldata: responseData.calldata,
                    to: responseData.contractAddress,
                    from: data.clientAddress,
                    value: transactionValue,
                    prioritySteps: eoaPriorityQueue,
                    gasLimit: String(getGasLimit)
                };
                resolve(response);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    ComposerFunction(data: AdapterIdParamsResponse, appId: string): Promise<CalldataResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const selectedAdapter = await this.SelectAdapter(data.adapterId);
                let prioritySteps: Array<PrioritySteps> = [];
                if (data.adapterType == "bridge")
                {
                    const adapters = data.adapters;
                    const target = [];
                    const calldata = [];
                    const value = [];
                    const callType = [];
                    const adapterPrioritySteps: Array<PrioritySteps> = [];
                    let receiverAddress: string = data.adapterOptions.receiverAddress;
                    // if(!adapters.length)
                    // {
                    //     target.push("");
                    //     value.push(data.value);
                    //     callType.push(data.callType);
                    //     calldata.push(data.calldata);
                    //     adapterPrioritySteps.push(...data.prioritySteps);
                    //     receiverAddress = adapters[i].adapterOptions.receiverAddress;
                    // }
                    for (let i = 0, len = adapters.length; i < len; i++)
                    {
                        const data = await this.ComposerFunction(adapters[i], appId);
                        if (data.target !== "")
                        {
                            target.push(data.target);
                            value.push(data.value);
                            callType.push(data.callType);
                            calldata.push(data.calldata);
                            adapterPrioritySteps.push(...data.prioritySteps);
                            receiverAddress = adapters[i].adapterOptions.receiverAddress;
                        }
                    }
                    // address refundAddress,
                    // address[] memory target,
                    // uint256[] memory value,
                    // uint256[] memory callType,
                    // bytes[] memory data
                    let message;
                    if (adapters.length > 0)
                    {
                        message = abiEncode(
                            [
                                "uint256",
                                "address",
                                "address[]",
                                "uint256[]",
                                "uint256[]",
                                "bytes[]"
                            ],
                            [appId, receiverAddress, target, value, callType, calldata]
                        );
                    }
                    else
                    {
                        message = null;
                    }

                    data.adapterOptions.data = { ...data.adapterOptions.data, message: message };
                    prioritySteps = [...adapterPrioritySteps];
                }
                const callDataQueue = await selectedAdapter.ComposeCalldata(data);
                const target = callDataQueue.target;
                const calldata = callDataQueue.calldata;
                const value = callDataQueue.value;
                const callType = callDataQueue.callType;
                prioritySteps.push(...callDataQueue.prioritySteps);

                const response = {
                    target,
                    calldata,
                    value,
                    callType,
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

    AddPool(data: PoolData): Promise<boolean>
    {
        return new Promise(async (res, rej) =>
        {
            try
            {
                const getAdapter = await this._mongoDataStore.AddPool(data);
                res(getAdapter);
            }
            catch (e)
            {
                rej(e);
            }
        });
    }

    GetPools(filter: any, sort: any, limit?: number): Promise<PoolData[]>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const details = await this._mongoDataStore.GetPools(filter, sort, limit);
                resolve(details);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
    CalldataGasFunction(data: CalldataGasParmas): Promise<String>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const gas = await estimateGasPrice(
                    data.to,
                    data.calldata,
                    data.value,
                    data.chainId,
                    data.from
                );
                resolve(String(gas));
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    UpdateAdapterChainAddress(
        adapterId: string,
        adapterChainData: Array<AdapterChainData>
    ): Promise<Boolean>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const adapterDetails = await this.GetAdapterDetails(adapterId);
                if (adapterChainData.length < 1)
                {
                    throw "nothing to update";
                }
                for (let i = 0, len = adapterChainData.length; i < len; i++)
                {
                    const chainId = adapterChainData[i].chainId;
                    adapterDetails.chains[chainId] = adapterChainData[i];
                    if (adapterDetails.deployedChains.indexOf(Number(chainId)) < 0)
                    {
                        adapterDetails.deployedChains.push(Number(chainId));
                    }
                }
                const updateAdapter = await this._mongoDataStore.UpdateAdapter(adapterDetails);
                resolve(updateAdapter);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    GetInternalAdapterAddress(): Promise<any>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const chainIdTargeted = [5, 80001, 43113, 1, 137, 43114];
                const getTestnetPfMappedAddress = await SeqTestnetService.GetContractAddress();
                const getMainnetPfMappedAddress = await SeqMainnetService.GetContractAddress();
                const response: any = {};
                for (let i = 0, len = chainIdTargeted.length; i < len; i++)
                {
                    const chainId = chainIdTargeted[i];
                    const batchHandler = GetBatchHandlerAddress(chainId);
                    if (batchHandler)
                    {
                        const isMainnetChain = isMainnet(chainId);
                        const dexspan_batch = await getDexspanMappedAddress(chainId);
                        const forwarder_batch = await getForwarderMappedAddress(chainId);
                        const dexspan_pf = isMainnetChain
                            ? getMainnetPfMappedAddress[chainId].dexSpan
                            : getTestnetPfMappedAddress[chainId].dexSpan;
                        const forwarder_pf = isMainnetChain
                            ? getMainnetPfMappedAddress[chainId].forwarderBridge
                            : getTestnetPfMappedAddress[chainId].forwarderBridge;

                        response[chainId] = {
                            dexspan_batch,
                            forwarder_batch,
                            batchHandler,
                            dexspan_pf,
                            forwarder_pf
                        };
                    }
                }
                resolve(response);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }
}
