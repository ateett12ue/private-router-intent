import { PoolProviders } from "../../constant/PoolProvidersEnum";
import { TokenData } from "./CommonModels";

export interface ChainDetails
{
    chainId: string;
    address: string;
}

// ----- Adapter DB ----- //
export interface AdapterChainDetails
{
    chainId: string;
    adapterAddress: string;
    active: boolean;
}

export interface AdapterPoolDetails
{
    id: string;
    name: string;
}

export interface AdapterDetails
{
    id: string;
    name: string;
    icon: string;
    category: string;
    protocolId: string;
    chains: any;
    deployedChains: Array<number>;
    tags: Array<string>;
    action: string;
    protocolAppLink: string;
    description: string;
    stars: number;
    applications: Array<string>;
    downloads: number;
    starredBy: Array<string>;
    pipelines: Array<string>;
    contractRepoLink: string;
    backendRepoLink: string;
    primaryAuthor: string;
    documentationLink: string;
    active: boolean;
    updatedOn?: string;
    createdOn?: string;
}

export interface ContractAddress
{
    address: string;
    active: boolean;
    chainId: number;
}
// ----- Protocol DB ----- //
export interface ProtocolMetaDetails
{
    llamaId: string;
    gecko_id: string;
    cmcId: string;
    logo: string;
    url: string;
    twitter: string;
    links: Array<string>;
}

export interface ProtocolDetails
{
    id: string;
    protocolName: string;
    description: string;
    metaProtocolData: ProtocolMetaDetails;
    adapters: Array<string>;
    pools: any;
    tvl: number;
    mcap: number;
}

// ----- Pool DB ----- //
export interface PoolData
{
    id: string;
    name: string;
    protocolId: string;
    chain: string;
    dataProvider: PoolProviders;
    metadata: {
        llamaId: string;
        protocolLink: string;
        url: string;
    };
    risk: number;
    active: boolean;
    underlyingTokens: Record<string, TokenData>;

    data: {
        apy: number;
        apyMean30d: number;
        tvlUsd: number;
    };

    updatedOn?: string;
    createdOn?: string;
}

// Pool Data Filter for GetPools
export interface PoolDataFilter extends GeneralFilters
{
    //compatible with GeneralFilters
    id?: PrimitiveFilter;
    name?: PrimitiveFilter;
    protocolId?: PrimitiveFilter;
    chain?: PrimitiveFilter;
    risk?: PrimitiveFilter;
    active?: PrimitiveFilter;
    underlyingTokens?: Record<string, PrimitiveFilter>;
    data?: {
        apy?: PrimitiveFilter;
        apyMean30d?: PrimitiveFilter;
        tvlUsd?: PrimitiveFilter;
    };
}

export interface PoolDataSort
{
    name?: number;
    protocolId?: number;
    chain?: number;
    risk?: number;
    data?: {
        apy?: number;
        apyMean30d?: number;
        tvlUsd?: number;
    };
}

export interface PrimitiveFilter
{
    eq?: any;
    gt?: any;
    lt?: any;
    gte?: any;
    lte?: any;
    in?: any[];
    nin?: any[];
}

export interface GeneralFilters
{
    [key: string]: PrimitiveFilter | Record<string, PrimitiveFilter | GeneralFilters>;
}

export interface ContractData
{
    address: string;
    active: boolean;
    chainId: string;
}

export interface HelperContractData
{
    id: string;
    chainData: any;
    createdOn: string;
    updatedOn: string;
}

export interface TransactionAdaptersDetails
{
    adapterId: string;
    adapterIndex: string;
    adapterType: string;
    adapterStatus: string;
    adapterHash: string;
    sourceChainId: string;
    destChainId: string;
    srcToken: TokenData;
    amountIn: string;
    amountOut: string;
    destToken: TokenData;
    receiverAddress: string;
    adapters: Array<TransactionAdaptersDetails>;
    adapterIndices: Array<string>;
}

export interface TransactionDetails
{
    transactionId: string;
    transactionStatus: string;
    gasFee: string;
    transactionHash: string;
    adapters: any;
    sourceTokens: Array<TokenData>;
    sourceAmount: Array<number>;
    senderAddress: string;
    receiverAddress: string;
    sourceChainId: string;
    destinationChainId: string;
    transactionCreationTime: string;
    transactionCompletionTime: string;
    transactionUpdateTime: string;
}

export interface TransactionStatusUpdate
{
    transactionId: string;
    transactionStatus: string;
    gasFee: string;
    transactionHash: string;
}

// const adapterObjectModel = {
//     name: 'Adapters',
//     properties: {
//       _id: 'objectId',
//       name: 'string', // Name of the adapter
//       category: 'string', // Liquid Staking, Lending and Borrowing, Utility, etc.
//       chains: ['int'], // List of chainIds where the adapter is deployed
//       tags: {type: ['string'], optional: true}, // DeFi, Cross-chain, etc.
//       actionItems: ['string'], // Actions supported by the adapter: Stake, Unstake, etc.
//       parentAppLink: 'string', // if Aave adapter, link to Aave
//       contractAddresses: {type: [{'int': 'string'}], optional: true}, // address of the adapter on different chains
//       description: 'string', // a brief description about the adapter
//       downloads: 'int', // number of application using this adapter
//       usedIn: ['objectId'], // objectId of applications using this adapter
//       stars: 'int', // number of times this adapter has been starred
//       starredBy: ['string'], // list of wallet addresses that have starred this adapter so that the same wallet cannot star it again
//       pipelines: ['objectId'], // list of pipelines using this adapter
//       repoLink: 'string', // link to the repository containing this adapter
//       primaryAuthor: {type: 'string', optional: true}, // github id of the primary author
//       documentationLink: 'string', // github link to the MD documentation that will be rendered
//       codeLink: 'string', // github link to the contract code that will be rendered
//     },
//     primaryKey: '_id'
//   };
