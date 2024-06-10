import * as _moongose from "mongoose";

const Schema = _moongose.Schema;

const AdapterDetailsSchema = new Schema({
    id: String,
    name: String,
    icon: String,
    category: String,
    protocolId: String,
    chains: { type: Schema.Types.Mixed, default: {} },
    deployedChains: [Number],
    tags: [String],
    action: String,
    protocolAppLink: String,
    description: String,
    stars: Number,
    applications: [String],
    downloads: Number,
    starredBy: [String],
    pipelines: [String],
    contractRepoLink: String,
    backendRepoLink: String,
    primaryAuthor: String,
    documentationLink: String,
    active: { type: Boolean, default: true },
    updatedOn: { type: Date, default: Date.now },
    createdOn: { type: Date, default: Date.now }
});

const AdapterDetails = _moongose.model<any>("IntentAdapterDetail", AdapterDetailsSchema);

export { AdapterDetails };
