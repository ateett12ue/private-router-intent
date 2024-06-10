import { PoolData, PoolDataFilter, PoolDataSort } from "../../../service/models/DbModels";

export interface IRedisDataStore
{
    SetKey(key: string, value: string): Promise<string>;
    GetKey(key: string): Promise<string>;
    DeleteKey(key: string): Promise<number>;

    GetPools(filter: any, sort: any, limit?: number, offset?: number): Promise<PoolData[]>;
    SetPools(
        poolData: PoolData[],
        filter: PoolDataFilter,
        sort: PoolDataSort,
        limit: number,
        offset: number,
        ttl: number
    ): Promise<string>;
}
