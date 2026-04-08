import { seedApplicationsIfEmpty } from '@/db/seed';
import { db } from '../db/client';

jest.mock('../db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

const mockDb = db as unknown as { select: jest.Mock; insert: jest.Mock };

describe('seedApplicationsIfEmpty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts applications, categories, status logs, and targets when the table is empty', async () => {
    const mockValues = jest.fn().mockResolvedValue(undefined);

    // select() is called 3 times:
    // 1. Check if applications table is empty
    // 2. Fetch categories to get their IDs
    // 3. Fetch applications to get their IDs
    mockDb.select
      .mockReturnValueOnce({ from: jest.fn().mockResolvedValue([]) }) // empty applications check
      .mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([
          { id: 1, name: 'Tech', color: '#3B82F6' },
          { id: 2, name: 'Finance', color: '#10B981' },
        ]),
      }) // categories fetch
      .mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([
          { id: 1, jobTitle: 'Software Developer', jobCompany: 'Redhat' },
          { id: 2, jobTitle: 'Accountant', jobCompany: 'Bank of Ireland' },
        ]),
      }); // applications fetch

    mockDb.insert.mockReturnValue({ values: mockValues });

    await seedApplicationsIfEmpty();

    // insert() should be called 4 times: categories, applications, status logs, targets
    expect(mockDb.insert).toHaveBeenCalledTimes(4);

    // Categories inserted correctly
    expect(mockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Tech' }),
        expect.objectContaining({ name: 'Finance' }),
      ])
    );

    // Applications inserted correctly
    expect(mockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ jobTitle: 'Software Developer', jobCompany: 'Redhat' }),
        expect.objectContaining({ jobTitle: 'Accountant', jobCompany: 'Bank of Ireland' }),
      ])
    );

    // Status logs inserted correctly
    expect(mockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ applicationId: 1, status: 'Applied' }),
        expect.objectContaining({ applicationId: 2, status: 'Applied' }),
      ])
    );

    // Targets inserted correctly
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
        { id: 1, jobTitle: 'Software Developer', jobCompany: 'Redhat' },
      ]),
    });

    await seedApplicationsIfEmpty();

    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});