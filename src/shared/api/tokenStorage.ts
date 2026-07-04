import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const REFRESH_TOKEN_KEY = 'refreshToken';

function canUseWebStorage() {
  return Platform.OS === 'web' && typeof window !== 'undefined' && Boolean(window.localStorage);
}

function getWebRefreshToken() {
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setWebRefreshToken(token: string) {
  try {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {
    // Web storage can be unavailable in private browsing or restricted contexts.
  }
}

function clearWebRefreshToken() {
  try {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Web storage can be unavailable in private browsing or restricted contexts.
  }
}

export function getRefreshToken(): Promise<string | null> {
  if (canUseWebStorage()) {
    return Promise.resolve(getWebRefreshToken());
  }

  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): Promise<void> {
  if (canUseWebStorage()) {
    setWebRefreshToken(token);
    return Promise.resolve();
  }

  return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken(): Promise<void> {
  if (canUseWebStorage()) {
    clearWebRefreshToken();
    return Promise.resolve();
  }

  return SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
