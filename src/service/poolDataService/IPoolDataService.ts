import { PoolData, PoolDataFilter, PoolDataSort } from "../models/DbModels";
export interface IPoolDataService
{
    AddPool(data: PoolData): Promise<boolean>;
    GetPool(id: string): Promise<PoolData>;
    GetPools(
        filter: PoolDataFilter,
        sort: PoolDataSort,
        limit?: number,
        offset?: number
    ): Promise<PoolData[]>;
    UpdatePoolDatas(): Promise<boolean>;
    FetchPoolsAndUpdates(poolData: PoolData[]): Promise<[PoolData[], PoolData[]]>;
}
