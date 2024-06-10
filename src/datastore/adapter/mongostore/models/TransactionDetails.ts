import * as _moongose from "mongoose";

const Schema = _moongose.Schema;

const TransactionAdapterSchema = new Schema({
    adapterId: String,
    adapterIndex: String,
    adapterType: String,
    sourceChainId: Number,
    destChainId: Number,
    srcToken: { type: Schema.Types.Mixed, default: {} },
    amountIn: String,
    amountOut: String,
    destToken: { type: Schema.Types.Mixed, default: {} },
    receiverAddress: String,
    adapters: [{ type: Schema.Types.Mixed, default: {} }]
});

const TransactionDetailsSchema = new Schema({
    transactionId: String,
    transactionStatus: String,
    gasFee: String,
    transactionHash: String,
    adapters: { type: Schema.Types.Mixed, default: {} },
    sourceTokens: [{ type: Schema.Types.Mixed, default: {} }],
    sourceAmount: [String],
    senderAddress: String,
    receiverAddress: String,
    sourceChainId: String,
    destinationChainId: String,
    transactionCreationTime: { type: Date, default: Date.now },
    transactionCompletionTime: { type: Date, default: Date.now },
    transactionUpdateTime: { type: Date, default: Date.now }
});

const TransactionDetails = _moongose.model<any>("TransactionDetail", TransactionDetailsSchema);

export { TransactionDetails };
