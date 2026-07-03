import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { KeyboardAwareScrollView } from '../KeyboardAwareScrollView';

describe('KeyboardAwareScrollView', () => {
  it('renders its children', () => {
    const { getByText } = render(
      <KeyboardAwareScrollView>
        <Text>Contenido del formulario</Text>
      </KeyboardAwareScrollView>,
    );

    expect(getByText('Contenido del formulario')).toBeOnTheScreen();
  });

  it('defaults keyboardShouldPersistTaps to "handled" so taps work with the keyboard open', () => {
    const { getByTestId } = render(
      <KeyboardAwareScrollView testID="aware-scroll">
        <Text>Contenido</Text>
      </KeyboardAwareScrollView>,
    );

    expect(getByTestId('aware-scroll').props.keyboardShouldPersistTaps).toBe('handled');
  });

  it('forwards scroll view props such as contentContainerClassName', () => {
    const { getByTestId } = render(
      <KeyboardAwareScrollView
        testID="aware-scroll"
        contentContainerClassName="gap-6"
        showsVerticalScrollIndicator={false}
      >
        <Text>Contenido</Text>
      </KeyboardAwareScrollView>,
    );

    expect(getByTestId('aware-scroll').props.showsVerticalScrollIndicator).toBe(false);
  });
});
