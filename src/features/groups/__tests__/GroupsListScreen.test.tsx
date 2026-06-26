import { useNavigation } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';

import { GroupsListScreen } from '../screens/GroupsListScreen';
import { useGroupsList } from '../hooks/useGroupsList';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../hooks/useGroupsList');

const mockUseNavigation = jest.mocked(useNavigation);
const mockUseGroupsList = jest.mocked(useGroupsList);

describe('GroupsListScreen', () => {
  beforeEach(() => {
    mockUseNavigation.mockReturnValue({
      getParent: () => ({ navigate: jest.fn() }),
    } as never);
    mockUseGroupsList.mockReturnValue({
      groups: [],
      netBalance: 0,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('shows a loading state instead of the empty state while groups are loading', () => {
    mockUseGroupsList.mockReturnValue({
      groups: [],
      netBalance: 0,
      isLoading: true,
      isError: false,
      error: null,
    });

    render(<GroupsListScreen />);

    expect(screen.getByLabelText('Cargando grupos')).toBeTruthy();
    expect(screen.getByText('Cargando grupos...')).toBeTruthy();
    expect(screen.queryByText('Aún no tienes movimientos')).toBeNull();
  });

  it('shows an error state instead of the empty state when groups fail to load', () => {
    mockUseGroupsList.mockReturnValue({
      groups: [],
      netBalance: 0,
      isLoading: false,
      isError: true,
      error: new Error('GET /groups failed'),
    });

    render(<GroupsListScreen />);

    expect(screen.getByText('No pudimos cargar tus grupos')).toBeTruthy();
    expect(screen.getByText('Intentá nuevamente en unos minutos.')).toBeTruthy();
    expect(screen.queryByText('Aún no tienes movimientos')).toBeNull();
  });
});
