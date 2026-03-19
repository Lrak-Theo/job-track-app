import { db } from './client';
import { applicationsTable } from './schema';

export async function seedApplicationsIfEmpty() {
    const existing = await db.select().from(applicationsTable);

    if (existing.length > 0) return;

    await db.insert(applicationsTable).values([

    { jobTitle: 'Software Developer', jobCompany: 'Redhat', applyDate: '2026-02-20' },
    { jobTitle: 'Accountant', jobCompany: 'Bank of Ireland', applyDate: '2026-01-10' },

    ]);
    
}