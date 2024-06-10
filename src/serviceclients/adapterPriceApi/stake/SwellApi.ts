import * as _httpClient from "request";
import axios from "axios";
export interface PriceResponse
{
    time: string;
    rate: string;
}
const BASE_URL =
    "https://v3.svc.swellnetwork.io/swell.v3.RatesService/SwethEth?connect=v1&encoding=json&message=%7B%7D";

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
    public PriceApiEth(): Promise<PriceResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                // const url = this.apiRequestUrl("eth", "exchangeRate");
                const url = BASE_URL;
                const response = await axios.get(url, {
                    headers: {
                        accept: "application/json"
                    }
                });
                if (!response)
                {
                    reject("Price not found");
                }
                resolve(response?.data?.rate);
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
}

export const service = new PriceFetchApi();
