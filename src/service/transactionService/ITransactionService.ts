import { TransactionStatusUpdate, TransactionAdapterStatusUpdate } from "../models/Transaction";
import { TransactionDetails } from "../models/DbModels";
import { ProtocolParamsResponse } from "../models/Protocols";
export interface ITransactionService
{
    AddTransaction(data: ProtocolParamsResponse, gas: string): Promise<{ trnxId: string }>;
    UpdateTransactionStatus(data: TransactionStatusUpdate): Promise<TransactionDetails>;
    UpdateTransactionAdapterStatus(
        data: TransactionAdapterStatusUpdate
    ): Promise<TransactionDetails>;
    GetTransactionsBySenderAddress(senderAddress: string): Promise<Array<TransactionDetails>>;
    GetTransactionByTransactionId(transactionId: string): Promise<TransactionDetails>;
    GetTransactionByHash(hash: string): Promise<TransactionDetails>;
}
