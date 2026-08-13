import { env, validateEnvironment } from "./config/env.js";
import { createApp } from "./app.js";
import { connectDatabase } from "./database/connection.js";
import { ensureAdminUser } from "./database/seed.js";

// Validate environment configuration first
validateEnvironment();

// Connect to database and seed admin user
const db = connectDatabase();
ensureAdminUser(db);

// Create and start Express app
const app = createApp();
const baseUrl = env.host
  ? `http://${env.host}:${env.port}`
  : `http://localhost:${env.port}`;

const server = env.host
  ? app.listen(env.port, env.host, () => {
      console.log(`✅ Baho Tech API running on ${baseUrl}`);
      console.log(`\n📡 Available Endpoints:`);
      console.log(`   Health Check: ${baseUrl}/api/health`);
      console.log(`   Authentication: ${baseUrl}/api/auth`);
      console.log(`   Users: ${baseUrl}/api/users`);
      console.log(`   Admin: ${baseUrl}/api/admin`);
      console.log(`   Disability: ${baseUrl}/api/disability`);
      console.log(`   AI Assistant: ${baseUrl}/api/ai-assistant`);
      console.log(`   More at: ${baseUrl}/api/*\n`);
      console.log(`🔗 Frontend: ${env.clientOrigin}`);
      console.log(`⏰ Session TTL: ${env.sessionTtlDays} days\n`);
    })
  : app.listen(env.port, () => {
      console.log(`✅ Baho Tech API running on ${baseUrl}`);
      console.log(`\n📡 Available Endpoints:`);
      console.log(`   Health Check: ${baseUrl}/api/health`);
      console.log(`   Authentication: ${baseUrl}/api/auth`);
      console.log(`   Users: ${baseUrl}/api/users`);
      console.log(`   Admin: ${baseUrl}/api/admin`);
      console.log(`   Disability: ${baseUrl}/api/disability`);
      console.log(`   AI Assistant: ${baseUrl}/api/ai-assistant`);
      console.log(`   More at: ${baseUrl}/api/*\n`);
      console.log(`🔗 Frontend: ${env.clientOrigin}`);
      console.log(`⏰ Session TTL: ${env.sessionTtlDays} days\n`);
    });

server.on("error", (error) => {
  console.error("❌ Failed to start Baho Tech API:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📴 SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("✅ HTTP server closed");
  });
});

process.on("SIGINT", () => {
  console.log("📴 SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("✅ HTTP server closed");
  });
});

