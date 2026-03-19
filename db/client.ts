import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

const sqlite = openDatabaseSync('applications.db');

sqlite.execSync(`
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jobTitle TEXT NOT NULL,
        jobCompany TEXT NOT NULL,
        applyDate TEXT NOT NULL
);
`);

export const db = drizzle(sqlite);