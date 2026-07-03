import { render } from '@testing-library/react-native';

import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

import { RootLayout } from '../RootLayout';
import { colors } from '../../shared/theme/colors';

jest.mock('expo-status-bar', () => ({
  StatusBar: jest.fn(() => null),
}));

jest.mock('react-native-toast-message', () => jest.fn(() => null));

jest.mock('@react-navigation/native', () => {
  return {
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('../navigation/RootNavigator', () => ({
  RootNavigator: jest.fn(() => null),
}));

jest.mock('../providers/AppProviders', () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('configures the root status bar with dark content on the app surface color', () => {
    const mockStatusBar = jest.mocked(StatusBar);
    const mockToast = jest.mocked(Toast);
    render(<RootLayout />);

    expect(mockStatusBar.mock.calls.at(-1)?.[0]).toMatchObject({
      style: 'dark',
      backgroundColor: colors.neutral100,
    });
    expect(mockToast.mock.calls.at(-1)?.[0]).toMatchObject({ position: 'bottom' });
  });
});
