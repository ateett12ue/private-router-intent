import { IMongoDataStore } from "../../datastore/adapter/mongostore/IMongoDataStore";
import { mongoDataStore } from "../../datastore/adapter/mongostore/MongoDataStoreFactory";
import { IDataStore } from "../../datastore/adapter/mysqlstore/IDataStore";
import { dataStore } from "../../datastore/adapter/mysqlstore/DataStoreFactory";
import { IHelperService } from "./IHelperService";
import { HelperServiceImpl } from "./HelperServiceImpl";

interface IServiceInternal
{
    new (mongoDataStore: IMongoDataStore, dataStore: IDataStore): IHelperService;
}

const GetProtocolService = (ctor: IServiceInternal): IHelperService =>
{
    return new ctor(mongoDataStore, dataStore);
};

export const service = GetProtocolService(HelperServiceImpl);
