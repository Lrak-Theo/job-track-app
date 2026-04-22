import { seedApplicationsIfEmpty } from "@/db/seed";
import { db } from '../db/client';

jest.mock('../db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

// Need a bcrypt mock 
jest.mock('@/utils/passwordcrypto', () => ({
  __esModule: true,
  default: {
    genSalt: jest.fn().mockResolvedValue('mocksalt'),
    hash: jest.fn().mockResolvedValue('hashedpassword'),
  },
}));


const mockDb = db as unknown as { select: jest.Mock; insert: jest.Mock };

describe('seedApplicationsIfEmpty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts users, categories, applications, status logs, and targets when the table is empty', async() => {

    const mockValues = jest.fn().mockResolvedValue(undefined);

    // Set up the fake DB responses and run the real seeded function afterwards
    mockDb.select
      .mockReturnValueOnce({ from: jest.fn().mockResolvedValue([]) })
      .mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([
          { id: 1, email: 'test@test.com' },
          { id: 2, email: 'empty@test.com' },
        ]),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { id: 1, name: 'Tech', color: '#3B82F6' },
            { id: 2, name: 'Finance', color: '#10B981' },
            { id: 3, name: 'Marketing', color: '#F59E0B' },
            { id: 4, name: 'Design', color: '#8B5CF6' },
          ]),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([
          { id: 1, jobTitle: 'Backend Engineer', jobCompany: 'Stripe', status: 'Interviewing', applyDate: '2026-01-20' },
          { id: 2, jobTitle: 'Data Analyst', jobCompany: 'AIB', status: 'Offered', applyDate: '2026-02-01' },
          { id: 3, jobTitle: 'Product Designer', jobCompany: 'Figma', status: 'Interviewing', applyDate: '2026-02-25' },
          { id: 4, jobTitle: 'Growth Analyst', jobCompany: 'Intercom', status: 'Withdrawn', applyDate: '2026-03-10' },
        ]),
      });

    mockDb.insert.mockReturnValue({ values: mockValues });

    await seedApplicationsIfEmpty();

    // Break

    expect(mockDb.insert).toHaveBeenCalledTimes(5);

    // Users inserted
    expect(mockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ email: 'test@test.com' }),
        expect.objectContaining({ email: 'empty@test.com' }),
      ])
    );

    // Categories inserted
    expect(mockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Tech' }),
        expect.objectContaining({ name: 'Finance' }),
      ])
    );

    // Applications inserted
    expect(mockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ jobTitle: 'Software Developer', jobCompany: 'Red Hat' }),
        expect.objectContaining({ jobTitle: 'Backend Engineer', jobCompany: 'Stripe' }),
      ])
    );

    // Status logs inserted
    expect(mockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ applicationId: 1, status: 'Applied' }),
        expect.objectContaining({ applicationId: 2, status: 'Applied' }),
      ])
    );

    // Targets inserted
    expect(mockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ period: 'weekly', userId: 1 }),
        expect.objectContaining({ period: 'monthly', userId: 1 }),
      ])
    );
  });

  it('does nothing when applications already exist', async () => {
    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockResolvedValue([
        { id: 1, jobTitle: 'Software Developer', jobCompany: 'Red Hat' },
      ]),
    });

    await seedApplicationsIfEmpty();

    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});