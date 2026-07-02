import type { PersonalTransactionType } from '../types';
import { PERSONAL_CATEGORY_CONFIGS } from './personalTransactionCategoryVisuals';

// Category names are derived from the visuals catalog so the list of selectable
// categories, their colors, and their icons can never drift apart.
export const PERSONAL_EXPENSE_CATEGORIES = PERSONAL_CATEGORY_CONFIGS.expense.map(
  (config) => config.name,
);

export const PERSONAL_INCOME_CATEGORIES = PERSONAL_CATEGORY_CONFIGS.income.map(
  (config) => config.name,
);

export function getPersonalTransactionCategories(type: PersonalTransactionType) {
  return type === 'income' ? PERSONAL_INCOME_CATEGORIES : PERSONAL_EXPENSE_CATEGORIES;
}
