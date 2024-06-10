import { IMongoDataStore } from "../../datastore/adapter/mongostore/IMongoDataStore";
import { mongoDataStore } from "../../datastore/adapter/mongostore/MongoDataStoreFactory";
import { IDataStore } from "../../datastore/adapter/mysqlstore/IDataStore";
import { dataStore } from "../../datastore/adapter/mysqlstore/DataStoreFactory";
import { ITransactionService } from "./ITransactionService";
import { TransactionServiceImpl } from "./TransactionServiceImpl";

interface IServiceInternal
{
    new (mongoDataStore: IMongoDataStore, dataStore: IDataStore): ITransactionService;
}

const GetProtocolService = (ctor: IServiceInternal): ITransactionService =>
{
    return new ctor(mongoDataStore, dataStore);
};

export const service = GetProtocolService(TransactionServiceImpl);
