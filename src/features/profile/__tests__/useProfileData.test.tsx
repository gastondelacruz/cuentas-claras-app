import { renderHook } from '@testing-library/react-native';

import { useAccountSummary } from '../../account/hooks/useAccountSummary';
import { useAuthStore } from '../../../shared/store/authStore';
import { useProfileData } from '../hooks/useProfileData';

jest.mock('../../account/hooks/useAccountSummary', () => ({
  useAccountSummary: jest.fn(),
}));

const mockedUseAccountSummary = jest.mocked(useAccountSummary);

function mockAccountSummaryQuery(
  summary: {
    totalGroups?: number;
    totalExpenses?: number;
    totalPaid?: number;
    totalOwed?: number;
    totalToReceive?: number;
    currency?: string;
  } | null,
  state: 'success' | 'loading' | 'error' = 'success',
) {
  mockedUseAccountSummary.mockReturnValue({
    data: state === 'success' && summary
      ? {
          totalGroups: summary.totalGroups ?? 3,
          totalExpenses: summary.totalExpenses ?? 2,
          totalsByCurrency: [
            {
              currency: summary.currency ?? 'ARS',
              totalPaid: summary.totalPaid ?? 57660,
              totalOwed: summary.totalOwed ?? 1200,
              totalToReceive: summary.totalToReceive ?? 28830,
            },
          ],
          activeSince: '2026-06-27T12:15:29.827Z',
        }
      : undefined,
    isLoading: state === 'loading',
    isError: state === 'error',
    error: state === 'error' ? new Error('Summary failed') : null,
  } as ReturnType<typeof useAccountSummary>);
}

describe('useProfileData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.getState().setSession({ id: 'current-user', email: 'you@example.com' }, 'tok');
    mockAccountSummaryQuery(null);
  });

  it('uses the authenticated user from authStore', () => {
    useAuthStore.getState().setSession({ id: 'u1', email: 'alex@example.com' }, 'tok');

    const { result } = renderHook(() => useProfileData());

    expect(result.current.user).toMatchObject({
      email: 'alex@example.com',
      status: 'Verificado',
    });
  });

  it('derives summary stats from the authenticated account summary query', () => {
    mockAccountSummaryQuery({
      totalGroups: 12,
      totalExpenses: 2,
      totalPaid: 57660,
      totalOwed: 1200,
      totalToReceive: 28830,
      currency: 'ARS',
    });

    const { result } = renderHook(() => useProfileData());

    expect(result.current.summary).toEqual({
      activeDebtGroupsCount: 12,
      totalExpenseCount: 2,
      totalExpenses: 57660,
      youOwe: 1200,
      owedToYou: 28830,
      netBalance: 27630,
      currency: 'ARS',
    });
    expect(result.current.summaryStatus).toBe('success');
  });

  it('returns an empty summary state without zero financial data when the query has no data', () => {
    const { result } = renderHook(() => useProfileData());

    expect(result.current.summary).toBeNull();
    expect(result.current.summaryStatus).toBe('empty');
  });

  it('surfaces account summary loading state', () => {
    mockAccountSummaryQuery(null, 'loading');

    const { result } = renderHook(() => useProfileData());

    expect(result.current.summary).toBeNull();
    expect(result.current.summaryStatus).toBe('loading');
  });

  it('surfaces account summary error state', () => {
    mockAccountSummaryQuery(null, 'error');

    const { result } = renderHook(() => useProfileData());

    expect(result.current.summary).toBeNull();
    expect(result.current.summaryStatus).toBe('error');
    expect(result.current.summaryError?.message).toBe('Summary failed');
  });
});
