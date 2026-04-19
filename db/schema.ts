import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  passwordhashed: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
})


export const categoriesTable = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(), // e.g., '#dd76ff'

});

export const targetsTable = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => usersTable.id),
  period: text('period').notNull(),
  goalCount: integer('goal_count').notNull(),
  categoryId: integer('category_id').references(() => categoriesTable.id),
  createdAt: text('created_at').notNull(),

}, (table) => ({
  uniqueTarget: unique().on(table.userId, table.period, table.categoryId),
}));

export const applicationsTable = sqliteTable('applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => usersTable.id),
  jobTitle: text('jobTitle').notNull(),
  jobCompany: text('jobCompany').notNull(),
  categoryId: integer('categoryId').notNull().references(() => categoriesTable.id), // foreign key
  applyDate: text('applyDate').notNull(),
  status: text('status').notNull(),

});

export const applicationStatusLogsTable = sqliteTable('application_status_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    applicationId: integer('application_id').notNull().references(() => applicationsTable.id),
    status: text('status').notNull(),
    changedAt: text('changed_at').notNull(),
});