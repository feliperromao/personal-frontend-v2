import { useEffect, useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, FormControlLabel, Grid, MenuItem, Switch, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import Modal from '../../../components/Modal';
import { PersonalAccount, PersonalAccountInput, SubscriptionPlan } from '../../../domain/types';

interface PersonalFormProps {
  personal?: PersonalAccount;
  open: boolean;
  onClose: () => void;
  onSubmit: (personal: PersonalAccountInput) => Promise<void>;
  subscriptions: SubscriptionPlan[];
}

const emptyPersonal: PersonalAccountInput = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirm_password: '',
  blocked: false,
  subscription_id: '',
};

export default function PersonalForm({ personal, open, onClose, onSubmit, subscriptions }: PersonalFormProps) {
  const editing = Boolean(personal?.id);
  const [submitError, setSubmitError] = useState('');
  const schema = useMemo(() => yup.object({
    name: yup.string().trim().min(5, 'Informe pelo menos 5 caracteres.').required('Informe o nome.'),
    email: yup.string().trim().email('Informe um e-mail válido.').required('Informe o e-mail.'),
    phone: yup.string().trim().required('Informe o celular.'),
    password: yup.string()
      .test('required-on-create', 'Informe uma senha.', (value) => editing || Boolean(value))
      .test('minimum-size', 'A senha deve ter pelo menos 8 caracteres.', (value) => !value || value.length >= 8)
      .default(''),
    confirm_password: yup.string()
      .test('required-on-create', 'Repita a senha.', (value) => editing || Boolean(value))
      .oneOf([yup.ref('password'), ''], 'As senhas não coincidem.')
      .default(''),
    blocked: yup.boolean().required(),
    subscription_id: yup.string().required('Selecione um plano de assinatura.'),
  }), [editing]);

  const { control, handleSubmit, reset, watch, formState: { errors, isDirty, isSubmitting } } = useForm<PersonalAccountInput>({
    resolver: yupResolver(schema),
    defaultValues: emptyPersonal,
    shouldFocusError: true,
  });

  useEffect(() => {
    if (!open) return;
    const selectedSubscription = personal?.subscription_id && subscriptions.some((plan) => plan.id === personal.subscription_id)
      ? personal.subscription_id
      : '';
    reset(personal ? {
      name: personal.name,
      email: personal.email,
      phone: personal.phone || '',
      password: '',
      confirm_password: '',
      blocked: personal.blocked,
      subscription_id: selectedSubscription,
    } : emptyPersonal);
    setSubmitError('');
  }, [open, personal, reset, subscriptions]);

  const selectedPlan = subscriptions.find((plan) => plan.id === watch('subscription_id'));

  const close = () => {
    if (isDirty && !window.confirm('Descartar as alterações deste personal?')) return;
    onClose();
  };

  const submit = handleSubmit(async (values) => {
    setSubmitError('');
    try {
      await onSubmit(values);
    } catch {
      setSubmitError('Não foi possível salvar. Revise os dados e tente novamente.');
    }
  });

  return (
    <Modal
      open={open}
      title={editing ? 'Editar personal' : 'Cadastrar personal'}
      handleClose={close}
      handleSubmit={submit}
      submitting={isSubmitting}
    >
      <Grid container spacing={2} sx={{ pt: 0.5 }}>
        {submitError && <Grid item xs={12}><Alert severity="error">{submitError}</Alert></Grid>}
        <Grid item xs={12}>
          <Controller name="name" control={control} render={({ field }) => (
            <TextField {...field} autoFocus label="Nome" required fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} />
          )} />
        </Grid>
        <Grid item xs={12} md={7}>
          <Controller name="email" control={control} render={({ field }) => (
            <TextField {...field} label="E-mail" type="email" required fullWidth error={Boolean(errors.email)} helperText={errors.email?.message} />
          )} />
        </Grid>
        <Grid item xs={12} md={5}>
          <Controller name="phone" control={control} render={({ field }) => (
            <TextField {...field} label="Celular" type="tel" required fullWidth error={Boolean(errors.phone)} helperText={errors.phone?.message} />
          )} />
        </Grid>
        <Grid item xs={12}>
          <Controller name="subscription_id" control={control} render={({ field }) => (
            <TextField
              {...field}
              select
              label="Plano de assinatura"
              required
              fullWidth
              disabled={subscriptions.length === 0}
              InputLabelProps={{ shrink: true }}
              error={Boolean(errors.subscription_id)}
              helperText={errors.subscription_id?.message || 'Os limites do plano serão aplicados a alunos, exercícios e treinos.'}
            >
              {subscriptions.map((plan) => <MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>)}
            </TextField>
          )} />
        </Grid>
        {selectedPlan && (
          <Grid item xs={12}>
            <Box
              aria-label={`Limites do plano ${selectedPlan.name}`}
              sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.5, py: 1.5, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}
            >
              <Box><Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>{selectedPlan.max_students}</Typography><Typography variant="body2" color="text.secondary">alunos</Typography></Box>
              <Box><Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>{selectedPlan.max_exercises}</Typography><Typography variant="body2" color="text.secondary">exercícios</Typography></Box>
              <Box><Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>{selectedPlan.max_training}</Typography><Typography variant="body2" color="text.secondary">treinos</Typography></Box>
            </Box>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            {editing ? 'Deixe a senha em branco para manter a atual.' : 'A senha inicial deve ter pelo menos 8 caracteres.'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller name="password" control={control} render={({ field }) => (
            <TextField {...field} label="Senha" type="password" required={!editing} fullWidth error={Boolean(errors.password)} helperText={errors.password?.message} autoComplete="new-password" />
          )} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller name="confirm_password" control={control} render={({ field }) => (
            <TextField {...field} label="Repetir senha" type="password" required={!editing} fullWidth error={Boolean(errors.confirm_password)} helperText={errors.confirm_password?.message} autoComplete="new-password" />
          )} />
        </Grid>
        <Grid item xs={12}>
          <Controller name="blocked" control={control} render={({ field }) => (
            <FormControlLabel
              control={<Switch checked={!field.value} onChange={(event) => field.onChange(!event.target.checked)} />}
              label="Permitir acesso ao aplicativo"
            />
          )} />
        </Grid>
      </Grid>
    </Modal>
  );
}
