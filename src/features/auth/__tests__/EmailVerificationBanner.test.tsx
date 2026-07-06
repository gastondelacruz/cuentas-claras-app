import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';

import { resendEmailVerification } from '../api/authApi';
import { EmailVerificationBanner } from '../components/EmailVerificationBanner';

jest.mock('../api/authApi', () => ({
  resendEmailVerification: jest.fn(),
}));

const mockResendEmailVerification = jest.mocked(resendEmailVerification);

describe('EmailVerificationBanner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockResendEmailVerification.mockReset();
    jest.mocked(Toast.show).mockClear();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('does not render when hidden', () => {
    render(<EmailVerificationBanner visible={false} />);

    expect(screen.queryByText('Reenviar')).toBeNull();
  });

  it('temporarily disables resend after a successful tap to avoid spam', async () => {
    mockResendEmailVerification.mockResolvedValueOnce(undefined);
    render(<EmailVerificationBanner visible />);

    const button = screen.getByLabelText('Reenviar email de verificación');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockResendEmailVerification).toHaveBeenCalledTimes(1);
      expect(button).toBeDisabled();
    });

    fireEvent.press(button);
    expect(mockResendEmailVerification).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(30_000);
    });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('keeps the cooldown active when resend fails', async () => {
    mockResendEmailVerification.mockRejectedValueOnce(new Error('network error'));
    render(<EmailVerificationBanner visible />);

    const button = screen.getByLabelText('Reenviar email de verificación');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockResendEmailVerification).toHaveBeenCalledTimes(1);
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'No pudimos reenviar el email',
        text2: 'Intentá nuevamente en unos minutos.',
      });
    });

    expect(button).toBeDisabled();

    fireEvent.press(button);
    expect(mockResendEmailVerification).toHaveBeenCalledTimes(1);
  });
});
