import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material';
import { axe } from 'jest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PwaProvider } from '../../platform/PwaContext';
import { appTheme } from '../../theme';
import api from '../@shared/api';
import ChangePasswordForm from './ChangePasswordForm';

vi.mock('../@shared/api', () => ({
  default: { post: vi.fn() },
}));

function renderForm() {
  return render(
    <ThemeProvider theme={appTheme}>
      <PwaProvider><ChangePasswordForm /></PwaProvider>
    </ThemeProvider>,
  );
}

describe('ChangePasswordForm', () => {
  afterEach(() => vi.clearAllMocks());

  it('redefine a senha do usuário autenticado sem solicitar e-mail', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'Senha redefinida com sucesso.' } });
    const user = userEvent.setup();
    const { container } = renderForm();

    await user.type(screen.getByLabelText('Senha atual'), 'senha-atual');
    await user.type(screen.getByLabelText('Nova senha'), 'nova-senha-segura');
    await user.type(screen.getByLabelText('Confirmar nova senha'), 'nova-senha-segura');
    await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/auth/change-password', {
      current_password: 'senha-atual',
      password: 'nova-senha-segura',
      confirm_password: 'nova-senha-segura',
    }));
    expect(await screen.findByText('Senha redefinida com sucesso.')).toBeInTheDocument();
    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument();
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it('não envia senhas diferentes', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Senha atual'), 'senha-atual');
    await user.type(screen.getByLabelText('Nova senha'), 'nova-senha-segura');
    await user.type(screen.getByLabelText('Confirmar nova senha'), 'outra-senha');
    await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));

    expect(await screen.findByText('As senhas não coincidem.')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });
});
