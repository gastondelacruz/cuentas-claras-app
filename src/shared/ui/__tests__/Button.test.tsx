import { fireEvent, render } from '@testing-library/react-native';

import { Button } from '../Button';

describe('Button', () => {
  it('renders label and calls onPress', () => {
    const onPress = jest.fn();
    const { getByRole, getByText } = render(<Button label="Submit" onPress={onPress} />);

    fireEvent.press(getByRole('button'));

    expect(getByText('Submit')).toBeOnTheScreen();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
