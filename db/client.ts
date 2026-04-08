import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

export const sqlite = openDatabaseSync('applications.db');

sqlite.execSync(`
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT NOT NULL
    );
`);

sqlite.execSync(`
    CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1,
    period TEXT NOT NULL,
    goal_count INTEGER NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    created_at TEXT NOT NULL
    );
`)

sqlite.execSync(`
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jobTitle TEXT NOT NULL,
        jobCompany TEXT NOT NULL,
        categoryId INTEGER NOT NULL,
        applyDate TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
    );
`);

sqlite.execSync(`
    CREATE TABLE IF NOT EXISTS application_status_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL REFERENCES applications(id),
    status TEXT NOT NULL,
    changed_at TEXT NOT NULL
    );
`)

export const db = drizzle(sqlite);