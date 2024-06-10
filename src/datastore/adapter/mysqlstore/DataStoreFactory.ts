import { IDataStore } from "./IDataStore";
import { MySqlDataStore } from "./MySqlDataStore";

interface IDataStoreFactory
{
    new (): IDataStore;
}

const GetDataStore = (ctor: IDataStoreFactory): IDataStore =>
{
    return new ctor();
};

export const dataStore = GetDataStore(MySqlDataStore);
