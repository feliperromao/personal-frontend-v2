import { yupResolver } from '@hookform/resolvers/yup';
import { RestartAltOutlined, SaveOutlined } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { DEFAULT_BRANDING, useBranding } from '../../branding/BrandingContext';
import BrandMark from '../../components/BrandMark';
import { BrandingConfig } from '../../domain/types';
import { createAppTheme, tokens } from '../../theme';
import api from '../@shared/api';

const hexColor = /^#[0-9A-F]{6}$/i;
const schema: yup.ObjectSchema<BrandingConfig> = yup.object({
  appName: yup.string().trim().min(2, 'Use pelo menos 2 caracteres.').max(40, 'Use no máximo 40 caracteres.').required('Informe o nome do app.'),
  primaryColor: yup.string().matches(hexColor, 'Informe uma cor hexadecimal válida.').required('Escolha a cor dos botões.'),
  footerColor: yup.string().matches(hexColor, 'Informe uma cor hexadecimal válida.').required('Escolha a cor do rodapé.'),
  logoUrl: yup.string().url('Informe uma URL completa, começando com http:// ou https://.').max(2048, 'A URL é muito longa.').defined(),
});

function ColorField({
  label,
  name,
  control,
  error,
  helperText,
}: {
  label: string;
  name: 'primaryColor' | 'footerColor';
  control: ReturnType<typeof useForm<BrandingConfig>>['control'];
  error: boolean;
  helperText?: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          type="color"
          label={label}
          error={error}
          helperText={helperText || field.value.toUpperCase()}
          InputLabelProps={{ shrink: true }}
          inputProps={{ 'aria-label': label }}
          sx={{ '& input[type="color"]': { minHeight: 52, p: 0.75, cursor: 'pointer' } }}
        />
      )}
    />
  );
}

export default function BrandingSettings() {
  const { branding, applyBranding } = useBranding();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const { control, handleSubmit, reset, setValue, watch, formState: { errors, isDirty } } = useForm<BrandingConfig>({
    resolver: yupResolver(schema),
    defaultValues: branding,
  });
  const preview = watch();
  const safePreview = useMemo(
    () => ({ ...preview, logoUrl: /^https?:\/\//i.test(preview.logoUrl) ? preview.logoUrl : '' }),
    [preview],
  );
  const previewTheme = useMemo(() => createAppTheme(safePreview), [safePreview]);
  const footerText = previewTheme.palette.getContrastText(preview.footerColor);

  const restoreDefaults = () => {
    setValue('appName', DEFAULT_BRANDING.appName, { shouldDirty: true, shouldValidate: true });
    setValue('primaryColor', DEFAULT_BRANDING.primaryColor, { shouldDirty: true, shouldValidate: true });
    setValue('footerColor', DEFAULT_BRANDING.footerColor, { shouldDirty: true, shouldValidate: true });
    setValue('logoUrl', DEFAULT_BRANDING.logoUrl, { shouldDirty: true, shouldValidate: true });
    setSaveState('idle');
  };

  const save = async (values: BrandingConfig) => {
    setSaveState('saving');
    try {
      const { data } = await api.put<BrandingConfig>('/branding', values);
      applyBranding(data);
      reset(data);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  return (
    <Box component="section" aria-labelledby="branding-title">
      <Stack spacing={0.75} sx={{ mb: 2.5 }}>
        <Typography id="branding-title" variant="h3" component="h2">Identidade do seu app</Typography>
        <Typography color="text.secondary">
          Personalize como sua marca aparece para você e seus alunos. As alterações entram em vigor depois de salvar.
        </Typography>
      </Stack>

      <Paper sx={{ border: `1px solid ${tokens.color.line}`, overflow: 'hidden' }}>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(save)}
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(300px, .8fr)' } }}
        >
          <Stack spacing={2.25} sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            {saveState === 'saved' && <Alert severity="success">Identidade visual atualizada para todas as contas vinculadas.</Alert>}
            {saveState === 'error' && <Alert severity="error">Não foi possível salvar agora. Confira a conexão e tente novamente.</Alert>}

            <Controller
              name="appName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome do app"
                  error={Boolean(errors.appName)}
                  helperText={errors.appName?.message || 'Até 40 caracteres.'}
                  inputProps={{ maxLength: 40 }}
                />
              )}
            />
            <Controller
              name="logoUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="URL da logomarca"
                  placeholder="https://seusite.com/logo.png"
                  error={Boolean(errors.logoUrl)}
                  helperText={errors.logoUrl?.message || 'Use uma imagem HTTPS em PNG, JPG, WebP ou SVG. Deixe vazio para usar a marca padrão.'}
                />
              )}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <ColorField
                label="Cor dos botões"
                name="primaryColor"
                control={control}
                error={Boolean(errors.primaryColor)}
                helperText={errors.primaryColor?.message}
              />
              <ColorField
                label="Cor do rodapé"
                name="footerColor"
                control={control}
                error={Boolean(errors.footerColor)}
                helperText={errors.footerColor?.message}
              />
            </Box>

            <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
              <Button
                type="button"
                variant="text"
                startIcon={<RestartAltOutlined />}
                onClick={restoreDefaults}
              >
                Usar identidade padrão
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveOutlined />}
                disabled={saveState === 'saving' || !isDirty}
              >
                {saveState === 'saving' ? 'Salvando…' : 'Salvar identidade'}
              </Button>
            </Stack>
          </Stack>

          <ThemeProvider theme={previewTheme}>
            <Box sx={{ bgcolor: 'background.default', borderLeft: { lg: `1px solid ${tokens.color.line}` }, borderTop: { xs: `1px solid ${tokens.color.line}`, lg: 0 }, p: { xs: 2.5, sm: 3.5 }, display: 'flex', flexDirection: 'column', minHeight: 320 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '.08em' }}>Prévia</Typography>
              <Box sx={{ mt: 2 }}><BrandMark brandingOverride={safePreview} /></Box>
              <Typography variant="h4" sx={{ mt: 4 }}>Treino de hoje</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>A identidade acompanha as telas dos seus alunos.</Typography>
              <Button variant="contained" sx={{ mt: 2.5, alignSelf: 'flex-start' }}>Começar treino</Button>
              <Box sx={{ mt: 'auto', mx: { xs: -2.5, sm: -3.5 }, mb: { xs: -2.5, sm: -3.5 }, px: { xs: 2.5, sm: 3.5 }, py: 2, bgcolor: preview.footerColor, color: footerText }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Rodapé e navegação</Typography>
              </Box>
            </Box>
          </ThemeProvider>
        </Box>
      </Paper>
    </Box>
  );
}
