import bcrypt from '@/utils/passwordcrypto';
import { eq } from 'drizzle-orm';
import { db } from './client';
import { applicationsTable, applicationStatusLogsTable, categoriesTable, targetsTable, usersTable } from './schema';


export async function seedApplicationsIfEmpty() {
  
  const existing = await db.select().from(applicationsTable);
  if (existing.length > 0) return;

  // Seed users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  await db.insert(usersTable).values([
    {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      passwordhashed: passwordHash,
      createdAt: new Date().toISOString(),
    },
    {
      firstName: 'Empty',
      lastName: 'User',
      email: 'empty@test.com',
      passwordhashed: passwordHash,
      createdAt: new Date().toISOString(),
    },
  ]);

  const users = await db.select().from(usersTable);
  const testUser = users.find(u => u.email === 'test@test.com');
  const emptyUser = users.find(u => u.email === 'empty@test.com');

  // Seed categories per user
  const defaultCategories = [
    { name: 'Tech', color: '#3B82F6' },
    { name: 'Finance', color: '#10B981' },
    { name: 'Marketing', color: '#F59E0B' },
    { name: 'Design', color: '#8B5CF6' },
  ];

  await db.insert(categoriesTable).values([
    ...defaultCategories.map(c => ({ ...c, userId: testUser!.id })),
    ...defaultCategories.map(c => ({ ...c, userId: emptyUser!.id })),
  ]);

  const categories = await db.select().from(categoriesTable).where(eq(categoriesTable.userId, testUser!.id));
  const tech = categories.find(c => c.name === 'Tech');
  const finance = categories.find(c => c.name === 'Finance');
  const marketing = categories.find(c => c.name === 'Marketing');
  const design = categories.find(c => c.name === 'Design');

  // Seed applications for test user
  await db.insert(applicationsTable).values([
    { userId: testUser!.id, jobTitle: 'Software Developer', jobCompany: 'Red Hat', categoryId: tech!.id, applyDate: '2026-01-05', status: 'Rejected' },
    { userId: testUser!.id, jobTitle: 'Frontend Engineer', jobCompany: 'Shopify', categoryId: tech!.id, applyDate: '2026-01-12', status: 'Rejected' },
    { userId: testUser!.id, jobTitle: 'Backend Engineer', jobCompany: 'Stripe', categoryId: tech!.id, applyDate: '2026-01-20', status: 'Interviewing' },
    { userId: testUser!.id, jobTitle: 'Data Analyst', jobCompany: 'AIB', categoryId: finance!.id, applyDate: '2026-02-01', status: 'Offered' },
    { userId: testUser!.id, jobTitle: 'Financial Analyst', jobCompany: 'Bank of Ireland', categoryId: finance!.id, applyDate: '2026-02-10', status: 'Rejected' },
    { userId: testUser!.id, jobTitle: 'UX Designer', jobCompany: 'Intercom', categoryId: design!.id, applyDate: '2026-02-18', status: 'Applied' },
    { userId: testUser!.id, jobTitle: 'Product Designer', jobCompany: 'Figma', categoryId: design!.id, applyDate: '2026-02-25', status: 'Interviewing' },
    { userId: testUser!.id, jobTitle: 'Marketing Executive', jobCompany: 'HubSpot', categoryId: marketing!.id, applyDate: '2026-03-03', status: 'Applied' },
    { userId: testUser!.id, jobTitle: 'Growth Analyst', jobCompany: 'Intercom', categoryId: marketing!.id, applyDate: '2026-03-10', status: 'Withdrawn' },
    { userId: testUser!.id, jobTitle: 'Full Stack Developer', jobCompany: 'Workday', categoryId: tech!.id, applyDate: '2026-03-18', status: 'Applied' },
  ]);

  // Fetch applications to get IDs for status logs
  const applications = await db.select().from(applicationsTable);

  // Insert status logs for each application
  const statusLogValues = applications.map(app => ({
    applicationId: app.id,
    status: app.status,
    changedAt: app.applyDate,
  }));

  // Add extra log entries for applications that progressed beyond Applied
  const backendApp = applications.find(a => a.jobTitle === 'Backend Engineer');
  const dataAnalystApp = applications.find(a => a.jobTitle === 'Data Analyst');
  const productDesignerApp = applications.find(a => a.jobTitle === 'Product Designer');
  const growthApp = applications.find(a => a.jobTitle === 'Growth Analyst');

  await db.insert(applicationStatusLogsTable).values([
    ...statusLogValues.map(log => ({ ...log, status: 'Applied', changedAt: log.changedAt })),
    { applicationId: backendApp!.id, status: 'Interviewing', changedAt: '2026-02-01' },
    { applicationId: dataAnalystApp!.id, status: 'Interviewing', changedAt: '2026-02-15' },
    { applicationId: dataAnalystApp!.id, status: 'Offered', changedAt: '2026-02-22' },
    { applicationId: productDesignerApp!.id, status: 'Interviewing', changedAt: '2026-03-05' },
    { applicationId: growthApp!.id, status: 'Withdrawn', changedAt: '2026-03-15' },
  ]);

  // Seed targets for test user
  await db.insert(targetsTable).values([
    {
      userId: testUser!.id,
      period: 'weekly',
      goalCount: 3,
      categoryId: null,
      createdAt: new Date().toISOString().split('T')[0],
    },
    {
      userId: testUser!.id,
      period: 'monthly',
      goalCount: 10,
      categoryId: null,
      createdAt: new Date().toISOString().split('T')[0],
    },
    {
      userId: testUser!.id,
      period: 'weekly',
      goalCount: 2,
      categoryId: tech!.id,
      createdAt: new Date().toISOString().split('T')[0],
    },
  ]);

  // Empty user gets no applications or targets — nothing to insert
}