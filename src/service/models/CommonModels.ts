export interface TokenData
{
    chainId: string;
    address: string;
    name?: string;
    symbol?: string;
    decimals: number;
    resourceID?: string;
    isMintable?: boolean;
    isWrappedAsset?: boolean;
}

export interface ChainDetails
{
    mainnetChains: Array<string>;
    testnetChains: Array<string>;
}
