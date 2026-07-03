import {
  personalTransactionsListQueryOptions,
  personalTransactionsSummaryQueryOptions,
} from '../personalTransactionQueryOptions';
import { prefetchAlternatePersonalTransactions } from '../personalTransactionPrefetch';
import { queryClient } from '../../../../shared/api/queryClient';

jest.mock('../../../../shared/api/queryClient', () => ({
  queryClient: {
    prefetchQuery: jest.fn(),
  },
}));

const mockPrefetchQuery = jest.mocked(queryClient.prefetchQuery);

describe('prefetchAlternatePersonalTransactions', () => {
  const originalFlag = process.env.EXPO_PUBLIC_ENHANCED_INITIAL_LOADING;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.EXPO_PUBLIC_ENHANCED_INITIAL_LOADING;
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_ENHANCED_INITIAL_LOADING = originalFlag;
  });

  it('does not prefetch the alternate transaction type when enhanced loading is disabled by default', () => {
    prefetchAlternatePersonalTransactions({ type: 'expense', range: 'week' });

    expect(mockPrefetchQuery).not.toHaveBeenCalled();
  });

  it('prefetches the alternate transaction type with the shared query option factories when enabled', () => {
    process.env.EXPO_PUBLIC_ENHANCED_INITIAL_LOADING = '1';

    prefetchAlternatePersonalTransactions({
      type: 'expense',
      range: 'period',
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-30T23:59:59.999Z',
    });

    const expectedOptions = [
      personalTransactionsListQueryOptions({
        type: 'income',
        range: 'period',
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-06-30T23:59:59.999Z',
      }),
      personalTransactionsSummaryQueryOptions({
        range: 'period',
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-06-30T23:59:59.999Z',
      }),
    ];

    expect(mockPrefetchQuery).toHaveBeenCalledTimes(expectedOptions.length);
    expectedOptions.forEach((expectedOption, index) => {
      expect(mockPrefetchQuery.mock.calls[index]?.[0]).toMatchObject({
        queryKey: expectedOption.queryKey,
        queryFn: expect.any(Function),
      });
    });
  });
});
