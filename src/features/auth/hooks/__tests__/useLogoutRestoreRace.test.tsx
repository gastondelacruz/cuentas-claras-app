import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { PropsWithChildren } from "react";

import { refreshSession, logoutUser } from "../../api/authApi";
import {
	clearRefreshToken,
	getBiometricEnabled,
	getRefreshToken,
} from "../../../../shared/api/tokenStorage";
import { queryClient } from "../../../../shared/api/queryClient";
import { useAuthStore } from "../../../../shared/store/authStore";
import { useLogout } from "../useLogout";
import { useSessionRestore } from "../useSessionRestore";

jest.mock("../../api/authApi", () => ({
	logoutUser: jest.fn(),
	refreshSession: jest.fn(),
}));
jest.mock("../../../../shared/api/tokenStorage", () => ({
	getRefreshToken: jest.fn(),
	getBiometricEnabled: jest.fn(),
	clearRefreshToken: jest.fn(),
	clearBiometricEnabled: jest.fn(),
	clearUserMetadata: jest.fn(),
}));

const mockRefreshSession = jest.mocked(refreshSession);
const mockLogoutUser = jest.mocked(logoutUser);
const mockGetRefreshToken = jest.mocked(getRefreshToken);
const mockClearRefreshToken = jest.mocked(clearRefreshToken);
const mockGetBiometricEnabled = jest.mocked(getBiometricEnabled);

function Wrapper({ children }: PropsWithChildren) {
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}

describe("logout/session restore race", () => {
	afterEach(() => {
		queryClient.clear();
		jest.useRealTimers();
	});

	beforeEach(() => {
		jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] });
		jest.clearAllMocks();
		queryClient.clear();
		useAuthStore.getState().endLogout();
		useAuthStore
			.getState()
			.setSession({ id: "1", email: "a@b.com" }, "access-token");
		mockLogoutUser.mockResolvedValue(undefined);
		mockGetBiometricEnabled.mockResolvedValue(false);
		mockRefreshSession.mockResolvedValue(undefined);
		mockClearRefreshToken.mockResolvedValue(undefined);
	});

	it("does not restore a session when logout starts while the old token read is deferred", async () => {
		let storedToken: string | null = "old-refresh-token";
		let firstRead = true;
		let releaseTokenRead!: () => void;
		mockGetRefreshToken.mockImplementation(() => {
			if (!firstRead) return Promise.resolve(storedToken);
			return new Promise((resolve) => {
				releaseTokenRead = () => {
					firstRead = false;
					resolve(storedToken);
				};
			});
		});
		mockClearRefreshToken.mockImplementation(async () => {
			storedToken = null;
		});

		useAuthStore.getState().clearSession();
		const { result, unmount } = renderHook(
			() => {
				useSessionRestore();
				return useLogout();
			},
			{ wrapper: Wrapper },
		);
		await waitFor(() => expect(mockGetRefreshToken).toHaveBeenCalledTimes(1));
		act(() => {
			useAuthStore
				.getState()
				.setSession({ id: "1", email: "a@b.com" }, "access-token");
		});

		act(() => result.current.mutate());
		releaseTokenRead();

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(mockRefreshSession).not.toHaveBeenCalled();
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
		unmount();
	});
});
