import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const categoriesTable = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(), // e.g., '#dd76ff'

});

export const targetsTable = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().default(1),
  periodRange: text('period_range').notNull(),
  goalCount: integer('goal_count').notNull(),
  categoryId: integer('category_id').references(() => categoriesTable.id),
  createdAt: text('created_at').notNull(),

});

export const applicationsTable = sqliteTable('applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  jobTitle: text('jobTitle').notNull(),
  jobCompany: text('jobCompany').notNull(),
  categoryId: integer('categoryId').notNull().references(() => categoriesTable.id), // foreign key
  applyDate: text('applyDate').notNull(),
  status: text('status').notNull(),
  
});