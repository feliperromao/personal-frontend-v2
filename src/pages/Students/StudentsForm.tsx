import { useEffect, useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, FormControlLabel, Grid, Switch, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import Modal from '../../components/Modal';
import { User } from '../../domain/types';

interface StudentsFormProps {
  user?: User | null;
  isOpen: boolean;
  onSubmit: (user: User) => Promise<void> | void;
  handleClose: () => void;
}

const emptyUser: User = {
  name: '', email: '', password: '', confirm_password: '', phone: '', birthdate: '',
  weight: 0, height: 0, monthly_value_brl: 0, blocked: false,
};

export default function StudentsForm({ user, isOpen, onSubmit, handleClose }: StudentsFormProps) {
  const editing = Boolean(user?.id);
  const [submitError, setSubmitError] = useState('');
  const schema = useMemo(() => yup.object({
    id: yup.string().optional(),
    type: yup.mixed<'PERSONAL' | 'STUDENT'>().optional(),
    name: yup.string().trim().min(5, 'Informe pelo menos 5 caracteres.').required('Informe o nome.'),
    email: yup.string().email('Informe um e-mail válido.').required('Informe o e-mail.'),
    password: yup.string().test('password-required', 'Informe uma senha.', (value) => editing || Boolean(value)).test('password-size', 'A senha deve ter pelo menos 8 caracteres.', (value) => !value || value.length >= 8).default(''),
    confirm_password: yup.string().test('confirmation-required', 'Repita a senha.', (value) => editing || Boolean(value)).oneOf([yup.ref('password'), ''], 'As senhas não coincidem.').default(''),
    phone: yup.string().required('Informe o celular.'),
    birthdate: yup.string().required('Informe a data de nascimento.'),
    weight: yup.number().typeError('Informe um número.').min(1, 'Informe um peso válido.').required(),
    height: yup.number().typeError('Informe um número.').min(1, 'Informe uma altura válida.').required(),
    monthly_value_brl: yup.number().typeError('Informe um número.').min(0, 'O valor não pode ser negativo.').required(),
    blocked: yup.boolean().required(),
  }), [editing]);
  const { control, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<User>({ resolver: yupResolver(schema) as never, defaultValues: emptyUser, shouldFocusError: true });

  useEffect(() => {
    if (isOpen) {
      reset(user ? { ...emptyUser, ...user, password: '', confirm_password: '' } : emptyUser);
      setSubmitError('');
    }
  }, [isOpen, reset, user]);

  const close = () => {
    if (isDirty && !window.confirm('Descartar as alterações deste aluno?')) return;
    handleClose();
  };

  const submit = handleSubmit(async (values) => {
    setSubmitError('');
    try { await onSubmit(values); }
    catch { setSubmitError('Revise os campos e tente novamente. Seus dados permanecem no formulário.'); }
  });

  const field = (name: keyof User, label: string, options: { type?: string; required?: boolean } = {}) => (
    <Controller name={name} control={control} render={({ field: input }) => (
      <TextField
        {...input}
        label={label}
        type={options.type}
        required={options.required !== false}
        fullWidth
        error={Boolean(errors[name])}
        helperText={errors[name]?.message as string | undefined}
        onChange={(event) => input.onChange(options.type === 'number' ? Number(event.target.value) : event.target.value)}
        InputLabelProps={options.type === 'date' ? { shrink: true } : undefined}
      />
    )} />
  );

  return (
    <Modal open={isOpen} title={editing ? 'Editar aluno' : 'Cadastrar aluno'} handleClose={close} handleSubmit={submit} submitting={isSubmitting}>
      <Grid container spacing={2} sx={{ pt: 0.5 }}>
        {submitError && <Grid item xs={12}><Alert severity="error">{submitError}</Alert></Grid>}
        <Grid item xs={12}>{field('name', 'Nome')}</Grid>
        <Grid item xs={12}>{field('email', 'E-mail', { type: 'email' })}</Grid>
        <Grid item xs={12} md={6}>{field('password', 'Senha', { type: 'password', required: !editing })}</Grid>
        <Grid item xs={12} md={6}>{field('confirm_password', 'Repetir senha', { type: 'password', required: !editing })}</Grid>
        <Grid item xs={12} md={6}>{field('phone', 'Celular')}</Grid>
        <Grid item xs={12} md={6}>{field('birthdate', 'Data de nascimento', { type: 'date' })}</Grid>
        <Grid item xs={12} md={4}>{field('weight', 'Peso (kg)', { type: 'number' })}</Grid>
        <Grid item xs={12} md={4}>{field('height', 'Altura (cm)', { type: 'number' })}</Grid>
        <Grid item xs={12} md={4}>{field('monthly_value_brl', 'Mensalidade (R$)', { type: 'number' })}</Grid>
        <Grid item xs={12}>
          <Controller name="blocked" control={control} render={({ field: input }) => (
            <FormControlLabel control={<Switch checked={!input.value} onChange={(event) => input.onChange(!event.target.checked)} />} label="Permitir acesso ao aplicativo" />
          )} />
        </Grid>
      </Grid>
    </Modal>
  );
}
