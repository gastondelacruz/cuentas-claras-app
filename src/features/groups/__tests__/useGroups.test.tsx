import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { useAuthStore } from "../../../shared/store/authStore";
import { getGroups } from "../api/groupsApi";
import { useGroups } from "../hooks/useGroups";

jest.mock("../api/groupsApi", () => ({ getGroups: jest.fn() }));

const mockedGetGroups = jest.mocked(getGroups);

describe("useGroups", () => {
	let testClient: QueryClient;
	function Wrapper({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={testClient}>{children}</QueryClientProvider>
		);
	}

	beforeEach(() => {
		jest.clearAllMocks();
		useAuthStore.getState().clearSession();
		testClient = new QueryClient({
			defaultOptions: { queries: { retry: false, gcTime: Infinity } },
		});
		mockedGetGroups.mockResolvedValue({ data: [] });
	});

	afterEach(() => testClient.clear());

	it("does not fetch groups while the authenticated user is not email verified", () => {
		useAuthStore
			.getState()
			.setSession(
				{ id: "u1", email: "unverified@example.com" },
				`header.${btoa(JSON.stringify({ emailVerified: false }))}.signature`,
			);

		const { result } = renderHook(() => useGroups(), { wrapper: Wrapper });

		expect(result.current.fetchStatus).toBe("idle");
		expect(result.current.data).toBeUndefined();
		expect(mockedGetGroups).not.toHaveBeenCalled();
	});

	it("does not expose cached groups while the authenticated user is not email verified", () => {
		testClient.setQueryData(["groups"], {
			data: [{ id: "g1", name: "Cached group" }],
		});
		useAuthStore
			.getState()
			.setSession(
				{ id: "u1", email: "unverified@example.com" },
				`header.${btoa(JSON.stringify({ emailVerified: false }))}.signature`,
			);

		const { result } = renderHook(() => useGroups(), { wrapper: Wrapper });

		expect(result.current.data).toBeUndefined();
		expect(mockedGetGroups).not.toHaveBeenCalled();
	});
});
