import { maskAmountInput } from './maskAmountInput';

/**
 * Formats a stored numeric amount into the masked es-AR string expected by the
 * amount input, so an existing expense can be refilled into the form.
 * Integers stay without decimals ("184"); non-integers keep two decimals
 * ("1500.5" -> "1.500,50"). Feeding the value through `maskAmountInput` keeps a
 * single source of truth for the thousands/decimal formatting rules.
 */
export function formatAmountForInput(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    return '';
  }

  const raw = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

  return maskAmountInput(raw);
}
