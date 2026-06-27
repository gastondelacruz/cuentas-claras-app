import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { getGroup } from '../api/groupsApi';
import { useGroupMembers } from '../hooks/useGroupMembers';

jest.mock('../api/groupsApi', () => ({ getGroup: jest.fn() }));

const mockGetGroup = jest.mocked(getGroup);

function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('useGroupMembers', () => {
  let testClient: QueryClient;

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={testClient}>{children}</QueryClientProvider>
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
    testClient = createTestQueryClient();
  });

  afterEach(() => testClient.clear());

  it('returns members from the API group detail', async () => {
    mockGetGroup.mockResolvedValueOnce({
      id: 'g1',
      members: [
        { id: 'm1', displayName: 'Gaston', email: 'gaston@example.com', isCurrentUser: true },
        { id: 'm2', displayName: 'Ana', email: 'ana@example.com', isCurrentUser: false },
      ],
    });

    const { result } = renderHook(() => useGroupMembers('g1'), { wrapper: Wrapper });

    await new Promise((r) => setTimeout(r, 50));

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toMatchObject({ id: 'm1', name: 'Gaston', isCurrentUser: true });
    expect(result.current[1]).toMatchObject({ id: 'm2', name: 'Ana', isCurrentUser: false });
  });

  it('returns empty array when groupId is undefined', () => {
    const { result } = renderHook(() => useGroupMembers(undefined), { wrapper: Wrapper });

    expect(result.current).toEqual([]);
    expect(mockGetGroup).not.toHaveBeenCalled();
  });

  it('excludes removed members', async () => {
    mockGetGroup.mockResolvedValueOnce({
      id: 'g1',
      members: [
        { id: 'm1', displayName: 'Gaston', isCurrentUser: true },
        { id: 'm2', displayName: 'Beto', isCurrentUser: false, removedAt: '2026-01-01T00:00:00.000Z' },
      ],
    });

    const { result } = renderHook(() => useGroupMembers('g1'), { wrapper: Wrapper });

    await new Promise((r) => setTimeout(r, 50));

    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.name).toBe('Gaston');
  });
});
