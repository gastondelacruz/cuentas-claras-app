import {
	Baby,
	Banknote,
	BookOpen,
	Building2,
	Bus,
	CardSim,
	Car,
	Coffee,
	CreditCard,
	Dumbbell,
	Gamepad2,
	Gift,
	GraduationCap,
	Heart,
	BriefcaseBusiness,
	House,
	Landmark,
	Laptop,
	PiggyBank,
	Plane,
	PawPrint,
	MoreHorizontal,
	Shirt,
	ShoppingBasket,
	ShoppingCart,
	Stethoscope,
	TrendingUp,
	Utensils,
	WalletCards,
	Tv,
	Wrench,
	type LucideIcon,
} from "lucide-react-native";

import type {
	PersonalCategoryDto,
	PersonalCategoryIcon,
} from "../schemas/personalCategorySchema";

import type { PersonalTransactionType } from "../types";

/**
 * Visual configuration for a single personal-transaction category.
 * This module is the SINGLE SOURCE OF TRUTH for the color + icon of every
 * category. It is consumed by:
 *  - AddPersonalTransactionScreen (category grid)
 *  - PersonalTransactionsScreen (recent list icons)
 *  - usePersonalTransactionsScreen (donut chart segment colors)
 * so the three surfaces can never drift apart again.
 */
export type PersonalCategoryConfig = {
	name: string;
	color: string;
	Icon: LucideIcon;
};

export const PERSONAL_CATEGORY_ICON_COMPONENTS: Record<
	PersonalCategoryIcon,
	LucideIcon
> = {
	Heart,
	Tv,
	Building2,
	Coffee,
	BookOpen,
	Gift,
	Bus,
	MoreHorizontal,
	Wrench,
	CreditCard,
	Car,
	Shirt,
	ShoppingBasket,
	Banknote,
	TrendingUp,
	BriefcaseBusiness,
	Dumbbell,
	House,
	Landmark,
	Laptop,
	Plane,
	WalletCards,
	CardSim,
	Utensils,
	ShoppingCart,
	Gamepad2,
	GraduationCap,
	PiggyBank,
	Stethoscope,
	Baby,
	PawPrint,
};

const CATEGORY_COLORS = [
	"#ef4444",
	"#22c55e",
	"#3b82f6",
	"#f59e0b",
	"#ec4899",
	"#8b5cf6",
	"#14b8a6",
	"#06b6d4",
	"#64748b",
	"#84cc16",
	"#f97316",
	"#6366f1",
	"#d946ef",
	"#a855f7",
	"#0ea5e9",
];

export function personalCategoryToConfig(
	category: PersonalCategoryDto,
	index = 0,
): PersonalCategoryConfig {
	return {
		name: category.name,
		color: category.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length],
		Icon: PERSONAL_CATEGORY_ICON_COMPONENTS[category.icon],
	};
}

// Colors are intentionally all-distinct within each type so the donut chart and
// the category grid never render two categories with the same color.
const EXPENSE_CATEGORY_CONFIGS: PersonalCategoryConfig[] = [
	{ name: "Salud", color: "#ef4444", Icon: Heart },
	{ name: "Ocio", color: "#22c55e", Icon: Tv },
	{ name: "Departamento", color: "#3b82f6", Icon: Building2 },
	{ name: "Café", color: "#f59e0b", Icon: Coffee },
	{ name: "Educación", color: "#ec4899", Icon: BookOpen },
	{ name: "Regalos", color: "#8b5cf6", Icon: Gift },
	{ name: "Alimentación", color: "#14b8a6", Icon: ShoppingBasket },
	{ name: "Transporte", color: "#06b6d4", Icon: Bus },
	{ name: "Otros", color: "#64748b", Icon: MoreHorizontal },
	{ name: "Servicio", color: "#84cc16", Icon: Wrench },
	{ name: "Tarjetas", color: "#f97316", Icon: CreditCard },
	{ name: "Auto", color: "#6366f1", Icon: Car },
	{ name: "Ropa", color: "#d946ef", Icon: Shirt },
	{ name: "Mascotas", color: "#a855f7", Icon: PawPrint },
	{ name: "Viajes", color: "#0ea5e9", Icon: Plane },
	{ name: "Deporte", color: "#f43f5e", Icon: Dumbbell },
	{ name: "Hogar", color: "#475569", Icon: House },
];

const INCOME_CATEGORY_CONFIGS: PersonalCategoryConfig[] = [
	{ name: "Salario", color: "#22c55e", Icon: Banknote },
	{ name: "Regalos", color: "#f59e0b", Icon: Gift },
	{ name: "Intereses", color: "#3b82f6", Icon: TrendingUp },
	{ name: "Freelance", color: "#8b5cf6", Icon: Laptop },
	{ name: "Bonos", color: "#ec4899", Icon: BriefcaseBusiness },
	{ name: "Ventas", color: "#14b8a6", Icon: ShoppingBasket },
	{ name: "Inversiones", color: "#06b6d4", Icon: Landmark },
	{ name: "Propiedades", color: "#f97316", Icon: Building2 },
];

export const PERSONAL_CATEGORY_CONFIGS: Record<
	PersonalTransactionType,
	PersonalCategoryConfig[]
> = {
	expense: EXPENSE_CATEGORY_CONFIGS,
	income: INCOME_CATEGORY_CONFIGS,
};

/** Fallback used when the backend returns a category we don't have a config for. */
export const PERSONAL_CATEGORY_FALLBACK_VISUAL: Omit<
	PersonalCategoryConfig,
	"name"
> = {
	color: "#6b7280",
	Icon: MoreHorizontal,
};

/**
 * Returns the color + icon for a given category name within a transaction type.
 * Falls back to a neutral gray + generic icon for unknown categories so the UI
 * never crashes on backend-defined categories outside our catalog.
 */
export function getPersonalCategoryVisual(
	type: PersonalTransactionType,
	categoryName: string,
	backendCategory?: PersonalCategoryDto,
	backendCategories: PersonalCategoryDto[] = [],
): Omit<PersonalCategoryConfig, "name"> {
	if (backendCategory?.type === type) {
		const categoryIndex = backendCategories
			.filter((category) => category.type === type)
			.findIndex((category) => category.id === backendCategory.id);
		const config = personalCategoryToConfig(
			backendCategory,
			categoryIndex >= 0 ? categoryIndex : 0,
		);

		return {
			color: config.color,
			Icon: config.Icon,
		};
	}

	const config = PERSONAL_CATEGORY_CONFIGS[type].find(
		(item) => item.name === categoryName,
	);

	return config
		? { color: config.color, Icon: config.Icon }
		: PERSONAL_CATEGORY_FALLBACK_VISUAL;
}
