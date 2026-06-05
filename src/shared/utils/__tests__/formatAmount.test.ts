import { formatAmount } from '../formatAmount';

describe('formatAmount', () => {
  it('formats positive amounts with an explicit plus sign', () => {
    expect(formatAmount(1420.5)).toBe('+$1.420,50');
  });

  it('formats negative amounts with an explicit minus sign', () => {
    expect(formatAmount(-342.15)).toBe('-$342,15');
  });

  it('keeps two decimal digits for whole amounts', () => {
    expect(formatAmount(-85)).toBe('-$85,00');
  });
});
