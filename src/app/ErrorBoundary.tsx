import { Component, ErrorInfo, PropsWithChildren } from 'react';
import { Text, View } from 'react-native';

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Root render error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-neutral100 p-6" testID="error-fallback">
          <Text className="text-center text-lg font-semibold text-error">Something went wrong.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
