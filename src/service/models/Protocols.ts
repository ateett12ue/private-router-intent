import { TokenData } from "./CommonModels";
import { AdapterIdParamsResponse, AdapterQuotationResponse } from "./Adapters";
export interface ProtocolParamsResponse
{
    appId: string;
    quotationType: string;
    slippageTolerance: number;
    sourceTokens: Array<TokenData>;
    amount: Array<number>;
    sourceChainId: number;
    destinationChainId: number;
    destinationToken: TokenData;
    adapters: Array<AdapterIdParamsResponse>;
    quote: Array<AdapterQuotationResponse>;
    clientAddress: string;
    senderAddress: string;
    estimatedTime?: number;
}

export interface CreateProtocolDefaultParams
{
    protocolId: string;
    action: string;
    sourceChain: number;
    destinationChain: number;
    amount: number;
    srcToken: TokenData;
    destToken?: Array<TokenData>;
    poolId: string;
    refundAddress: string;
    protocolData?: any;
    slippageTolerance: number;
}

export interface CreateProtocolDefaultParamsResponse
{
    currentChain: number;
    currentToken: TokenData;
    currentAmount: number | string;
    adapterData: Array<AdapterIdParamsResponse>;
    isCrossChain: boolean;
    quotationData: Array<AdapterQuotationResponse>;
    estimatedTime: number;
    quotationType: string;
    partnerId?: number;
}

export interface GetProtocolQuote
{
    appId: string;
    sourceTokens: Array<TokenData>; // uSdt
    destinationTokens?: Array<TokenData>;
    amount: Array<number>;
    sourceChainId: number;
    protocol: Array<ProtocolIdPara>;
    receiverAddress: string;
    senderAddress?: string;
    slippageTolerance?: number;
}

export interface ProtocolIdPara
{
    protocolId: string;
    chainId: number;
    action: string;
    poolId: string;
    data?: any;
}

export interface InstancePoolData
{
    tokenA: TokenData;
    tokenB: TokenData;
    chainId: string | number;
    poolAddress: string;
    poolFactory: string;
    stable?: boolean;
    reserveA?: string;
    reserveB?: string;
}

export interface InstancePoolDataV3
{
    tokenA: TokenData;
    tokenB: TokenData;
    chainId: string | number;
    poolAddress: string;
    poolFactory: string;
    stable?: boolean;
    reserveA?: string;
    reserveB?: string;
    fee: number;
    tick: number;
    lowerTick?: string;
    upperTick?: string;
    sqrtPriceX96?: string;
    liquidity?: string;
    initialized?: boolean;
}
