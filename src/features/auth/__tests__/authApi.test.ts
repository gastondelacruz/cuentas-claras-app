import { client } from '../../../shared/api/client';
import { getMeSummary } from '../api/authApi';

jest.mock('../../../shared/api/client', () => ({
  client: { get: jest.fn() },
}));

const mockGet = jest.mocked(client.get);

describe('authApi.getMeSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls GET /me/summary and returns parsed data', async () => {
    const data = {
      user: { id: 'u1', name: 'Alex', email: 'alex@example.com' },
      totalBalance: 120,
      currency: 'ARS',
      recentActivity: [
        { id: 'a1', title: 'Cena', groupId: 'g1', groupName: 'Viaje', amount: 60, date: '2024-05-20T00:00:00.000Z', category: 'food' },
      ],
    };
    mockGet.mockResolvedValueOnce({ data: { data } });

    const result = await getMeSummary();

    expect(mockGet).toHaveBeenCalledWith('/me/summary');
    expect(result).toEqual(data);
  });

  it('throws when the response does not match the contract', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { totalBalance: 120 } } });

    await expect(getMeSummary()).rejects.toThrow('API response does not match contract');
  });
});
