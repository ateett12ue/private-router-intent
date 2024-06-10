import {
    AdapterDetails,
    ProtocolDetails,
    PoolData,
    HelperContractData,
    TransactionDetails,
    TransactionStatusUpdate
} from "../../../service/models/DbModels";
export interface IMongoDataStore
{
    GetAdapterDetails(adapterId: string): Promise<AdapterDetails>;
    GetAllAdaptersDetails(): Promise<Array<AdapterDetails>>;
    AddAdapter(data: AdapterDetails): Promise<boolean>;
    UpdateAdapter(data: AdapterDetails): Promise<boolean>;

    AddProtocol(data: ProtocolDetails): Promise<boolean>;
    GetProtocolDetails(protocolId: string): Promise<ProtocolDetails>;

    AddPool(data: PoolData): Promise<boolean>;
    GetPool(id: string): Promise<PoolData>;
    GetPools(filter: any, sort: any, limit?: number, offset?: number): Promise<PoolData[]>;
    GetPoolsCount(filter: any): Promise<number>;

    UpdatePool(data: PoolData): Promise<boolean>;
    UpdatePools(data: PoolData[]): Promise<boolean>;

    GetHelperContractData(id: string): Promise<HelperContractData>;
    UpdateHelperContractData(data: HelperContractData): Promise<boolean>;

    AddTransaction(data: TransactionDetails): Promise<boolean>;
    UpdateTransaction(data: TransactionStatusUpdate): Promise<boolean>;
    GetTransactionByTransactionId(id: string): Promise<TransactionDetails>;
    GetTransactionsByUserAddress(userAddress: string): Promise<Array<TransactionDetails>>;
    GetTransactionByHash(hash: string): Promise<TransactionDetails>;
}
