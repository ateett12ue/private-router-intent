import { PoolData } from "../../models/DbModels";
import { IPoolProvider } from "./IPoolProvider";
abstract class PoolProviderBase implements IPoolProvider
{
    abstract FetchAndUpdateExternalData(poolData: PoolData): Promise<PoolData>;
}

export default PoolProviderBase;
