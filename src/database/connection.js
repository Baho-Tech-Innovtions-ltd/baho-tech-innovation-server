import pg from "pg";
import { env } from "../config/env.js";
import { schemaSql } from "./schema.js";
import { ensureAdminUser } from "./seed.js";

let pool = null;

export function connectDatabase() {
  if (pool) return pool;

  pool = new pg.Pool({
    connectionString: env.databaseUrl,
    ssl: env.nodeEnv === "production" ? { rejectUnauthorized: false } : false,
  });

  return pool;
}

export function getDatabase() {
  if (!pool) return connectDatabase();
  return pool;
}

export async function initializeDatabase(db) {
  try {
    // Run schema creation
    await db.query(schemaSql);
    console.log("✅ Database schema initialized successfully");
    
    // Seed admin user
    await ensureAdminUser(db);
    console.log("✅ Database seeding verified");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    throw error;
  }
}
