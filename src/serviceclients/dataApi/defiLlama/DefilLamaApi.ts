import * as _httpClient from "request";
import axios from "axios";

const BASE_URL = "https://api.llama.fi/";
const POOLS_BASE_URI = "https://yields.llama.fi/";

export interface DefiLlamaPoolData
{
    chain: string;
    project: string;
    symbol: string;
    tvlUsd: number;
    apyBase: number;
    apyReward: number;
    apy: number;
    rewardTokens: any;
    pool: string;
    apyPct1D: number;
    apyPct7D: number;
    apyPct30D: number;
    stablecoin: boolean;
    ilRisk: string;
    exposure: string;
    predictions: any;
    poolMeta: any;
    mu: number;
    sigma: number;
    count: number;
    outlier: boolean;
    underlyingTokens: string[];
    il7d: any;
    apyBase7d: number;
    apyMean30d: number;
    volumeUsd1d: number;
    volumeUsd7d: number;
    apyBaseInception: number;
    url: string;
}

export interface DefiLlamaProtocolData
{
    id: string;
    name: string;
    url: string;
    description: string;
    logo: string;
    chains: string[];
    gecko_id: string;
    cmcId: string;
    treasury: string;
    twitter: string;
    governanceID: string[];
    wrongLiquidity: boolean;
    github: string[];
    currentChainTvls: Record<string, number>;
}

class DefiLlama
{
    public apiRequestUrl(path: string, type?: string): string
    {
        let url = "";
        if (type === "pools")
        {
            url = POOLS_BASE_URI + path;
        }
        else
        {
            url = BASE_URL + path;
        }

        return url;
    }

    public GetPoolData(poolId: string): Promise<DefiLlamaPoolData>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const url = this.apiRequestUrl(`poolsEnriched?pool=${poolId}`, "pools");
                const response = await axios.get(url, {});

                if (!response)
                {
                    reject("Error fetching pool data");
                }

                const poolData = response?.data?.data?.[0];

                resolve(poolData);
            }
            catch (ex)
            {
                if (ex?.response?.data?.error)
                {
                    reject(ex?.response?.data?.error);
                }
                else
                {
                    reject(ex);
                }
            }
        });
    }

    public GetProtocolData(protocolId: string): Promise<DefiLlamaProtocolData>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const url = this.apiRequestUrl(`protocol/${protocolId}`);
                const response = await axios.get<any, DefiLlamaProtocolData>(url, {});

                if (!response)
                {
                    reject("Error fetching protocol data");
                }
                resolve(response);
            }
            catch (ex)
            {
                if (ex?.response?.data?.error)
                {
                    reject(ex?.response?.data?.error);
                }
                else
                {
                    reject(ex);
                }
            }
        });
    }
}

export default DefiLlama;
export const service = new DefiLlama();
