import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'jest-axe';
import { afterEach, describe, expect, it } from 'vitest';
import { PwaProvider } from '../../platform/PwaContext';
import { appTheme } from '../../theme';
import Login from '.';

describe('Login', () => {
  afterEach(() => Object.defineProperty(navigator, 'onLine', { configurable: true, value: true }));

  it('explica o estado offline e desabilita a autenticação', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    const { container } = render(<ThemeProvider theme={appTheme}><PwaProvider><MemoryRouter><Login /></MemoryRouter></PwaProvider></ThemeProvider>);
    expect(screen.getByText(/sem conexão/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();
    expect((await axe(container)).violations).toHaveLength(0);
  });
});
