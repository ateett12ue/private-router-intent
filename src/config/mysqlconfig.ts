import * as mysql from "mysql2";

export const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    connectionLimit: process.env.MYSQLCONNECTIONLIMIT
});
