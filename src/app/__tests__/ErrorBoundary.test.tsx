import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import { ErrorBoundary } from '../ErrorBoundary';

function ThrowingChild() {
  throw new Error('render failure');

  return null;
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Healthy tree</Text>
      </ErrorBoundary>,
    );

    expect(getByText('Healthy tree')).toBeOnTheScreen();
  });

  it('shows fallback when child throws', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const { getByTestId } = render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(getByTestId('error-fallback')).toBeOnTheScreen();
  });
});
