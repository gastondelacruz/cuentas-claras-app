import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

import { queryClient } from "../../../../shared/api/queryClient";
import { useAuthStore } from "../../../../shared/store/authStore";
import { setRefreshToken } from "../../../../shared/api/tokenStorage";
import { prefetchInitialAppData } from "../../../../shared/api/prefetchInitialAppData";
import { appendGoogleAuthFailureLog } from "../../utils/googleAuthTelemetry";
import { loginWithGoogle } from "../../api/authApi";
import { useGoogleLogin } from "../useGoogleLogin";

jest.mock("../../api/authApi", () => ({
	loginWithGoogle: jest.fn(),
}));

jest.mock("../../utils/googleAuthTelemetry", () => ({
	appendGoogleAuthFailureLog: jest.fn(async () => undefined),
}));

jest.mock("../../../../shared/api/tokenStorage", () => ({
	setRefreshToken: jest.fn(async () => undefined),
}));

jest.mock("../../../../shared/api/prefetchInitialAppData", () => ({
	prefetchInitialAppData: jest.fn(),
}));

jest.mock("react-native-toast-message", () => ({
	show: jest.fn(),
}));

let promptAsyncMock = jest.fn();

jest.mock("expo-auth-session", () => ({
	ResponseType: { Code: "code", IdToken: "id_token" },
	makeRedirectUri: jest.fn(() => "test-redirect://auth"),
}));

jest.mock("expo-auth-session/providers/google", () => ({
	__esModule: true,
	useAuthRequest: jest.fn(() => [null, null, undefined]),
}));

const mockedUseAuthRequest = jest.requireMock(
	"expo-auth-session/providers/google",
).useAuthRequest as jest.Mock;
const mockLoginWithGoogle = jest.mocked(loginWithGoogle);
const mockSetRefreshToken = jest.mocked(setRefreshToken);
const mockPrefetchInitialAppData = jest.mocked(prefetchInitialAppData);
const mockAppendGoogleAuthFailureLog = jest.mocked(appendGoogleAuthFailureLog);
const mockToast = jest.mocked(Toast);

describe("useGoogleLogin", () => {
	beforeEach(() => {
		jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] });
		Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
		jest.clearAllMocks();
		queryClient.clear();
		useAuthStore.getState().clearSession();
		delete process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
		delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
		delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
		promptAsyncMock = jest.fn(async () => ({
			type: "success",
			params: { id_token: "token-id-from-provider" },
		}));
		mockedUseAuthRequest.mockImplementation(() => [
			null,
			null,
			promptAsyncMock,
		]);
		mockLoginWithGoogle.mockReset();
	});

	afterEach(() => {
		queryClient.clear();
		jest.useRealTimers();
	});

	function Wrapper({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	}

	it("waits for the native provider response before storing the session", async () => {
		process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID = "android-id";
		let providerResponse: unknown = null;
		promptAsyncMock.mockResolvedValue({ type: "success" });
		mockedUseAuthRequest.mockImplementation(
			() =>
				[
					{ serviceType: "test" },
					providerResponse,
					promptAsyncMock,
				] as never,
		);
		mockLoginWithGoogle.mockResolvedValue({
			data: {
				accessToken: "access-token",
				refreshToken: "refresh-token",
				user: { id: "user-123", name: "Juan", email: "juan@example.com" },
			},
		} as never);

		const { result, rerender, unmount } = renderHook(() => useGoogleLogin(), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.startGoogleLogin();
		});
		expect(mockLoginWithGoogle).not.toHaveBeenCalled();

		providerResponse = {
			type: "success",
			authentication: {
				accessToken: "google-access-token",
				idToken: "token-id-from-provider",
			},
		};
		rerender(undefined);

		await waitFor(() => {
			expect(mockLoginWithGoogle).toHaveBeenCalledWith(
				"token-id-from-provider",
			);
			expect(mockSetRefreshToken).toHaveBeenCalledWith("refresh-token");
			expect(useAuthStore.getState().isAuthenticated).toBe(true);
			expect(useAuthStore.getState().user?.email).toBe("juan@example.com");
		});

		expect(mockPrefetchInitialAppData).toHaveBeenCalledTimes(1);
		unmount();
	});

	it("lets the Google provider choose native response type and redirect URI", () => {
		process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID = "android-id";

		const { unmount } = renderHook(() => useGoogleLogin(), {
			wrapper: Wrapper,
		});

		expect(mockedUseAuthRequest).toHaveBeenCalledWith(
			expect.not.objectContaining({
				responseType: expect.anything(),
				redirectUri: expect.anything(),
			}),
		);
		expect(mockedUseAuthRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				androidClientId: "android-id",
				scopes: ["openid", "email", "profile"],
			}),
		);
		unmount();
	});

	it("does not expose or start Google login outside Android", async () => {
		Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
		process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID = "android-id";
		mockedUseAuthRequest.mockImplementation(
			() => [{ serviceType: "test" }, null, promptAsyncMock] as never,
		);

		const { result, unmount } = renderHook(() => useGoogleLogin(), {
			wrapper: Wrapper,
		});

		expect(result.current.isSupportedPlatform).toBe(false);
		expect(result.current.isReady).toBe(false);
		await act(async () => {
			await result.current.startGoogleLogin();
		});
		expect(promptAsyncMock).not.toHaveBeenCalled();
		unmount();
	});

	it("reports prompt failures without rejecting the caller", async () => {
		process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID = "android-id";
		promptAsyncMock.mockRejectedValue(new Error("provider unavailable"));
		mockedUseAuthRequest.mockImplementation(
			() => [{ serviceType: "test" }, null, promptAsyncMock] as never,
		);
		const { result, unmount } = renderHook(() => useGoogleLogin(), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await expect(result.current.startGoogleLogin()).resolves.toBeUndefined();
		});

		expect(mockAppendGoogleAuthFailureLog).toHaveBeenCalledWith({
			reason: "PROMPT_FAILED",
		});
		expect(mockToast.show).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "error",
				text1: "No se pudo iniciar sesión con Google",
			}),
		);
		unmount();
	});

	it("shows an error and skips auth when Google login is not configured", async () => {
		mockedUseAuthRequest.mockImplementation(() => [
			null,
			null,
			promptAsyncMock,
		]);
		const { result, unmount } = renderHook(() => useGoogleLogin(), {
			wrapper: Wrapper,
		});

		await act(async () => {
			await result.current.startGoogleLogin();
		});

		expect(promptAsyncMock).not.toHaveBeenCalled();
		expect(mockToast.show).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "error",
				text1: "Login con Google no configurado",
			}),
		);
		expect(mockAppendGoogleAuthFailureLog).toHaveBeenCalledWith(
			expect.objectContaining({
				reason: "MISSING_GOOGLE_CLIENT_ID",
			}),
		);
		unmount();
	});
});
