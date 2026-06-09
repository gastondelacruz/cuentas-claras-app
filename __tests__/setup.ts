import '@testing-library/jest-native/extend-expect';

const mockSecureStore = new Map<string, string>();
mockSecureStore.set('refreshToken', 'mock-refresh-token');

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockSecureStore.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStore.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureStore.delete(key);
  }),
}));

jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => undefined),
  hideAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: null })),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: View,
  };
});

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');

  return {
    GestureHandlerRootView: View,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const mockInsets = { top: 0, right: 0, bottom: 0, left: 0 };
  const mockFrame = { x: 0, y: 0, width: 390, height: 844 };

  return {
    SafeAreaProvider: View,
    SafeAreaView: View,
    SafeAreaInsetsContext: React.createContext(mockInsets),
    SafeAreaFrameContext: React.createContext(mockFrame),
    initialWindowMetrics: { insets: mockInsets, frame: mockFrame },
    useSafeAreaInsets: jest.fn(() => mockInsets),
    useSafeAreaFrame: jest.fn(() => mockFrame),
  };
});

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');

  return {
    ...actual,
    useNavigation: jest.fn(() => ({
      navigate: jest.fn(),
      replace: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
      removeListener: jest.fn(),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
    })),
    useRoute: jest.fn(() => ({ params: undefined })),
  };
});
