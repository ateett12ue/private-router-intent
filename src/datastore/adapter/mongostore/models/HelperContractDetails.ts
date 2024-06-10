import * as _moongose from "mongoose";

const Schema = _moongose.Schema;

const HelperContractDetailsSchema = new Schema({
    id: String,
    chains: { type: Schema.Types.Mixed, default: {} },
    updatedOn: { type: Date, default: Date.now },
    createdOn: { type: Date, default: Date.now }
});

const HelperContractDetails = _moongose.model<any>(
    "HelperContractDetail",
    HelperContractDetailsSchema
);

export { HelperContractDetails };
