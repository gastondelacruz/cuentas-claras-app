import { renderHook } from '@testing-library/react-native';

import { useGroups } from '../../groups/hooks/useGroups';
import { useAuthStore } from '../../../shared/store/authStore';
import { useProfileData } from '../hooks/useProfileData';

jest.mock('../../groups/hooks/useGroups', () => ({
  useGroups: jest.fn(),
}));

const mockedUseGroups = jest.mocked(useGroups);

function mockGroupsQuery(groups: { id: string; name: string; expensesCount?: number; totalAmount?: number; currentUserBalance?: number }[]) {
  mockedUseGroups.mockReturnValue({
    data: { data: groups },
    isLoading: false,
    isError: false,
    error: null,
  } as unknown as ReturnType<typeof useGroups>);
}

describe('useProfileData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.getState().setSession({ id: 'current-user', email: 'you@example.com' }, 'tok');
    mockGroupsQuery([]);
  });

  it('uses the authenticated user from authStore', () => {
    useAuthStore.getState().setSession({ id: 'u1', email: 'alex@example.com' }, 'tok');

    const { result } = renderHook(() => useProfileData());

    expect(result.current.user).toMatchObject({
      email: 'alex@example.com',
      status: 'Verificado',
    });
  });

  it('derives summary stats from groups query', () => {
    mockGroupsQuery([
      { id: 'g1', name: 'Viaje', expensesCount: 2, totalAmount: 80000, currentUserBalance: -10000 },
      { id: 'g2', name: 'Depto', expensesCount: 1, totalAmount: 12000, currentUserBalance: -6000 },
      { id: 'g3', name: 'Evento', expensesCount: 0, totalAmount: 0, currentUserBalance: 0 },
    ]);

    const { result } = renderHook(() => useProfileData());

    expect(result.current.summary).toEqual({
      activeDebtGroupsCount: 2,
      totalExpenseCount: 3,
      totalExpenses: 92000,
      youOwe: 16000,
    });
  });

  it('returns zero stats when groups query is empty', () => {
    const { result } = renderHook(() => useProfileData());

    expect(result.current.summary).toMatchObject({
      activeDebtGroupsCount: 0,
      totalExpenseCount: 0,
      totalExpenses: 0,
      youOwe: 0,
    });
  });
});
