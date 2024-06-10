import { IMongoDataStore } from "../../datastore/adapter/mongostore/IMongoDataStore";
import { mongoDataStore } from "../../datastore/adapter/mongostore/MongoDataStoreFactory";
import { IDataStore } from "../../datastore/adapter/mysqlstore/IDataStore";
import { dataStore } from "../../datastore/adapter/mysqlstore/DataStoreFactory";
import { IProtocolService } from "./IProtocolService";
import { ProtocolServiceImpl } from "./ProtocolServiceImpl";

interface IServiceInternal
{
    new (mongoDataStore: IMongoDataStore, dataStore: IDataStore): IProtocolService;
}

const GetProtocolService = (ctor: IServiceInternal): IProtocolService =>
{
    return new ctor(mongoDataStore, dataStore);
};

export const service = GetProtocolService(ProtocolServiceImpl);
