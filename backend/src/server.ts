import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { createApp } from "./app.js";
import { getConfig } from "./config.js";
import { sqlClient } from "./db/client.js";
import { checkDatabase } from "./models/health.model.js";

const config = getConfig();
const app = createApp({
  config,
  checkDatabase,
  authHandler: toNodeHandler(auth),
});

const server = app.listen(config.PORT, () => {
  console.info(`Parking management API listening on port ${config.PORT}`);
});

async function shutdown(signal: string) {
  console.info(`Received ${signal}; shutting down.`);
  server.close(async () => {
    await sqlClient.end({ timeout: 5 });
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
