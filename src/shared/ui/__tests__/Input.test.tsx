import { fireEvent, render } from '@testing-library/react-native';

import { Input } from '../Input';

describe('Input', () => {
  it('renders error message when provided', () => {
    const { getByText } = render(<Input errorMessage="Required" testID="email-input" />);

    expect(getByText('Required')).toBeOnTheScreen();
  });

  it('renders without error message when absent', () => {
    const { queryByText } = render(<Input testID="email-input" />);

    expect(queryByText('Required')).toBeNull();
  });

  it('forwards value and change handler', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(<Input value="hello" onChangeText={onChangeText} testID="email-input" />);

    fireEvent.changeText(getByTestId('email-input'), 'hello!');

    expect(onChangeText).toHaveBeenCalledWith('hello!');
  });
});
