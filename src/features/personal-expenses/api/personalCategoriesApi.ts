import { client } from "../../../shared/api/client";
import { parseOrThrow } from "../../../shared/api/errors";
import {
	createPersonalCategorySchema,
	personalCategoriesResponseSchema,
	personalCategorySchema,
	type CreatePersonalCategoryInput,
} from "../schemas/personalCategorySchema";

export async function getPersonalCategories() {
	const response = await client.get("/me/categories");
	return parseOrThrow(personalCategoriesResponseSchema, response.data.data);
}

export async function createPersonalCategory(
	input: CreatePersonalCategoryInput,
) {
	const payload = parseOrThrow(createPersonalCategorySchema, input);
	const response = await client.post("/me/categories", payload);
	return parseOrThrow(personalCategorySchema, response.data.data);
}
