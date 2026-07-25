import type { PersonalTransactionType } from "../types";
import type { PersonalCategoryConfig } from "./personalTransactionCategoryVisuals";

const VISIBLE_CATEGORY_COUNT = 7;
const catalogs: Record<PersonalTransactionType, PersonalCategoryConfig[]> = {
	expense: [],
	income: [],
};
type CategoryState = {
	names: string[];
	recency: string[];
	selected?: string;
};

const states: Record<PersonalTransactionType, CategoryState> = {
	expense: { names: [], recency: [] },
	income: { names: [], recency: [] },
};

function ensureState(type: PersonalTransactionType) {
	const state = states[type];
	if (state.names.length === 0 && catalogs[type].length > 0) {
		state.names = catalogs[type]
			.slice(0, VISIBLE_CATEGORY_COUNT)
			.map(({ name }) => name);
		state.recency = [...state.names];
	}
	return state;
}

export function registerPersonalCategory(
	type: PersonalTransactionType,
	category: PersonalCategoryConfig,
) {
	if (!catalogs[type].some(({ name }) => name === category.name)) {
		catalogs[type].push(category);
	}
}

export function setPersonalCategoryCatalog(
	type: PersonalTransactionType,
	categories: PersonalCategoryConfig[],
) {
	const currentCatalog = catalogs[type];
	const unchanged =
		currentCatalog.length === categories.length &&
		currentCatalog.every(
			(current, index) =>
				current.name === categories[index]?.name &&
				current.color === categories[index]?.color &&
				current.Icon === categories[index]?.Icon,
		);

	if (unchanged) return;

	catalogs[type] = categories;
	const categoryNames = new Set(categories.map(({ name }) => name));
	const currentState = states[type];
	states[type] = {
		names: currentState.names.filter((name) => categoryNames.has(name)),
		recency: currentState.recency.filter((name) => categoryNames.has(name)),
		selected:
			currentState.selected && categoryNames.has(currentState.selected)
				? currentState.selected
				: undefined,
	};
}

export function getVisiblePersonalCategoryConfigs(
	type: PersonalTransactionType,
) {
	const state = ensureState(type);
	return state.names
		.map((name) => catalogs[type].find((item) => item.name === name))
		.filter((item): item is PersonalCategoryConfig => item !== undefined);
}

export function getSelectedPersonalCategory(type: PersonalTransactionType) {
	return ensureState(type).selected;
}

export function selectPersonalCategory(
	type: PersonalTransactionType,
	name: string,
) {
	const result = promotePersonalCategory(type, name);
	ensureState(type).selected = name;
	return result;
}

export function promotePersonalCategory(
	type: PersonalTransactionType,
	name: string,
) {
	const state = ensureState(type);
	const category = catalogs[type].find((item) => item.name === name);
	if (!category) {
		throw new Error(`Unknown personal category: ${name}`);
	}

	state.recency = [...state.recency.filter((item) => item !== name), name];
	if (!state.names.includes(name)) {
		const evicted = state.recency.find((item) => state.names.includes(item));
		state.names = [...state.names.filter((item) => item !== evicted), name];
	}
	return {
		selected: category,
		visible: getVisiblePersonalCategoryConfigs(type),
	};
}

export function resetPersonalCategoryVisibility() {
	for (const type of ["expense", "income"] as const) {
		states[type] = { names: [], recency: [], selected: undefined };
	}
}
