import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

import { useAuthStore } from "../../../../shared/store/authStore";
import { setRefreshToken } from "../../../../shared/api/tokenStorage";
import { useLogin } from "../../hooks/useLogin";
import { useRegister } from "../../hooks/useRegister";
import { useGoogleLogin } from "../../hooks/useGoogleLogin";
import { KeyboardAwareScrollView } from "../../../../shared/ui/KeyboardAwareScrollView";
import { AuthScreen } from "../AuthScreen";

jest.mock("../../../../shared/store/authStore", () => ({
	useAuthStore: jest.fn(),
}));

jest.mock("../../../../shared/api/tokenStorage", () => ({
	setRefreshToken: jest.fn(),
}));

jest.mock("../../hooks/useLogin", () => ({
	useLogin: jest.fn(),
}));

jest.mock("../../hooks/useRegister", () => ({
	useRegister: jest.fn(),
}));

jest.mock("../../hooks/useGoogleLogin", () => ({
	useGoogleLogin: jest.fn(),
}));

jest.mock("react-native-toast-message", () => ({
	show: jest.fn(),
}));

jest.mock("../../../../shared/ui/KeyboardAwareScrollView", () => ({
	KeyboardAwareScrollView: jest.fn(({ children }) => children),
}));

const mockedUseAuthStore = jest.mocked(useAuthStore);
const mockedUseLogin = jest.mocked(useLogin);
const mockedUseRegister = jest.mocked(useRegister);
const mockedUseGoogleLogin = jest.mocked(useGoogleLogin);
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
	Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
	mockedUseAuthStore.mockImplementation(
		(selector) =>
			(selector as (s: unknown) => unknown)({ setSession }) as never,
	);
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
	mockedUseGoogleLogin.mockReturnValue({
		startGoogleLogin: jest.fn(),
		isPending: false,
		isReady: true,
		isSupportedPlatform: true,
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

	it("does not render Google login controls on iOS", () => {
		Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
		mockedUseGoogleLogin.mockReturnValue({
			startGoogleLogin: jest.fn(),
			isPending: false,
			isReady: false,
			isSupportedPlatform: false,
		} as never);

		renderAuth("login");

		expect(screen.queryByTestId("google-login-button-login")).toBeNull();
		expect(screen.queryByText("o continuar con")).toBeNull();
	});

	it("calls startGoogleLogin when pressing Google button on login tab", async () => {
		const mockStartGoogleLogin = jest.fn();
		mockedUseGoogleLogin.mockReturnValue({
			startGoogleLogin: mockStartGoogleLogin,
			isPending: false,
			isReady: true,
			isSupportedPlatform: true,
		} as never);

		renderAuth("login");
		await act(async () => {
			fireEvent.press(screen.getByTestId("google-login-button-login"));
		});

		expect(mockStartGoogleLogin).toHaveBeenCalledTimes(1);
	});

	it("calls startGoogleLogin when pressing Google button on register tab", async () => {
		const mockStartGoogleLogin = jest.fn();
		mockedUseGoogleLogin.mockReturnValue({
			startGoogleLogin: mockStartGoogleLogin,
			isPending: false,
			isReady: true,
			isSupportedPlatform: true,
		} as never);

		renderAuth("register");
		await act(async () => {
			fireEvent.press(screen.getByTestId("google-login-button-register"));
		});

		expect(mockStartGoogleLogin).toHaveBeenCalledTimes(1);
	});

	it("disables Google button while Google auth is unavailable", () => {
		mockedUseGoogleLogin.mockReturnValue({
			startGoogleLogin: jest.fn(),
			isPending: false,
			isReady: false,
			isSupportedPlatform: true,
		} as never);

		renderAuth("login");

		const loginGoogleButton = screen.getByTestId("google-login-button-login");

		expect(loginGoogleButton.props.accessibilityState).toMatchObject({
			disabled: true,
		});
	});
});
