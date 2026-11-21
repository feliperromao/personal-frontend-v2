import { useRef, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { LockResetOutlined } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { usePwa } from '../../platform/PwaContext';
import { tokens } from '../../theme';
import api from '../@shared/api';

interface ChangePasswordFields {
  current_password: string;
  password: string;
  confirm_password: string;
}

const schema: yup.ObjectSchema<ChangePasswordFields> = yup.object({
  current_password: yup.string().required('Informe a senha atual.'),
  password: yup.string().min(8, 'A senha deve ter pelo menos 8 caracteres.').required('Informe a nova senha.'),
  confirm_password: yup.string().oneOf([yup.ref('password')], 'As senhas não coincidem.').required('Repita a nova senha.'),
});

export default function ChangePasswordForm() {
  const { online } = usePwa();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const feedbackRef = useRef<HTMLDivElement>(null);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordFields>({
    resolver: yupResolver(schema),
    defaultValues: { current_password: '', password: '', confirm_password: '' },
    shouldFocusError: true,
  });

  const submit = async (values: ChangePasswordFields) => {
    if (!online) return;
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/change-password', values);
      reset();
      setSuccess('Senha redefinida com sucesso.');
    } catch (requestError: any) {
      const responseMessage = requestError?.response?.data?.message;
      setError(responseMessage === 'A senha atual está incorreta.'
        ? responseMessage
        : requestError?.response
          ? 'Não foi possível redefinir a senha. Revise os dados e tente novamente.'
          : 'Não foi possível alcançar o servidor. Verifique a conexão e tente novamente.');
    } finally {
      requestAnimationFrame(() => feedbackRef.current?.focus());
    }
  };

  return (
    <Paper component="section" sx={{ p: 3, border: `1px solid ${tokens.color.line}` }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5">Senha de acesso</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Confirme sua senha atual e crie uma nova com pelo menos 8 caracteres.</Typography>
      </Box>

      {!online && <Alert severity="warning" sx={{ mb: 2 }}>Você está sem conexão. A senha poderá ser alterada quando a internet retornar.</Alert>}
      {error && <Alert ref={feedbackRef} tabIndex={-1} severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert ref={feedbackRef} tabIndex={-1} severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box component="form" noValidate onSubmit={handleSubmit(submit)}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Controller
            name="current_password"
            control={control}
            render={({ field }) => (
              <TextField {...field} autoComplete="current-password" label="Senha atual" type="password" error={Boolean(errors.current_password)} helperText={errors.current_password?.message} />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField {...field} autoComplete="new-password" label="Nova senha" type="password" error={Boolean(errors.password)} helperText={errors.password?.message} />
            )}
          />
          <Controller
            name="confirm_password"
            control={control}
            render={({ field }) => (
              <TextField {...field} autoComplete="new-password" label="Confirmar nova senha" type="password" error={Boolean(errors.confirm_password)} helperText={errors.confirm_password?.message} />
            )}
          />
        </Box>
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <LockResetOutlined />} disabled={isSubmitting || !online}>
            {isSubmitting ? 'Salvando…' : 'Salvar nova senha'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
