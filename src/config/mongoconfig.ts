import * as mongoose from "mongoose";

interface MongooseConnectionOptions extends mongoose.ConnectionOptions
{
    retryWrites?: boolean;
    writeConcern?: string;
}

const config: MongooseConnectionOptions = {
    useNewUrlParser: true
};

let uri;
console.log("process.env.ENV", process.env.ENV);
if (process.env.ENV == "live")
{
    uri = "mongodb+srv://" + process.env.MONGOHOST + "/" + process.env.MONGODB;
    config.user = process.env.MONGOUSER;
    config.pass = process.env.MONGOPASS;
    config.retryWrites = true;
    config.writeConcern = "majority";
}
else
{
    uri =
        "mongodb://" +
        process.env.MONGOHOST +
        ":" +
        process.env.MONGOPORT +
        "/" +
        process.env.MONGODB;
    console.log("dev", uri);
}

export const db = mongoose.connect(uri, config);
