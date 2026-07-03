import { accountSummaryQueryOptions } from '../../../features/account/api/accountQueryOptions';
import { groupsListQueryOptions } from '../../../features/groups/api/groupQueryOptions';
import {
  personalTransactionsListQueryOptions,
  personalTransactionsSummaryQueryOptions,
} from '../../../features/personal-expenses/api/personalTransactionQueryOptions';
import { prefetchInitialAppData } from '../prefetchInitialAppData';
import { queryClient } from '../queryClient';

jest.mock('../queryClient', () => ({
  queryClient: {
    prefetchQuery: jest.fn(),
  },
}));

const mockPrefetchQuery = jest.mocked(queryClient.prefetchQuery);

describe('prefetchInitialAppData', () => {
  const originalFlag = process.env.EXPO_PUBLIC_ENHANCED_INITIAL_LOADING;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.EXPO_PUBLIC_ENHANCED_INITIAL_LOADING;
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_ENHANCED_INITIAL_LOADING = originalFlag;
  });

  it('does not prefetch when enhanced initial loading is disabled by default', () => {
    prefetchInitialAppData();

    expect(mockPrefetchQuery).not.toHaveBeenCalled();
  });

  it('prefetches the same initial query options used by the app hooks when enabled', () => {
    process.env.EXPO_PUBLIC_ENHANCED_INITIAL_LOADING = 'true';

    prefetchInitialAppData();

    const expectedOptions = [
      groupsListQueryOptions(),
      accountSummaryQueryOptions(),
      personalTransactionsListQueryOptions({ type: 'expense', range: 'week' }),
      personalTransactionsSummaryQueryOptions({ range: 'week' }),
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
