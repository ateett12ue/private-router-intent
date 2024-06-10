import { PoolData } from "../../models/DbModels";

export interface IPoolProvider
{
    FetchAndUpdateExternalData(poolData: PoolData): Promise<PoolData>;
}
