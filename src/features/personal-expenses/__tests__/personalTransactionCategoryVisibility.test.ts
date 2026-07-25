import { PERSONAL_CATEGORY_CONFIGS } from "../constants/personalTransactionCategoryVisuals";
import {
	getSelectedPersonalCategory,
	getVisiblePersonalCategoryConfigs,
	promotePersonalCategory,
	resetPersonalCategoryVisibility,
	selectPersonalCategory,
	setPersonalCategoryCatalog,
} from "../constants/personalTransactionCategoryVisibility";

describe("personal transaction category visibility", () => {
	beforeEach(() => {
		resetPersonalCategoryVisibility();
		setPersonalCategoryCatalog("expense", PERSONAL_CATEGORY_CONFIGS.expense);
		setPersonalCategoryCatalog("income", PERSONAL_CATEGORY_CONFIGS.income);
	});

	it("keeps exactly seven visible categories per transaction type", () => {
		expect(getVisiblePersonalCategoryConfigs("expense")).toHaveLength(7);
		expect(getVisiblePersonalCategoryConfigs("income")).toHaveLength(7);
	});

	it("promotes a hidden category and evicts the least recently used one", () => {
		const initial = getVisiblePersonalCategoryConfigs("expense");
		const promoted = promotePersonalCategory("expense", "Transporte");

		expect(promoted.selected.name).toBe("Transporte");
		expect(promoted.visible).toHaveLength(7);
		expect(promoted.visible.map(({ name }) => name)).toEqual([
			...initial.slice(1).map(({ name }) => name),
			"Transporte",
		]);
	});

	it("refreshes recency without changing the visible set", () => {
		const initial = getVisiblePersonalCategoryConfigs("expense");
		const selected = promotePersonalCategory("expense", initial[0].name);

		expect(selected.visible.map(({ name }) => name)).toEqual(
			initial.map(({ name }) => name),
		);
	});

	it("records the selected category separately for each transaction type", () => {
		selectPersonalCategory("expense", "Transporte");
		selectPersonalCategory("income", "Intereses");

		expect(getSelectedPersonalCategory("expense")).toBe("Transporte");
		expect(getSelectedPersonalCategory("income")).toBe("Intereses");
	});

	it("keeps expense and income visibility separate", () => {
		promotePersonalCategory("income", "Intereses");

		expect(getVisiblePersonalCategoryConfigs("expense")).toHaveLength(7);
		expect(
			getVisiblePersonalCategoryConfigs("income").map(({ name }) => name),
		).toHaveLength(7);
	});
});
