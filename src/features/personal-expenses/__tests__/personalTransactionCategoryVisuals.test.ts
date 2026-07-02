import { MoreHorizontal } from 'lucide-react-native';

import {
  PERSONAL_CATEGORY_CONFIGS,
  PERSONAL_CATEGORY_FALLBACK_VISUAL,
  getPersonalCategoryVisual,
} from '../constants/personalTransactionCategoryVisuals';
import {
  PERSONAL_INCOME_CATEGORIES,
} from '../constants/personalTransactionCategories';

describe('personalTransactionCategoryVisuals', () => {
  it('assigns a distinct color to every expense category', () => {
    const colors = PERSONAL_CATEGORY_CONFIGS.expense.map((config) => config.color);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('assigns a distinct color to every income category', () => {
    const colors = PERSONAL_CATEGORY_CONFIGS.income.map((config) => config.color);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('does not include the "Otros" income category', () => {
    const incomeNames = PERSONAL_CATEGORY_CONFIGS.income.map((config) => config.name);
    expect(incomeNames).not.toContain('Otros');
    expect(PERSONAL_INCOME_CATEGORIES).not.toContain('Otros');
  });

  it('returns the configured visual for a known category', () => {
    const salud = getPersonalCategoryVisual('expense', 'Salud');
    expect(salud.color).toBe('#ef4444');
  });

  it('falls back to a neutral visual for an unknown backend category', () => {
    const unknown = getPersonalCategoryVisual('expense', 'Criptomonedas');
    expect(unknown).toEqual(PERSONAL_CATEGORY_FALLBACK_VISUAL);
    expect(unknown.Icon).toBe(MoreHorizontal);
  });

  it('resolves the same category name differently per transaction type', () => {
    // "Regalos" exists in both catalogs but with different colors/icons.
    const expenseGift = getPersonalCategoryVisual('expense', 'Regalos');
    const incomeGift = getPersonalCategoryVisual('income', 'Regalos');
    expect(expenseGift.color).not.toBe(incomeGift.color);
  });
});
