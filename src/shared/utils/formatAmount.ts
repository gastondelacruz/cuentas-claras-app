export function formatCurrency(amount: number, currency = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(Math.abs(amount))
    .replace(/\s+/g, '');
}

export function formatAmount(amount: number, currency = 'ARS'): string {
  const sign = amount >= 0 ? '+' : '-';

  return `${sign}${formatCurrency(amount, currency)}`;
}
