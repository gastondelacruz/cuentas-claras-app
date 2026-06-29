import { client } from '../../../shared/api/client';
import { getAccountSummary } from '../api/accountSummaryApi';

jest.mock('../../../shared/api/client', () => ({
  client: { get: jest.fn() },
}));

const mockGet = jest.mocked(client.get);

describe('accountSummaryApi.getAccountSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls GET /me/summary and returns parsed summary data', async () => {
    const data = {
      totalGroups: 12,
      totalExpenses: 2,
      totalsByCurrency: [
        { currency: 'ARS', totalPaid: 57660, totalOwed: 1200, totalToReceive: 28830 },
      ],
      activeSince: '2026-06-27T12:15:29.827Z',
    };
    mockGet.mockResolvedValueOnce({ data: { data } });

    const result = await getAccountSummary();

    expect(mockGet).toHaveBeenCalledWith('/me/summary');
    expect(result).toEqual(data);
  });

  it('throws when the response does not match the account summary contract', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: { totalGroups: 12 } } });

    await expect(getAccountSummary()).rejects.toThrow('API response does not match contract');
  });
});
