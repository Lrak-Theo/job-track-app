import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const applicationsTable = sqliteTable('applications', {

    id: integer('id').primaryKey({ autoIncrement: true }),
    jobTitle: text('jobTitle').notNull(),
    jobCompany: text('jobCompany').notNull(),
    applyDate: text('applyDate').notNull(),
    
});