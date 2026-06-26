import { useNavigation } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { useExpensesStore } from '../../expenses/store/expensesStore';
import { useGroups } from '../../groups/hooks/useGroups';
import type { GroupExpense } from '../../groups/types';
import { useGroupsStore } from '../../groups/store/groupsStore';
import { useAuthStore } from '../../../shared/store/authStore';
import { HomeScreen } from '../screens/HomeScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../../groups/hooks/useGroups', () => ({
  useGroups: jest.fn(),
}));

const mockedUseNavigation = jest.mocked(useNavigation);
const mockedUseGroups = jest.mocked(useGroups);
const navigate = jest.fn();
const parentNavigate = jest.fn();

function mockGroupsQuery(groups: Array<{ id: string; name: string; description?: string | null }>) {
  mockedUseGroups.mockReturnValue({
    data: {
      data: groups.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description ?? null,
        currency: 'ARS',
        createdAt: '2024-05-20T00:00:00.000Z',
        updatedAt: '2024-05-20T00:00:00.000Z',
      })),
    },
    isLoading: false,
    isError: false,
    error: null,
  } as ReturnType<typeof useGroups>);
}

function addExpense(groupId: string, expense: GroupExpense) {
  useExpensesStore.getState().addExpense(groupId, expense);
}

function seedDashboard() {
  const homeGroup = { id: 'api-group-lisboa', name: 'Viaje a Lisboa' };
  const secondGroup = { id: 'api-group-departamento', name: 'Departamento' };

  mockGroupsQuery([homeGroup, secondGroup]);

  addExpense(homeGroup.id, {
    id: 'expense-home-1',
    title: 'Cena de Sushi',
    paidByLabel: 'Pagado por mí',
    timeLabel: 'hace 2h',
    totalAmount: 120,
    category: 'FOOD',
    userRelation: { type: 'lent', amount: 60 },
    paidById: 'current-user',
    participantIds: ['current-user', 'invite-0-alex@example.com', 'invite-1-sarah@example.com'],
    date: '2024-05-21T12:00:00.000Z',
  });

  addExpense(secondGroup.id, {
    id: 'expense-home-2',
    title: 'Billetes de Tren',
    paidByLabel: 'Pagado por Diego',
    timeLabel: 'hace 4h',
    totalAmount: 85,
    category: 'TRANSPORT',
    userRelation: { type: 'share', amount: 20 },
    paidById: 'invite-0-diego@example.com',
    participantIds: ['current-user', 'invite-0-diego@example.com'],
    date: '2024-05-21T10:00:00.000Z',
  });
}

describe('HomeScreen', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession({ id: 'current-user', email: 'you@example.com' }, 'token');
    useGroupsStore.getState().reset();
    useExpensesStore.getState().reset();
    jest.clearAllMocks();
    mockGroupsQuery([]);
    mockedUseNavigation.mockReturnValue({
      navigate,
      getParent: () => ({ navigate: parentNavigate }),
    } as never);
  });

  it('renders the loaded dashboard shell', () => {
    seedDashboard();

    render(<HomeScreen />);

    expect(screen.getByText('Cuentas Claras')).toBeTruthy();
    expect(screen.getByLabelText('Abrir menú de creación')).toBeTruthy();
  });

  it('renders summary cards with store-driven totals', () => {
    seedDashboard();

    render(<HomeScreen />);

    expect(screen.getByText('Te deben')).toBeTruthy();
    expect(screen.getByText('+$60,00')).toBeTruthy();
    expect(screen.getByText('2 Personas')).toBeTruthy();
    expect(screen.getByText('Debes')).toBeTruthy();
    expect(screen.getByText('-$20,00')).toBeTruthy();
    expect(screen.getByText('1 Grupo')).toBeTruthy();
  });

  it('renders active groups and the view-all card', () => {
    seedDashboard();

    render(<HomeScreen />);

    expect(screen.getByText('Grupos activos')).toBeTruthy();
    expect(screen.getByText('Viaje a Lisboa')).toBeTruthy();
    expect(screen.getByText('Departamento')).toBeTruthy();
    expect(screen.getAllByText('Recién creado')).toHaveLength(2);
    expect(screen.getAllByText('Otros')).toHaveLength(2);
    expect(screen.getByLabelText('Ver todos los grupos')).toBeTruthy();
    expect(screen.getByText('Ver lista completa')).toBeTruthy();
  });

  it('renders API-backed active groups even when there are no local expenses', () => {
    mockGroupsQuery([{ id: 'api-group-empty-expenses', name: 'Grupo desde API' }]);

    render(<HomeScreen />);

    expect(screen.queryByText('Aún no tienes movimientos')).toBeNull();
    expect(screen.getByText('Grupo desde API')).toBeTruthy();
    expect(screen.getAllByText('+$0,00').length).toBeGreaterThan(0);
  });

  it('navigates to the groups list from the extra active groups card', () => {
    seedDashboard();

    render(<HomeScreen />);

    fireEvent.press(screen.getByLabelText('Ver todos los grupos'));

    expect(navigate).toHaveBeenCalledWith('GroupsList');
  });

  it('renders recent activity rows with store-created expenses', () => {
    seedDashboard();

    render(<HomeScreen />);

    expect(screen.getByText('Actividad reciente')).toBeTruthy();
    expect(screen.getByText('Cena de Sushi')).toBeTruthy();
    expect(screen.getByText('Billetes de Tren')).toBeTruthy();
    expect(screen.getByText('Pagado por ti en Viaje a Lisboa')).toBeTruthy();
    expect(screen.getByText('Pagado por Diego en Departamento')).toBeTruthy();
    expect(screen.getByText('+$120,00')).toBeTruthy();
    expect(screen.getByText('-$85,00')).toBeTruthy();
    expect(screen.getByText('hace 2h')).toBeTruthy();
  });

  it('renders the empty state without groups or expenses', () => {
    render(<HomeScreen />);

    expect(screen.getByText('Aún no tienes movimientos')).toBeTruthy();
    expect(screen.getByLabelText('Crear un Grupo')).toBeTruthy();
  });
});
