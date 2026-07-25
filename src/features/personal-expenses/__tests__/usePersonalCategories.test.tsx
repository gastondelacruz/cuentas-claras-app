import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";

import { getPersonalCategories } from "../api/personalCategoriesApi";
import { usePersonalCategories } from "../hooks/usePersonalCategories";

jest.mock("../api/personalCategoriesApi", () => ({
	getPersonalCategories: jest.fn(),
	createPersonalCategory: jest.fn(),
}));
jest.mock("../../../shared/hooks/useProtectedDataEnabled", () => ({
	useProtectedDataEnabled: () => true,
}));

const queryClient = new QueryClient({
	defaultOptions: { queries: { gcTime: Infinity } },
});
const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

test("loads categories through the protected React Query hook", async () => {
	jest
		.mocked(getPersonalCategories)
		.mockResolvedValueOnce([
			{
				id: "1",
				name: "Salud",
				type: "expense",
				icon: "Heart",
				color: "#22c55e",
				isDefault: true,
			},
		]);

	const { result } = renderHook(() => usePersonalCategories(), { wrapper });
	await waitFor(() => expect(result.current.isLoading).toBe(false));

	expect(result.current.categories[0].name).toBe("Salud");
});
