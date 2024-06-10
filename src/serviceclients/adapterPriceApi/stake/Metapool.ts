import axios from "axios";
import { getContract } from "../../../utils/index";
import { metapoolStakingAbi } from "../../../abis/MetapoolStake";
import { MetapoolStakingContract } from "../../../constant/contractMapping";
export interface PriceResponse
{
    value: number;
}

const BASE_URL = "https://eth-metapool.narwallets.com/metrics_front";

class PriceFetchApi
{
    public apiRequestUrl(methodName: string, chainType?: string, extra?: string)
    {
        let url = BASE_URL + methodName;
        if (chainType)
        {
            url = url + `/${chainType}`;
        }
        if (extra)
        {
            url = url + `?${extra}`;
        }
        return url;
    }
    // 1 EthX = x Eth
    public PriceApiEth(amount: string): Promise<number>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const sourceTokenContract = await getContract(
                    metapoolStakingAbi,
                    MetapoolStakingContract[5],
                    5
                );
                const metaEthReceived = await sourceTokenContract.previewDeposit(amount);
                if (!metaEthReceived)
                {
                    throw "metapool allowance error";
                }
                resolve(metaEthReceived);
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

    public PriceApiNear(): Promise<number>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                // const url = this.apiRequestUrl("eth", "exchangeRate");
                const url = "https://validators.narwallets.com/metrics/price/stnear-near";
                const response = await axios.get(url, {
                    headers: {
                        accept: "application/json"
                    }
                });
                if (!response)
                {
                    reject("Price not found");
                }
                resolve(Number(response));
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

export const service = new PriceFetchApi();
