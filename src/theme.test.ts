import { describe, expect, it } from 'vitest';
import { createAppTheme } from './theme';

describe('createAppTheme', () => {
  it('aplica a cor white-label aos componentes primários', () => {
    const theme = createAppTheme({ primaryColor: '#0E7490' });

    expect(theme.palette.primary.main).toBe('#0E7490');
    expect(theme.palette.primary.dark).not.toBe('#0E7490');
    expect(theme.palette.primary.contrastText).toMatch(/^#/);
  });
});
