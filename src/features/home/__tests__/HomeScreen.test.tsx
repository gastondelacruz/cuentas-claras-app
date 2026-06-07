import { render, screen } from '@testing-library/react-native';

import { homeMockData } from '../mocks/home.mock';
import { HomeScreen } from '../screens/HomeScreen';
import type { UseHomeDataResult } from '../types';
import { useHomeData } from '../hooks/useHomeData';

jest.mock('../hooks/useHomeData', () => ({
  useHomeData: jest.fn(),
}));

const mockedUseHomeData = jest.mocked(useHomeData);

function mockHomeData(overrides: Partial<UseHomeDataResult> = {}) {
  mockedUseHomeData.mockReturnValue({
    data: homeMockData,
    summary: homeMockData.summary,
    activeGroups: homeMockData.activeGroups,
    recentActivity: homeMockData.recentActivity,
    isLoading: false,
    isError: false,
    error: null,
    ...overrides,
  });
}

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the loaded dashboard shell', () => {
    mockHomeData();

    render(<HomeScreen />);

    expect(screen.getByText('Cuentas Claras')).toBeTruthy();
    expect(screen.getByLabelText('Buscar')).toBeTruthy();
    expect(screen.getByLabelText('Abrir menú de creación')).toBeTruthy();
  });

  it('renders summary cards with exact formatted amounts and chips', () => {
    mockHomeData();

    render(<HomeScreen />);

    expect(screen.getByText('Te deben')).toBeTruthy();
    expect(screen.getByText('+$1.420,50')).toBeTruthy();
    expect(screen.getByText('3 Personas')).toBeTruthy();
    expect(screen.getByText('Debes')).toBeTruthy();
    expect(screen.getByText('-$342,15')).toBeTruthy();
    expect(screen.getByText('2 Grupos')).toBeTruthy();
  });

  it('renders active groups with covers, avatars, extra badge, and debt labels', () => {
    mockHomeData();

    render(<HomeScreen />);
    expect(screen.getByText('Grupos activos')).toBeTruthy();
    expect(screen.getByText('Viaje a Lisboa')).toBeTruthy();
    expect(screen.getByText('Almuerzo Oficina')).toBeTruthy();
    expect(screen.getByText('+2')).toBeTruthy();
    expect(screen.getByText('4 deudas activas')).toBeTruthy();
    expect(screen.getByLabelText('James')).toBeTruthy();
  });

  it('renders recent activity rows with context, signed amounts, and time labels', () => {
    mockHomeData();

    render(<HomeScreen />);
    expect(screen.getByText('Actividad reciente')).toBeTruthy();
    expect(screen.getByText('Cena de Sushi')).toBeTruthy();
    expect(screen.getByText('Billetes de Tren')).toBeTruthy();
    expect(screen.getByText('Factura de la Luz')).toBeTruthy();
    expect(screen.getByText('Pagado por ti en Almuerzo Oficina')).toBeTruthy();
    expect(screen.getByText('+$45,00')).toBeTruthy();
    expect(screen.getByText('-$85,00')).toBeTruthy();
    expect(screen.getByText('hace 2h')).toBeTruthy();
  });

  it('renders the loading state', () => {
    mockHomeData({ data: null, isLoading: true });

    render(<HomeScreen />);
    expect(screen.getByText('Cargando inicio...')).toBeTruthy();
  });

  it('renders the empty state', () => {
    const data = { ...homeMockData, activeGroups: [], recentActivity: [] };
    mockHomeData({ data, activeGroups: [], recentActivity: [] });

    render(<HomeScreen />);
    expect(screen.getByText('Todavia no hay movimientos')).toBeTruthy();
  });

  it('renders the error state', () => {
    mockHomeData({ data: null, isError: true, error: new Error('Mock failure') });

    render(<HomeScreen />);
    expect(screen.getByText('No pudimos cargar el inicio')).toBeTruthy();
    expect(screen.getByText('Mock failure')).toBeTruthy();
  });

  it('renders the empty state when query-shaped data is null', () => {
    mockHomeData({ data: null });

    render(<HomeScreen />);
    expect(screen.getByText('Todavia no hay movimientos')).toBeTruthy();
  });
});
