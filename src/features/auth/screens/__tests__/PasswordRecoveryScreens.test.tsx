import {
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react-native";
import type { ReactNode } from "react";

import { ForgotPasswordScreen } from "../ForgotPasswordScreen";
import { ResetPasswordScreen } from "../ResetPasswordScreen";
import { forgotPassword, resetPassword } from "../../api/authApi";

jest.mock("../../api/authApi", () => ({
	forgotPassword: jest.fn(async () => undefined),
	resetPassword: jest.fn(async () => undefined),
	getPasswordResetErrorCode: jest.fn((error: unknown) =>
		error instanceof Error
			? "PASSWORD_RESET_CONNECTION"
			: "PASSWORD_RESET_TOKEN_INVALID",
	),
}));

jest.mock("../../../../shared/ui/KeyboardAwareScrollView", () => ({
	KeyboardAwareScrollView: ({ children }: { children: ReactNode }) => children,
}));
jest.mock("../../../../shared/ui/InternalScreenHeader", () => ({
	InternalScreenHeader: ({ title }: { title: string }) => title,
}));

describe("password recovery screens", () => {
	it("validates the recovery email and shows a local success message", async () => {
		const navigate = jest.fn();
		render(
			<ForgotPasswordScreen
				navigation={{ navigate } as never}
				route={{} as never}
			/>,
		);
		fireEvent.press(screen.getByTestId("forgot-password-submit"));
		expect(screen.getByText("Ingresá un email válido")).toBeTruthy();
		expect(screen.getAllByText("Cuentas Claras").length).toBeGreaterThan(0);
		expect(
			screen.getByText(
				`© ${new Date().getFullYear()} Cuentas Claras. De La Cruz Bayugar Gaston.`,
			),
		).toBeTruthy();

		fireEvent.changeText(
			screen.getByLabelText("Correo electrónico"),
			"user@example.com",
		);
		fireEvent.press(screen.getByTestId("forgot-password-submit"));
		await waitFor(() =>
			expect(screen.getByText(/Si el correo está registrado/)).toBeTruthy(),
		);
		expect(forgotPassword).toHaveBeenCalledWith("user@example.com");
		expect(screen.getByTestId("forgot-password-submit")).toBeDisabled();
		expect(screen.getByText("Reenviar en 30s")).toBeTruthy();
		fireEvent.press(screen.getByTestId("forgot-password-submit"));
		expect(forgotPassword).toHaveBeenCalledTimes(1);
		expect(screen.queryByTestId("reset-password-preview-link")).toBeNull();
		fireEvent.changeText(
			screen.getByLabelText("Correo electrónico"),
			"changed@example.com",
		);
		expect(screen.queryByText(/Si el correo está registrado/)).toBeNull();
	});

	it("rejects a missing reset token without calling the API", async () => {
		render(
			<ResetPasswordScreen
				navigation={{ reset: jest.fn() } as never}
				route={{ params: undefined } as never}
			/>,
		);
		fireEvent.changeText(screen.getByTestId("new-password-input"), "secure123");
		fireEvent.changeText(
			screen.getByTestId("confirm-password-input"),
			"secure123",
		);
		fireEvent.press(screen.getByTestId("reset-password-submit"));

		await waitFor(() =>
			expect(
				screen.getByText("El enlace de recuperación no es válido."),
			).toBeTruthy(),
		);
		expect(resetPassword).not.toHaveBeenCalled();
	});

	it("shows progress and disables the form while updating the password", async () => {
		let resolveReset: () => void = () => undefined;
		jest.mocked(resetPassword).mockImplementationOnce(
			() =>
				new Promise<void>((resolve) => {
					resolveReset = resolve;
				}),
		);
		const navigation = { reset: jest.fn() };
		render(
			<ResetPasswordScreen
				navigation={navigation as never}
				route={{ params: { token: "token-123" } } as never}
			/>,
		);
		fireEvent.changeText(screen.getByTestId("new-password-input"), "secure123");
		fireEvent.changeText(
			screen.getByTestId("confirm-password-input"),
			"secure123",
		);
		fireEvent.press(screen.getByTestId("reset-password-submit"));

		expect(screen.getByText("Actualizando…")).toBeTruthy();
		expect(screen.getByTestId("reset-password-submit")).toBeDisabled();
		expect(
			screen.getByTestId("reset-password-submit").props.accessibilityState,
		).toEqual(expect.objectContaining({ busy: true }));
		expect(screen.getByTestId("new-password-input").props.editable).toBe(false);
		expect(screen.getByTestId("confirm-password-input").props.editable).toBe(
			false,
		);

		resolveReset();
		await waitFor(() => expect(navigation.reset).toHaveBeenCalled());
	});

	it("shows an API error when the reset token is invalid or expired", async () => {
		jest.mocked(resetPassword).mockRejectedValueOnce({
			response: { status: 400 },
		});
		render(
			<ResetPasswordScreen
				navigation={{ reset: jest.fn() } as never}
				route={{ params: { token: "token-123" } } as never}
			/>,
		);
		fireEvent.changeText(screen.getByTestId("new-password-input"), "secure123");
		fireEvent.changeText(
			screen.getByTestId("confirm-password-input"),
			"secure123",
		);
		fireEvent.press(screen.getByTestId("reset-password-submit"));

		await waitFor(() =>
			expect(
				screen.getByText("El enlace de recuperación no es válido."),
			).toBeTruthy(),
		);
	});

	it("shows a connection error when reset cannot reach the API", async () => {
		jest.mocked(resetPassword).mockRejectedValueOnce(new Error("network error"));
		render(
			<ResetPasswordScreen
				navigation={{ reset: jest.fn() } as never}
				route={{ params: { token: "token-123" } } as never}
			/>,
		);
		fireEvent.changeText(screen.getByTestId("new-password-input"), "secure123");
		fireEvent.changeText(
			screen.getByTestId("confirm-password-input"),
			"secure123",
		);
		fireEvent.press(screen.getByTestId("reset-password-submit"));

		await waitFor(() =>
			expect(
				screen.getByText(
					"No pudimos conectar con el servidor. Revisá tu conexión e intentá nuevamente.",
				),
			).toBeTruthy(),
		);
	});

	it("validates matching passwords and supports visibility toggles", async () => {
		render(
			<ResetPasswordScreen
				navigation={{ reset: jest.fn() } as never}
				route={{ params: { token: "token-123" } } as never}
			/>,
		);
		fireEvent.changeText(screen.getByTestId("new-password-input"), "secure123");
		fireEvent.changeText(
			screen.getByTestId("confirm-password-input"),
			"different123",
		);
		fireEvent.press(screen.getByTestId("reset-password-submit"));
		expect(screen.getByText("Las contraseñas no coinciden")).toBeTruthy();

		fireEvent.changeText(
			screen.getByTestId("confirm-password-input"),
			"secure123",
		);
		fireEvent.press(screen.getByLabelText("Mostrar nueva contraseña"));
		fireEvent.press(screen.getByTestId("reset-password-submit"));
		await waitFor(() =>
			expect(resetPassword).toHaveBeenCalledWith("token-123", "secure123"),
		);
	});
});
