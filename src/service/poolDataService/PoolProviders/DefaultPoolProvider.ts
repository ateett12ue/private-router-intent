import { PoolData } from "../../models/DbModels";
import { IPoolProvider } from "./IPoolProvider";

class DefaultPoolProvider implements IPoolProvider
{
    FetchAndUpdateExternalData(poolData: PoolData): Promise<PoolData>
    {
        return new Promise((resolve, reject) =>
        {
            try
            {
                resolve(poolData);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
}

export default DefaultPoolProvider;
