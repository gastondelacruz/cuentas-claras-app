import { render } from '@testing-library/react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTopBar } from '../AppTopBar';

describe('AppTopBar', () => {
  it('uses the screen background color in the top safe-area inset', () => {
    const { UNSAFE_getByType } = render(<AppTopBar />);

    expect(UNSAFE_getByType(SafeAreaView).props.className).toContain('bg-neutral100');
  });
});
