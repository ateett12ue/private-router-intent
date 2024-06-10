import { IDataStore } from "./IDataStore";
import { pool } from "../../../config/mysqlconfig";

const exec = (sql: string, data: string[] | object = []): Promise<any> =>
{
    return new Promise((resolve, reject) =>
    {
        pool.getConnection((err: any, connection: any) =>
        {
            if (err) reject(err);

            connection.query(sql, data, (error: any, results: any, fields: any) =>
            {
                connection.release();
                if (error)
                {
                    reject(error);
                }
                else
                {
                    resolve(results);
                }
            });
        });
    });
};

export class MySqlDataStore implements IDataStore
{}
