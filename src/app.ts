/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config({ path: `.env` });
import * as express from "express";
import * as path from "path";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as expressValidator from "express-validator";
import { db as connectDB } from "./config/mongoconfig";
import { redisDb as connectRedis } from "./config/redisconfig";
import swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
import { RegisterRoutes } from "./routes";
const helmet = require("helmet");
const correlator = require("express-correlation-id");
export const app = express();
// restart - 3
const cors = require("cors");

if (process.env.ENV == "live")
{
    app.use(helmet());
}
/**
 * Instrumenting Metrics and Logger
 */
if (process.env.ENV == "staging" || process.env.ENV == "live")
{
    app.use(correlator());
    // app.use(
    //     metrics({
    //         host: process.env.METRICSHOST,
    //         port: process.env.METRICSPORT,
    //         requestKey: process.env.SERVICENAME
    //     })
    // );
}
/**
 * Protect app from some well-known web vulnerabilities by setting HTTP headers appropriately.
 * will set some default
 */
if (process.env.CORSENABLED == "true")
{
    console.log("enabled");
    app.use(function (req, res, next)
    {
        res.header("Access-Control-Allow-Origin", "*");
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept, x-access-token"
        );
        next();
    });
}
/**
 * Swagger Documentation Configuration
 */
//relaunch
if (process.env.SWAGGERDOCENABLED == "true")
{
    const options = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "Router Intent Backend Service",
                version: "1.0.0"
            }
        },
        apis: ["./dist/routes/*.js"],
        servers: [
            {
                api: "https://api.router.intent.testnet.routerprotocol.com/"
            }
        ]
    };

    const spec = swaggerJSDoc(options);

    app.get("/api-docs.json", function (req, res)
    {
        res.setHeader("Content-Type", "application/json");
        res.send(spec);
    });

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
}

/**
 * Mongodb Connection
 */
app.use(cors());

connectDB
    .then(() =>
    {
        console.log("Mogodb Connected!");
    })
    .catch(ex => console.log(ex));

connectRedis
    .then(() =>
    {
        console.log("Redis Connected!");
    })
    .catch(ex => console.log(ex));

app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

RegisterRoutes(app);

app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));

/**
 * Error Handling
 */
app.use(function (error: any, req: any, res: any, next: any)
{
    const err = { code: 404, error: error };
    res.status(404).send(err);
});
