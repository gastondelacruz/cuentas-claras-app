import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { getGroup, getGroupBalances, getGroupSettlements } from '../../groups/api/groupsApi';
import { useSettleDebts } from '../hooks/useSettleDebts';

jest.mock('../../groups/api/groupsApi', () => ({
  getGroup: jest.fn(),
  getGroupBalances: jest.fn(),
  getGroupSettlements: jest.fn(),
}));

const mockGetGroup = jest.mocked(getGroup);
const mockGetGroupBalances = jest.mocked(getGroupBalances);
const mockGetGroupSettlements = jest.mocked(getGroupSettlements);

// Real backend shape: { memberId, displayName, balance, currency, maybe isCurrentUser }
const currentUser = { memberId: 'm-current', displayName: 'Vos', balance: 0, currency: 'ARS', isCurrentUser: true };

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity, retry: false }, mutations: { retry: false } },
  });
}

describe('useSettleDebts', () => {
  let testClient: QueryClient;

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={testClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    testClient = createTestQueryClient();
    mockGetGroup.mockResolvedValue({ id: 'g1', members: [] });
    mockGetGroupSettlements.mockResolvedValue({ settlements: [] });
  });

  afterEach(async () => {
    await act(async () => {
      await testClient.cancelQueries();
      testClient.clear();
    });
  });

  it('returns a zero summary and no items while loading', () => {
    mockGetGroupBalances.mockImplementation(() => new Promise(() => {}));

    const { result, unmount } = renderHook(() => useSettleDebts('g1'), { wrapper: Wrapper });

    expect(result.current.summary).toEqual({ owedToYou: 0, youOwe: 0 });
    expect(result.current.items).toEqual([]);

    unmount();
  });

  it('returns a zero summary when balances are all settled', async () => {
    mockGetGroupBalances.mockResolvedValue({ balances: [currentUser] });

    const { result } = renderHook(() => useSettleDebts('g1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.summary).toEqual({ owedToYou: 0, youOwe: 0 });
    expect(result.current.items).toEqual([]);
  });

  it('derives the summary from the current member signed balance contract', async () => {
    mockGetGroupBalances.mockResolvedValue({
      balances: [
        { ...currentUser, balance: 50 },
        { memberId: 'm-ana', displayName: 'Ana', balance: -50, currency: 'ARS' },
      ],
    });

    const { result } = renderHook(() => useSettleDebts('g1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.summary).toEqual({ owedToYou: 50, youOwe: 0 });
  });

  it('derives payable summary when the current member has a negative balance', async () => {
    mockGetGroupBalances.mockResolvedValue({
      balances: [
        { ...currentUser, balance: -75.25 },
        { memberId: 'm-ana', displayName: 'Ana', balance: 75.25, currency: 'ARS' },
      ],
    });

    const { result } = renderHook(() => useSettleDebts('g1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.summary).toEqual({ owedToYou: 0, youOwe: 75.25 });
  });

  it('maps backend settlements to who-owes-whom rows relative to the current user', async () => {
    mockGetGroupBalances.mockResolvedValue({ balances: [{ ...currentUser, balance: 30 }] });
    mockGetGroupSettlements.mockResolvedValue({
      settlements: [
        { fromMemberId: 'm-ana', fromMemberName: 'Ana', toMemberId: 'm-current', toMemberName: 'Vos', amount: 50, currency: 'ARS' },
        { fromMemberId: 'm-current', fromMemberName: 'Vos', toMemberId: 'm-beto', toMemberName: 'Beto', amount: 20, currency: 'ARS' },
        { fromMemberId: 'm-caro', fromMemberName: 'Caro', toMemberId: 'm-diego', toMemberName: 'Diego', amount: 10, currency: 'ARS' },
      ],
    });

    const { result } = renderHook(() => useSettleDebts('g1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.items).toEqual([
      {
        id: 'settlement-m-ana-m-current',
        type: 'with-user',
        person: { id: 'm-ana', name: 'Ana', initials: 'AN', avatarUrl: null },
        direction: 'owes-you',
        amount: 50,
      },
      {
        id: 'settlement-m-current-m-beto',
        type: 'with-user',
        person: { id: 'm-beto', name: 'Beto', initials: 'BE', avatarUrl: null },
        direction: 'you-owe',
        amount: 20,
      },
      {
        id: 'settlement-m-caro-m-diego',
        type: 'between-members',
        from: { id: 'm-caro', name: 'Caro', initials: 'CA', avatarUrl: null },
        to: { id: 'm-diego', name: 'Diego', initials: 'DI', avatarUrl: null },
        amount: 10,
      },
    ]);
  });

  it('does not infer the current user from a zero balance when identity markers are missing', async () => {
    mockGetGroupBalances.mockResolvedValue({
      balances: [
        { memberId: 'm-zero', displayName: 'Cero', balance: 0, currency: 'ARS' },
        { memberId: 'm-ana', displayName: 'Ana', balance: 40, currency: 'ARS' },
        { memberId: 'm-beto', displayName: 'Beto', balance: -40, currency: 'ARS' },
      ],
    });
    mockGetGroupSettlements.mockResolvedValue({
      settlements: [
        { fromMemberId: 'm-ana', fromMemberName: 'Ana', toMemberId: 'm-zero', toMemberName: 'Cero', amount: 40, currency: 'ARS' },
      ],
    });

    const { result } = renderHook(() => useSettleDebts('g1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.currentUserId).toBeUndefined();
    expect(result.current.summary).toEqual({ owedToYou: 0, youOwe: 0 });
    expect(result.current.items).toEqual([
      {
        id: 'settlement-m-ana-m-zero',
        type: 'between-members',
        from: { id: 'm-ana', name: 'Ana', initials: 'AN', avatarUrl: null },
        to: { id: 'm-zero', name: 'Cero', initials: 'CE', avatarUrl: null },
        amount: 40,
      },
    ]);
  });

  it('exposes the settlements plan returned by the API', async () => {
    mockGetGroupBalances.mockResolvedValue({ balances: [currentUser] });
    mockGetGroupSettlements.mockResolvedValue({
      settlements: [
        { fromMemberId: 'm-ana', fromMemberName: 'Ana', toMemberId: 'm-current', toMemberName: 'Vos', amount: 30, currency: 'ARS' },
      ],
    });

    const { result } = renderHook(() => useSettleDebts('g1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.settlements).toHaveLength(1);
    expect(result.current.settlements[0]).toMatchObject({ fromMemberId: 'm-ana', amount: 30 });
  });

  it('ignores balances smaller than one cent', async () => {
    mockGetGroupBalances.mockResolvedValue({
      balances: [
        currentUser,
        { memberId: 'm-ana', displayName: 'Ana', balance: 0.004, currency: 'ARS' },
      ],
    });

    const { result } = renderHook(() => useSettleDebts('g1'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.summary).toEqual({ owedToYou: 0, youOwe: 0 });
    expect(result.current.items).toEqual([]);
  });
});
