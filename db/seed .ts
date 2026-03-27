import { db } from './client';
import { applicationsTable, categoriesTable } from './schema';

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
}