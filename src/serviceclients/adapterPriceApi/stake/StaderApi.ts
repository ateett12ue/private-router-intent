import * as _httpClient from "request";
import axios from "axios";
export interface PriceResponse
{
    value: number;
}

const BASE_URL = "https://universe.staderlabs.com/";

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
    public PriceApiEth(): Promise<number>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const url = this.apiRequestUrl("eth", "exchangeRate");
                const response = await axios.get(url, {
                    headers: {
                        accept: "application/json"
                    }
                });
                if (!response)
                {
                    reject("Price not found");
                }
                resolve(response?.data?.value);
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
                const url = this.apiRequestUrl("polygon", "exchangeRate");

                const config = {
                    method: "get",
                    maxBodyLength: Infinity,
                    url: url,
                    headers: {}
                };

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
                resolve(response?.data?.value);
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
