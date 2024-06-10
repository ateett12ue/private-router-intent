import * as _moongose from "mongoose";

const Schema = _moongose.Schema;

const PoolDataSchema = new Schema({
    id: String,
    name: String,
    chain: String,
    protocolId: String,

    active: Boolean,
    risk: Number,

    metadata: {
        llamaId: String,
        protocolLink: String,
        url: String
    },

    underlyingTokens: {
        type: Schema.Types.Mixed,
        default: {}
    },
    dataProvider: String,
    data: {
        type: Schema.Types.Mixed,
        default: {
            apy: Number,
            apyMean30d: Number,
            tvlUsd: Number
        }
    },

    updatedOn: { type: Date, default: Date.now },
    createdOn: { type: Date, default: Date.now }
});

const PoolData = _moongose.model<any>("IntentPoolData", PoolDataSchema);

export { PoolData };
