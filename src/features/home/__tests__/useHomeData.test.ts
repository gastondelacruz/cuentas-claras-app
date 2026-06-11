import { renderHook } from '@testing-library/react-native';

import { useExpensesStore } from '../../expenses/store/expensesStore';
import type { ExpenseUserRelation, GroupExpense } from '../../groups/types';
import { useGroupsStore } from '../../groups/store/groupsStore';
import { useHomeData } from '../hooks/useHomeData';

function makeExpense(
  id: string,
  userRelation: ExpenseUserRelation,
  participantIds: string[],
  overrides: Partial<GroupExpense> = {},
): GroupExpense {
  return {
    id,
    title: `Gasto ${id}`,
    paidByLabel: 'Pagado por mí',
    timeLabel: 'Hoy',
    totalAmount: 0,
    category: 'FOOD',
    userRelation,
    paidById: participantIds[0] ?? 'current-user',
    participantIds,
    date: '2024-05-20T00:00:00.000Z',
    ...overrides,
  };
}

describe('useHomeData', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
  });

  it('starts from an empty state with query-shaped data', () => {
    const { result } = renderHook(() => useHomeData());

    expect(result.current.data).toEqual({
      summary: result.current.summary,
      activeGroups: result.current.activeGroups,
      recentActivity: result.current.recentActivity,
    });
    expect(result.current.summary.owedToUser.amount).toBe(0);
    expect(result.current.summary.owedByUser.amount).toBe(0);
    expect(result.current.activeGroups).toHaveLength(0);
    expect(result.current.recentActivity).toHaveLength(0);
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

  it('computes the summary from real group expenses', () => {
    const group = useGroupsStore.getState().createGroup({
      category: 'TRAVEL',
      image: { type: 'default', uri: null },
      invitedEmails: ['friend@example.com'],
      name: 'Viaje a la costa',
      owner: {
        id: 'current-user',
        name: 'Vos',
        initials: 'YO',
        avatarUrl: null,
        email: 'you@example.com',
      },
    });
    const otherId = 'invite-0-friend@example.com';

    // You paid 60.000 split between both: the other person owes you 30.000.
    useExpensesStore
      .getState()
      .addExpense(group.id, makeExpense('e-lent', { type: 'lent', amount: 30000 }, ['current-user', otherId]));
    // The other person paid and you share 15.000: you owe in this group.
    useExpensesStore
      .getState()
      .addExpense(group.id, makeExpense('e-share', { type: 'share', amount: 15000 }, ['current-user', otherId]));

    const { result } = renderHook(() => useHomeData());

    expect(result.current.summary.owedToUser.amount).toBe(30000);
    expect(result.current.summary.owedToUser.detail).toBe('1 Persona');
    expect(result.current.summary.owedByUser.amount).toBe(-15000);
    expect(result.current.summary.owedByUser.detail).toBe('1 Grupo');
  });

  it('derives recent activity from real expenses, newest first', () => {
    const group = useGroupsStore.getState().createGroup({
      category: 'TRAVEL',
      image: { type: 'default', uri: null },
      invitedEmails: ['friend@example.com'],
      name: 'Viaje a la costa',
      owner: {
        id: 'current-user',
        name: 'Vos',
        initials: 'YO',
        avatarUrl: null,
        email: 'you@example.com',
      },
    });
    const otherId = 'invite-0-friend@example.com';

    useExpensesStore.getState().addExpense(
      group.id,
      makeExpense('older', { type: 'lent', amount: 30000 }, ['current-user', otherId], {
        title: 'Cena',
        totalAmount: 60000,
        date: '2024-05-18T10:00:00.000Z',
      }),
    );
    useExpensesStore.getState().addExpense(
      group.id,
      makeExpense('newer', { type: 'share', amount: 15000 }, ['current-user', otherId], {
        title: 'Tren',
        category: 'TRANSPORT',
        totalAmount: 30000,
        paidById: otherId,
        paidByLabel: 'Pagado por friend@example.com',
        date: '2024-05-20T10:00:00.000Z',
      }),
    );

    const { result } = renderHook(() => useHomeData());
    const [first, second] = result.current.recentActivity;

    expect(result.current.recentActivity).toHaveLength(2);
    expect(first).toMatchObject({
      id: 'newer',
      groupId: group.id,
      title: 'Tren',
      context: 'Pagado por friend@example.com en Viaje a la costa',
      amount: -30000,
      category: 'transport',
    });
    expect(second).toMatchObject({
      id: 'older',
      title: 'Cena',
      context: 'Pagado por ti en Viaje a la costa',
      amount: 60000,
      category: 'food',
    });
  });
});
