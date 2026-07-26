import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { connectDatabase } from "./database/connection.js";
import { ensureAdminUser } from "./database/seed.js";

const db = connectDatabase();
ensureAdminUser(db);

const app = createApp();
const server = env.host
  ? app.listen(env.port, env.host, () => {
      console.log(`Baho Tech API running on http://${env.host}:${env.port}`);
    })
  : app.listen(env.port, () => {
      console.log(`Baho Tech API running on port ${env.port}`);
    });

server.on("error", (error) => {
  console.error("Failed to start Baho Tech API.", error);
  process.exit(1);
});
