import { useEffect, useState } from 'react';
import { Add, ArrowDownward, ArrowUpward, Close, Delete, Save } from '@mui/icons-material';
import { Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Paper, Stack, Switch, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Exercise, Training, TrainingInput } from '../../domain/types';
import { tokens } from '../../theme';
import SelectExercises from '../Exercises/SelectExercises';

export interface Option { label: string; value: string }
interface TrainingFormProps {
  training?: Training | null;
  isOpen: boolean;
  students: Option[];
  onSubmit: (training: TrainingInput) => Promise<void> | void;
  handleClose: () => void;
}

const empty: TrainingInput = { name: '', description: '', show_to_student: false, exercises: [] };

export const toTrainingInput = (training?: Training | TrainingInput | null): TrainingInput => {
  const studentId = training?.student_id?.trim();
  return {
    name: training?.name ?? '',
    description: training?.description ?? '',
    show_to_student: Boolean(studentId && training?.show_to_student),
    ...(studentId ? { student_id: studentId } : {}),
    exercises: training?.exercises ? [...training.exercises] : [],
  };
};

export default function TrainingForm({ training, isOpen, students, onSubmit, handleClose }: TrainingFormProps) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [form, setForm] = useState<TrainingInput>(empty);
  const [student, setStudent] = useState<Option | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const next = toTrainingInput(training);
    setForm(next); setExercises(next.exercises || []);
    setStudent(students.find((item) => item.value === next.student_id) || null);
    setDirty(false); setError('');
  }, [isOpen, students, training]);

  const close = () => {
    if (dirty && !window.confirm('Descartar as alterações deste treino?')) return;
    handleClose();
  };
  const update = (changes: Partial<TrainingInput>) => { setForm((current) => ({ ...current, ...changes })); setDirty(true); };
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= exercises.length) return;
    const next = [...exercises]; [next[index], next[target]] = [next[target], next[index]]; setExercises(next); setDirty(true);
  };
  const remove = (id: string) => { setExercises((current) => current.filter((item) => item.id !== id)); setDirty(true); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (form.name.trim().length < 3) { setError('Informe um nome com pelo menos 3 caracteres.'); return; }
    if (!exercises.length) { setError('Adicione ao menos um exercício.'); return; }
    setSubmitting(true);
    try { await onSubmit(toTrainingInput({ ...form, exercises })); }
    catch { setError('Não foi possível salvar. Revise os dados e tente novamente.'); }
    finally { setSubmitting(false); }
  };

  return (
    <Dialog fullScreen={mobile} fullWidth maxWidth="md" open={isOpen} onClose={(_, reason) => { if (!submitting && reason !== 'backdropClick') close(); }} PaperProps={{ component: 'form', onSubmit: submit }}>
      <DialogTitle sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>{training ? 'Editar treino' : 'Criar treino'}</DialogTitle>
      <DialogContent sx={{ pt: '24px!important' }}>
        <Stack spacing={3}>
          {error && <Alert severity="error" tabIndex={-1}>{error}</Alert>}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0,1fr))' }, gap: 2 }}>
            <TextField autoFocus required label="Nome do treino" value={form.name} onChange={(event) => update({ name: event.target.value })} inputProps={{ minLength: 3 }} />
            <Autocomplete
              options={students}
              value={student}
              onChange={(_, value) => {
                setStudent(value);
                update({ student_id: value?.value, show_to_student: value ? form.show_to_student : false });
              }}
              renderInput={(params) => <TextField {...params} label="Aluno (opcional)" helperText="Sem aluno, o treino fica disponível apenas para você executar." />}
            />
            <TextField required label="Orientação geral" value={form.description} onChange={(event) => update({ description: event.target.value })} multiline minRows={3} sx={{ gridColumn: { md: '1 / -1' } }} />
            <FormControlLabel
              control={<Switch checked={Boolean(student && form.show_to_student)} disabled={!student} onChange={(_, checked) => update({ show_to_student: checked })} />}
              label={student ? 'Publicar para o aluno' : 'Associe um aluno para publicar'}
            />
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
            <Box><Typography component="h3" variant="h4">Sequência de exercícios</Typography><Typography color="text.secondary">Essa será a ordem usada durante a execução do treino.</Typography></Box>
            <Button variant="outlined" startIcon={<Add />} onClick={() => setSelectorOpen(true)}>Adicionar</Button>
          </Stack>

          <Stack spacing={1.25}>
            {exercises.map((exercise, index) => (
              <Paper key={exercise.id} sx={{ p: 2, border: `1px solid ${tokens.color.line}`, display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 1.5, alignItems: 'center' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{index + 1}</Box>
                <Box minWidth={0}><Typography fontWeight={750}>{exercise.name}</Typography><Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exercise.instructions}</Typography></Box>
                <Stack direction="row" flexWrap="wrap" justifyContent="flex-end">
                  <IconButton aria-label={`Mover ${exercise.name} para cima`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUpward /></IconButton>
                  <IconButton aria-label={`Mover ${exercise.name} para baixo`} disabled={index === exercises.length - 1} onClick={() => move(index, 1)}><ArrowDownward /></IconButton>
                  <IconButton aria-label={`Remover ${exercise.name}`} color="error" onClick={() => remove(exercise.id)}><Delete /></IconButton>
                </Stack>
              </Paper>
            ))}
            {!exercises.length && <Paper sx={{ p: 3, border: `1px dashed ${tokens.color.line}` }}><Typography fontWeight={700}>Nenhum exercício adicionado</Typography><Typography color="text.secondary">Use “Adicionar” para montar a sequência.</Typography></Paper>}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ position: 'sticky', bottom: 0, zIndex: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', p: 2 }}>
        <Button startIcon={<Close />} onClick={close} disabled={submitting}>Cancelar</Button>
        <Button type="submit" variant="contained" startIcon={<Save />} disabled={submitting}>{submitting ? 'Salvando…' : 'Salvar treino'}</Button>
      </DialogActions>
      <SelectExercises isOpen={selectorOpen} handleClose={() => setSelectorOpen(false)} addExercise={(item) => { if (!exercises.some((exercise) => exercise.id === item.id)) { setExercises((current) => [...current, item]); setDirty(true); } }} selected={exercises} removeExercise={(item) => remove(item.id)} />
    </Dialog>
  );
}
