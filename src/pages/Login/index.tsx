import { useEffect, useRef, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import * as yup from 'yup';
import BrandMark from '../../components/BrandMark';
import { usePwa } from '../../platform/PwaContext';
import { tokens } from '../../theme';
import api from '../@shared/api';
import { useBranding } from '../../branding/BrandingContext';

interface LoginFields { email: string; password: string }

const schema: yup.ObjectSchema<LoginFields> = yup.object({
  email: yup.string().email('Informe um e-mail válido.').required('Informe seu e-mail.'),
  password: yup.string().required('Informe sua senha.'),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { online } = usePwa();
  const { applyBranding } = useBranding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef<HTMLDivElement>(null);
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFields>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const submit = async (values: LoginFields) => {
    if (!online) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', values);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('auth-token', data.access_token);
      applyBranding(data.branding);
      localStorage.setItem('install-prompt-pending', '1');
      const fromState = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      const requested = searchParams.get('returnTo') || fromState;
      navigate(requested || (data.user.type === 'PERSONAL' ? '/' : '/my-workouts'), { replace: true });
    } catch (requestError: any) {
      if (!requestError?.response) {
        setError('Não foi possível alcançar o servidor. Verifique a conexão e tente novamente.');
      } else {
        setError('E-mail ou senha incorretos. Confira os dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="main" sx={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(360px, 520px) 1fr' }, bgcolor: 'background.default' }}>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, bgcolor: tokens.color.ink, color: '#FFFFFF', p: 7, flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', position: 'relative' }}>
        <BrandMark inverse />
        <Box sx={{ maxWidth: 620, position: 'relative', zIndex: 1 }}>
          <Typography variant="h1" sx={{ color: '#FFFFFF', maxWidth: 8 }}>Seu treino tem ritmo.</Typography>
          <Typography sx={{ mt: 3, maxWidth: 520, color: 'rgba(255,255,255,.76)', fontSize: '1.2rem' }}>
            Planejamento do personal e execução do aluno no mesmo percurso, com cada série no lugar certo.
          </Typography>
        </Box>
        <Box aria-hidden="true" sx={{ position: 'absolute', width: 500, height: 500, right: -160, bottom: -140, border: '1px solid rgba(209,220,39,.35)', borderRadius: '44% 56% 63% 37%' }} />
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,.62)' }}>Treino claro. Progresso visível.</Typography>
      </Box>

      <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 2, sm: 4 }, pt: { xs: 'calc(24px + env(safe-area-inset-top))', sm: 4 } }}>
        <Paper sx={{ width: '100%', maxWidth: 440, p: { xs: 3, sm: 5 }, border: `1px solid ${tokens.color.line}` }}>
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 5 }}><BrandMark /></Box>
          <Typography component="h1" variant="h3">Entrar</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Acesse sua rotina de treinos.</Typography>

          {!online && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Você está sem conexão. O login volta a funcionar quando a internet retornar.
            </Alert>
          )}
          {error && <Alert ref={errorRef} tabIndex={-1} severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" noValidate onSubmit={handleSubmit(submit)}>
            <Stack spacing={2.25}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} autoFocus autoComplete="email" label="E-mail" type="email" error={Boolean(errors.email)} helperText={errors.email?.message} />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField {...field} autoComplete="current-password" label="Senha" type="password" error={Boolean(errors.password)} helperText={errors.password?.message} />
                )}
              />
              <Button type="submit" variant="contained" size="large" disabled={loading || !online} sx={{ mt: 1 }}>
                {loading ? <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />Entrando…</> : 'Entrar'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
