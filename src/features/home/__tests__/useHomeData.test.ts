import { renderHook } from '@testing-library/react-native';

import { useGroupsStore } from '../../groups/store/groupsStore';
import { useHomeData } from '../hooks/useHomeData';

describe('useHomeData', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
  });

  it('returns direct mock fields and query-shaped data', () => {
    const { result } = renderHook(() => useHomeData());

    expect(result.current.data).toEqual({
      summary: result.current.summary,
      activeGroups: result.current.activeGroups,
      recentActivity: result.current.recentActivity,
    });
    expect(result.current.summary.owedToUser.amount).toBe(1420.5);
    expect(result.current.summary.owedByUser.amount).toBe(-342.15);
    expect(result.current.activeGroups).toHaveLength(2);
    expect(result.current.recentActivity).toHaveLength(3);
  });

  it('keeps query-shaped data nullable for future loading and error states', () => {
    const { result } = renderHook(() => useHomeData());

    const data: typeof result.current.data = null;
    expect(data).toBeNull();
  });

  it('is not loading or errored by default', () => {
    const { result } = renderHook(() => useHomeData());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('derives the latest two created groups from the groups store', () => {
    useGroupsStore.getState().createGroup({
      category: 'EVENT',
      image: { type: 'default', uri: null },
      invitedEmails: ['ana@example.com'],
      name: 'Cumple de Ana',
      owner: {
        id: 'owner-1',
        name: 'Alex',
        initials: 'AL',
        avatarUrl: null,
        email: 'alex@example.com',
      },
    });

    useGroupsStore.getState().createGroup({
      category: 'TRAVEL',
      image: { type: 'default', uri: null },
      invitedEmails: ['luz@example.com'],
      name: 'Escapada a Tigre',
      owner: {
        id: 'owner-2',
        name: 'Mora',
        initials: 'MO',
        avatarUrl: null,
        email: 'mora@example.com',
      },
    });

    const { result } = renderHook(() => useHomeData());

    expect(result.current.activeGroups.map((group) => group.name)).toEqual(['Escapada a Tigre', 'Cumple de Ana']);
    expect(result.current.activeGroups.map((group) => group.category)).toEqual(['Viajes', 'Eventos']);
  });
});
