import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";

import { useAuthStore } from "../../../../shared/store/authStore";
import { setRefreshToken } from "../../../../shared/api/tokenStorage";
import { useBiometricAuth } from "../../hooks/useBiometricAuth";
import { useLogin } from "../../hooks/useLogin";
import { useRegister } from "../../hooks/useRegister";
import { KeyboardAwareScrollView } from "../../../../shared/ui/KeyboardAwareScrollView";
import { AuthScreen } from "../AuthScreen";

jest.mock("../../../../shared/store/authStore", () => ({
	useAuthStore: jest.fn(),
}));

jest.mock("../../../../shared/api/tokenStorage", () => ({
	setRefreshToken: jest.fn(),
	setUserMetadata: jest.fn(),
}));

jest.mock("../../hooks/useBiometricAuth", () => ({
	useBiometricAuth: jest.fn(),
}));

jest.mock("../../hooks/useLogin", () => ({
	useLogin: jest.fn(),
}));

jest.mock("../../hooks/useRegister", () => ({
	useRegister: jest.fn(),
}));

jest.mock("react-native-toast-message", () => ({
	show: jest.fn(),
}));

jest.mock("../../../../shared/ui/KeyboardAwareScrollView", () => ({
	KeyboardAwareScrollView: jest.fn(({ children }) => children),
}));

const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedUseBiometricAuth = jest.mocked(useBiometricAuth);
const mockedUseLogin = jest.mocked(useLogin);
const mockedUseRegister = jest.mocked(useRegister);
const mockedToast = jest.mocked(Toast);
const mockedSetRefreshToken = jest.mocked(setRefreshToken);
const setSession = jest.fn();

function renderAuth(initialTab?: "login" | "register") {
	const route = { params: initialTab ? { initialTab } : undefined } as never;
	const navigation = {} as never;
	return render(<AuthScreen route={route} navigation={navigation} />);
}

beforeEach(() => {
	jest.clearAllMocks();
	mockedUseAuthStore.mockImplementation(
		(selector) =>
			(selector as (s: unknown) => unknown)({ setSession }) as never,
	);
	mockedUseBiometricAuth.mockReturnValue({
		enabled: true,
		isAvailable: true,
		isPending: false,
		enable: jest.fn(),
		disable: jest.fn(),
		unlock: jest.fn(),
	});
	mockedUseLogin.mockReturnValue({
		mutate: jest.fn(),
		isPending: false,
		error: null,
	} as never);
	mockedUseRegister.mockReturnValue({
		mutate: jest.fn(),
		isPending: false,
		error: null,
	} as never);
});

describe("AuthScreen", () => {
	// --- Existing tests (preserved) ---

	it("renders without crashing", () => {
		renderAuth();
	});

	it('shows "Iniciar Sesión" heading when initialTab="login" (default)', () => {
		renderAuth("login");
		expect(screen.getAllByText("Iniciar Sesión").length).toBeGreaterThan(0);
	});

	it('shows "Crear Cuenta" heading when initialTab="register"', () => {
		renderAuth("register");
		expect(screen.getByText("Crear Cuenta")).toBeTruthy();
	});

	it("does not auto-scroll the register screen to the end when the keyboard opens", () => {
		renderAuth("register");

		expect(jest.mocked(KeyboardAwareScrollView).mock.calls[0][0]).not.toEqual(
			expect.objectContaining({ autoScrollToEndOnKeyboardShow: true }),
		);
	});

	it("renders an accessible Google button on both auth tabs", () => {
		renderAuth("login");

		let googleButton = screen.getByTestId("google-button");
		expect(googleButton.props.accessibilityRole).toBe("button");
		expect(googleButton.props.accessibilityLabel).toBe("Continuar con Google");

		fireEvent.press(screen.getByText("Registrarse"));
		googleButton = screen.getByTestId("google-button");
		expect(googleButton.props.accessibilityRole).toBe("button");
		expect(googleButton.props.accessibilityLabel).toBe("Continuar con Google");
	});

	it("hides biometric login when the preference or device availability is missing", () => {
		mockedUseBiometricAuth.mockReturnValue({
			enabled: false,
			isAvailable: false,
			isPending: false,
			enable: jest.fn(),
			disable: jest.fn(),
			unlock: jest.fn(),
		});
		renderAuth("login");
		expect(screen.queryByTestId("biometric-login-button")).toBeNull();
	});

	it("renders the biometric login button only on the login tab", () => {
		renderAuth("login");
		expect(screen.getByTestId("biometric-login-button")).toBeTruthy();
		expect(
			screen.getByTestId("biometric-login-button").props.accessibilityRole,
		).toBe("button");
		expect(
			screen.getByTestId("biometric-login-button").props.accessibilityLabel,
		).toBe("Iniciar sesión con huella digital");

		fireEvent.press(screen.getByText("Registrarse"));
		expect(screen.queryByTestId("biometric-login-button")).toBeNull();
	});

	it("shows a screen-level loading overlay while biometric login is pending", () => {
		mockedUseBiometricAuth.mockReturnValue({
			enabled: true,
			isAvailable: true,
			isPending: true,
			enable: jest.fn(),
			disable: jest.fn(),
			unlock: jest.fn(),
		});

		renderAuth("login");

		const loadingOverlay = screen.getByTestId("auth-loading-overlay");
		const biometricLabel = screen.getByText("Iniciar con huella digital");

		expect(loadingOverlay.findByType(ActivityIndicator)).toBeTruthy();
		expect(loadingOverlay.props.accessibilityRole).toBe("progressbar");
		expect(loadingOverlay.props.accessibilityLabel).toBe("Autenticando");
		expect(loadingOverlay.props.accessibilityState).toEqual({ busy: true });
		expect(loadingOverlay.props.className).toContain("absolute");
		expect(loadingOverlay.props.className).toContain("inset-0");
		expect(loadingOverlay.props.pointerEvents).toBe("auto");
		expect(
			biometricLabel.parent?.findAllByType(ActivityIndicator),
		).toHaveLength(0);
	});

	it("places Google and biometric actions together above the login fields", () => {
		const { toJSON } = renderAuth("login");
		const serialized = JSON.stringify(toJSON());

		expect(serialized.indexOf('testID":"google-button')).toBeLessThan(
			serialized.indexOf('testID":"biometric-login-button'),
		);
		expect(serialized.indexOf('testID":"biometric-login-button')).toBeLessThan(
			serialized.indexOf('testID":"email-label'),
		);
		expect(screen.queryByText("o continuar con")).toBeNull();
	});

	it("uses the official SVG Google logo instead of a text G", () => {
		renderAuth("login");

		const googleButton = screen.getByTestId("google-button");
		const logo = googleButton.findByProps({ testID: "google-logo" });
		expect(logo.props.testID).toBe("google-logo");
		expect(logo.props.viewBox).toBe("0 0 24 24");
		expect(logo.props.accessible).toBe(false);
		expect(screen.queryByText("G")).toBeNull();
	});

	it('tapping "Registrarse" tab shows "Crear Cuenta" heading', () => {
		renderAuth("login");
		fireEvent.press(screen.getByText("Registrarse"));
		expect(screen.getByText("Crear Cuenta")).toBeTruthy();
	});

	it('tapping "Entrar" tab shows "Iniciar Sesión" heading', () => {
		renderAuth("register");
		fireEvent.press(screen.getByText("Entrar"));
		expect(screen.getAllByText("Iniciar Sesión").length).toBeGreaterThan(0);
	});

	// --- Register validation tests ---

	it("pressing register button with short name shows name validation error and name label turns red", async () => {
		renderAuth("register");
		await act(async () => {
			fireEvent.press(screen.getByTestId("register-button"));
		});
		expect(
			screen.getByText("El nombre debe tener al menos 2 caracteres"),
		).toBeTruthy();
		const nameLabel = screen.getByTestId("register-name-label");
		expect(nameLabel.props.className).toContain("text-red-600");
	});

	it("pressing register button with invalid email shows email validation error", async () => {
		renderAuth("register");
		fireEvent.changeText(screen.getByPlaceholderText("Juan García"), "Juan");
		fireEvent.changeText(
			screen.getByPlaceholderText("juan@ejemplo.com"),
			"notanemail",
		);
		fireEvent.changeText(
			screen.getByPlaceholderText("••••••••"),
			"validpassword",
		);
		fireEvent.changeText(
			screen.getByPlaceholderText("Repetí tu contraseña"),
			"validpassword",
		);
		await act(async () => {
			fireEvent.press(screen.getByTestId("register-button"));
		});
		expect(screen.getByText("Ingresá un email válido")).toBeTruthy();
	});

	it("pressing register button with short password shows password error and password label turns red", async () => {
		renderAuth("register");
		fireEvent.changeText(screen.getByPlaceholderText("Juan García"), "Juan");
		fireEvent.changeText(
			screen.getByPlaceholderText("juan@ejemplo.com"),
			"user@example.com",
		);
		fireEvent.changeText(screen.getByPlaceholderText("••••••••"), "short");
		await act(async () => {
			fireEvent.press(screen.getByTestId("register-button"));
		});
		expect(
			screen.getByText("La contraseña debe tener al menos 8 caracteres"),
		).toBeTruthy();
		const passwordLabel = screen.getByTestId("register-password-label");
		expect(passwordLabel.props.className).toContain("text-red-600");
	});

	it("renders a second password field for registration", () => {
		renderAuth("register");

		expect(screen.getByTestId("register-confirm-password-label")).toBeTruthy();
		expect(screen.getByPlaceholderText("Repetí tu contraseña")).toBeTruthy();
	});

	it("blocks registration when password confirmation does not match", async () => {
		const mockMutate = jest.fn();
		mockedUseRegister.mockReturnValue({
			mutate: mockMutate,
			isPending: false,
			error: null,
		} as never);

		renderAuth("register");
		fireEvent.changeText(screen.getByPlaceholderText("Juan García"), "Gastón");
		fireEvent.changeText(
			screen.getByPlaceholderText("juan@ejemplo.com"),
			"gaston@example.com",
		);
		fireEvent.changeText(
			screen.getByPlaceholderText("••••••••"),
			"validpassword",
		);
		fireEvent.changeText(
			screen.getByPlaceholderText("Repetí tu contraseña"),
			"differentpassword",
		);
		await act(async () => {
			fireEvent.press(screen.getByTestId("register-button"));
		});

		expect(screen.getByText("Las contraseñas no coinciden")).toBeTruthy();
		expect(
			screen.getByTestId("register-confirm-password-label").props.className,
		).toContain("text-red-600");
		expect(mockMutate).not.toHaveBeenCalled();
	});

	it("pressing register button with valid data calls useRegister mutate", async () => {
		const mockMutate = jest.fn();
		mockedUseRegister.mockReturnValue({
			mutate: mockMutate,
			isPending: false,
			error: null,
		} as never);

		renderAuth("register");
		fireEvent.changeText(screen.getByPlaceholderText("Juan García"), "Gastón");
		fireEvent.changeText(
			screen.getByPlaceholderText("juan@ejemplo.com"),
			"gaston@example.com",
		);
		fireEvent.changeText(
			screen.getByPlaceholderText("••••••••"),
			"validpassword",
		);
		fireEvent.changeText(
			screen.getByPlaceholderText("Repetí tu contraseña"),
			"validpassword",
		);
		await act(async () => {
			fireEvent.press(screen.getByTestId("register-button"));
		});
		expect(mockMutate).toHaveBeenCalledWith(
			{
				name: "Gastón",
				email: "gaston@example.com",
				password: "validpassword",
			},
			expect.objectContaining({
				onSuccess: expect.any(Function),
				onError: expect.any(Function),
			}),
		);
	});

	it("when useRegister mutation succeeds, setSession is called with user data and tokens are stored", async () => {
		let onSuccessCallback:
			| ((response: {
					data: {
						accessToken: string;
						refreshToken: string;
						user: { id: string; name: string; email: string };
					};
			  }) => void)
			| undefined;
		const mockMutate = jest.fn((_vars, options) => {
			onSuccessCallback = options?.onSuccess;
		});
		mockedUseRegister.mockReturnValue({
			mutate: mockMutate,
			isPending: false,
			error: null,
		} as never);
		mockedSetRefreshToken.mockResolvedValue();

		renderAuth("register");
		fireEvent.changeText(screen.getByPlaceholderText("Juan García"), "Gastón");
		fireEvent.changeText(
			screen.getByPlaceholderText("juan@ejemplo.com"),
			"gaston@example.com",
		);
		fireEvent.changeText(
			screen.getByPlaceholderText("••••••••"),
			"validpassword",
		);
		fireEvent.changeText(
			screen.getByPlaceholderText("Repetí tu contraseña"),
			"validpassword",
		);
		await act(async () => {
			fireEvent.press(screen.getByTestId("register-button"));
		});

		const mockResponse = {
			data: {
				accessToken: "test-access-token",
				refreshToken: "test-refresh-token",
				user: {
					id: "user-123",
					name: "Gastón",
					email: "gaston@example.com",
				},
			},
		};
		await act(async () => {
			await onSuccessCallback?.(mockResponse);
		});

		expect(mockedSetRefreshToken).toHaveBeenCalledWith("test-refresh-token");
		expect(setSession).toHaveBeenCalledWith(
			{ id: "user-123", name: "Gastón", email: "gaston@example.com" },
			"test-access-token",
		);
	});

	it("when useRegister mutation fails, shows error toast and does NOT call setSession", async () => {
		let onErrorCallback: ((error: Error) => void) | undefined;
		const mockMutate = jest.fn((_vars, options) => {
			onErrorCallback = options?.onError;
		});
		mockedUseRegister.mockReturnValue({
			mutate: mockMutate,
			isPending: false,
			error: null,
		} as never);

		renderAuth("register");
		fireEvent.changeText(screen.getByPlaceholderText("Juan García"), "Gastón");
		fireEvent.changeText(
			screen.getByPlaceholderText("juan@ejemplo.com"),
			"gaston@example.com",
		);
		fireEvent.changeText(
			screen.getByPlaceholderText("••••••••"),
			"validpassword",
		);
		fireEvent.changeText(
			screen.getByPlaceholderText("Repetí tu contraseña"),
			"validpassword",
		);
		await act(async () => {
			fireEvent.press(screen.getByTestId("register-button"));
		});

		const mockError = new Error("El email ya está registrado");
		act(() => {
			onErrorCallback?.(mockError);
		});

		expect(mockedToast.show).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "error",
				text1: "Error al registrarse",
				text2: "Verificá tus datos",
			}),
		);
		expect(setSession).not.toHaveBeenCalled();
	});

	// --- New validation tests (login tab) ---

	it("pressing login button with empty email shows email validation error and email label turns red", async () => {
		renderAuth("login");
		await act(async () => {
			fireEvent.press(screen.getByTestId("login-button"));
		});
		expect(screen.getByText("Ingresá un email válido")).toBeTruthy();
		const emailLabel = screen.getByTestId("email-label");
		expect(emailLabel.props.className).toContain("text-red-600");
	});

	it("pressing login button with invalid email shows email validation error", async () => {
		renderAuth("login");
		fireEvent.changeText(
			screen.getByPlaceholderText("juan@ejemplo.com"),
			"notanemail",
		);
		await act(async () => {
			fireEvent.press(screen.getByTestId("login-button"));
		});
		expect(screen.getByText("Ingresá un email válido")).toBeTruthy();
	});

	it("pressing login button with valid email but short password shows password error and password label turns red", async () => {
		renderAuth("login");
		fireEvent.changeText(
			screen.getByPlaceholderText("juan@ejemplo.com"),
			"user@example.com",
		);
		fireEvent.changeText(screen.getByPlaceholderText("••••••••"), "short");
		await act(async () => {
			fireEvent.press(screen.getByTestId("login-button"));
		});
		expect(
			screen.getByText("La contraseña debe tener al menos 8 caracteres"),
		).toBeTruthy();
		const passwordLabel = screen.getByTestId("password-label");
		expect(passwordLabel.props.className).toContain("text-red-600");
	});

	it("pressing login button with valid credentials calls useLogin mutate", async () => {
		const mockMutate = jest.fn();
		mockedUseLogin.mockReturnValue({
			mutate: mockMutate,
			isPending: false,
			error: null,
		} as never);

		renderAuth("login");
		fireEvent.changeText(
			screen.getByPlaceholderText("juan@ejemplo.com"),
			"user@example.com",
		);
		fireEvent.changeText(
			screen.getByPlaceholderText("••••••••"),
			"validpassword",
		);
		await act(async () => {
			fireEvent.press(screen.getByTestId("login-button"));
		});
		expect(mockMutate).toHaveBeenCalledWith(
			{ email: "user@example.com", password: "validpassword" },
			expect.objectContaining({
				onSuccess: expect.any(Function),
				onError: expect.any(Function),
			}),
		);
	});

	it("when useLogin mutation succeeds, setSession is called with user data and tokens are stored", async () => {
		let onSuccessCallback:
			| ((response: {
					data: {
						accessToken: string;
						refreshToken: string;
						user: { id: string; name: string; email: string };
					};
			  }) => void)
			| undefined;
		const mockMutate = jest.fn((_vars, options) => {
			onSuccessCallback = options?.onSuccess;
		});
		mockedUseLogin.mockReturnValue({
			mutate: mockMutate,
			isPending: false,
			error: null,
		} as never);
		mockedSetRefreshToken.mockResolvedValue();

		renderAuth("login");
		fireEvent.changeText(
			screen.getByPlaceholderText("juan@ejemplo.com"),
			"user@example.com",
		);
		fireEvent.changeText(
			screen.getByPlaceholderText("••••••••"),
			"validpassword",
		);
		await act(async () => {
			fireEvent.press(screen.getByTestId("login-button"));
		});

		// Simulate mutation success with real API response structure
		const mockResponse = {
			data: {
				accessToken: "test-access-token",
				refreshToken: "test-refresh-token",
				user: {
					id: "user-123",
					name: "Test User",
					email: "user@example.com",
				},
			},
		};
		await act(async () => {
			await onSuccessCallback?.(mockResponse);
		});

		expect(mockedSetRefreshToken).toHaveBeenCalledWith("test-refresh-token");
		expect(setSession).toHaveBeenCalledWith(
			{ id: "user-123", name: "Test User", email: "user@example.com" },
			"test-access-token",
		);
	});

	it("when useLogin mutation fails, shows error toast and does NOT call setSession", async () => {
		let onErrorCallback: ((error: Error) => void) | undefined;
		const mockMutate = jest.fn((_vars, options) => {
			onErrorCallback = options?.onError;
		});
		mockedUseLogin.mockReturnValue({
			mutate: mockMutate,
			isPending: false,
			error: null,
		} as never);

		renderAuth("login");
		fireEvent.changeText(
			screen.getByPlaceholderText("juan@ejemplo.com"),
			"user@example.com",
		);
		fireEvent.changeText(
			screen.getByPlaceholderText("••••••••"),
			"validpassword",
		);
		await act(async () => {
			fireEvent.press(screen.getByTestId("login-button"));
		});

		// Simulate mutation error
		const mockError = new Error(
			"Credenciales inválidas. Verificá tu email y contraseña.",
		);
		act(() => {
			onErrorCallback?.(mockError);
		});

		expect(mockedToast.show).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "error",
				text1: "Error al iniciar sesión",
				text2: "Verificá tus credenciales",
			}),
		);
		expect(setSession).not.toHaveBeenCalled();
	});
});
