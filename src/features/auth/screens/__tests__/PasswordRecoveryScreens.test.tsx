import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { ForgotPasswordScreen } from "../ForgotPasswordScreen";
import { ResetPasswordScreen } from "../ResetPasswordScreen";

jest.mock("../../../../shared/ui/KeyboardAwareScrollView", () => ({
	KeyboardAwareScrollView: ({ children }: { children: ReactNode }) => children,
}));
jest.mock("../../../../shared/ui/InternalScreenHeader", () => ({
	InternalScreenHeader: ({ title }: { title: string }) => title,
}));

describe("password recovery screens", () => {
	it("validates the recovery email and shows a local success message", () => {
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
		expect(screen.getByText(/Si el correo está registrado/)).toBeTruthy();
		expect(screen.queryByTestId("reset-password-preview-link")).toBeNull();
		fireEvent.changeText(
			screen.getByLabelText("Correo electrónico"),
			"changed@example.com",
		);
		expect(screen.queryByText(/Si el correo está registrado/)).toBeNull();
	});

	it("validates matching passwords and supports visibility toggles", () => {
		render(
			<ResetPasswordScreen navigation={{} as never} route={{} as never} />,
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
		expect(screen.getByText("Contraseña lista para actualizar.")).toBeTruthy();
	});
});
