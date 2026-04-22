import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

export const sqlite = openDatabaseSync('applications.db');

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    color TEXT NOT NULL
  );
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    period TEXT NOT NULL,
    goal_count INTEGER NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    created_at TEXT NOT NULL,
    UNIQUE(user_id, period, category_id)
  );
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    jobTitle TEXT NOT NULL,
    jobCompany TEXT NOT NULL,
    categoryId INTEGER NOT NULL REFERENCES categories(id),
    applyDate TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT
  );
`);

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS application_status_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL REFERENCES applications(id),
    status TEXT NOT NULL,
    changed_at TEXT NOT NULL
  );
`);

export const db = drizzle(sqlite);