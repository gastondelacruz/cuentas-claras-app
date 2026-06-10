import { fireEvent, render, screen } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';

import { SettleDebtsScreen } from '../screens/SettleDebtsScreen';

describe('SettleDebtsScreen', () => {
  it('renders the internal header and uses natural back navigation', () => {
    const goBack = jest.fn();
    jest.mocked(useNavigation).mockReturnValue({ goBack } as never);

    render(<SettleDebtsScreen />);

    expect(screen.getByText('Saldos')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Volver'));

    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('renders the balances summary and settlement rows', () => {
    render(<SettleDebtsScreen />);

    expect(screen.getByText('Resumen de saldos')).toBeTruthy();
    expect(screen.getByText('Quién debe a quién')).toBeTruthy();
    expect(screen.getByText('Tú le debes a Marcus')).toBeTruthy();
    expect(screen.getByText('Sofía te debe')).toBeTruthy();
    expect(screen.getByText('Carlos te debe')).toBeTruthy();
    expect(screen.getByText('Sofía le debe a Carlos')).toBeTruthy();
    expect(screen.queryByText('Saldar')).toBeNull();
  });
});
