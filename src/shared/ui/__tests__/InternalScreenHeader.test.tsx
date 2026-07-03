import { render } from '@testing-library/react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InternalScreenHeader } from '../InternalScreenHeader';

describe('InternalScreenHeader', () => {
  it('uses the screen background color in the top safe-area inset', () => {
    const { UNSAFE_getByType } = render(<InternalScreenHeader title="Detalle" />);

    expect(UNSAFE_getByType(SafeAreaView).props.className).toContain('bg-neutral100');
  });
});
