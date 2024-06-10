import { IMongoDataStore } from "./IMongoDataStore";
import { MongoDataStore } from "./MongoDataStore";

interface MongoDataStoreFactory
{
    new (): IMongoDataStore;
}

const GetMongoDataStore = (ctor: MongoDataStoreFactory): IMongoDataStore =>
{
    return new ctor();
};

export const mongoDataStore = GetMongoDataStore(MongoDataStore);
