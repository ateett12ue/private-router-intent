import * as core from "express-serve-static-core";

import { adapter } from "./adapter";
import { health } from "./health";
import { protocol } from "./protocol";
import { pool } from "./pool";
import { transaction } from "./transaction";
import { helper } from "./helper";
export const RegisterRoutes = (app: core.Express) =>
{
    app.use("/router-intent", adapter);
    app.use("/router-intent", health);
    app.use("/router-intent", protocol);
    app.use("/router-intent", pool);
    app.use("/router-intent", transaction);
    app.use("/router-intent", helper);
};
