export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(Math.abs(amount))
    .replace(/\s+/g, '');
}

export function formatAmount(amount: number): string {
  const sign = amount >= 0 ? '+' : '-';

  return `${sign}${formatCurrency(amount)}`;
}
