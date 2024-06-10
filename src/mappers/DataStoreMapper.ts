import * as _moongose from "mongoose";
import {
    AdapterDetails,
    PoolData,
    ProtocolDetails,
    HelperContractData,
    TransactionDetails
} from "../service/models/DbModels";

export class AdapterDataStoreMapper
{
    public static AdapterDetailsFromMongooseDocumentMapper(data: any): AdapterDetails
    {
        const adapter = {} as AdapterDetails;
        adapter.id = data.id;
        adapter.name = data.name;
        adapter.icon = data.icon;
        adapter.category = data.category;
        adapter.protocolId = data.protocolId;
        adapter.chains = data.chains;
        adapter.deployedChains = data.deployedChains;
        adapter.tags = data.tags;
        adapter.action = data.action;
        adapter.protocolAppLink = data.protocolAppLink;
        adapter.description = data.description;
        adapter.stars = data.stars;
        adapter.applications = data.applications;
        adapter.downloads = data.downloads;
        adapter.starredBy = data.starredBy;
        adapter.pipelines = data.pipelines;
        adapter.contractRepoLink = data.contractRepoLink;
        adapter.backendRepoLink = data.backendRepoLink;
        adapter.primaryAuthor = data.primaryAuthor;
        adapter.documentationLink = data.documentationLink;
        adapter.active = data.active;
        adapter.updatedOn = data.updatedOn;
        adapter.createdOn = data.createdOn;
        return adapter;
    }
}

export class ProtocolDataStoreMapper
{
    public static ProtocolDetailsFromMongooseDocumentMapper(data: any): ProtocolDetails
    {
        const protocol = {} as ProtocolDetails;
        protocol.id = data.id;
        protocol.protocolName = data.protocolName;
        protocol.description = data.description;
        protocol.metaProtocolData = data.metaProtocolData;
        protocol.adapters = data.adapters;
        protocol.pools = data.pools;
        protocol.tvl = data.tvl;
        protocol.mcap = data.mcap;

        return protocol;
    }
}

export class PoolDataStoreMapper
{
    public static PoolDetailsFromMongooseDocumentMapper(data: any): PoolData
    {
        const pool = {} as PoolData;
        pool.id = data.id;
        pool.name = data.name;
        pool.chain = data.chain;
        pool.protocolId = data.protocolId;

        pool.active = data.active;
        pool.risk = data.risk;

        pool.metadata = data.metadata;

        pool.underlyingTokens = data.underlyingTokens;
        pool.dataProvider = data.dataProvider;
        pool.data = data.data;

        pool.createdOn = data.createdOn;
        pool.updatedOn = data.updatedOn;

        return pool;
    }
}

export class HelperDataStoreMapper
{
    public static HelperDetailsFromMongooseDocumentMapper(data: any): HelperContractData
    {
        const helperData = {} as HelperContractData;
        helperData.id = data.id;
        helperData.chainData = data.chain;
        helperData.createdOn = data.createdOn;
        helperData.updatedOn = data.updatedOn;

        return helperData;
    }
}

export class TransactionDataStoreMapper
{
    public static TransactionDetailsFromMongooseDocumentMapper(data: any): TransactionDetails
    {
        const transactionData = {} as TransactionDetails;
        transactionData.transactionId = data.transactionId;
        transactionData.transactionStatus = data.transactionStatus;
        transactionData.gasFee = data.gasFee;
        transactionData.transactionHash = data.transactionHash;
        transactionData.adapters = data.adapters;
        (transactionData.sourceTokens = data.sourceTokens),
        (transactionData.sourceAmount = data.sourceAmount),
        (transactionData.senderAddress = data.senderAddress),
        (transactionData.receiverAddress = data.receiverAddress),
        (transactionData.sourceChainId = data.sourceChainId),
        (transactionData.destinationChainId = data.destinationChainId),
        (transactionData.transactionCreationTime = data.transactionCreationTime),
        (transactionData.transactionCompletionTime = data.transactionCompletionTime),
        (transactionData.transactionUpdateTime = data.transactionUpdateTimeg);
        return transactionData;
    }
}
