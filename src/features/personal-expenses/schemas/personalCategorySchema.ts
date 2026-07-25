import { z } from "zod";

export const personalCategoryTypeSchema = z.enum(["expense", "income"]);

const personalCategoryCreateIcons = [
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

export const personalCategoryIconSchema = z.enum([
	...personalCategoryCreateIcons,
	"PawPrint",
]);

export const personalCategoryCreateIconSchema = z.enum(
	personalCategoryCreateIcons,
);
export const personalCategoryColorSchema = z
	.string()
	.regex(/^#[0-9A-Fa-f]{6}$/);

export const personalCategorySchema = z.object({
	id: z.string(),
	name: z.string(),
	type: personalCategoryTypeSchema,
	icon: personalCategoryIconSchema,
	color: personalCategoryColorSchema,
	isDefault: z.boolean(),
});

export const personalCategoriesResponseSchema = z.array(personalCategorySchema);
export const createPersonalCategorySchema = z.object({
	name: z.string().min(1),
	type: personalCategoryTypeSchema,
	icon: personalCategoryCreateIconSchema,
	color: personalCategoryColorSchema,
});

export const personalCategoryUpdateSchema = z.object({
	name: z.string().min(1).optional(),
	icon: personalCategoryCreateIconSchema.optional(),
	color: personalCategoryColorSchema.optional(),
});

export type PersonalCategoryDto = Omit<
	z.infer<typeof personalCategorySchema>,
	"color"
> & { color?: string };
export type PersonalCategoryIcon = z.infer<typeof personalCategoryIconSchema>;
export type PersonalCategoryCreateIcon = z.infer<
	typeof personalCategoryCreateIconSchema
>;
export type CreatePersonalCategoryInput = z.infer<
	typeof createPersonalCategorySchema
>;
export type UpdatePersonalCategoryInput = z.infer<
	typeof personalCategoryUpdateSchema
>;
