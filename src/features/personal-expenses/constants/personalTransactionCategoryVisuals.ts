import {
	Banknote,
	BookOpen,
	Building2,
	Bus,
	Car,
	Coffee,
	CreditCard,
	Gift,
	Heart,
	MoreHorizontal,
	Shirt,
	ShoppingBasket,
	TrendingUp,
	Tv,
	Wrench,
	type LucideIcon,
} from "lucide-react-native";

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

// Colors are intentionally all-distinct within each type so the donut chart and
// the category grid never render two categories with the same color.
const EXPENSE_CATEGORY_CONFIGS: PersonalCategoryConfig[] = [
	{ name: "Salud", color: "#ef4444", Icon: Heart },
	{ name: "Ocio", color: "#22c55e", Icon: Tv },
	{ name: "Departament", color: "#3b82f6", Icon: Building2 },
	{ name: "Café", color: "#f59e0b", Icon: Coffee },
	{ name: "Educación", color: "#ec4899", Icon: BookOpen },
	{ name: "Regalos", color: "#8b5cf6", Icon: Gift },
	{ name: "Transporte", color: "#06b6d4", Icon: Bus },
	{ name: "Otros", color: "#64748b", Icon: MoreHorizontal },
	{ name: "Servicio", color: "#84cc16", Icon: Wrench },
	{ name: "Tarjetas", color: "#f97316", Icon: CreditCard },
	{ name: "Auto", color: "#6366f1", Icon: Car },
	{ name: "Ropa", color: "#d946ef", Icon: Shirt },
	{ name: "Alimentación", color: "#14b8a6", Icon: ShoppingBasket },
];

const INCOME_CATEGORY_CONFIGS: PersonalCategoryConfig[] = [
	{ name: "Salario", color: "#22c55e", Icon: Banknote },
	{ name: "Regalos", color: "#f59e0b", Icon: Gift },
	{ name: "Intereses", color: "#3b82f6", Icon: TrendingUp },
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
): Omit<PersonalCategoryConfig, "name"> {
	const config = PERSONAL_CATEGORY_CONFIGS[type].find(
		(item) => item.name === categoryName,
	);

	return config
		? { color: config.color, Icon: config.Icon }
		: PERSONAL_CATEGORY_FALLBACK_VISUAL;
}
