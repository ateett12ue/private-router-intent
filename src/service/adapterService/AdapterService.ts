import { IMongoDataStore } from "../../datastore/adapter/mongostore/IMongoDataStore";
import { mongoDataStore } from "../../datastore/adapter/mongostore/MongoDataStoreFactory";
import { IDataStore } from "../../datastore/adapter/mysqlstore/IDataStore";
import { dataStore } from "../../datastore/adapter/mysqlstore/DataStoreFactory";
import { IAdapterService } from "./IAdapterService";
import { AdapterServiceImpl } from "./AdapterServiceImpl";

interface IServiceInternal
{
    new (mongoDataStore: IMongoDataStore, dataStore: IDataStore): IAdapterService;
}

const GetAdapterService = (ctor: IServiceInternal): IAdapterService =>
{
    return new ctor(mongoDataStore, dataStore);
};

export const service = GetAdapterService(AdapterServiceImpl);
