import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { deleteGroup, updateGroup } from '../api/groupsApi';
import { useDeleteGroup, useUpdateGroup } from '../hooks/useGroupDetailActions';
import { queryKeys } from '../../../shared/api/queryKeys';

jest.mock('../api/groupsApi', () => ({
  deleteGroup: jest.fn(),
  updateGroup: jest.fn(),
}));

const mockDeleteGroup = jest.mocked(deleteGroup);
const mockUpdateGroup = jest.mocked(updateGroup);

describe('useGroupDetailActions mutations', () => {
  let testClient: QueryClient;

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={testClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    jest.clearAllMocks();
    testClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    testClient.setQueryData(queryKeys.groups.all(), { data: [] });
    testClient.setQueryData(queryKeys.groups.detail('g1'), { id: 'g1', name: 'Viaje' });
  });

  afterEach(() => {
    testClient.clear();
    jest.useRealTimers();
  });

  it('useDeleteGroup invalidates the groups list', async () => {
    mockDeleteGroup.mockResolvedValueOnce({
      id: 'g1',
      name: 'Viaje',
      type: 'trip',
      currency: 'ARS',
      members: [],
      archivedAt: '2024-05-20T00:00:00.000Z',
    });

    const { result } = renderHook(() => useDeleteGroup(), { wrapper: Wrapper });

    result.current.mutate('g1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockDeleteGroup).toHaveBeenCalledWith('g1', expect.any(Object));
    expect(testClient.getQueryState(queryKeys.groups.all())?.isInvalidated).toBe(true);
  });

  it('useUpdateGroup invalidates the group detail and the groups list', async () => {
    mockUpdateGroup.mockResolvedValueOnce({
      id: 'g1',
      name: 'Viaje a Bariloche',
      type: 'trip',
      currency: 'ARS',
      members: [],
    });

    const { result } = renderHook(() => useUpdateGroup(), { wrapper: Wrapper });

    result.current.mutate({ groupId: 'g1', data: { name: 'Viaje a Bariloche' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUpdateGroup).toHaveBeenCalledWith('g1', { name: 'Viaje a Bariloche' });
    expect(testClient.getQueryState(queryKeys.groups.detail('g1'))?.isInvalidated).toBe(true);
    expect(testClient.getQueryState(queryKeys.groups.all())?.isInvalidated).toBe(true);
  });
});
