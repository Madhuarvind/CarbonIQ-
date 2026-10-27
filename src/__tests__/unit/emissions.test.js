jest.mock('../../dbConnect');

const { GET, POST } = require('../app/api/emissions/route');

describe('Emissions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch emissions data successfully', async () => {
    const mockData = [
      { clerkId: 'user1', monthlyData: { '2024-01': 100 } },
      { clerkId: 'user2', monthlyData: { '2024-01': 200 } }
    ];

    // Mock the database
    const mockClient = {
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue(mockData)
          })
        })
      })
    };

    require('../../dbConnect').default = jest.fn().mockResolvedValue(mockClient);

    const response = await GET();
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual(mockData);
  });

  test('should handle database errors in GET', async () => {
    require('../../dbConnect').default = jest.fn().mockRejectedValue(new Error('DB Error'));

    const response = await GET();
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.error).toBe('Failed to fetch data');
  });

  test('should add new user emissions data', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        clerkId: 'new-user',
        month: '2024-01',
        value: 50
      })
    };

    const mockClient = {
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(null),
          insertOne: jest.fn().mockResolvedValue({ acknowledged: true })
        })
      })
    };

    require('../../dbConnect').default = jest.fn().mockResolvedValue(mockClient);

    const response = await POST(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
  });

  test('should update existing user emissions data', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        clerkId: 'existing-user',
        month: '2024-01',
        value: 25
      })
    };

    const existingUser = {
      clerkId: 'existing-user',
      monthlyData: { '2024-01': 10 }
    };

    const mockClient = {
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(existingUser),
          updateOne: jest.fn().mockResolvedValue({ acknowledged: true })
        })
      })
    };

    require('../../dbConnect').default = jest.fn().mockResolvedValue(mockClient);

    const response = await POST(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
  });

  test('should handle database errors in POST', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        clerkId: 'user',
        month: '2024-01',
        value: 50
      })
    };

    require('../../dbConnect').default = jest.fn().mockRejectedValue(new Error('DB Error'));

    const response = await POST(mockRequest);
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.error).toBe('DB Error');
  });
});
