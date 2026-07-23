import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import { PropsWithChildren } from "react";

import { useLogout } from "../useLogout";
import { logoutUser } from "../../api/authApi";
import { queryClient } from "../../../../shared/api/queryClient";
import { useAuthStore } from "../../../../shared/store/authStore";
import {
	getBiometricEnabled,
	getRefreshToken,
	getUserMetadata,
	setBiometricEnabled,
	setRefreshToken,
	setUserMetadata,
} from "../../../../shared/api/tokenStorage";

jest.mock("../../api/authApi", () => ({
	logoutUser: jest.fn(),
}));

const mockLogoutUser = jest.mocked(logoutUser);

describe("useLogout", () => {
	function Wrapper({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	}

	beforeEach(() => {
		jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] });
		jest.clearAllMocks();
		queryClient.clear();
		useAuthStore.getState().setSession({ id: "1", email: "a@b.com" }, "tok");
	});

	afterEach(() => {
		queryClient.clear();
		jest.useRealTimers();
	});

	it("calls POST /auth/logout, clears the session, and resets the query cache", async () => {
		mockLogoutUser.mockResolvedValueOnce(undefined);
		const clearSpy = jest.spyOn(queryClient, "clear");

		const { result, unmount } = renderHook(() => useLogout(), {
			wrapper: Wrapper,
		});

		result.current.mutate();

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(mockLogoutUser).toHaveBeenCalledTimes(1);
		expect(useAuthStore.getState()).toMatchObject({
			user: null,
			accessToken: null,
			isAuthenticated: false,
		});
		expect(clearSpy).toHaveBeenCalledTimes(1);

		clearSpy.mockRestore();
		unmount();
	});

	it("passes the stored refresh token to logoutUser before cleanup", async () => {
		await setRefreshToken("refresh-token");
		let tokenReadByLogout: string | null = null;
		mockLogoutUser.mockImplementation(async () => {
			tokenReadByLogout = await getRefreshToken();
		});

		const { result, unmount } = renderHook(() => useLogout(), {
			wrapper: Wrapper,
		});
		result.current.mutate();
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(tokenReadByLogout).toBe("refresh-token");
		unmount();
	});

	it("clears refresh token, biometric preference, and cached user metadata on explicit logout", async () => {
		await setRefreshToken("refresh-token");
		await setBiometricEnabled(true);
		await setUserMetadata({ id: "1", name: "Ana", email: "a@b.com" });
		mockLogoutUser.mockResolvedValueOnce(undefined);

		const { result, unmount } = renderHook(() => useLogout(), {
			wrapper: Wrapper,
		});
		result.current.mutate();
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		await expect(getRefreshToken()).resolves.toBeNull();
		await expect(getBiometricEnabled()).resolves.toBe(false);
		await expect(getUserMetadata()).resolves.toBeNull();
		unmount();
	});

	it("still clears the session and cache when the logout request fails", async () => {
		mockLogoutUser.mockRejectedValueOnce(new Error("Network error"));
		const clearSpy = jest.spyOn(queryClient, "clear");

		const { result, unmount } = renderHook(() => useLogout(), {
			wrapper: Wrapper,
		});

		result.current.mutate();

		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(useAuthStore.getState()).toMatchObject({
			user: null,
			accessToken: null,
			isAuthenticated: false,
		});
		expect(clearSpy).toHaveBeenCalledTimes(1);

		clearSpy.mockRestore();
		unmount();
	});
});
