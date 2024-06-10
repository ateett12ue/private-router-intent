import axios from "axios";
import { getContract } from "../../../utils/index";
import { StakestoneValutAbi } from "../../../abis/StakeStoneValut";
import { StakeStoneValutContract } from "../../../constant/contractMapping";
import * as ethers from "ethers";
export interface PriceResponse
{
    value: number;
}

class PriceFetchApi
{
    public PriceApiEthereum(): Promise<number>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const valutContract = await getContract(
                    StakestoneValutAbi,
                    StakeStoneValutContract[1],
                    1
                );
                const exchangeRate = await valutContract.currentSharePrice();
                if (!exchangeRate)
                {
                    throw "Stake Stone Exchange Rate Not Fetched";
                }
                resolve(exchangeRate);
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
