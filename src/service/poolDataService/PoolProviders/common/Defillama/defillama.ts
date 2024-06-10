import { PoolData } from "../../../../models/DbModels";
import PoolProviderBase from "../../PoolProviderBase";
import { service as defiLlamaApi } from "../../../../../serviceclients/dataApi/defiLlama/DefilLamaApi";

class DefillamaLiquidStakingPool extends PoolProviderBase
{
    FetchAndUpdateExternalData(poolData: PoolData): Promise<PoolData>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                // fetch data from defillama
                const llamaId = poolData.metadata.llamaId;

                const defiLlamaPoolData = await defiLlamaApi.GetPoolData(llamaId);

                if (!defiLlamaPoolData)
                {
                    reject(`DefiLlamaPoolData not found for ${llamaId}`);
                }

                // update poolData
                poolData = {
                    ...poolData,
                    data: {
                        apy: defiLlamaPoolData.apy,
                        tvlUsd: defiLlamaPoolData.tvlUsd,
                        apyMean30d: defiLlamaPoolData.apyMean30d
                    }
                };

                resolve(poolData);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
}

export default DefillamaLiquidStakingPool;
