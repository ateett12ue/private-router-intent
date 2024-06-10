import * as redis from "redis";

type RedisConnectionOptions = redis.RedisClientOptions;

console.log("process.env.ENV", process.env.REDISURL);

const options: RedisConnectionOptions = {
    name: process.env.REDISNAME,
    url: process.env.REDISURL,
    pingInterval: Number(process.env.REDISPINGINTERVAL),
    disableOfflineQueue: true
};

export const redisClient = redis.createClient(options);

export const redisDb = redisClient.connect();
