import { TokenPath } from "../../mappers/model/TokenPath";
import { QuoteResponse } from "../../serviceclients/pathFinderApi/pathfinderApi";
import { AdapterChainDetails } from "./DbModels";
import { TokenData } from "./CommonModels";
import { BridgeFee } from "../../serviceclients/sequencerApi/testnet";
import { InstancePoolData, InstancePoolDataV3 } from "./Protocols";
export interface ParamDetails
{
    adapterId: string;
    amount: number;
    fromTokenAddress: string;
    fromTokenChainId: number;
    toTokenAddress: string;
    toTokenChainId: string;
    widgetId?: number;
    senderAddress: string;
    receiverAddress: string;
    adapterData?: adapterParams;
}

interface adapterParams
{
    type: string; // supply,or borrow
    supplyAmount: string; // supply amount
    borrowAmount: string; //
    supplyAsset: string;
    borrowAsset: string;
    pathFinderQuote: QuoteResponse;
}

export interface AdapterParamDetails
{
    adapterId: string;
    amount: number;
    fromTokenAddress: string;
    fromTokenChainId: number;
    toTokenAddress: string;
    toTokenChainId: string;
    widgetId?: number;
    senderAddress: string;
    receiverAddress: string;
    destinationAmount: string;
    destinationDecimal?: number;
}

// export interface AdapterParamsResponse
// {
//     transactionData: TransactionResponse;
//     adapterData: AdapterResponse;
//     contractData: ContractData;
// }

// export interface CalldataResponse
// {
//     argData: Array<any>,
//     contractData: ContractData,
//     adapterInstruction: AdapterResponse
// }

export interface AdapterResponse
{
    contractAddress?: string;
    instructionData: string; // step data
    instructionTitle?: string; // step title
    value: string;
    data?: any; // calldata
}

export interface AdapterQuoteResponse
{
    Steps?: Array<AdapterResponse>;
    QuoteData?: any;
}

export interface FinalAmountParamDetails
{
    adapterId: string;
    amount: number;
    fromTokenAddress: string;
    fromTokenChainId: number;
    toTokenAddress: string;
    toTokenChainId: string;
}

export interface FinalAmountResponse
{
    adapterId: string;
    chainId: string;
    beforeAdapterAmount: number;
    afterAdapterAmount: number;
    destinationAmount: number;
    exchangePrice: number;
    bridgeFee: BridgeFee;
    contractData: ContractData;
}

export interface FinalAmount
{
    finalAmount: number;
    destinationAmount: number;
    exchangePrice: number;
    contractData?: ContractData;
}

export interface FinalAmountDetails
{
    toTokenAddress: string;
    toTokenChainId: string;
    fromTokenChainId: string;
    destinationAmount: string;
    destinationDecimal?: number;
}

export interface ContractData
{
    contractAddress: string;
    reservedToken?: boolean;
    functionCalled: string;
}

export interface DexSpanContractArgs
{
    partnerId: number;
    destChainIdBytes: string;
    recipient: string;
    destAmount: string;
    message: string;
    isMessage: boolean;
    // swapData: DexContractSwapParams
}
export interface DexContractSwapParams
{
    tokens: Array<string>;
    amount: string;
    minReturn: number;
    flags: Array<string>;
    dataTx: Array<string>;
    isWrapper: boolean;
    recipient: string;
}

export interface ForwarderContractArgs
{
    partnerId: number;
    destChainIdBytes: string;
    recipient: string;
    srcToken: string;
    amount: string;
    destAmount: string;
    message: string;
}

export interface ContractMsg
{
    tokenArray: Array<string>;
    amount: string;
    tnxData: Array<string>;
    flags: Array<string>;
    stakingContractAddress: string;
    isMsg: boolean;
    instruction: string;
}

export interface SeqCalldataResponse
{
    from: string;
    to: string;
    data: string;
    value: string;
    path?: TokenPath | {};
}

export interface GetAdapterDetailsResponse
{
    Id: number;
    Name: string;
    AdapterType: string;
    SupportedChains: Array<AdapterChainDetails>;
    SupportedTokens: Array<TokenData>;
    AdapterData: any;
}

export interface ChainData
{
    ChainId: string;
    Name: string;
}
export interface SwapAdapterdataResponse
{
    SwapData: string;
    MinReturn: string;
}

export interface BatchParams
{
    tokens: Array<string>;
    amounts: Array<number>;
    targets: Array<string>;
    data: Array<string>;
    value: Array<number>;
    callType: Array<number>;
}

//--- new backend ---//
export interface CreateAdaptersParams
{
    sourceTokens: TokenData; // uSdt
    amount: Array<number>;
    sourceChainId: number;
    adaptersId: Array<AdapterIdParmas>;
}

export interface AdapterIdParmas
{
    adapterId: string;
    chainId: number;
}

export interface AdapterParamsResponse
{
    sourceTokens: TokenData;
    amount: Array<number>;
    sourceChainId: number;
    destinationChainId: number;
    destinationToken: TokenData;
    adapters: Array<AdapterIdParamsResponse>;
}

export interface AdapterIdParamsResponse
{
    adapterId: string;
    adapterType: string;
    sourceChainId: number;
    destChainId: number;
    adapterOptions?: {
        srcToken: TokenData;
        amountIn: string;
        amountOut: string;
        destToken: TokenData;
        receiverAddress: string;
        data?: any;
    };
    adapters?: Array<AdapterIdParamsResponse>;
}

export interface CreateAdapterDefaultParams
{
    adapterId: string;
    sourceChain: number;
    destinationChain: number;
    amount: number | string;
    srcToken: TokenData | any;
    destToken: TokenData;
    refundAddress: string;
    partnerId?: number;
    protocolData?: any;
}

export interface CreateAdapterDefaultParamsForAmm
{
    adapterId: string;
    chain: number;
    tokenAAmountCal: number | string;
    tokenBAmountCal: number | string;
    tokenAAmount: number | string;
    tokenBAmount: number | string;
    pairPoolToken: TokenData;
    tokenA: TokenData;
    tokenB: TokenData;
    refundAddress: string;
    partnerId?: number;
    reservePoolData: InstancePoolData;
    stable?: boolean;
}

export interface CreateAdapterDefaultParamsForAmmV4
{
    adapterId: string;
    chain: number;
    tokenAAmountCal: number | string;
    tokenBAmountCal: number | string;
    tokenAAmount: number | string;
    tokenBAmount: number | string;
    pool: string;
    tokenA: TokenData;
    tokenB: TokenData;
    refundAddress: string;
    partnerId?: number;
    reservePoolData: InstancePoolDataV3;
    stable?: boolean;
}

export interface CreateAdapterDefaultParamsResponse
{
    currentChain: number;
    currentToken: TokenData;
    adapterData: AdapterIdParamsResponse;
    quotation: AdapterQuotationResponse;
}

export interface AdapterQuotationResponse extends AdapterQuotationApiResponse
{
    adapterId: string;
    srcToken: string;
    destToken: string;
    adapters?: Array<AdapterQuotationResponse>;
    bridgeFee?: BridgeFee;
    estimatedTime: number;
}
export interface AdapterQuotationParams
{
    amount: string | number;
    destinationChain: number;
    sourceChain: number;
    destDecimal: number;
    srcToken?: TokenData;
    destToken?: TokenData;
    quotationData?: any;
    partnerId?: number;
    slippageTolerance?: number;
}

export interface AdapterQuotationApiResponse
{
    amountSent: string | number;
    amountReceived: string | number;
    amountReceivedInEther: string | number;
    exchangeRate?: string | number | BridgeFee;
    data?: any;
    estimatedTime?: number;
    slippageTolerance?: number;
}

export interface AdapterQuoteResponse
{
    quotation: [];
    params: [];
    sourceToken: TokenData;
    destinationToken: TokenData;
    bridgeFee: {
        amount: string;
        decimals: number;
        symbol: string;
    };
    adapters: Array<AdapterIdParamsResponse>;
}

export interface AdapterSteps
{
    instructionTitle: string;
    adapterName: string;
    contractAddress?: string;
    instructionData: string; // step data
    fromAmount: string;
    toAmount: string;
    value: string;
    data?: any; // calldata
}

// export interface AdapterQuoteResponse
// {
//     flowType: "same-chain" | "cross-chain" | "multi-cross-chain";
//     allowanceTo: string;
//     sourceToken: string;
//     destinationToken: string;
//     bridgeFee: {
//         amount: string;
//         decimals: number;
//         symbol: string;
//     };
//     flow: string;
//     flowArray: Array<string>;
//     adapters: Array<AdapterIdParamsResponse>;
//     steps: Array<AdapterSteps>;
// }

export interface ComposeCalldataResponse
{
    trnxId?: string;
    gasPrice: string;
    gasLimit: string;
    calldata: string;
    to: string;
    from: string;
    value: string;
    data?: any;
    prioritySteps: Array<PrioritySteps>;
}

export interface PrioritySteps
{
    contractAddress?: string;
    instructionData: string;
    instructionTitle?: string;
    value: number;
    data?: any;
}

export interface CalldataResponse
{
    target: string;
    calldata: string;
    value: number;
    callType: number;
    prioritySteps: Array<PrioritySteps>;
}

export interface CalldataGasParmas
{
    from: string;
    to: string;
    calldata: string;
    value: string;
    chainId: number;
}

export interface NoBatchCalldataResponse
{
    calldata: string;
    value: string;
    contractAddress: string;
    contractName: string;
    prioritySteps: Array<PrioritySteps>;
}

export interface AdapterChainData
{
    chainId: string;
    adapterAddress: string;
    active: boolean;
}

export interface AllAdapterDetails
{
    id: string;
    name: string;
    protocolId: string;
    chains: any;
    icon: string;
    desc: string;
    active: boolean;
    tags: Array<string>;
    stars: number;
    category: string;
    deployedChains: Array<number>;
    action: string;
    contractRepoLink: string;
    backendRepoLink: string;
}

export interface AdapterFilter
{
    isActive: boolean;
}
