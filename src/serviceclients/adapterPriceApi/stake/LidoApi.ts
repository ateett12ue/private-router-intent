import * as _httpClient from "request";
import axios from "axios";
export interface PriceResponse
{
    native: string;
    kyberswap: string;
    discountPercent: number;
}

const BASE_URL = "https://polygon.lido.fi/api/discount";

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
    public PriceApiEth(amount: number): Promise<any>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                // const url = `https://open-api.openocean.finance/v3/1/quote?inTokenAddress=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&outTokenAddress=0xae7ab96520de3a18e5e111b5eaab095312d7fe84&gasPrice=34&amount=${amount}`
                // const response = await axios.get(url, {
                //     headers: {
                //         accept: "application/json"
                //     }
                // });
                // if (!response)
                // {
                //     reject("Price not found");
                // }
                // resolve(response?.data?.data?.outAmount);
                resolve(amount);
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
    // 1 MaticX = x Matic
    public PriceApiMatic(): Promise<number>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const url = "https://polygon.lido.fi/api/discount";
                //   const response = await axios.request(config);
                const response = await axios.get(url, {
                    headers: {
                        accept: "application/json"
                    }
                });
                if (!response)
                {
                    reject("Price not found");
                }
                resolve(response?.data?.native);
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
