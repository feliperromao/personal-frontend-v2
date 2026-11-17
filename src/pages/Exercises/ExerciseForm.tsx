import { useEffect, useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Checkbox, FormControlLabel, Grid, MenuItem, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import Modal from '../../components/Modal';
import { Exercise, ExerciseInput, exerciseCategories } from '../../domain/types';

interface ExerciseFormProps {
  exercise?: Exercise | null;
  isOpen: boolean;
  onSubmit: (exercise: ExerciseInput) => Promise<void> | void;
  handleClose: () => void;
}

const emptyExercise: ExerciseInput = { name: '', type: '', instructions: '', video: '', rest: 30, load: 0, series: 4, load_progress: false };

export const toExerciseInput = (exercise?: Exercise | null): ExerciseInput => ({
  name: exercise?.name ?? '',
  type: exercise?.type ?? '',
  instructions: exercise?.instructions ?? '',
  video: exercise?.video ?? '',
  rest: Number(exercise?.rest ?? 30),
  load: Number(exercise?.load ?? 0),
  series: Number(exercise?.series ?? 4),
  load_progress: exercise?.load_progress ?? false,
});

const schema: yup.ObjectSchema<ExerciseInput> = yup.object({
  name: yup.string().trim().min(3, 'Informe pelo menos 3 caracteres.').required('Informe o nome.'),
  type: yup.string().required('Selecione o grupo muscular.'),
  instructions: yup.string().trim().required('Explique como executar o exercício.'),
  video: yup.string().url('Informe uma URL válida.').optional().default(''),
  rest: yup.number().typeError('Informe um número.').min(0, 'O descanso não pode ser negativo.').required(),
  load: yup.number().typeError('Informe um número.').min(0, 'A carga não pode ser negativa.').required(),
  series: yup.number().typeError('Informe um número.').integer('Use um número inteiro.').min(1, 'Informe ao menos 1 série.').required(),
  load_progress: yup.boolean().required(),
}).noUnknown();

export default function ExerciseForm({ exercise, isOpen, onSubmit, handleClose }: ExerciseFormProps) {
  const [submitError, setSubmitError] = useState('');
  const { control, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<ExerciseInput>({ resolver: yupResolver(schema), defaultValues: emptyExercise });
  useEffect(() => { if (isOpen) { reset(toExerciseInput(exercise)); setSubmitError(''); } }, [exercise, isOpen, reset]);
  const close = () => { if (isDirty && !window.confirm('Descartar as alterações deste exercício?')) return; handleClose(); };
  const submit = handleSubmit(async (values) => { setSubmitError(''); try { await onSubmit(values); } catch { setSubmitError('Não foi possível salvar. Revise os campos e tente novamente.'); } });
  const numericFields = useMemo(() => [
    { name: 'rest' as const, label: 'Descanso (segundos)' },
    { name: 'load' as const, label: 'Carga (kg/placas)' },
    { name: 'series' as const, label: 'Séries' },
  ], []);

  return (
    <Modal open={isOpen} title={exercise ? 'Editar exercício' : 'Cadastrar exercício'} handleClose={close} handleSubmit={submit} submitting={isSubmitting}>
      <Grid container spacing={2} sx={{ pt: 0.5 }}>
        {submitError && <Grid item xs={12}><Alert severity="error">{submitError}</Alert></Grid>}
        <Grid item xs={12} md={7}><Controller name="name" control={control} render={({ field }) => <TextField {...field} autoFocus label="Nome" required fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} />} /></Grid>
        <Grid item xs={12} md={5}><Controller name="type" control={control} render={({ field }) => <TextField {...field} select label="Grupo muscular" required fullWidth error={Boolean(errors.type)} helperText={errors.type?.message}>{exerciseCategories.map((item) => <MenuItem key={item.name} value={item.name}>{item.type}</MenuItem>)}</TextField>} /></Grid>
        <Grid item xs={12}><Controller name="instructions" control={control} render={({ field }) => <TextField {...field} label="Instruções" required multiline minRows={3} fullWidth error={Boolean(errors.instructions)} helperText={errors.instructions?.message || 'Use frases curtas e diga o que o aluno deve observar.'} />} /></Grid>
        <Grid item xs={12}><Controller name="video" control={control} render={({ field }) => <TextField {...field} label="URL do vídeo (opcional)" type="url" fullWidth error={Boolean(errors.video)} helperText={errors.video?.message || 'Aceita YouTube, Google Drive, Vimeo ou link direto para MP4/WebM.'} />} /></Grid>
        {numericFields.map((item) => <Grid key={item.name} item xs={12} md={4}><Controller name={item.name} control={control} render={({ field }) => <TextField {...field} label={item.label} type="number" required fullWidth error={Boolean(errors[item.name])} helperText={errors[item.name]?.message} onChange={(event) => field.onChange(Number(event.target.value))} inputProps={{ min: 0 }} />} /></Grid>)}
        <Grid item xs={12}><Controller name="load_progress" control={control} render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(_, checked) => field.onChange(checked)} />} label="Este exercício usa progressão de carga" />} /></Grid>
      </Grid>
    </Modal>
  );
}
