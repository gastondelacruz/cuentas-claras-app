export function isEnhancedInitialLoadingEnabled() {
  const value = process.env.EXPO_PUBLIC_ENHANCED_INITIAL_LOADING;

  return value === '1' || value === 'true';
}
