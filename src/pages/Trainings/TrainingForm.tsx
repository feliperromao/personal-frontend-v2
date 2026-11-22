import { useEffect, useState } from 'react';
import { Add, ArrowDownward, ArrowUpward, Close, Delete, LinkOutlined, LinkOffOutlined, Save } from '@mui/icons-material';
import { Alert, Autocomplete, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Paper, Stack, Switch, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Exercise, ExerciseGroup, Training, TrainingInput } from '../../domain/types';
import { getWorkoutBlocks } from '../../domain/workoutBlocks';
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

const empty: TrainingInput = { name: '', description: '', show_to_student: false, exercises: [], exercise_groups: [] };

export const toTrainingInput = (training?: Training | TrainingInput | null): TrainingInput => {
  const studentId = training?.student_id?.trim();
  return {
    name: training?.name ?? '',
    description: training?.description ?? '',
    show_to_student: Boolean(studentId && training?.show_to_student),
    ...(studentId ? { student_id: studentId } : {}),
    exercises: training?.exercises ? [...training.exercises] : [],
    exercise_groups: training?.exercise_groups?.map(group => ({ ...group, exercise_ids: [...group.exercise_ids] })) || [],
  };
};

export default function TrainingForm({ training, isOpen, students, onSubmit, handleClose }: TrainingFormProps) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [form, setForm] = useState<TrainingInput>(empty);
  const [student, setStudent] = useState<Option | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [groups, setGroups] = useState<ExerciseGroup[]>([]);
  const [selectedForCombination, setSelectedForCombination] = useState<string[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const next = toTrainingInput(training);
    setForm(next); setExercises(next.exercises || []); setGroups(next.exercise_groups || []); setSelectedForCombination([]);
    setStudent(students.find((item) => item.value === next.student_id) || null);
    setDirty(false); setError('');
  }, [isOpen, students, training]);

  const close = () => {
    if (dirty && !window.confirm('Descartar as alterações deste treino?')) return;
    handleClose();
  };
  const update = (changes: Partial<TrainingInput>) => { setForm((current) => ({ ...current, ...changes })); setDirty(true); };
  const blocks = getWorkoutBlocks(exercises, groups);
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks]; [next[index], next[target]] = [next[target], next[index]];
    setExercises(next.flatMap(block => block.exercises)); setDirty(true);
  };
  const remove = (id: string) => {
    setExercises((current) => current.filter((item) => item.id !== id));
    setGroups((current) => current.flatMap(group => {
      if (!group.exercise_ids.includes(id)) return [group];
      const exerciseIds = group.exercise_ids.filter(exerciseId => exerciseId !== id);
      return exerciseIds.length >= 2 ? [{ ...group, exercise_ids: exerciseIds }] : [];
    }));
    setSelectedForCombination(current => current.filter(exerciseId => exerciseId !== id));
    setDirty(true);
  };
  const toggleCombinationSelection = (id: string) => {
    setSelectedForCombination(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  };
  const createCombination = () => {
    const selected = exercises.filter(exercise => selectedForCombination.includes(exercise.id));
    if (selected.length < 2) return;
    const firstIndex = Math.min(...selected.map(exercise => exercises.findIndex(item => item.id === exercise.id)));
    const remaining = exercises.filter(exercise => !selectedForCombination.includes(exercise.id));
    remaining.splice(firstIndex, 0, ...selected);
    setExercises(remaining);
    setGroups(current => [...current, {
      id: `combination-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      exercise_ids: selected.map(exercise => exercise.id),
      series: Math.min(...selected.map(exercise => exercise.series)),
      rest: Math.max(...selected.map(exercise => exercise.rest)),
    }]);
    setSelectedForCombination([]);
    setDirty(true);
  };
  const updateGroup = (id: string, changes: Partial<ExerciseGroup>) => {
    setGroups(current => current.map(group => group.id === id ? { ...group, ...changes } : group));
    setDirty(true);
  };
  const dissolveGroup = (id: string) => { setGroups(current => current.filter(group => group.id !== id)); setDirty(true); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (form.name.trim().length < 3) { setError('Informe um nome com pelo menos 3 caracteres.'); return; }
    if (!exercises.length) { setError('Adicione ao menos um exercício.'); return; }
    setSubmitting(true);
    try { await onSubmit(toTrainingInput({ ...form, exercises, exercise_groups: groups })); }
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
            <TextField label="Orientação geral (opcional)" value={form.description ?? ''} onChange={(event) => update({ description: event.target.value })} multiline minRows={3} sx={{ gridColumn: { md: '1 / -1' } }} />
            <FormControlLabel
              control={<Switch checked={Boolean(student && form.show_to_student)} disabled={!student} onChange={(_, checked) => update({ show_to_student: checked })} />}
              label={student ? 'Publicar para o aluno' : 'Associe um aluno para publicar'}
            />
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
            <Box><Typography component="h3" variant="h4">Sequência de exercícios</Typography><Typography color="text.secondary">Marque 2 ou mais exercícios individuais para executá-los em sequência, descansando só no final.</Typography></Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button variant="outlined" startIcon={<LinkOutlined />} disabled={selectedForCombination.length < 2} onClick={createCombination}>Combinar ({selectedForCombination.length})</Button>
              <Button variant="outlined" startIcon={<Add />} onClick={() => setSelectorOpen(true)}>Adicionar</Button>
            </Stack>
          </Stack>

          <Stack spacing={1.25}>
            {blocks.map((block, index) => block.isCombination ? (
              <Paper key={block.id} sx={{ border: `1px solid ${tokens.color.primary}`, overflow: 'hidden' }}>
                <Box sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-start' }, gap: 1, bgcolor: 'rgba(91, 33, 209, 0.06)' }}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1}><LinkOutlined color="primary" /><Typography fontWeight={800}>Série combinada</Typography><Chip size="small" color="primary" variant="outlined" label={`${block.exercises.length} exercícios`} /></Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Sem descanso entre os exercícios; uma série conta após concluir todos.</Typography>
                  </Box>
                  <Stack direction="row" justifyContent={{ xs: 'flex-end', sm: 'flex-start' }}>
                    <IconButton aria-label="Mover combinação para cima" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUpward /></IconButton>
                    <IconButton aria-label="Mover combinação para baixo" disabled={index === blocks.length - 1} onClick={() => move(index, 1)}><ArrowDownward /></IconButton>
                    <IconButton aria-label="Desfazer combinação" onClick={() => dissolveGroup(block.id)}><LinkOffOutlined /></IconButton>
                  </Stack>
                </Box>
                <Stack sx={{ px: 2 }} divider={<Box sx={{ borderTop: `1px solid ${tokens.color.line}` }} />}>
                  {block.exercises.map((exercise, exerciseIndex) => (
                    <Box key={exercise.id} sx={{ py: 1.5, display: 'grid', gridTemplateColumns: '36px minmax(0,1fr) auto', gap: 1.5, alignItems: 'center' }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{exerciseIndex + 1}</Box>
                      <Box minWidth={0}><Typography fontWeight={750}>{exercise.name}</Typography><Typography variant="body2" color="text.secondary" noWrap>{exercise.instructions || 'Sem orientação adicional'}</Typography></Box>
                      <IconButton aria-label={`Remover ${exercise.name}`} color="error" onClick={() => remove(exercise.id)}><Delete /></IconButton>
                    </Box>
                  ))}
                </Stack>
                <Box sx={{ p: 2, pt: 1, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 160px))', gap: 1.5 }}>
                  <TextField size="small" label="Séries combinadas" type="number" value={block.series} onChange={event => updateGroup(block.id, { series: Math.max(1, Math.round(Number(event.target.value) || 1)) })} inputProps={{ min: 1, step: 1, inputMode: 'numeric' }} />
                  <TextField size="small" label="Descanso ao final" type="number" value={block.rest} onChange={event => updateGroup(block.id, { rest: Math.max(0, Math.round(Number(event.target.value) || 0)) })} inputProps={{ min: 0, step: 1, inputMode: 'numeric' }} InputProps={{ endAdornment: <Typography color="text.secondary">s</Typography> }} />
                </Box>
              </Paper>
            ) : (() => {
              const exercise = block.exercises[0];
              return (
                <Paper key={exercise.id} sx={{ p: 2, border: `1px solid ${tokens.color.line}`, display: 'grid', gridTemplateColumns: { xs: '44px minmax(0,1fr)', sm: '44px 44px minmax(0,1fr) auto' }, gap: 1.25, alignItems: 'center' }}>
                  <Checkbox checked={selectedForCombination.includes(exercise.id)} onChange={() => toggleCombinationSelection(exercise.id)} inputProps={{ 'aria-label': `Selecionar ${exercise.name} para combinar` }} />
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: { xs: 'none', sm: 'grid' }, placeItems: 'center', fontWeight: 800 }}>{index + 1}</Box>
                  <Box minWidth={0}><Typography fontWeight={750}>{exercise.name}</Typography><Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exercise.instructions || `${exercise.series} séries · ${exercise.rest}s de descanso`}</Typography></Box>
                  <Stack direction="row" flexWrap="wrap" justifyContent="flex-end" sx={{ gridColumn: { xs: '2', sm: 'auto' } }}>
                    <IconButton aria-label={`Mover ${exercise.name} para cima`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUpward /></IconButton>
                    <IconButton aria-label={`Mover ${exercise.name} para baixo`} disabled={index === blocks.length - 1} onClick={() => move(index, 1)}><ArrowDownward /></IconButton>
                    <IconButton aria-label={`Remover ${exercise.name}`} color="error" onClick={() => remove(exercise.id)}><Delete /></IconButton>
                  </Stack>
                </Paper>
              );
            })())}
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
