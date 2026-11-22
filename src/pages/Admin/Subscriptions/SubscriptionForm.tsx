import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Grid, InputAdornment, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import Modal from '../../../components/Modal';
import { SubscriptionPlan, SubscriptionPlanInput } from '../../../domain/types';

interface SubscriptionFormProps {
  plan?: SubscriptionPlan;
  open: boolean;
  onClose: () => void;
  onSubmit: (plan: SubscriptionPlanInput) => Promise<void>;
}

const emptyPlan: SubscriptionPlanInput = {
  name: '',
  max_students: 1,
  max_exercises: 1,
  max_training: 1,
  price_brl: 0,
};

const schema: yup.ObjectSchema<SubscriptionPlanInput> = yup.object({
  name: yup.string().trim().required('Informe o nome do plano.'),
  max_students: yup.number().typeError('Informe um número.').integer('Use um número inteiro.').min(1, 'Informe pelo menos 1 aluno.').required(),
  max_exercises: yup.number().typeError('Informe um número.').integer('Use um número inteiro.').min(1, 'Informe pelo menos 1 exercício.').required(),
  max_training: yup.number().typeError('Informe um número.').integer('Use um número inteiro.').min(1, 'Informe pelo menos 1 treino.').required(),
  price_brl: yup.number().typeError('Informe um valor.').min(0, 'O preço não pode ser negativo.').required(),
});

export default function SubscriptionForm({ plan, open, onClose, onSubmit }: SubscriptionFormProps) {
  const [submitError, setSubmitError] = useState('');
  const { control, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<SubscriptionPlanInput>({
    resolver: yupResolver(schema),
    defaultValues: emptyPlan,
    shouldFocusError: true,
  });

  useEffect(() => {
    if (!open) return;
    reset(plan ? {
      name: plan.name,
      max_students: plan.max_students,
      max_exercises: plan.max_exercises,
      max_training: plan.max_training,
      price_brl: plan.price_brl,
    } : emptyPlan);
    setSubmitError('');
  }, [open, plan, reset]);

  const close = () => {
    if (isDirty && !window.confirm('Descartar as alterações deste plano?')) return;
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

  const numberField = (name: keyof Pick<SubscriptionPlanInput, 'max_students' | 'max_exercises' | 'max_training'>, label: string) => (
    <Controller name={name} control={control} render={({ field }) => (
      <TextField
        {...field}
        label={label}
        type="number"
        required
        fullWidth
        error={Boolean(errors[name])}
        helperText={errors[name]?.message}
        inputProps={{ min: 1, step: 1 }}
        onChange={(event) => field.onChange(Number(event.target.value))}
      />
    )} />
  );

  return (
    <Modal open={open} title={plan ? 'Editar plano' : 'Criar plano'} handleClose={close} handleSubmit={submit} submitting={isSubmitting}>
      <Grid container spacing={2} sx={{ pt: 0.5 }}>
        {submitError && <Grid item xs={12}><Alert severity="error">{submitError}</Alert></Grid>}
        <Grid item xs={12}>
          <Controller name="name" control={control} render={({ field }) => (
            <TextField {...field} autoFocus label="Nome do plano" required fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} />
          )} />
        </Grid>
        <Grid item xs={12} sm={4}>{numberField('max_students', 'Máx. alunos')}</Grid>
        <Grid item xs={12} sm={4}>{numberField('max_exercises', 'Máx. exercícios')}</Grid>
        <Grid item xs={12} sm={4}>{numberField('max_training', 'Máx. treinos')}</Grid>
        <Grid item xs={12} sm={6}>
          <Controller name="price_brl" control={control} render={({ field }) => (
            <TextField
              {...field}
              label="Preço mensal"
              type="number"
              required
              fullWidth
              error={Boolean(errors.price_brl)}
              helperText={errors.price_brl?.message}
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
              onChange={(event) => field.onChange(Number(event.target.value))}
            />
          )} />
        </Grid>
      </Grid>
    </Modal>
  );
}
