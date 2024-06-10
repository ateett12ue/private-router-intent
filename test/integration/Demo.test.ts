import * as dotenv from "dotenv";
const envPath = ".env." + process.env.ENV;
dotenv.config({ path: envPath });

import * as app from "../../src/app";
import chai = require("chai");
import chaiHttp = require("chai-http");

import * as _ from "lodash";
chai.use(chaiHttp);
const expect = chai.expect;
const should = chai.should;

let request: ChaiHttp.Agent = null;

before("Loading Environment Variable", d =>
{
    request = chai.request(app).keepOpen(); //app is the name of your application service which in this case is express application
    d();
});

describe("/GET data", () =>
{
    it("Success Case, Should Return 200 :", done =>
    {});

    it("Authorization Should Fail because no x-access-token provided", done =>
    {});

    it("Wrong adapterId provided, Code = 2 should be in response body and payload null :", done =>
    {});

    it("Success case, Should have defined properties in payload", done =>
    {});

    after("Closing Connection", d =>
    {
        d();
    });
});

after("Exit mocha gracefully after finishing all tests execution", () =>
{
    request.close();
    // Exit node process
    process.exit();
});
