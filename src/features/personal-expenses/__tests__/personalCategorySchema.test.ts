import {
	createPersonalCategorySchema,
	personalCategorySchema,
	personalCategoryUpdateSchema,
} from "../schemas/personalCategorySchema";

const allCreateIcons = [
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
] as const;

test("accepts the Swagger response and create contracts", () => {
	const category = {
		id: "cat-1",
		name: "Salud",
		type: "expense" as const,
		icon: "Heart" as const,
		color: "#A1b2C3",
		isDefault: true,
	};
	expect(personalCategorySchema.parse(category)).toEqual(category);
	for (const icon of allCreateIcons) {
		expect(
			createPersonalCategorySchema.parse({
				name: "Viajes",
				type: "income",
				icon,
				color: "#22c55e",
			}),
		).toMatchObject({ icon });
	}
	expect(
		personalCategorySchema.parse({ ...category, icon: "PawPrint" }),
	).toMatchObject({ icon: "PawPrint" });
});

test("validates six-digit hex colors and update inputs", () => {
	expect(() =>
		createPersonalCategorySchema.parse({
			name: "Viajes",
			type: "expense",
			icon: "Plane",
			color: "green",
		}),
	).toThrow();
	expect(
		personalCategoryUpdateSchema.parse({ icon: "Baby", color: "#abcdef" }),
	).toEqual({ icon: "Baby", color: "#abcdef" });
});

test("rejects frontend-only icon keys", () => {
	expect(() =>
		createPersonalCategorySchema.parse({
			name: "Viajes",
			type: "expense",
			icon: "plane",
			color: "#22c55e",
		}),
	).toThrow();
});
