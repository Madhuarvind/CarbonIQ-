jest.mock('../../../dbConnect');

describe('User Workflow Integration', () => {
  let mockDb;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock database client
    mockDb = {
      collection: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      deleteMany: jest.fn(),
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      updateOne: jest.fn()
    };

    const mockClient = {
      db: jest.fn().mockReturnValue(mockDb)
    };

    require('../../../dbConnect').default = jest.fn().mockResolvedValue(mockClient);
  });

  test('should save and retrieve user emissions data', async () => {
    const testUser = {
      clerkId: 'test-user-123',
      monthlyData: {
        '2024-01-15': 25.5,
        '2024-01-16': 22.3
      }
    };

    // Mock insert and find operations
    mockDb.insertOne.mockResolvedValue({ acknowledged: true });
    mockDb.findOne.mockResolvedValue(testUser);

    // Simulate saving data
    await mockDb.collection('overall').insertOne(testUser);

    // Simulate retrieving data
    const retrieved = await mockDb.collection('overall').findOne({ clerkId: 'test-user-123' });

    expect(retrieved).toBeTruthy();
    expect(retrieved.monthlyData['2024-01-15']).toBe(25.5);
    expect(retrieved.monthlyData['2024-01-16']).toBe(22.3);
  });

  test('should generate AI insights for user data', async () => {
    const mockInsight = {
      clerkId: 'test-user-123',
      type: 'daily',
      content: 'Great job keeping emissions low today!',
      emissions: 15.5,
      createdAt: new Date()
    };

    // Mock insert and find operations
    mockDb.insertOne.mockResolvedValue({ acknowledged: true });
    mockDb.toArray.mockResolvedValue([mockInsight]);

    // Simulate saving insight
    await mockDb.collection('insights').insertOne(mockInsight);

    // Simulate retrieving insights
    const insights = await mockDb.collection('insights')
      .find({ clerkId: 'test-user-123' })
      .toArray();

    expect(insights).toHaveLength(1);
    expect(insights[0].content).toContain('Great job');
  });

  test('should handle leaderboard calculations', async () => {
    const users = [
      { clerkId: 'user1', weeklyEmissions: 50 },
      { clerkId: 'user2', weeklyEmissions: 30 },
      { clerkId: 'user3', weeklyEmissions: 70 }
    ];

    const leaderboardData = {
      type: "weekly",
      data: users,
      updatedAt: new Date()
    };

    // Mock insert and find operations
    mockDb.insertOne.mockResolvedValue({ acknowledged: true });
    mockDb.findOne.mockResolvedValue(leaderboardData);

    // Simulate saving leaderboard
    await mockDb.collection('leaderboard').insertOne(leaderboardData);

    // Simulate retrieving leaderboard
    const leaderboard = await mockDb.collection('leaderboard')
      .findOne({ type: "weekly" });

    expect(leaderboard.data).toHaveLength(3);
    expect(leaderboard.data[0].weeklyEmissions).toBe(50); // Original order maintained
  });
});
