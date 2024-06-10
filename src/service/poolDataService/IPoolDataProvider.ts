import { PoolData } from "../models/DbModels";

export interface IPoolDataProvider
{
    FetchAndUpdateExternalData(poolData: PoolData): Promise<PoolData>;
}
