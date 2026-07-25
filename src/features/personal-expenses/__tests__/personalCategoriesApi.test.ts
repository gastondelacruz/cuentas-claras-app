import { client } from "../../../shared/api/client";
import {
	createPersonalCategory,
	getPersonalCategories,
} from "../api/personalCategoriesApi";

jest.mock("../../../shared/api/client", () => ({
	client: { get: jest.fn(), post: jest.fn() },
}));

const mockGet = jest.mocked(client.get);
const mockPost = jest.mocked(client.post);

const category = {
	id: "cat-1",
	name: "Salud",
	type: "expense" as const,
	icon: "Heart" as const,
	color: "#ef4444",
	isDefault: true,
};

describe("personal categories API", () => {
	beforeEach(() => jest.clearAllMocks());

	it("gets the backend category list", async () => {
		mockGet.mockResolvedValueOnce({ data: { data: [category] } });

		await expect(getPersonalCategories()).resolves.toEqual([category]);
		expect(mockGet).toHaveBeenCalledWith("/me/categories");
	});

	it("posts the exact backend create payload", async () => {
		mockPost.mockResolvedValueOnce({ data: { data: category } });
		const input = {
			name: "Salud",
			type: "expense" as const,
			icon: "Heart" as const,
			color: "#ef4444",
		};

		await expect(createPersonalCategory(input)).resolves.toEqual(category);
		expect(mockPost).toHaveBeenCalledWith("/me/categories", input);
	});

	it("rejects unsupported response icons", async () => {
		mockGet.mockResolvedValueOnce({
			data: { data: [{ ...category, icon: "heart-pulse" }] },
		});

		await expect(getPersonalCategories()).rejects.toThrow(
			"API response does not match contract",
		);
	});
});
