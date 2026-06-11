import { fireEvent, render, screen } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';

import { useGroupsStore } from '../../groups/store/groupsStore';
import type { GroupExpense } from '../../groups/types';
import { useAuthStore } from '../../../shared/store/authStore';
import { SettleDebtsScreen } from '../screens/SettleDebtsScreen';
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

function seedGroupWithFriend() {
  useAuthStore.getState().setSession({ id: 'current-user', email: 'you@example.com' }, 'tok');

  const group = useGroupsStore.getState().createGroup({
    category: 'TRAVEL',
    image: { type: 'default', uri: null },
    invitedEmails: ['ana@example.com'],
    name: 'Viaje a la costa',
    owner: {
      id: 'current-user',
      name: 'Vos',
      initials: 'YO',
      avatarUrl: null,
      email: 'you@example.com',
    },
  });

  // You paid 100 split with Ana -> Ana owes you 50.
  useExpensesStore
    .getState()
    .addExpense(group.id, makeExpense('a', 'current-user', ['current-user', 'invite-0-ana@example.com'], 100));
}

describe('SettleDebtsScreen', () => {
  beforeEach(() => {
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
    useAuthStore.getState().clearSession();
  });

  it('renders the internal header and uses natural back navigation', () => {
    const goBack = jest.fn();
    jest.mocked(useNavigation).mockReturnValue({ goBack } as never);

    render(<SettleDebtsScreen />);

    expect(screen.getByText('Saldos')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Volver'));

    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state when there are no pending debts', () => {
    render(<SettleDebtsScreen />);

    expect(screen.getByText('Resumen de saldos')).toBeTruthy();
    expect(screen.getByText('Estás al día')).toBeTruthy();
  });

  it('renders the balances summary and settlement rows from real data', () => {
    seedGroupWithFriend();

    render(<SettleDebtsScreen />);

    expect(screen.getByText('Resumen de saldos')).toBeTruthy();
    expect(screen.getByText('Quién debe a quién')).toBeTruthy();
    expect(screen.getByText('ana@example.com te debe')).toBeTruthy();
    expect(screen.queryByText('Estás al día')).toBeNull();
  });
});
