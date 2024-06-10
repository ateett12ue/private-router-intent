import { PoolData } from "../models/DbModels";
import { IPoolDataProvider } from "./IPoolDataProvider";
import { PoolProviders } from "../../constant/PoolProvidersEnum";
import DefaultPool from "./PoolProviders/DefaultPoolProvider";
import { IPoolProvider } from "./PoolProviders/IPoolProvider";
import DefillamaLiquidStakingPool from "./PoolProviders/common/Defillama/defillama";

class PoolDataProvider implements IPoolDataProvider
{
    private map: { [id: string]: IPoolProvider };

    constructor()
    {
        this.map = {};
        this.map[PoolProviders.NONE] = new DefaultPool();
        this.map[PoolProviders.LSD_LLAMA] = new DefillamaLiquidStakingPool();
    }

    FetchAndUpdateExternalData(poolData: PoolData): Promise<PoolData>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const dataProvider = this.map[poolData.dataProvider];
                const data = await dataProvider.FetchAndUpdateExternalData(poolData);
                resolve(data);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
}

export const poolDataProvider = new PoolDataProvider();
