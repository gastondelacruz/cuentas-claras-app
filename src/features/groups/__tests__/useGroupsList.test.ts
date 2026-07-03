import { renderHook } from '@testing-library/react-native';

import { useGroupsList } from '../hooks/useGroupsList';
import { useGroups } from '../hooks/useGroups';
import { useAccountSummary } from '../../account/hooks/useAccountSummary';

jest.mock('../hooks/useGroups');
jest.mock('../../account/hooks/useAccountSummary');

const mockUseGroups = jest.mocked(useGroups);
const mockUseAccountSummary = jest.mocked(useAccountSummary);

function makeGroup(
  id: string,
  name = `Group ${id}`,
  currentUserBalance?: number,
  overrides?: Record<string, unknown>,
) {
  return {
    id,
    name,
    description: null,
    currency: 'ARS',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    currentUserBalance,
    ...overrides,
  };
}

describe('useGroupsList', () => {
  beforeEach(() => {
    mockUseGroups.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof useGroups>);
    mockUseAccountSummary.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAccountSummary>);
  });

  it('starts empty with a zero net balance when the query returns no groups', () => {
    const { result } = renderHook(() => useGroupsList());

    expect(result.current.groups).toEqual([]);
    expect(result.current.netBalance).toBe(0);
    expect(result.current.owedToYou).toBe(0);
    expect(result.current.youOwe).toBe(0);
  });

  it('derives account-wide summary balances from the authenticated account summary query', () => {
    mockUseAccountSummary.mockReturnValue({
      data: {
        totalGroups: 12,
        totalExpenses: 2,
        totalsByCurrency: [
          { currency: 'ARS', totalPaid: 57660, totalOwed: 1200, totalToReceive: 28830 },
        ],
        activeSince: '2026-06-27T12:15:29.827Z',
      },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAccountSummary>);

    const { result } = renderHook(() => useGroupsList());

    expect(result.current.owedToYou).toBe(28830);
    expect(result.current.youOwe).toBe(1200);
    expect(result.current.netBalance).toBe(27630);
    expect(result.current.currency).toBe('ARS');
  });

  it('exposes isLoading from the query', () => {
    mockUseGroups.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useGroups>);

    const { result } = renderHook(() => useGroupsList());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.groups).toEqual([]);
  });

  it('exposes error state from the query', () => {
    const error = new Error('GET /groups failed');
    mockUseGroups.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error,
    } as unknown as ReturnType<typeof useGroups>);

    const { result } = renderHook(() => useGroupsList());

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.groups).toEqual([]);
  });

  it('maps API response to GroupListItem with defaults for missing fields', () => {
    mockUseGroups.mockReturnValue({
      data: { data: [makeGroup('g1', 'Viaje a la costa')] },
      isLoading: false,
    } as unknown as ReturnType<typeof useGroups>);

    const { result } = renderHook(() => useGroupsList());

    expect(result.current.groups).toHaveLength(1);
    expect(result.current.groups[0]).toMatchObject({
      id: 'g1',
      name: 'Viaje a la costa',
      category: 'OTHER',
      status: { type: 'recent' },
      members: [],
      extraMembersCount: 0,
      balance: 0,
    });
  });

  it('derives each group balance from currentUserBalance in the API response', () => {
    mockUseGroups.mockReturnValue({
      data: {
        data: [
          makeGroup('g1', 'Viaje a la costa', 25000),
          makeGroup('g2', 'Departamento', -12000),
        ],
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useGroups>);

    const { result } = renderHook(() => useGroupsList());

    const balances = Object.fromEntries(result.current.groups.map((g) => [g.id, g.balance]));
    expect(balances['g1']).toBe(25000);
    expect(balances['g2']).toBe(-12000);
  });

  it('keeps zero balances from the API instead of deriving from legacy embedded members/balances fields', () => {
    mockUseGroups.mockReturnValue({
      data: {
        data: [
          makeGroup('g1', 'Viaje a la costa', 0, {
            members: [
              { id: 'member-current', displayName: 'Vos', email: 'you@example.com', isCurrentUser: true },
              { id: 'member-ana', displayName: 'Ana' },
            ],
            balances: [
              { memberId: 'member-current', displayName: 'Vos', balance: 25000, currency: 'ARS' },
              { memberId: 'member-ana', displayName: 'Ana', balance: -25000, currency: 'ARS' },
            ],
          }),
          makeGroup('g2', 'Departamento', 0, {
            members: [
              { id: 'member-current-2', displayName: 'Vos', email: 'you@example.com', isCurrentUser: true },
              { id: 'member-beto', displayName: 'Beto' },
            ],
            balances: [
              { memberId: 'member-current-2', displayName: 'Vos', balance: -12000, currency: 'ARS' },
              { memberId: 'member-beto', displayName: 'Beto', balance: 12000, currency: 'ARS' },
            ],
          }),
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useGroups>);
    mockUseAccountSummary.mockReturnValue({
      data: {
        totalGroups: 2,
        totalExpenses: 4,
        totalsByCurrency: [
          { currency: 'ARS', totalPaid: 57660, totalOwed: 12000, totalToReceive: 25000 },
        ],
        activeSince: '2026-06-27T12:15:29.827Z',
      },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAccountSummary>);

    const { result } = renderHook(() => useGroupsList());

    const balances = Object.fromEntries(result.current.groups.map((g) => [g.id, g.balance]));
    expect(result.current.owedToYou).toBe(25000);
    expect(result.current.youOwe).toBe(12000);
    expect(balances['g1']).toBe(0);
    expect(balances['g2']).toBe(0);
  });

  it('defensively derives each group balance when legacy query data is returned as a raw array payload', () => {
    mockUseGroups.mockReturnValue({
      data: [
        makeGroup('g1', 'Viaje a la costa', 25000),
        makeGroup('g2', 'Departamento', -12000),
      ],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useGroups>);

    const { result } = renderHook(() => useGroupsList());

    const balances = Object.fromEntries(result.current.groups.map((g) => [g.id, g.balance]));
    expect(balances['g1']).toBe(25000);
    expect(balances['g2']).toBe(-12000);
  });
});
