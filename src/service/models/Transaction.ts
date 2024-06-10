export interface TransactionResponse extends TransactionStatusUpdate
{
    adapters: string;
    senderAddress: string;
    receiverAddress: string;
    sourceChainId: string;
    destinationChainId: string;
    transactionCreationTime: string;
    transactionCompletionTime: string;
    transactionUpdageTime: string;
}

export interface TransactionStatusUpdate
{
    transactionId: string;
    transactionStatus: string;
    gasFee: string;
    transactionHash: string;
    adapterStatus?: Array<TransactionAdapterStatusUpdate>;
}

export interface TransactionAdapterStatusUpdate
{
    transactionId?: string;
    adapterIndex: string;
    status: string;
    hash: string;
}
