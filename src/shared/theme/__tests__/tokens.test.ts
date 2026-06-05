import { colors, primary, debt, accent, neutral100, neutral900 } from '../colors';
import { radius } from '../radius';
import { spacing } from '../spacing';
import { fontFamily, fontSize } from '../typography';

const tailwindConfig = require('../../../../tailwind.config');

describe('theme tokens', () => {
  it('exports exact brand token values', () => {
    expect(primary).toBe('#0E7A3A');
    expect(debt).toBe('#DC2626');
    expect(accent).toBe('#F97316');
  });

  it('exports neutral placeholder hex values', () => {
    expect(neutral100).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(neutral900).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('exports typography, spacing, and radius scales', () => {
    expect(fontFamily.sans).toBe('Inter');
    expect(fontSize.sm).toBeLessThan(fontSize.base);
    expect(fontSize.base).toBeLessThan(fontSize.lg);
    expect(fontSize.lg).toBeLessThan(fontSize.xl);
    expect(fontSize.xl).toBeLessThan(fontSize.h1);
    expect(spacing[1]).toBe(4);
    expect(spacing[2]).toBe(8);
    expect(spacing[3]).toBe(12);
    expect(spacing[4]).toBe(16);
    expect(radius.sm).toBeLessThan(radius.md);
    expect(radius.md).toBeLessThan(radius.lg);
    expect(radius.full).toBeDefined();
  });

  it('wires tokens into NativeWind tailwind config', () => {
    expect(tailwindConfig.theme.extend.colors.primary).toBe(colors.primary);
    expect(tailwindConfig.theme.extend.colors.debt).toBe(colors.debt);
    expect(tailwindConfig.theme.extend.colors.accent).toBe(colors.accent);
  });
});
