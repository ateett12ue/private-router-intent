import { IMongoDataStore } from "../../datastore/adapter/mongostore/IMongoDataStore";
import { IDataStore } from "../../datastore/adapter/mysqlstore/IDataStore";
import { IRedisDataStore } from "../../datastore/adapter/redis/IRedisDataStore";
import { convertToMongooseFilters } from "../../utils";
import { PoolData, PoolDataFilter, PoolDataSort } from "../models/DbModels";
import { IPoolDataService } from "./IPoolDataService";
import { poolDataProvider } from "./PoolDataProvider";

const POOL_UPDATE_INTERVAL = 3600 * 6 * 1000; // 6 hours
const POOL_CACHE_TTL = 60 * 5; // 5 minutes

// const POOL_UPDATE_INTERVAL = 1 * 1000;
export class PoolDataServiceImplementation implements IPoolDataService
{
    _mongoDataStore: IMongoDataStore;
    _cacheStore: IRedisDataStore;
    _dataStore: IDataStore;

    constructor(
        mongoDataStore: IMongoDataStore,
        dataStore: IDataStore,
        cacheStore: IRedisDataStore
    )
    {
        this._mongoDataStore = mongoDataStore;
        this._dataStore = dataStore;
        this._cacheStore = cacheStore;
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

    GetPool(id: string): Promise<PoolData>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const poolData = await this._mongoDataStore.GetPool(id);
                resolve(poolData);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    GetPools(
        filter: PoolDataFilter,
        sort: PoolDataSort,
        limit?: number,
        offset?: number
    ): Promise<PoolData[]>
    {
        return new Promise(async (resolve, reject) =>
        {
            let poolDataList: PoolData[] = [];
            poolDataList = await this._cacheStore.GetPools(filter, sort, limit, offset).catch(e =>
            {
                console.log("error fetching pools from cache", e);
                return [];
            });

            if (!poolDataList || poolDataList.length == 0)
            {
                try
                {
                    const mongoFilter = convertToMongooseFilters(filter);
                    poolDataList = await this._mongoDataStore.GetPools(
                        mongoFilter,
                        sort,
                        limit,
                        offset
                    );
                }
                catch (e)
                {
                    reject(e);
                }
                await this._cacheStore
                    .SetPools(poolDataList, filter, sort, limit, offset, POOL_CACHE_TTL)
                    .catch(e =>
                    {
                        console.log("error setting pools in cache", e);
                    });
            }

            resolve(poolDataList);
        });
    }
    // 12 hrs

    UpdatePoolDatas(): Promise<boolean>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const totalPools = await this._mongoDataStore.GetPoolsCount({});
                const lastUpdatedTimestamp = await this._cacheStore.GetKey(
                    "pools:updated_timestamp"
                );
                const lastUpdatedLength = await this._cacheStore.GetKey("pools:updated_length");

                // fetch external data if pool data is outdated
                if (
                    !lastUpdatedTimestamp ||
                    !lastUpdatedLength ||
                    totalPools != parseInt(lastUpdatedLength) ||
                    new Date().getTime() - parseInt(lastUpdatedTimestamp) > POOL_UPDATE_INTERVAL
                )
                {
                    const poolDataList = await this._mongoDataStore.GetPools({}, {});
                    let updateBatch: PoolData[] = [];

                    [, updateBatch] = await this.FetchPoolsAndUpdates(poolDataList);

                    // update mongo data store
                    try
                    {
                        await this._mongoDataStore.UpdatePools(updateBatch);
                        await this._cacheStore.SetKey(
                            "pools:updated_timestamp",
                            new Date().getTime().toString()
                        );
                        await this._cacheStore.SetKey(
                            "pools:updated_length",
                            poolDataList.length.toString()
                        );
                    }
                    catch (e)
                    {
                        console.log("error updating pools", e);
                    }

                    resolve(true);
                }
                else
                {
                    resolve(true);
                }
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    FetchPoolsAndUpdates(poolData: PoolData[]): Promise<[PoolData[], PoolData[]]>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const result: PoolData[] = [];
                const updateBatch: PoolData[] = [];

                for (const pool of poolData)
                {
                    try
                    {
                        const updatedPool = await poolDataProvider.FetchAndUpdateExternalData(pool);
                        updateBatch.push(updatedPool);
                    }
                    catch (e)
                    {
                        console.log("error fetching pools", e);
                    }
                    finally
                    {
                        result.push(pool);
                    }
                }

                resolve([poolData, updateBatch]);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
}
