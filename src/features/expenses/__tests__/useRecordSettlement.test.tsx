import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { recordGroupSettlement } from '../../groups/api/groupsApi';
import { useRecordSettlement } from '../hooks/useRecordSettlement';

jest.mock('../../groups/api/groupsApi', () => ({
  recordGroupSettlement: jest.fn(),
}));

const mockRecordGroupSettlement = jest.mocked(recordGroupSettlement);

// Real backend response shape for POST /groups/:id/settlements
const mockPayment = {
  id: 's1',
  groupId: 'g1',
  fromMember: { id: 'm1', displayName: 'Ana' },
  toMember: { id: 'm2', displayName: 'Vos' },
  amount: 30,
  currency: 'ARS',
  paidAt: '2026-06-26T12:00:00.000Z',
  notes: null,
  createdAt: '2026-06-26T12:00:00.000Z',
};

const mockBalances = [
  { memberId: 'm1', displayName: 'Ana', balance: 0, currency: 'ARS' },
];

const settlementInput = {
  fromMemberId: 'm1',
  toMemberId: 'm2',
  amount: 30,
  currency: 'ARS',
  paidAt: '2026-06-26T12:00:00.000Z',
};

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
}

describe('useRecordSettlement', () => {
  let testClient: QueryClient;

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={testClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    testClient = createTestQueryClient();
  });

  afterEach(() => {
    testClient.clear();
  });

  it('calls the API with the settlement payload', async () => {
    mockRecordGroupSettlement.mockResolvedValue({ payment: mockPayment, balances: mockBalances });

    const { result } = renderHook(() => useRecordSettlement('g1'), { wrapper: Wrapper });

    result.current.mutate(settlementInput);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockRecordGroupSettlement).toHaveBeenCalledWith('g1', settlementInput);
  });

  it('invalidates balances, settlements, and auth me queries on success', async () => {
    mockRecordGroupSettlement.mockResolvedValue({ payment: mockPayment, balances: mockBalances });

    const invalidateQueriesSpy = jest.spyOn(testClient, 'invalidateQueries');
    const { result } = renderHook(() => useRecordSettlement('g1'), { wrapper: Wrapper });

    result.current.mutate(settlementInput);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['groups', 'g1', 'balances'] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['groups', 'g1', 'settlements'] });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['auth', 'me'] });
  });
});
