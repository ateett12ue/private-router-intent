import { ITransactionService } from "./ITransactionService";
import { IMongoDataStore } from "../../datastore/adapter/mongostore/IMongoDataStore";
import { IDataStore } from "../../datastore/adapter/mysqlstore/IDataStore";
import { TransactionStatusUpdate, TransactionAdapterStatusUpdate } from "../models/Transaction";
import { ProtocolParamsResponse } from "../models/Protocols";
import { AdapterIdParamsResponse } from "../models/Adapters";
import { TransactionDetails, TransactionAdaptersDetails } from "../models/DbModels";
import * as uuid from "uuid";
export class TransactionServiceImpl implements ITransactionService
{
    _mongoDataStore: IMongoDataStore;
    _dataStore: IDataStore;

    constructor(mongoDataStore: IMongoDataStore, dataStore: IDataStore)
    {
        this._mongoDataStore = mongoDataStore;
        this._dataStore = dataStore;
    }

    AddTransaction(data: ProtocolParamsResponse, gasPrice: string): Promise<{ trnxId: string }>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const { adapterMap, adapters } = this.AddAdapterIndicesAndFlatten(data.adapters);
                const trnxId = uuid();
                const tranxData: TransactionDetails = {
                    transactionId: trnxId,
                    transactionStatus: "PENDING",
                    gasFee: gasPrice,
                    transactionHash: "",
                    adapters: adapterMap,
                    sourceTokens: data.sourceTokens,
                    sourceAmount: data.amount,
                    senderAddress: data.senderAddress,
                    receiverAddress: data.clientAddress,
                    sourceChainId: String(data?.sourceChainId),
                    destinationChainId: String(data?.destinationChainId),
                    transactionCreationTime: String(new Date()),
                    transactionCompletionTime: "",
                    transactionUpdateTime: ""
                };
                const tnxCreation = await this._mongoDataStore.AddTransaction(tranxData);
                resolve({ trnxId });
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }
    UpdateTransactionStatus(data: TransactionStatusUpdate): Promise<TransactionDetails>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const trnxDetails = await this._mongoDataStore.GetTransactionByTransactionId(
                    data.transactionId
                );
                trnxDetails.transactionStatus = data.transactionStatus;
                trnxDetails.gasFee = data.gasFee;
                trnxDetails.transactionHash = data.transactionHash;
                if (data.transactionStatus == "COMPLETED")
                {
                    trnxDetails.transactionCompletionTime = String(new Date());
                }

                trnxDetails.transactionUpdateTime = String(new Date());

                if (data.adapterStatus.length > 0)
                {
                    const adapters = trnxDetails.adapters;
                    const update = data.adapterStatus.map(
                        (adapterStatus: TransactionAdapterStatusUpdate) =>
                        {
                            const adapterDetails: TransactionAdaptersDetails =
                                adapters[adapterStatus.adapterIndex];
                            adapterDetails.adapterHash = adapterStatus.hash;
                            adapterDetails.adapterStatus = adapterStatus.status;
                            trnxDetails.adapters[adapterStatus.adapterIndex] = adapterDetails;
                            return true;
                        }
                    );
                }
                const updateTnx = await this._mongoDataStore.UpdateTransaction(trnxDetails);

                resolve(trnxDetails);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    GetTransactionsBySenderAddress(senderAddress: string): Promise<Array<TransactionDetails>>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const getTnx = await this._mongoDataStore.GetTransactionsByUserAddress(
                    senderAddress
                );
                resolve(getTnx);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }
    GetTransactionByTransactionId(transactionId: string): Promise<TransactionDetails>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const getTnx = await this._mongoDataStore.GetTransactionByTransactionId(
                    transactionId
                );
                resolve(getTnx);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    private AddAdapterIndices(
        adapters: Array<AdapterIdParamsResponse>,
        prevId = "0"
    ): Array<TransactionAdaptersDetails>
    {
        try
        {
            return adapters.map((adapter, index) =>
            {
                const id = prevId ? `${prevId}-${index}` : `${index}`;
                const newAdapter = {
                    adapterId: adapter.adapterId,
                    adapterIndex: id,
                    adapterType: adapter.adapterType,
                    adapterStatus: "PENDING",
                    adapterHash: "",
                    sourceChainId: String(adapter.sourceChainId),
                    destChainId: String(adapter.destChainId),
                    srcToken: adapter.adapterOptions?.srcToken,
                    amountIn: adapter.adapterOptions.amountIn,
                    amountOut: adapter.adapterOptions.amountOut,
                    destToken: adapter.adapterOptions?.destToken,
                    receiverAddress: adapter.adapterOptions?.receiverAddress
                };
                if (adapter.adapters)
                {
                    return {
                        ...newAdapter,
                        adapters: this.AddAdapterIndices(adapter.adapters, id),
                        adapterIndices: adapter.adapters.map((_, i) => `${id}-${i}`)
                    };
                }
                return {
                    ...newAdapter,
                    index: id,
                    adapters: [],
                    adapterIndices: []
                };
            });
        }
        catch (ex)
        {
            throw ex;
        }
    }

    private FlattenAdapters(
        adapters: Array<TransactionAdaptersDetails>,
        prevId = "0"
    ): Record<string, any>
    {
        try
        {
            return adapters.reduce((acc, adapter, index) =>
            {
                if (adapter.adapters)
                {
                    return {
                        ...acc,
                        [adapter.adapterIndex]: adapter,
                        ...this.FlattenAdapters(adapter.adapters, adapter.adapterIndex)
                    };
                }
                return {
                    ...acc,
                    [adapter.adapterIndex]: adapter
                };
            }, {});
        }
        catch (ex)
        {
            throw ex;
        }
    }

    private AddAdapterIndicesAndFlatten(
        adapters: Array<AdapterIdParamsResponse>,
        prevId = "0"
    ): { adapterMap: any; adapters: any[] }
    {
        try
        {
            const adapterIndices = this.AddAdapterIndices(adapters, prevId);
            const adapterMap = this.FlattenAdapters(adapterIndices, prevId);

            return {
                adapterMap,
                adapters: adapterIndices
            };
        }
        catch (ex)
        {
            throw ex;
        }
    }
    UpdateTransactionAdapterStatus(
        data: TransactionAdapterStatusUpdate
    ): Promise<TransactionDetails>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const trnxDetails = await this._mongoDataStore.GetTransactionByTransactionId(
                    data.transactionId
                );
                const adapters = trnxDetails.adapters;
                const adapterDetails: TransactionAdaptersDetails = adapters[data.adapterIndex];
                adapterDetails.adapterHash = data.hash;
                adapterDetails.adapterStatus = data.status;
                trnxDetails.adapters[data.adapterIndex] = adapterDetails;
                const updateTnx = await this._mongoDataStore.UpdateTransaction(trnxDetails);
                resolve(trnxDetails);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    GetTransactionByHash(hash: string): Promise<TransactionDetails>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const getTnx = await this._mongoDataStore.GetTransactionByHash(hash);
                resolve(getTnx);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }
}
