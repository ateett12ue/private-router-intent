import axios from "axios";
import { getContract } from "../../../utils/index";
import { BenqiStakingAbi } from "../../../abis/BenqiStake";
import { BenqiStakingContract } from "../../../constant/contractMapping";
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
    public PriceApiAvalance(amount: string): Promise<string>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const sourceTokenContract = await getContract(
                    BenqiStakingAbi,
                    BenqiStakingContract[43114],
                    43114
                );
                const sAvaxReceived = await sourceTokenContract.getSharesByPooledAvax(amount);
                if (!sAvaxReceived)
                {
                    throw "Benqi allowance error";
                }
                resolve(sAvaxReceived.toString());
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
