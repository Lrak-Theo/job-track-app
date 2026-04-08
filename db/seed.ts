import { db } from './client';
import { applicationsTable, applicationStatusLogsTable, categoriesTable, targetsTable } from './schema';

export async function seedApplicationsIfEmpty() {
  const existing = await db.select().from(applicationsTable);
  if (existing.length > 0) return;

  // Seed categories first
  await db.insert(categoriesTable).values([
    { name: 'Tech', color: '#3B82F6' },
    { name: 'Finance', color: '#10B981' },
  ]);

  // Fetch the categories to get their IDs
  const categories = await db.select().from(categoriesTable);
  const techCategory = categories.find(c => c.name === 'Tech');
  const financeCategory = categories.find(c => c.name === 'Finance');

  // Seed applications with categoryId references
  await db.insert(applicationsTable).values([
    { 
      jobTitle: 'Software Developer', 
      jobCompany: 'Redhat', 
      categoryId: techCategory!.id,
      applyDate: '2026-02-20', 
      status: 'Applied' 
    },
    { 
      jobTitle: 'Accountant', 
      jobCompany: 'Bank of Ireland', 
      categoryId: financeCategory!.id,
      applyDate: '2026-01-10', 
      status: 'Rejected' 
    },
  ]);


  // Fetch applications to get their IDs
  const applications = await db.select().from(applicationsTable);
  const softwareDevApp = applications.find(a => a.jobTitle === 'Software Developer');
  const accountantApp = applications.find(a => a.jobTitle === 'Accountant');

  await db.insert(applicationStatusLogsTable).values([
      {
          applicationId: softwareDevApp!.id,
          status: 'Applied',
          changedAt: '2026-02-20',
      },
      
      {
          applicationId: accountantApp!.id,
          status: 'Applied',
          changedAt: '2026-01-10',
      },
  ]);

  await db.insert(targetsTable).values([
    {
      userId: 1,
      period: 'weekly',
      goalCount: 0,
      categoryId: null,
      createdAt: new Date().toISOString().split('T')[0]
    },
    {
      userId: 1,
      period: 'monthly',
      goalCount: 0,
      categoryId: null,
      createdAt: new Date().toISOString().split('T')[0]
    },
  ]);
}