import { formatAmountForInput } from '../utils/formatAmountForInput';

describe('formatAmountForInput', () => {
  it('keeps integers without decimals and groups thousands', () => {
    expect(formatAmountForInput(184)).toBe('184');
    expect(formatAmountForInput(1000)).toBe('1.000');
  });

  it('formats non-integers with two decimals and an es-AR comma', () => {
    expect(formatAmountForInput(1500.5)).toBe('1.500,50');
    expect(formatAmountForInput(28.5)).toBe('28,50');
    expect(formatAmountForInput(7.12)).toBe('7,12');
  });

  it('returns an empty string for non-positive or invalid amounts', () => {
    expect(formatAmountForInput(0)).toBe('');
    expect(formatAmountForInput(-10)).toBe('');
    expect(formatAmountForInput(Number.NaN)).toBe('');
  });
});
