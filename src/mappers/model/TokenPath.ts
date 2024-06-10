export interface TokenPath
{
    TokenPath: Array<TokenDetails>;
    FromChainId: string;
    ToChainId: string;
    Path: string;
}

export interface TokenDetails
{
    address: string;
    name: string;
    chainId: string;
}
