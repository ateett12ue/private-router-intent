import { redisClient } from "../../../config/redisconfig";
import { PoolData, PoolDataFilter, PoolDataSort } from "../../../service/models/DbModels";
import { IRedisDataStore } from "./IRedisDataStore";
import * as redis from "redis";

export class RedisDataStore implements IRedisDataStore
{
    // private _redisClient: redis.RedisClientType;
    private _redisClient: ReturnType<typeof redis.createClient>;

    constructor()
    {
        this._redisClient = redisClient;
    }

    GetKey(key: string): Promise<string>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const result = await this._redisClient.get(key);
                resolve(JSON.parse(result));
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    SetKey(key: string, value: string, ttl?: number): Promise<string>
    {
        return new Promise((resolve, reject) =>
        {
            try
            {
                const result = this._redisClient.set(key, value);
                if (ttl)
                {
                    this._redisClient.expire(key, ttl);
                }
                resolve(result);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    DeleteKey(key: string): Promise<number>
    {
        return new Promise((resolve, reject) =>
        {
            try
            {
                const result = this._redisClient.del(key);
                resolve(result);
            }
            catch (ex)
            {
                reject(ex);
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
            try
            {
                const key = `pools:${JSON.stringify(filter)}_${JSON.stringify(
                    sort
                )}_${limit}_${offset}`;

                const val = await this._redisClient.get(key);
                const result = JSON.parse(val);

                resolve(result);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    SetPools(
        poolData: PoolData[],
        filter: PoolDataFilter,
        sort: PoolDataSort,
        limit: number,
        offset: number,
        ttl: number
    ): Promise<string>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const key = `pools:${JSON.stringify(filter)}_${JSON.stringify(
                    sort
                )}_${limit}_${offset}`;

                const result = await this._redisClient.set(key, JSON.stringify(poolData));
                await this._redisClient.expire(key, ttl);

                resolve(result);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }
}
