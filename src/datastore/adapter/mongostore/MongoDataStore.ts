import * as bluebird from "bluebird";
import {
    AdapterDataStoreMapper,
    PoolDataStoreMapper,
    ProtocolDataStoreMapper,
    HelperDataStoreMapper,
    TransactionDataStoreMapper
} from "../../../mappers/DataStoreMapper";
import {
    AdapterDetails,
    PoolData,
    PoolDataFilter,
    PoolDataSort,
    ProtocolDetails,
    HelperContractData,
    TransactionDetails
} from "../../../service/models/DbModels";
import { IMongoDataStore } from "./IMongoDataStore";
import { AdapterDetails as AdapterDetailsDocument } from "./models/AdapterDetails";
import { PoolData as PoolDataDocument } from "./models/PoolData";
import { ProtocolDetails as ProtocolDetailsDocument } from "./models/ProtocolDetails";
import { HelperContractDetails as HelperContractDetailsDocument } from "./models/HelperContractDetails";
import { TransactionDetails as TransactionDetailsDocument } from "./models/TransactionDetails";
import _mongoose = require("mongoose");
_mongoose.Promise = bluebird;

export class MongoDataStore implements IMongoDataStore
{
    AddAdapter(data: AdapterDetails): Promise<boolean>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const recordObj = new AdapterDetailsDocument(data);
                const result = await recordObj.save();
                if (result) resolve(true);
                else reject(false);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    UpdateAdapter(data: AdapterDetails): Promise<boolean>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const options = {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                };
                AdapterDetailsDocument.findOneAndUpdate(
                    { id: data.id },
                    { $set: data },
                    options,
                    (err: any, res: any) =>
                    {
                        if (err)
                        {
                            reject(err);
                        }
                        else
                        {
                            if (!res)
                            {
                                resolve(false);
                                return;
                            }

                            resolve(true);
                        }
                    }
                );
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    AddProtocol(data: ProtocolDetails): Promise<boolean>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const recordObj = new ProtocolDetailsDocument(data);
                const result = await recordObj.save();
                if (result) resolve(true);
                else reject(false);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    AddPool(data: PoolData): Promise<boolean>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const recordObj = new PoolDataDocument(data);
                const result = await recordObj.save();
                if (result) resolve(true);
                else reject(false);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    GetAdapterDetails(adapterId: string): Promise<AdapterDetails>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                AdapterDetailsDocument.find(
                    { id: adapterId },
                    (err: any, res: Array<_mongoose.Document>) =>
                    {
                        if (err)
                        {
                            reject(err);
                        }
                        else
                        {
                            if (!res || res.length == 0)
                            {
                                reject("Adapter not found");
                                return;
                            }
                            resolve(
                                AdapterDataStoreMapper.AdapterDetailsFromMongooseDocumentMapper(
                                    res[0].toObject()
                                )
                            );
                        }
                    }
                );
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    GetAllAdaptersDetails(): Promise<Array<AdapterDetails>>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                AdapterDetailsDocument.find({}, (err: any, res: Array<_mongoose.Document>) =>
                {
                    if (err)
                    {
                        reject(err);
                    }
                    else
                    {
                        if (!res || res.length == 0)
                        {
                            reject("Adapter not found");
                            return;
                        }
                        const docs = res.map(doc =>
                        {
                            return AdapterDataStoreMapper.AdapterDetailsFromMongooseDocumentMapper(
                                doc.toObject()
                            );
                        });
                        resolve(docs);
                    }
                });
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    GetProtocolDetails(protocolId: string): Promise<ProtocolDetails>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                ProtocolDetailsDocument.find(
                    { id: protocolId },
                    (err: any, res: Array<_mongoose.Document>) =>
                    {
                        if (err)
                        {
                            reject(err);
                        }
                        else
                        {
                            if (!res || res.length == 0)
                            {
                                reject("Protocol not found");
                                return;
                            }
                            resolve(
                                ProtocolDataStoreMapper.ProtocolDetailsFromMongooseDocumentMapper(
                                    res[0].toObject()
                                )
                            );
                        }
                    }
                );
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    GetPool(id: string): Promise<PoolData>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                PoolDataDocument.find({ id: id }, (err: any, res: Array<_mongoose.Document>) =>
                {
                    if (err)
                    {
                        reject(err);
                    }
                    else
                    {
                        if (!res || res.length == 0)
                        {
                            reject("Pool not found");
                            return;
                        }
                        resolve(
                            PoolDataStoreMapper.PoolDetailsFromMongooseDocumentMapper(
                                res[0].toObject()
                            )
                        );
                    }
                });
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    GetPools(
        filter: PoolDataFilter = {},
        sort: PoolDataSort,
        limit?: number,
        offset?: number
    ): Promise<Array<PoolData>>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                PoolDataDocument.find(filter, null, {
                    sort: sort,
                    limit: limit,
                    skip: offset
                }).exec((err: any, res: Array<_mongoose.Document>) =>
                {
                    if (err)
                    {
                        reject(err);
                    }
                    else
                    {
                        if (!res || res.length == 0)
                        {
                            resolve([]);
                        }

                        const pools = res.map(pool =>
                        {
                            return PoolDataStoreMapper.PoolDetailsFromMongooseDocumentMapper(
                                pool.toObject()
                            );
                        });

                        resolve(pools);
                    }
                });
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    GetPoolsCount(filter: any): Promise<number>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                PoolDataDocument.countDocuments(filter, (err: any, res: number) =>
                {
                    if (err)
                    {
                        reject(err);
                    }
                    else
                    {
                        resolve(res);
                    }
                });
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    UpdatePool(data: PoolData): Promise<boolean>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const result = await PoolDataDocument.collection.updateOne({ id: data.id }, data);
                if (result) resolve(true);
                else throw new Error("Update failed");
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    UpdatePools(data: PoolData[]): Promise<boolean>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const bulkOps = data.map((pool: PoolData) =>
                {
                    return {
                        updateOne: {
                            filter: { id: pool.id },
                            update: { $set: pool }
                        }
                    };
                });

                const result = await PoolDataDocument.collection.bulkWrite(bulkOps);

                if (result) resolve(true);
                else throw new Error("Update failed");
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    GetHelperContractData(id: string): Promise<HelperContractData>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                HelperContractDetailsDocument.find(
                    { id: id },
                    (err: any, res: Array<_mongoose.Document>) =>
                    {
                        if (err)
                        {
                            reject(err);
                        }
                        else
                        {
                            if (!res || res.length == 0)
                            {
                                reject("Data not found");
                                return;
                            }
                            resolve(
                                HelperDataStoreMapper.HelperDetailsFromMongooseDocumentMapper(
                                    res[0].toObject()
                                )
                            );
                        }
                    }
                );
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    UpdateHelperContractData(data: HelperContractData): Promise<boolean>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const options = {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                };
                HelperContractDetailsDocument.findOneAndUpdate(
                    { id: data.id },
                    { $set: data },
                    options,
                    (err: any, res: any) =>
                    {
                        if (err)
                        {
                            reject(err);
                        }
                        else
                        {
                            if (!res)
                            {
                                resolve(false);
                                return;
                            }

                            resolve(true);
                        }
                    }
                );
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    AddTransaction(data: TransactionDetails): Promise<boolean>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const recordObj = new TransactionDetailsDocument(data);
                const result = await recordObj.save();
                if (result) resolve(true);
                else reject(false);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }
    UpdateTransaction(data: TransactionDetails): Promise<boolean>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const options = {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                };
                TransactionDetailsDocument.findOneAndUpdate(
                    { transactionId: data.transactionId },
                    { $set: data },
                    options,
                    (err: any, res: any) =>
                    {
                        if (err)
                        {
                            reject(err);
                        }
                        else
                        {
                            if (!res)
                            {
                                resolve(false);
                                return;
                            }

                            resolve(true);
                        }
                    }
                );
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    GetTransactionByTransactionId(id: string): Promise<TransactionDetails>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                TransactionDetailsDocument.find(
                    { transactionId: id },
                    (err: any, res: Array<_mongoose.Document>) =>
                    {
                        if (err)
                        {
                            reject(err);
                        }
                        else
                        {
                            if (!res || res.length == 0)
                            {
                                reject("Data not found");
                                return;
                            }
                            resolve(
                                TransactionDataStoreMapper.TransactionDetailsFromMongooseDocumentMapper(
                                    res[0].toObject()
                                )
                            );
                        }
                    }
                );
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }
    GetTransactionsByUserAddress(userAddress: string): Promise<Array<TransactionDetails>>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                TransactionDetailsDocument.find(
                    { senderAddress: userAddress },
                    (err: any, res: Array<_mongoose.Document>) =>
                    {
                        if (err)
                        {
                            reject(err);
                        }
                        else
                        {
                            if (!res || res.length == 0)
                            {
                                reject("Data not found");
                                return;
                            }
                            const data = res.map(tnx =>
                            {
                                return TransactionDataStoreMapper.TransactionDetailsFromMongooseDocumentMapper(
                                    tnx.toObject()
                                );
                            });

                            resolve(data);
                        }
                    }
                );
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
                TransactionDetailsDocument.find(
                    { transactionHash: hash },
                    (err: any, res: Array<_mongoose.Document>) =>
                    {
                        if (err)
                        {
                            reject(err);
                        }
                        else
                        {
                            if (!res || res.length == 0)
                            {
                                reject("Data not found");
                                return;
                            }
                            resolve(
                                TransactionDataStoreMapper.TransactionDetailsFromMongooseDocumentMapper(
                                    res[0].toObject()
                                )
                            );
                        }
                    }
                );
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }
}
