import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "central.db");

export const db = new Database(dbPath);

// Pragmas recomendados para um app web pequeno com SQLite
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Cria as tabelas caso ainda nao existam
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    team TEXT,
    position TEXT,
    overall INTEGER NOT NULL CHECK (overall BETWEEN 0 AND 99),
    comment TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    team TEXT,
    position TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE (user_id, player_id)
  );

  CREATE INDEX IF NOT EXISTS idx_reviews_player ON reviews (player_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews (user_id);
  CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites (user_id);
`);

export default db;
