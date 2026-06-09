/**
 * Masks raw keyboard input into an es-AR currency string.
 * Thousands are grouped with dots and decimals are separated by a comma,
 * e.g. "1234567" -> "1.234.567" and "1234,5" -> "1.234,5".
 * Decimal input accepts either comma or dot because Android keyboards can emit
 * a dot for decimal-pad. The display is normalized back to comma.
 */
export function maskAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^\d,.]/g, '');
  const separatorIndex = getDecimalSeparatorIndex(cleaned);

  if (separatorIndex === -1) {
    return groupInteger(normalizeInteger(cleaned.replace(/\D/g, ''), false));
  }

  const integerDigits = normalizeInteger(cleaned.slice(0, separatorIndex).replace(/\D/g, ''), true);
  const decimalDigits = cleaned.slice(separatorIndex + 1).replace(/\D/g, '').slice(0, 2);

  return `${groupInteger(integerDigits)},${decimalDigits}`;
}

function getDecimalSeparatorIndex(cleaned: string): number {
  const commaIndex = cleaned.indexOf(',');

  if (commaIndex !== -1) {
    return commaIndex;
  }

  const dotIndexes = [...cleaned.matchAll(/\./g)].map((match) => match.index ?? -1);

  if (dotIndexes.length !== 1) {
    return -1;
  }

  const dotIndex = dotIndexes[0];
  const decimalsAfterDot = cleaned.slice(dotIndex + 1).replace(/\D/g, '').length;

  // Treat one/two digits after a single dot as decimal input (12.5 / 12.50).
  // Three or more digits are more likely a thousands separator paste (1.000).
  return decimalsAfterDot > 0 && decimalsAfterDot <= 2 ? dotIndex : -1;
}

function normalizeInteger(digits: string, hasDecimalSeparator: boolean): string {
  const stripped = digits.replace(/^0+(?=\d)/, '');

  if (stripped === '') {
    return hasDecimalSeparator ? '0' : '';
  }

  return stripped;
}

function groupInteger(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
