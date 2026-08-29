import { describe, expect, it } from 'vitest';
import { colors, radii, spacing, theme } from './theme';

describe('design tokens', () => {
  it('exposes the brief palette and geometry from one theme', () => {
    expect(colors.sidebar).toBe('#0E0F13');
    expect(colors.accent).toBe('#E8703A');
    expect(spacing[4]).toBe(16);
    expect(radii.card).toBe(8);
    expect(radii.pill).toBe(999);
    expect(theme.colors).toBe(colors);
  });
});
