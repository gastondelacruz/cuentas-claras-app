import { maskAmountInput } from '../utils/maskAmountInput';

describe('maskAmountInput', () => {
  it('returns an empty string for empty input', () => {
    expect(maskAmountInput('')).toBe('');
  });

  it('groups thousands with dots', () => {
    expect(maskAmountInput('100')).toBe('100');
    expect(maskAmountInput('1000')).toBe('1.000');
    expect(maskAmountInput('10000')).toBe('10.000');
    expect(maskAmountInput('1234567')).toBe('1.234.567');
  });

  it('keeps a single decimal comma with up to two digits', () => {
    expect(maskAmountInput('1234,5')).toBe('1.234,5');
    expect(maskAmountInput('1234,567')).toBe('1.234,56');
    expect(maskAmountInput('1000,00')).toBe('1.000,00');
  });

  it('normalizes a single decimal dot from Android decimal keyboards', () => {
    expect(maskAmountInput('12.5')).toBe('12,5');
    expect(maskAmountInput('12.50')).toBe('12,50');
  });

  it('strips special characters and stray dots', () => {
    expect(maskAmountInput('1a2b3c')).toBe('123');
    expect(maskAmountInput('1.000.000')).toBe('1.000.000');
    expect(maskAmountInput('$1.234,50')).toBe('1.234,50');
  });

  it('normalizes leading zeros', () => {
    expect(maskAmountInput('007')).toBe('7');
    expect(maskAmountInput('0')).toBe('0');
    expect(maskAmountInput(',')).toBe('0,');
    expect(maskAmountInput(',5')).toBe('0,5');
  });
});
