import * as _httpClient from "request";
import axios from "axios";
export interface QuoteParams
{
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    fromTokenChainId: number;
    toTokenChainId: number;
    partnerId?: number;
}

export interface Asset
{
    decimals: number;
    symbol: string;
    name: string;
    chainId: string;
    address: string;
    resourceID: string;
    isMintable: boolean;
    isWrappedAsset: boolean;
}

export interface TokenResponse
{
    chainId: string;
    asset: Asset;
    stableReserveAsset: Asset;
    tokenAmount: string;
    stableReserveAmount: string;
    path: Array<string>;
    flags: Array<string>;
    priceImpact: string;
    tokenPath: string;
    dataTx: Array<string>;
}

export interface BridgeFee
{
    amount: string;
    decimals: number;
    symbol: string;
}
export interface QuoteResponse
{
    flowType: string;
    isTransfer: boolean;
    isWrappedToken: boolean;
    allowanceTo: string;
    bridgeFee?: BridgeFee;
    source: TokenResponse;
    destination: TokenResponse;
    widgetId: string;
}
export interface TransactionParams extends QuoteResponse
{
    fromTokenAddress: string;
    toTokenAddress: string;
    senderAddress: string;
    receiverAddress: string;
    partnerId: string;
}

export interface TransactionResponse extends TransactionParams
{
    txn: {
        from: string;
        to: string;
        data: string;
        value: string;
    };
}

export interface StatusParams
{
    networkId: number;
    txHash: string;
}

export interface StatusResponse
{
    status: "completed" | "pending";
    src_chain_id: string;
    dest_chain_id: string;
    src_tx_hash: string;
    dest_tx_hash: string;
    src_address: string;
    dest_address: string;
    src_amount: string;
    dest_amount: string;
    src_symbol: string;
    dest_symbol: string;
    src_timestamp: number;
    dest_timestamp: number;
}

const BASE_URL = "https://api.pf.testnet.routerprotocol.com/api/v2/";

class PathFinderApi
{
    public apiRequestUrl(methodName: string, chainId?: string, extra?: string)
    {
        let url = BASE_URL + methodName;
        if (chainId)
        {
            url = url + `/${chainId}`;
        }
        if (extra)
        {
            url = url + `?${extra}`;
        }
        return url;
    }
    public QuoteApi(data: QuoteParams): Promise<QuoteResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const url = this.apiRequestUrl("quote");
                const response = await axios.get(url, {
                    headers: {
                        accept: "application/json"
                    },
                    params: data
                });
                if (!response)
                {
                    reject("Price route not found");
                }
                resolve(response?.data);
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
    public TransactionApi(data: TransactionParams): Promise<TransactionResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const url = this.apiRequestUrl("transaction");
                const bodyData = JSON.stringify(data);
                const config = {
                    method: "post",
                    url: url,
                    headers: {
                        accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    data: bodyData
                };
                const txnResponse = await axios(config);

                resolve(txnResponse?.data);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    public StatusApi(data: StatusParams): Promise<StatusResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const url = this.apiRequestUrl("status");
                const response = await axios.get(url, {
                    headers: {
                        accept: "application/json"
                    },
                    params: data
                });
                if (!response)
                {
                    reject("Price route not found");
                }
                resolve(response?.data);
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

export const service = new PathFinderApi();
