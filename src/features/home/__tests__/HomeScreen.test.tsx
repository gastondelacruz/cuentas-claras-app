import { useNavigation } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { useHomeData } from '../hooks/useHomeData';
import type { UseHomeDataResult } from '../types';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../hooks/useHomeData', () => ({
  useHomeData: jest.fn(),
}));

const mockedUseNavigation = jest.mocked(useNavigation);
const mockedUseHomeData = jest.mocked(useHomeData);
const navigate = jest.fn();
const parentNavigate = jest.fn();

const EMPTY_RESULT: UseHomeDataResult = {
  data: { summary: { owedToUser: { id: 'owed-to-user', title: 'Te deben', amount: 0, detail: 'Resumen' }, owedByUser: { id: 'owed-by-user', title: 'Debes', amount: 0, detail: 'Resumen' } }, activeGroups: [], recentActivity: [] },
  summary: { owedToUser: { id: 'owed-to-user', title: 'Te deben', amount: 0, detail: 'Resumen' }, owedByUser: { id: 'owed-by-user', title: 'Debes', amount: 0, detail: 'Resumen' } },
  activeGroups: [],
  recentActivity: [],
  isLoading: false,
  isError: false,
  error: null,
};

function mockHomeData(overrides: Partial<UseHomeDataResult> = {}) {
  mockedUseHomeData.mockReturnValue({ ...EMPTY_RESULT, ...overrides });
}

function seedDashboard() {
  const activeGroups = [
    { id: 'api-group-lisboa', name: 'Viaje a Lisboa', category: 'Otros', coverUrl: '', members: [], extraMembersCount: 0, activeDebtsLabel: 'Recién creado' },
    { id: 'api-group-departamento', name: 'Departamento', category: 'Otros', coverUrl: '', members: [], extraMembersCount: 0, activeDebtsLabel: 'Recién creado' },
  ];
  const summary = {
    owedToUser: { id: 'owed-to-user', title: 'Te deben', amount: 60, detail: '2 Personas' },
    owedByUser: { id: 'owed-by-user', title: 'Debes', amount: -20, detail: '1 Grupo' },
  };
  const recentActivity = [
    { id: 'expense-home-1', groupId: 'api-group-lisboa', title: 'Cena de Sushi', context: 'Viaje a Lisboa', amount: 120, timeLabel: 'hace 2h', category: 'food' as const, paidByLabel: 'Pagado por ti en Viaje a Lisboa' },
    { id: 'expense-home-2', groupId: 'api-group-departamento', title: 'Billetes de Tren', context: 'Departamento', amount: -85, timeLabel: 'hace 4h', category: 'transport' as const, paidByLabel: 'Pagado por Diego en Departamento' },
  ];
  mockHomeData({
    data: { summary, activeGroups, recentActivity },
    summary,
    activeGroups,
    recentActivity,
  });
}

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHomeData();
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

  it('renders summary cards with API-driven totals', () => {
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
    expect(screen.getAllByText('Viaje a Lisboa').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Departamento').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Recién creado')).toHaveLength(2);
    expect(screen.getAllByText('Otros')).toHaveLength(2);
    expect(screen.getByLabelText('Ver todos los grupos')).toBeTruthy();
    expect(screen.getByText('Ver lista completa')).toBeTruthy();
  });

  it('renders API-backed active groups even when there are no recent expenses', () => {
    mockHomeData({
      data: {
        summary: EMPTY_RESULT.summary,
        activeGroups: [{ id: 'api-group-empty-expenses', name: 'Grupo desde API', category: 'Otros', coverUrl: '', members: [], extraMembersCount: 0, activeDebtsLabel: 'Recién creado' }],
        recentActivity: [],
      },
      summary: EMPTY_RESULT.summary,
      activeGroups: [{ id: 'api-group-empty-expenses', name: 'Grupo desde API', category: 'Otros', coverUrl: '', members: [], extraMembersCount: 0, activeDebtsLabel: 'Recién creado' }],
      recentActivity: [],
    });

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

  it('renders recent activity rows with API-backed expenses', () => {
    seedDashboard();

    render(<HomeScreen />);

    expect(screen.getByText('Actividad reciente')).toBeTruthy();
    expect(screen.getByText('Cena de Sushi')).toBeTruthy();
    expect(screen.getByText('Billetes de Tren')).toBeTruthy();
    expect(screen.getByText('hace 2h')).toBeTruthy();
  });

  it('renders the empty state without groups or expenses', () => {
    render(<HomeScreen />);

    expect(screen.getByText('Aún no tienes movimientos')).toBeTruthy();
    expect(screen.getByLabelText('Crear un Grupo')).toBeTruthy();
  });
});
