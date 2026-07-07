import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react-native";
import Toast from "react-native-toast-message";

import { resendEmailVerification } from "../api/authApi";
import { EmailVerificationBanner } from "../components/EmailVerificationBanner";
import { __resetEmailVerificationResendCooldownForTests } from "../hooks/useEmailVerificationBanner";

jest.mock("../api/authApi", () => ({
	resendEmailVerification: jest.fn(),
}));

const mockResendEmailVerification = jest.mocked(resendEmailVerification);

describe("EmailVerificationBanner", () => {
	beforeEach(() => {
		jest.useFakeTimers();
		__resetEmailVerificationResendCooldownForTests();
		mockResendEmailVerification.mockReset();
		jest.mocked(Toast.show).mockClear();
	});

	afterEach(() => {
		act(() => {
			jest.advanceTimersByTime(30_000);
			jest.runOnlyPendingTimers();
		});
		__resetEmailVerificationResendCooldownForTests();
		jest.useRealTimers();
	});

	it("does not render when hidden", () => {
		render(<EmailVerificationBanner visible={false} />);

		expect(screen.queryByText("Reenviar")).toBeNull();
	});

	it("temporarily disables resend after a successful tap to avoid spam", async () => {
		mockResendEmailVerification.mockResolvedValueOnce(undefined);
		render(<EmailVerificationBanner visible />);

		const button = screen.getByLabelText("Reenviar email de verificación");
		fireEvent.press(button);

		await waitFor(() => {
			expect(mockResendEmailVerification).toHaveBeenCalledTimes(1);
			expect(button).toBeDisabled();
			expect(screen.getByText("Reenviar en 30s")).toBeTruthy();
		});

		fireEvent.press(button);
		expect(mockResendEmailVerification).toHaveBeenCalledTimes(1);

		act(() => {
			jest.advanceTimersByTime(1_000);
		});

		expect(screen.getByText("Reenviar en 29s")).toBeTruthy();

		act(() => {
			jest.advanceTimersByTime(29_000);
		});

		await waitFor(() => {
			expect(button).not.toBeDisabled();
			expect(screen.getByText("Reenviar")).toBeTruthy();
		});
	});

	it("ignores rapid repeated taps while the resend request is pending", async () => {
		let resolveResend!: () => void;
		const resendPromise = new Promise<void>((resolve) => {
			resolveResend = resolve;
		});
		mockResendEmailVerification.mockReturnValueOnce(resendPromise);
		render(<EmailVerificationBanner visible />);

		const button = screen.getByLabelText("Reenviar email de verificación");
		fireEvent.press(button);
		fireEvent.press(button);

		expect(mockResendEmailVerification).toHaveBeenCalledTimes(1);

		await act(async () => {
			resolveResend();
			await resendPromise;
		});

		await waitFor(() => {
			expect(Toast.show).toHaveBeenCalledWith({
				type: "success",
				text1: "Email reenviado",
				text2: "Revisá tu casilla de correo.",
			});
		});
	});

	it("clears the cooldown timer on unmount", async () => {
		mockResendEmailVerification.mockResolvedValueOnce(undefined);
		const { unmount } = render(<EmailVerificationBanner visible />);

		fireEvent.press(screen.getByLabelText("Reenviar email de verificación"));

		await waitFor(() => {
			expect(mockResendEmailVerification).toHaveBeenCalledTimes(1);
			expect(jest.getTimerCount()).toBe(1);
		});

		unmount();

		expect(jest.getTimerCount()).toBe(0);
	});

	it("keeps the cooldown active after the banner remounts", async () => {
		mockResendEmailVerification.mockResolvedValueOnce(undefined);
		const { unmount } = render(<EmailVerificationBanner visible />);

		fireEvent.press(screen.getByLabelText("Reenviar email de verificación"));

		await waitFor(() => {
			expect(mockResendEmailVerification).toHaveBeenCalledTimes(1);
			expect(screen.getByText("Reenviar en 30s")).toBeTruthy();
		});

		unmount();
		render(<EmailVerificationBanner visible />);

		const remountedButton = screen.getByLabelText(
			"Reenviar email de verificación",
		);
		expect(remountedButton).toBeDisabled();
		expect(screen.getByText("Reenviar en 30s")).toBeTruthy();

		fireEvent.press(remountedButton);
		expect(mockResendEmailVerification).toHaveBeenCalledTimes(1);
	});

	it("keeps the cooldown active when resend fails", async () => {
		mockResendEmailVerification.mockRejectedValueOnce(
			new Error("network error"),
		);
		render(<EmailVerificationBanner visible />);

		const button = screen.getByLabelText("Reenviar email de verificación");
		fireEvent.press(button);

		await waitFor(() => {
			expect(mockResendEmailVerification).toHaveBeenCalledTimes(1);
			expect(Toast.show).toHaveBeenCalledWith({
				type: "error",
				text1: "No pudimos reenviar el email",
				text2: "Intentá nuevamente en unos minutos.",
			});
		});

		expect(button).toBeDisabled();
		expect(screen.getByText("Reenviar en 30s")).toBeTruthy();

		fireEvent.press(button);
		expect(mockResendEmailVerification).toHaveBeenCalledTimes(1);
	});
});
