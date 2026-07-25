import { MoreHorizontal } from "lucide-react-native";

import {
	PERSONAL_CATEGORY_CONFIGS,
	PERSONAL_CATEGORY_FALLBACK_VISUAL,
	PERSONAL_CATEGORY_ICON_COMPONENTS,
	getPersonalCategoryVisual,
} from "../constants/personalTransactionCategoryVisuals";
import { PERSONAL_INCOME_CATEGORIES } from "../constants/personalTransactionCategories";

describe("personalTransactionCategoryVisuals", () => {
	it("maps every Swagger response icon, including legacy PawPrint", () => {
		expect(Object.keys(PERSONAL_CATEGORY_ICON_COMPONENTS)).toHaveLength(31);
		for (const icon of [
			"Heart",
			"Tv",
			"Building2",
			"Coffee",
			"BookOpen",
			"Gift",
			"Bus",
			"MoreHorizontal",
			"Wrench",
			"CreditCard",
			"Car",
			"Shirt",
			"ShoppingBasket",
			"Banknote",
			"TrendingUp",
			"BriefcaseBusiness",
			"Dumbbell",
			"House",
			"Landmark",
			"Laptop",
			"Plane",
			"WalletCards",
			"CardSim",
			"Utensils",
			"ShoppingCart",
			"Gamepad2",
			"GraduationCap",
			"PiggyBank",
			"Stethoscope",
			"Baby",
			"PawPrint",
		]) {
			expect(
				PERSONAL_CATEGORY_ICON_COMPONENTS[
					icon as keyof typeof PERSONAL_CATEGORY_ICON_COMPONENTS
				],
			).toBeDefined();
		}
	});

	it("matches the backend-supported expense category catalog in order", () => {
		expect(
			PERSONAL_CATEGORY_CONFIGS.expense.map((config) => config.name),
		).toEqual([
			"Salud",
			"Ocio",
			"Departamento",
			"Café",
			"Educación",
			"Regalos",
			"Alimentación",
			"Transporte",
			"Otros",
			"Servicio",
			"Tarjetas",
			"Auto",
			"Ropa",
			"Mascotas",
			"Viajes",
			"Deporte",
			"Hogar",
		]);
	});

	it("assigns a distinct color to every expense category", () => {
		const colors = PERSONAL_CATEGORY_CONFIGS.expense.map(
			(config) => config.color,
		);
		expect(new Set(colors).size).toBe(colors.length);
	});

	it("assigns a distinct color to every income category", () => {
		const colors = PERSONAL_CATEGORY_CONFIGS.income.map(
			(config) => config.color,
		);
		expect(new Set(colors).size).toBe(colors.length);
	});

	it('does not include the "Otros" income category', () => {
		const incomeNames = PERSONAL_CATEGORY_CONFIGS.income.map(
			(config) => config.name,
		);
		expect(incomeNames).not.toContain("Otros");
		expect(PERSONAL_INCOME_CATEGORIES).not.toContain("Otros");
	});

	it("returns the configured visual for a known category", () => {
		const salud = getPersonalCategoryVisual("expense", "Salud");
		expect(salud.color).toBe("#ef4444");
	});

	it("uses the backend icon for a default category absent from the local catalog", () => {
		const visual = getPersonalCategoryVisual(
			"expense",
			"Backend Default",
			{
				id: "default-backend",
				name: "Backend Default",
				type: "expense",
				icon: "Car",
				isDefault: true,
			},
			[
				{
					id: "backend-first",
					name: "Backend First",
					type: "expense",
					icon: "Heart",
					color: "#111111",
					isDefault: true,
				},
				{
					id: "default-backend",
					name: "Backend Default",
					type: "expense",
					icon: "Car",
					color: "#ABCDEF",
					isDefault: true,
				},
			],
		);

		expect(visual.color).toBe("#22c55e");
		expect(visual.Icon).toBe(PERSONAL_CATEGORY_ICON_COMPONENTS.Car);
	});

	it("uses the backend icon for a custom category with a mismatched local name", () => {
		const visual = getPersonalCategoryVisual(
			"expense",
			"Custom Backend",
			{
				id: "custom-backend",
				name: "Custom Backend",
				type: "expense",
				icon: "Gift",
				isDefault: false,
			},
			[
				{
					id: "backend-first",
					name: "Backend First",
					type: "expense",
					icon: "Heart",
					color: "#111111",
					isDefault: true,
				},
				{
					id: "custom-backend",
					name: "Custom Backend",
					type: "expense",
					icon: "Gift",
					color: "#123456",
					isDefault: false,
				},
			],
		);

		expect(visual.color).toBe("#22c55e");
		expect(visual.Icon).toBe(PERSONAL_CATEGORY_ICON_COMPONENTS.Gift);
	});

	it("falls back to a neutral visual for an unknown backend category", () => {
		const unknown = getPersonalCategoryVisual("expense", "Criptomonedas");
		expect(unknown).toEqual(PERSONAL_CATEGORY_FALLBACK_VISUAL);
		expect(unknown.Icon).toBe(MoreHorizontal);
	});

	it("resolves the same category name differently per transaction type", () => {
		// "Regalos" exists in both catalogs but with different colors/icons.
		const expenseGift = getPersonalCategoryVisual("expense", "Regalos");
		const incomeGift = getPersonalCategoryVisual("income", "Regalos");
		expect(expenseGift.color).not.toBe(incomeGift.color);
	});

	it("returns configured visuals for the added backend expense categories", () => {
		for (const category of [
			"Transporte",
			"Otros",
			"Servicio",
			"Tarjetas",
			"Auto",
			"Ropa",
		]) {
			expect(getPersonalCategoryVisual("expense", category)).not.toEqual(
				PERSONAL_CATEGORY_FALLBACK_VISUAL,
			);
		}
	});
});
