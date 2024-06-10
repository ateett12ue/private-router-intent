import * as _moongose from "mongoose";

const Schema = _moongose.Schema;

const ProtocolMetaDetails = new Schema({
    llamaId: String,
    gecko_id: String,
    cmcId: String,
    logo: String,
    url: String,
    twitter: String,
    links: [String]
});

const ProtocolDetailsSchema = new Schema({
    id: String,
    protocolName: String,
    description: String,
    metaProtocolData: ProtocolMetaDetails,
    adapters: [{ type: Schema.Types.Mixed, default: {} }],
    pools: { type: Schema.Types.Mixed, default: {} },
    tvl: Number,
    mcap: Number
});

const ProtocolDetails = _moongose.model<any>("IntentProtocolDetail", ProtocolDetailsSchema);

export { ProtocolDetails };
