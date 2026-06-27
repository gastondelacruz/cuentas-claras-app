import { renderHook } from '@testing-library/react-native';

import { useGroupsList } from '../hooks/useGroupsList';
import { useGroups } from '../hooks/useGroups';

jest.mock('../hooks/useGroups');

const mockUseGroups = jest.mocked(useGroups);

function makeGroup(id: string, name = `Group ${id}`, currentUserBalance?: number) {
  return {
    id,
    name,
    description: null,
    currency: 'ARS',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    currentUserBalance,
  };
}

describe('useGroupsList', () => {
  beforeEach(() => {
    mockUseGroups.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof useGroups>);
  });

  it('starts empty with a zero net balance when the query returns no groups', () => {
    const { result } = renderHook(() => useGroupsList());

    expect(result.current.groups).toEqual([]);
    expect(result.current.netBalance).toBe(0);
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

  it('derives each group balance and the net total from currentUserBalance in the API response', () => {
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
    expect(result.current.netBalance).toBe(13000);
  });
});
