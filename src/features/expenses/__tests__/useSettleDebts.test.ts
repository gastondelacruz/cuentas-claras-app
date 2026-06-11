import { renderHook } from '@testing-library/react-native';

import { useGroupsStore } from '../../groups/store/groupsStore';
import type { GroupExpense } from '../../groups/types';
import { useAuthStore } from '../../../shared/store/authStore';
import { useSettleDebts } from '../hooks/useSettleDebts';
import { useExpensesStore } from '../store/expensesStore';

function makeExpense(
  id: string,
  paidById: string,
  participantIds: string[],
  totalAmount: number,
): GroupExpense {
  return {
    id,
    title: `Gasto ${id}`,
    paidByLabel: 'Pagado',
    timeLabel: 'Hoy',
    totalAmount,
    category: 'FOOD',
    userRelation: { type: 'none', amount: 0 },
    paidById,
    participantIds,
    date: '2024-05-20T00:00:00.000Z',
  };
}

function createGroupWithMembers(emails: string[]) {
  return useGroupsStore.getState().createGroup({
    category: 'TRAVEL',
    image: { type: 'default', uri: null },
    invitedEmails: emails,
    name: 'Viaje a la costa',
    owner: {
      id: 'current-user',
      name: 'Vos',
      initials: 'YO',
      avatarUrl: null,
      email: 'you@example.com',
    },
  });
}

describe('useSettleDebts', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
    useAuthStore.getState().setSession({ id: 'current-user', email: 'you@example.com' }, 'tok');
  });

  it('returns a zero summary and no items when there are no expenses', () => {
    createGroupWithMembers(['friend@example.com']);

    const { result } = renderHook(() => useSettleDebts());

    expect(result.current.summary).toEqual({ owedToYou: 0, youOwe: 0 });
    expect(result.current.items).toEqual([]);
  });

  it('derives per-person balances and the summary from real expenses', () => {
    const group = createGroupWithMembers(['ana@example.com', 'beto@example.com']);
    const ana = 'invite-0-ana@example.com';
    const beto = 'invite-1-beto@example.com';

    // You paid 100 split with Ana -> Ana owes you 50.
    useExpensesStore.getState().addExpense(group.id, makeExpense('a', 'current-user', ['current-user', ana], 100));
    // Beto paid 40 split with you -> you owe Beto 20.
    useExpensesStore.getState().addExpense(group.id, makeExpense('b', beto, ['current-user', beto], 40));

    const { result } = renderHook(() => useSettleDebts());

    expect(result.current.summary).toEqual({ owedToYou: 50, youOwe: 20 });
    // People who owe you come first.
    expect(result.current.items).toEqual([
      {
        id: 'with-ana@example.com',
        type: 'with-user',
        person: { id: 'ana@example.com', name: 'ana@example.com', initials: 'A', avatarUrl: null },
        direction: 'owes-you',
        amount: 50,
      },
      {
        id: 'with-beto@example.com',
        type: 'with-user',
        person: { id: 'beto@example.com', name: 'beto@example.com', initials: 'B', avatarUrl: null },
        direction: 'you-owe',
        amount: 20,
      },
    ]);
  });

  it('nets opposing expenses with the same person and drops settled balances', () => {
    const group = createGroupWithMembers(['ana@example.com']);
    const ana = 'invite-0-ana@example.com';

    // You paid 100 split with Ana -> Ana owes you 50.
    useExpensesStore.getState().addExpense(group.id, makeExpense('a', 'current-user', ['current-user', ana], 100));
    // Ana paid 100 split with you -> you owe Ana 50. Net: settled.
    useExpensesStore.getState().addExpense(group.id, makeExpense('b', ana, ['current-user', ana], 100));

    const { result } = renderHook(() => useSettleDebts());

    expect(result.current.summary).toEqual({ owedToYou: 0, youOwe: 0 });
    expect(result.current.items).toEqual([]);
  });
});
