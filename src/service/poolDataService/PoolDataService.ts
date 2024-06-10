import { IMongoDataStore } from "../../datastore/adapter/mongostore/IMongoDataStore";
import { mongoDataStore } from "../../datastore/adapter/mongostore/MongoDataStoreFactory";
import { IDataStore } from "../../datastore/adapter/mysqlstore/IDataStore";
import { dataStore } from "../../datastore/adapter/mysqlstore/DataStoreFactory";

import { IPoolDataService } from "./IPoolDataService";
import { PoolDataServiceImplementation } from "./PoolDataServiceImpl";
import { IRedisDataStore } from "../../datastore/adapter/redis/IRedisDataStore";
import { redisDataStore } from "../../datastore/adapter/redis/RedisDataStoreFactory";

interface IServiceInternal
{
    new (
        mongoDataStore: IMongoDataStore,
        dataStore: IDataStore,
        redisDataStore: IRedisDataStore
    ): IPoolDataService;
}

const GetTemplateService = (ctor: IServiceInternal): IPoolDataService =>
{
    return new ctor(mongoDataStore, dataStore, redisDataStore);
};

export const service = GetTemplateService(PoolDataServiceImplementation);
