import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";

import { deletePersonalTransaction } from "../../api/personalTransactionsApi";
import { useDeletePersonalTransaction } from "../useDeletePersonalTransaction";

jest.mock("../../api/personalTransactionsApi", () => ({
	deletePersonalTransaction: jest.fn(),
}));

const mockDelete = jest.mocked(deletePersonalTransaction);

describe("useDeletePersonalTransaction", () => {
	it("deletes and invalidates every personal transaction query", async () => {
		const client = new QueryClient({
			defaultOptions: {
				mutations: { retry: false, gcTime: 0 },
				queries: { retry: false, gcTime: 0 },
			},
		});
		mockDelete.mockResolvedValueOnce(undefined);
		const invalidate = jest.spyOn(client, "invalidateQueries");
		const wrapper = ({ children }: PropsWithChildren) => (
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		);

		const { result, unmount } = renderHook(
			() => useDeletePersonalTransaction(),
			{ wrapper },
		);

		try {
			await act(async () => {
				await result.current.mutateAsync("ptx-1");
			});

			expect(mockDelete.mock.calls[0]?.[0]).toBe("ptx-1");
			expect(invalidate).toHaveBeenCalledWith({
				queryKey: ["personal-transactions"],
			});
		} finally {
			unmount();
			await client.cancelQueries();
			client.clear();
			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});
		}
	});
});
