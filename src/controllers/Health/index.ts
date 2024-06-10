import { Response, Request } from "express";
import { pool } from "../../config/mysqlconfig";
import { db as connectDB } from "../../config/mongoconfig";
import { redisDb as connectRedis } from "../../config/redisconfig";
import moment = require("moment");

class HealthController
{
    public async GetHealth(req: Request, res: Response)
    {
        let sqlPool, mongoPool, redisPool;
        try
        {
            sqlPool = pool._allConnections.length ? true : false;
            await connectDB
                .then(() =>
                {
                    mongoPool = true;
                })
                .catch(ex =>
                {
                    mongoPool = false;
                    throw ex;
                });

            await connectRedis
                .then(() =>
                {
                    redisPool = true;
                })
                .catch(ex =>
                {
                    redisPool = false;
                    throw ex;
                });

            const result = {
                ServerTime: moment().utc().toString(),
                sqlPoolSize: sqlPool,
                mongoPoolSize: mongoPool,
                redisPoolSize: redisPool,
                msg: "OK",
                isHealthy: true,
                errors: {}
            };
            res.send(result);
        }
        catch (ex)
        {
            const result = {
                ServerTime: moment().utc().toString(),
                sqlPoolSize: sqlPool,
                mongoPoolSize: mongoPool,
                redisPoolSize: redisPool,
                msg: "ERROR",
                isHealthy: false,
                errors: ex
            };
            res.send(result);
        }
    }
}

export const controller = new HealthController();
