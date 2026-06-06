export function formatAmount(amount: number): string {
  const sign = amount >= 0 ? '+' : '-';
  const formattedAmount = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(Math.abs(amount))
    .replace(/\s+/g, '');

  return `${sign}${formattedAmount}`;
}
