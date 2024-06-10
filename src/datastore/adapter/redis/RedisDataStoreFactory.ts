import { IRedisDataStore } from "./IRedisDataStore";
import { RedisDataStore } from "./RedisDataStore";

interface RedisDataStoreFactory
{
    new (): IRedisDataStore;
}

const GetRedisDataStore = (ctor: RedisDataStoreFactory): IRedisDataStore =>
{
    return new ctor();
};

export const redisDataStore = GetRedisDataStore(RedisDataStore);
