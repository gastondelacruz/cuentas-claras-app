import type { PersonalTransactionType } from '../types';

export const PERSONAL_EXPENSE_CATEGORIES = [
  'Salud',
  'Ocio',
  'Departament',
  'Café',
  'Educación',
  'Regalos',
  'Alimentación',
  'Más',
] as const;

export const PERSONAL_INCOME_CATEGORIES = [
  'Salario',
  'Regalos',
  'Intereses',
  'Otros',
] as const;

export function getPersonalTransactionCategories(type: PersonalTransactionType) {
  return type === 'income' ? PERSONAL_INCOME_CATEGORIES : PERSONAL_EXPENSE_CATEGORIES;
}
