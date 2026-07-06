import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { PropsWithChildren } from "react";

import { useAuthStore } from "../../../shared/store/authStore";
import { getGroup } from "../api/groupsApi";
import { useGroupMembers } from "../hooks/useGroupMembers";

jest.mock("../api/groupsApi", () => ({ getGroup: jest.fn() }));

const mockGetGroup = jest.mocked(getGroup);

function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: Infinity } },
	});
}

describe("useGroupMembers", () => {
	let testClient: QueryClient;

	function Wrapper({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={testClient}>{children}</QueryClientProvider>
		);
	}

	beforeEach(() => {
		jest.clearAllMocks();
		useAuthStore
			.getState()
			.setSession({ id: "current-user", email: "you@example.com" }, "token");
		useAuthStore
			.getState()
			.setEmailVerification({ verified: true, verifiedAt: null });
		testClient = createTestQueryClient();
	});

	afterEach(() => {
		act(() => {
			useAuthStore.getState().clearSession();
		});
		testClient.clear();
	});

	it("returns members from the API group detail", async () => {
		mockGetGroup.mockResolvedValueOnce({
			id: "g1",
			members: [
				{
					id: "m1",
					displayName: "Gaston",
					email: "gaston@example.com",
					isCurrentUser: true,
				},
				{
					id: "m2",
					displayName: "Ana",
					email: "ana@example.com",
					isCurrentUser: false,
				},
			],
		});

		const { result } = renderHook(() => useGroupMembers("g1"), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current).toHaveLength(2));

		expect(result.current[0]).toMatchObject({
			id: "m1",
			name: "Gaston",
			isCurrentUser: true,
		});
		expect(result.current[1]).toMatchObject({
			id: "m2",
			name: "Ana",
			isCurrentUser: false,
		});
	});

	it("does not fetch members when email is not verified", () => {
		useAuthStore
			.getState()
			.setEmailVerification({ verified: false, verifiedAt: null });

		const { result } = renderHook(() => useGroupMembers("g1"), {
			wrapper: Wrapper,
		});

		expect(result.current).toEqual([]);
		expect(mockGetGroup).not.toHaveBeenCalled();
	});

	it("returns empty array when groupId is undefined", () => {
		const { result } = renderHook(() => useGroupMembers(undefined), {
			wrapper: Wrapper,
		});

		expect(result.current).toEqual([]);
		expect(mockGetGroup).not.toHaveBeenCalled();
	});

	it("excludes removed members", async () => {
		mockGetGroup.mockResolvedValueOnce({
			id: "g1",
			members: [
				{ id: "m1", displayName: "Gaston", isCurrentUser: true },
				{
					id: "m2",
					displayName: "Beto",
					isCurrentUser: false,
					removedAt: "2026-01-01T00:00:00.000Z",
				},
			],
		});

		const { result } = renderHook(() => useGroupMembers("g1"), {
			wrapper: Wrapper,
		});

		await waitFor(() => expect(result.current).toHaveLength(1));

		expect(result.current[0]?.name).toBe("Gaston");
	});
});
