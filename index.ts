import app from "./app";

const server = Bun.serve({ fetch: app.fetch });

console.log(`Listening on localhost:${server.port}`);
