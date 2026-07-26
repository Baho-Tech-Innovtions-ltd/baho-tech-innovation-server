import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { schemaSql } from "./schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../../data");
const dbPath = path.join(dataDir, "baho.sqlite");

let db = null;

export function connectDatabase() {
  if (db) return db;

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  db.exec(schemaSql);
  ensureUserPreferenceColumns(db);
  return db;
}

export function getDatabase() {
  if (!db) return connectDatabase();
  return db;
}

function ensureUserPreferenceColumns(database) {
  const columns = database.prepare("PRAGMA table_info(users)").all().map((column) => column.name);
  const migrations = [
    ["preferred_language", "ALTER TABLE users ADD COLUMN preferred_language TEXT NOT NULL DEFAULT 'en'"],
    ["preferred_theme", "ALTER TABLE users ADD COLUMN preferred_theme TEXT NOT NULL DEFAULT 'light'"],
    ["accessibility_preferences", "ALTER TABLE users ADD COLUMN accessibility_preferences TEXT NOT NULL DEFAULT '{}'"],
  ];

  for (const [column, sql] of migrations) {
    if (!columns.includes(column)) {
      database.prepare(sql).run();
    }
  }
}
