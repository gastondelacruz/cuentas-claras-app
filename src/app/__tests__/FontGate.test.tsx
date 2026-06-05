import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';

import { FontGate } from '../providers/FontGate';

const mockedUseFonts = jest.mocked(useFonts);
const mockedHideAsync = jest.mocked(SplashScreen.hideAsync);

describe('FontGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks rendering children while fonts are loading', () => {
    mockedUseFonts.mockReturnValueOnce([false, null]);

    const { queryByText } = render(
      <FontGate>
        <Text>navigation-ready</Text>
      </FontGate>,
    );

    expect(queryByText('navigation-ready')).toBeNull();
    expect(mockedHideAsync).not.toHaveBeenCalled();
  });

  it('renders children and hides the splash screen after fonts load', async () => {
    mockedUseFonts.mockReturnValueOnce([true, null]);

    const { getByText } = render(
      <FontGate>
        <Text>navigation-ready</Text>
      </FontGate>,
    );

    expect(getByText('navigation-ready')).toBeOnTheScreen();
    await waitFor(() => expect(mockedHideAsync).toHaveBeenCalled());
  });
});
