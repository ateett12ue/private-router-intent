#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as http from "http";

let port: any;
let server: any;

function normalizePort(val: string): boolean | string | number
{
    const port = parseInt(val, 10);

    if (isNaN(port))
    {
        // named pipe
        return val;
    }

    if (port >= 0)
    {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: NodeJS.ErrnoException): Error
{
    if (error.syscall !== "listen")
    {
        throw error;
    }

    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code)
    {
    case "EACCES":
        console.error(bind + " requires elevated privileges");
        return process.exit(1);
    case "EADDRINUSE":
        console.error(bind + " is already in use");
        return process.exit(1);
    default:
        throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(): void
{
    const addr = server.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    if (process.env.ENV === "dev")
    {
        console.log("Listening on " + bind);
    }
}

async function makeHttpServer(): Promise<void>
{
    process.env.ENV = process.env.ENV ? process.env.ENV : "dev";
    const envPath = ".env." + process.env.ENV;
    port = normalizePort(process.env.PORT || "3014");
    const { app } = await import("../app");
    app.set("port", port);
    server = http.createServer(app);
    server.listen(port);
    server.on("error", onError);
    server.on("listening", onListening);
}

makeHttpServer()
    .then(() => console.log("Secrets initialised successfully"))
    .catch(err =>
    {
        console.error(err);
        process.exit(1);
    });
