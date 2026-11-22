import { useEffect, useMemo, useState } from 'react';
import { Add, Check, Close, FormatListNumbered, Remove, SkipNext } from '@mui/icons-material';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, IconButton, InputAdornment, Paper, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Template from '../../components/Template';
import { FinishStatus, Training, TrainingProgress, UserRole } from '../../domain/types';
import { getWorkoutBlockForExercise } from '../../domain/workoutBlocks';
import { usePwa } from '../../platform/PwaContext';
import { tokens } from '../../theme';
import api from '../@shared/api';
import VideoCard from './VideoCard';
import WorkoutExerciseNavigator from './WorkoutExerciseNavigator';
import { findNextPendingExercise, getExerciseProgress, getWorkoutProgress } from './workoutProgress';
import { getWorkoutRoutes } from './workoutRoutes';

const statuses: Array<{ value: FinishStatus; label: string }> = [
  { value: 'LEVE', label: 'Leve' },
  { value: 'MODERADA', label: 'Moderada' },
  { value: 'INTENSA', label: 'Intensa' },
  { value: 'MUITO_INTENSA', label: 'Muito intensa' },
];

function formatTime(total: number) {
  const minutes = Math.floor(total / 60).toString().padStart(2, '0');
  const seconds = (total % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

interface ActiveExerciseProps {
  mode?: UserRole;
}

export default function ActiveExercise({ mode = 'STUDENT' }: ActiveExerciseProps) {
  const { trainingId = '', exerciseId = '' } = useParams();
  const navigate = useNavigate();
  const { online } = usePwa();
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [training, setTraining] = useState<Training | null>(null);
  const [completedSeries, setCompletedSeries] = useState(0);
  const [seriesLoads, setSeriesLoads] = useState<Record<string, string>>({});
  const [restSeconds, setRestSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [finishOpen, setFinishOpen] = useState(false);
  const [status, setStatus] = useState<FinishStatus>('MODERADA');
  const [feedback, setFeedback] = useState('');
  const [finishing, setFinishing] = useState(false);
  const [savingSeries, setSavingSeries] = useState(false);
  const [exercisesOpen, setExercisesOpen] = useState(false);
  const personal = mode === 'PERSONAL';
  const routes = getWorkoutRoutes(mode, trainingId);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);

  useEffect(() => {
    if (!online) { setLoading(false); setError('Reconecte-se para retomar com segurança os dados deste treino.'); return; }
    let active = true;
    (async () => {
      setLoading(true); setError('');
      try {
        const response = await api.get<TrainingProgress>('/training-progress/current');
        const current = response.data;
        const detail = await api.get<Training>(`/training-progress/${trainingId}`);
        if (active) {
          if (!current || current.training_id !== trainingId) throw new Error('no-current');
          const executionExercises = current.exercises?.length
            ? current.exercises
            : detail.data.exercises || [];
          const executionGroups = current.exercise_groups?.length
            ? current.exercise_groups
            : detail.data.exercise_groups || [];
          setProgress(current);
          setTraining({ ...detail.data, exercises: executionExercises, exercise_groups: executionGroups });
          sessionStorage.setItem('active-training-progress', JSON.stringify(current));
          const block = getWorkoutBlockForExercise(executionExercises, executionGroups, exerciseId);
          const blockExercises = block?.exercises || executionExercises.filter(item => item.id === exerciseId);
          const storageId = block?.isCombination ? block.id : exerciseId;
          const localSeries = Number(sessionStorage.getItem(`series:${current.id}:${storageId}`) || 0);
          const serverSeries = Array.from({ length: block?.series || blockExercises[0]?.series || 0 }, (_, index) => index + 1)
            .filter(series => blockExercises.every(item => (current.completed_series || [])
              .some(history => history.exercise_id === item.id && history.series === series))).length;
          setCompletedSeries(Math.max(serverSeries, localSeries));
          setSeriesLoads(Object.fromEntries(blockExercises.map(item => {
            const history = (current.completed_series || []).filter(entry => entry.exercise_id === item.id).sort((a, b) => a.series - b.series);
            const pendingLoad = sessionStorage.getItem(`load:${current.id}:${item.id}`);
            return [item.id, pendingLoad ?? String(history.at(-1)?.load ?? current.last_loads?.[item.id] ?? 0)];
          })));
          setRestSeconds(Number(sessionStorage.getItem(`rest:${current.id}:${storageId}`) || 0));
        }
      } catch { if (active) setError('Não encontramos uma execução ativa deste treino. Volte e inicie ou retome o treino.'); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [exerciseId, online, trainingId]);

  const exerciseIndex = training?.exercises?.findIndex((item) => item.id === exerciseId) ?? -1;
  const exercise = exerciseIndex >= 0 ? training?.exercises?.[exerciseIndex] : undefined;
  const exercises = useMemo(() => training?.exercises || [], [training?.exercises]);
  const groups = useMemo(() => training?.exercise_groups || [], [training?.exercise_groups]);
  const activeBlock = useMemo(() => getWorkoutBlockForExercise(exercises, groups, exerciseId), [exerciseId, exercises, groups]);
  const activeExercises = activeBlock?.exercises || (exercise ? [exercise] : []);
  const totalSeries = activeBlock?.series || exercise?.series || 0;
  const storageId = activeBlock?.isCombination ? activeBlock.id : exerciseId;
  const allSeriesDone = Boolean(exercise && completedSeries >= totalSeries);
  const nextPendingExercise = useMemo(() => findNextPendingExercise(exercises, progress, exerciseId, groups), [exerciseId, exercises, groups, progress]);
  const workoutSummary = useMemo(() => getWorkoutProgress(exercises, progress, groups), [exercises, groups, progress]);

  useEffect(() => {
    if (restSeconds <= 0) return;
    const timer = window.setInterval(() => setRestSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [restSeconds]);

  useEffect(() => {
    if (progress && storageId) sessionStorage.setItem(`rest:${progress.id}:${storageId}`, String(restSeconds));
  }, [progress, restSeconds, storageId]);

  const updateSeriesLoad = (targetExerciseId: string, value: string) => {
    setSeriesLoads(current => ({ ...current, [targetExerciseId]: value }));
    if (progress) {
      sessionStorage.setItem(`load:${progress.id}:${targetExerciseId}`, value);
    }
  };

  const adjustLoad = (targetExerciseId: string, amount: number) => {
    const parsed = Number((seriesLoads[targetExerciseId] || '0').replace(',', '.'));
    const next = Math.max(0, (Number.isFinite(parsed) ? parsed : 0) + amount);
    updateSeriesLoad(targetExerciseId, String(Math.round(next * 10) / 10));
  };

  const completeSeries = async () => {
    if (!exercise || !progress || allSeriesDone || !online || savingSeries) return;
    const exerciseLoads = activeExercises.map(item => ({ exercise_id: item.id, load: Number((seriesLoads[item.id] || '0').replace(',', '.')) }));
    if (exerciseLoads.some(item => !Number.isFinite(item.load) || item.load < 0)) {
      setError('Informe uma carga válida para cada exercício antes de concluir a série.');
      return;
    }
    const next = Math.min(completedSeries + 1, totalSeries);
    setSavingSeries(true);
    setError('');
    try {
      const request = activeBlock?.isCombination
        ? api.post<TrainingProgress>('/training-progress/series-group', {
          id: progress.id,
          group_id: activeBlock.id,
          series: next,
          exercises: exerciseLoads,
        })
        : api.post<TrainingProgress>('/training-progress/series', {
          id: progress.id,
          exercise_id: exercise.id,
          series: next,
          load: exerciseLoads[0].load,
        });
      const { data } = await request;
      setProgress(data);
      setCompletedSeries(next);
      setRestSeconds(next < totalSeries ? (activeBlock?.rest ?? exercise.rest) : 0);
      sessionStorage.setItem('active-training-progress', JSON.stringify(data));
      sessionStorage.setItem(`series:${progress.id}:${storageId}`, String(next));
      exerciseLoads.forEach(item => sessionStorage.setItem(`load:${progress.id}:${item.exercise_id}`, String(item.load)));
    } catch {
      setError('A série não foi registrada. A carga permanece na tela; verifique a conexão e tente novamente.');
    } finally {
      setSavingSeries(false);
    }
  };

  const continueWorkout = () => {
    if (nextPendingExercise) navigate(routes.exercise(nextPendingExercise.id));
    else setFinishOpen(true);
  };

  const skipExercise = () => {
    setRestSeconds(0);
    if (nextPendingExercise) navigate(routes.exercise(nextPendingExercise.id));
    else setFinishOpen(true);
  };

  const openFinish = () => {
    setExercisesOpen(false);
    setFinishOpen(true);
  };

  const finish = async () => {
    if (!progress || !online) return;
    setFinishing(true); setError('');
    try {
      await api.post('/training-progress/finish', { id: progress.id, status, feedback: feedback.trim() || undefined });
      sessionStorage.removeItem('active-training-progress');
      Object.keys(sessionStorage).filter((key) => key.startsWith(`series:${progress.id}:`) || key.startsWith(`rest:${progress.id}:`) || key.startsWith(`load:${progress.id}:`)).forEach((key) => sessionStorage.removeItem(key));
      navigate(routes.list, { replace: true, state: { completed: true } });
    } catch { setError('A finalização não foi confirmada pelo servidor. As séries e cargas já registradas continuam salvas; reconecte-se e tente novamente.'); setFinishOpen(false); }
    finally { setFinishing(false); }
  };

  const setStops = useMemo(() => Array.from({ length: totalSeries }), [totalSeries]);

  return (
    <Template type={mode} pageName={training?.name || 'Treino ativo'}>
      <Stack spacing={0} sx={{ maxWidth: 900, mx: 'auto', position: 'relative', pb: { xs: 10, md: 0 } }}>
        {!online && <Alert severity="warning">Sem conexão. Registrar séries e concluir o treino permanecem bloqueados até a reconexão.</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        {loading ? <Typography role="status">Carregando exercício…</Typography> : exercise ? (
          <>
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
              <Button startIcon={<FormatListNumbered />} onClick={() => setExercisesOpen(true)}>
                Exercícios · {workoutSummary.completedExercises}/{workoutSummary.totalExercises}
              </Button>
            </Stack>
            <Box sx={{ position: 'relative', minHeight: { xs: 142, sm: 190 }, borderBottom: `1px solid ${tokens.color.line}`, pb: 2, mt: '-6px!important' }}>
              <Box component="svg" viewBox="0 0 320 210" aria-hidden="true" sx={{ position: 'absolute', right: -16, top: -68, width: { xs: '68%', sm: '52%' }, height: 220, color: tokens.color.line, opacity: 0.7, pointerEvents: 'none' }}>
                <path d="M318 12C232 44 218 84 154 102S45 134 8 205" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M320 46C251 69 236 105 173 121S69 151 38 209" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M320 80C270 96 254 124 197 140S100 166 76 210" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </Box>
              <Typography component="h2" variant="h1" sx={{ maxWidth: { xs: '70%', sm: '78%' }, position: 'relative', zIndex: 1, fontSize: { xs: 'clamp(2.5rem, 10vw, 3.5rem)', sm: '4.75rem' }, transform: 'translateY(-8px)' }}>{activeBlock?.isCombination ? 'Série combinada' : exercise.name}</Typography>
              <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: '1.15rem', fontWeight: 650 }}>Série {Math.min(completedSeries + 1, totalSeries)} de {totalSeries}{activeBlock?.isCombination ? ` · ${activeExercises.length} exercícios seguidos` : ''}</Typography>
              <Typography aria-hidden="true" sx={{ display: { xs: activeBlock?.isCombination ? 'none' : 'block', sm: 'block' }, position: 'absolute', right: 0, top: -34, color: '#8989A3', fontSize: { xs: '8rem', sm: '11rem' }, lineHeight: 1, fontWeight: 850, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', pointerEvents: 'none' }}>
                {String(exerciseIndex + 1).padStart(2, '0')}
              </Typography>
            </Box>

            <Box sx={{ py: 2, pl: 3, borderBlock: `1px solid ${tokens.color.line}`, position: 'relative', '&::before': { content: '""', position: 'absolute', left: 0, top: -6, width: 6, height: 36, borderRadius: 3, bgcolor: 'secondary.main' } }}>
              <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 700, transform: 'translateY(-30px)' }}>{activeBlock?.isCombination ? 'Faça todos na ordem abaixo, sem pausa. O descanso começa somente depois do último.' : (exercise.instructions || 'Sem instruções adicionais para este exercício.')}</Typography>
            </Box>

            {activeBlock?.isCombination ? (
              <Stack spacing={1.5} sx={{ py: 2, borderBottom: `1px solid ${tokens.color.line}` }}>
                {activeExercises.map((item, itemIndex) => (
                  <Paper key={item.id} component="section" aria-labelledby={`combination-exercise-${item.id}`} sx={{ p: 2, border: `1px solid ${tokens.color.line}` }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '40px minmax(0,1fr)', gap: 1.5, alignItems: 'start' }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{itemIndex + 1}</Box>
                      <Box minWidth={0}>
                        <Typography id={`combination-exercise-${item.id}`} variant="h4">{item.name}</Typography>
                        <Typography color="text.secondary" sx={{ mt: 0.25 }}>{item.instructions || 'Sem instruções adicionais.'}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'minmax(0,1fr) auto' }, gap: 2, alignItems: 'end' }}>
                      <TextField
                        label={`Carga — ${item.name}`}
                        value={seriesLoads[item.id] || '0'}
                        onChange={(event) => updateSeriesLoad(item.id, event.target.value)}
                        type="number"
                        disabled={savingSeries || allSeriesDone}
                        inputProps={{ min: 0, step: 0.5, inputMode: 'decimal', 'aria-label': `Carga de ${item.name} em quilogramas` }}
                        InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                      />
                      <Stack direction="row" spacing={1}>
                        <IconButton aria-label={`Diminuir carga de ${item.name} em 1 kg`} onClick={() => adjustLoad(item.id, -1)} disabled={savingSeries || allSeriesDone || Number(seriesLoads[item.id]) <= 0} sx={{ width: 44, height: 44, border: `1px solid ${tokens.color.line}`, borderRadius: 1.5 }}><Remove /></IconButton>
                        <IconButton aria-label={`Aumentar carga de ${item.name} em 1 kg`} onClick={() => adjustLoad(item.id, 1)} disabled={savingSeries || allSeriesDone} sx={{ width: 44, height: 44, border: `1px solid ${tokens.color.line}`, borderRadius: 1.5 }}><Add /></IconButton>
                      </Stack>
                    </Box>
                  </Paper>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2, px: 1 }}>
                  <Typography fontWeight={700}>Descanso após o último</Typography>
                  <Typography variant="h3" sx={{ color: 'info.main', fontVariantNumeric: 'tabular-nums' }}>{activeBlock.rest}s</Typography>
                </Box>
              </Stack>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', borderBottom: `1px solid ${tokens.color.line}` }}>
                <Box sx={{ py: 2, pr: 2, borderRight: `1px solid ${tokens.color.line}` }}>
                  <Typography color="text.primary" fontWeight={650} sx={{ transform: 'translateY(-32px)' }}>Carga desta série</Typography>
                  <TextField
                    value={seriesLoads[exercise.id] || '0'}
                    onChange={(event) => updateSeriesLoad(exercise.id, event.target.value)}
                    type="number"
                    variant="standard"
                    disabled={savingSeries || allSeriesDone}
                    inputProps={{ min: 0, step: 0.5, inputMode: 'decimal', 'aria-label': 'Carga da série em quilogramas' }}
                    InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                    sx={{
                      transform: 'translateY(-32px)',
                      width: '100%',
                      maxWidth: 180,
                      borderBottom: `6px solid ${tokens.color.energy}`,
                      '& .MuiInput-root::before, & .MuiInput-root::after': { display: 'none' },
                      '& input': { py: 0, fontSize: { xs: '3.2rem', sm: '4rem' }, lineHeight: 1, fontWeight: 800, fontVariantNumeric: 'tabular-nums' },
                      '& .MuiInputAdornment-root': { mt: 1.5 },
                      '& .MuiInputAdornment-root p': { color: 'text.primary', fontSize: '1.75rem', fontWeight: 800 },
                    }}
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: -3.25 }}>
                    <IconButton aria-label="Diminuir carga em 1 kg" onClick={() => adjustLoad(exercise.id, -1)} disabled={savingSeries || allSeriesDone || Number(seriesLoads[exercise.id]) <= 0} sx={{ width: 44, height: 44, border: `1px solid ${tokens.color.line}`, borderRadius: 1.5 }}><Remove /></IconButton>
                    <IconButton aria-label="Aumentar carga em 1 kg" onClick={() => adjustLoad(exercise.id, 1)} disabled={savingSeries || allSeriesDone} sx={{ width: 44, height: 44, border: `1px solid ${tokens.color.line}`, borderRadius: 1.5 }}><Add /></IconButton>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    {progress?.last_loads?.[exercise.id] !== undefined && completedSeries === 0
                      ? 'Última carga registrada, ajuste se necessário'
                      : 'Registrada ao concluir'}
                  </Typography>
                </Box>
                <Box sx={{ py: 2, pl: 2 }}>
                  <Typography color="text.primary" fontWeight={650} sx={{ transform: 'translateY(-32px)' }}>{exercise.repetitions ? 'Repetições' : 'Descanso'}</Typography>
                  <Typography variant="h2" sx={{ fontSize: '3.5rem', fontVariantNumeric: 'tabular-nums', transform: 'translateY(-32px)', width: 'fit-content', borderBottom: `6px solid ${tokens.color.info}`, pb: 0.25 }}>{exercise.repetitions || exercise.rest} {!exercise.repetitions && <Typography component="span" fontSize=".7em" fontWeight="inherit">s</Typography>}</Typography>
                </Box>
              </Box>
            )}

            <Box aria-label={`${completedSeries} de ${totalSeries} séries concluídas`} sx={{ display: 'grid', gridTemplateColumns: `repeat(${totalSeries}, minmax(0,1fr))`, gap: 1, py: 1, mt: activeBlock?.isCombination ? 0 : '-24px', borderBottom: `1px solid ${tokens.color.line}`, position: 'relative', '&::before': { content: '""', position: 'absolute', left: '9%', right: '9%', top: 27, height: 2, bgcolor: 'divider' } }}>
              {setStops.map((_, index) => {
                const done = index < completedSeries;
                const active = index === completedSeries && !allSeriesDone;
                return (
                  <Box key={index} sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <Box sx={{
                      width: 34,
                      height: 34,
                      mx: 'auto',
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: done ? 'success.main' : active ? 'primary.main' : 'background.default',
                      color: done || active ? '#fff' : 'text.secondary',
                      border: `2px solid ${done ? tokens.color.success : active ? tokens.color.primary : tokens.color.line}`,
                      boxShadow: active ? `0 0 0 3px ${tokens.color.canvas}, 0 0 0 5px ${tokens.color.primary}` : 'none',
                      fontWeight: 800,
                      animation: active ? 'cadencePulse 620ms cubic-bezier(.2,.8,.2,1) both' : 'none',
                      '@keyframes cadencePulse': {
                        from: { transform: 'scale(.78)', opacity: 0.55 },
                        to: { transform: 'scale(1)', opacity: 1 },
                      },
                    }}>
                      {done ? <Check fontSize="small" /> : index + 1}
                    </Box>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>Série {index + 1}</Typography>
                  </Box>
                );
              })}
            </Box>

            {restSeconds > 0 && (
              <Paper sx={{ px: 0, py: 1.5, mt: 2, borderBlock: `1px solid ${tokens.color.line}`, borderRadius: 0, bgcolor: 'transparent', textAlign: 'center', transform: 'translateY(-13px)' }}>
                <Typography fontWeight={800} sx={{ letterSpacing: '.08em' }}>DESCANSO</Typography>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                  <Button variant="outlined" aria-label="Diminuir descanso em 10 segundos" onClick={() => setRestSeconds((value) => Math.max(0, value - 10))} sx={{ minWidth: 88, minHeight: 58, px: 1, borderWidth: 2, borderColor: 'primary.main', borderRadius: 1.5, whiteSpace: 'nowrap', fontSize: '1.2rem', fontWeight: 800, '&:hover': { borderWidth: 2, borderColor: 'primary.dark' } }}><Remove />10 s</Button>
                  <Typography aria-live="polite" variant="h2" sx={{ minWidth: 96, fontSize: '4rem', fontVariantNumeric: 'tabular-nums' }}>{formatTime(restSeconds)}</Typography>
                  <Button variant="outlined" aria-label="Aumentar descanso em 10 segundos" onClick={() => setRestSeconds((value) => value + 10)} sx={{ minWidth: 88, minHeight: 58, px: 1, borderWidth: 2, borderColor: 'primary.main', borderRadius: 1.5, whiteSpace: 'nowrap', fontSize: '1.2rem', fontWeight: 800, '&:hover': { borderWidth: 2, borderColor: 'primary.dark' } }}><Add />10 s</Button>
                </Stack>
              </Paper>
            )}

            {nextPendingExercise && allSeriesDone && (
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2 }}>
                <Typography aria-hidden="true" color="info.main" sx={{ pl: 1, pr: 2, borderRight: `1px solid ${tokens.color.muted}`, fontSize: '2.5rem', lineHeight: 1 }}>→</Typography>
                <Box sx={{ minWidth: 0 }}><Typography color="text.secondary">Próximo pendente</Typography><Typography variant="h4" noWrap sx={{ fontSize: '1.45rem' }}>{nextPendingExercise.name}</Typography></Box>
              </Stack>
            )}
            <Box sx={{
              position: { xs: 'fixed', md: 'static' },
              left: { xs: 0, md: 'auto' },
              right: { xs: 0, md: 'auto' },
              bottom: { xs: 'calc(var(--app-bottom-nav) + var(--app-safe-bottom))', md: 'auto' },
              zIndex: { xs: 1100, md: 'auto' },
              mt: { md: 2 },
              px: { xs: 2, md: 0 },
              py: { xs: 1, md: 0 },
              bgcolor: { xs: 'rgba(248, 248, 248, 0.96)', md: 'transparent' },
              borderTop: { xs: `1px solid ${tokens.color.line}`, md: 0 },
            }}>
              <Button fullWidth variant="contained" size="large" disabled={savingSeries || (!allSeriesDone && !online)} onClick={allSeriesDone ? continueWorkout : completeSeries} sx={{ minHeight: 56, maxWidth: 900, mx: 'auto', display: 'flex', fontSize: '1.15rem' }}>
                {savingSeries ? 'Registrando série…' : allSeriesDone ? (nextPendingExercise ? 'Próxima etapa pendente' : 'Finalizar treino') : activeBlock?.isCombination ? 'Concluir série combinada' : 'Concluir série'}
              </Button>
            </Box>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {!allSeriesDone && (
                <Button variant="text" startIcon={<SkipNext />} disabled={savingSeries} onClick={skipExercise} sx={{ minHeight: 48 }}>
                  Pular por agora
                </Button>
              )}
            </Stack>
            {activeExercises.filter(item => item.video).map(item => <VideoCard key={item.id} url={item.video!} title={item.name} collapsible />)}
          </>
        ) : !error && <Alert severity="error">Exercício não encontrado neste treino.</Alert>}
      </Stack>

      <WorkoutExerciseNavigator
        open={exercisesOpen}
        exercises={exercises}
        groups={groups}
        progress={progress}
        currentExerciseId={exerciseId}
        onClose={() => setExercisesOpen(false)}
        onSelect={(selected) => {
          setExercisesOpen(false);
          navigate(routes.exercise(selected.id));
        }}
        onFinish={openFinish}
      />

      <Dialog open={finishOpen} onClose={() => !finishing && setFinishOpen(false)} fullWidth maxWidth="sm" aria-labelledby="finish-title">
        <DialogTitle id="finish-title">Como foi o treino?</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {workoutSummary.pendingExercises > 0 ? (
              <Alert severity="warning">
                Você concluiu {workoutSummary.completedSeries} de {workoutSummary.totalSeries} séries em {workoutSummary.completedExercises} de {workoutSummary.totalExercises} exercícios. O que ficou pendente será registrado como não realizado nesta execução.
              </Alert>
            ) : (
              <Alert severity="success">Todos os exercícios e séries foram concluídos.</Alert>
            )}
            <Typography color="text.secondary">
              As cargas informadas em cada série serão mantidas no histórico desta execução para acompanhar sua evolução.
            </Typography>
            <FormControl>
              <FormLabel id="intensity-label">Intensidade percebida</FormLabel>
              <RadioGroup aria-labelledby="intensity-label" value={status} onChange={(event) => setStatus(event.target.value as FinishStatus)}>
                {statuses.map((item) => <FormControlLabel key={item.value} value={item.value} control={<Radio />} label={item.label} />)}
              </RadioGroup>
            </FormControl>
            <TextField label={personal ? 'Anotações da execução (opcional)' : 'Feedback para seu personal (opcional)'} multiline minRows={3} value={feedback} onChange={(event) => setFeedback(event.target.value)} inputProps={{ maxLength: 500 }} />
            {!online && <Alert severity="warning">Reconecte-se para enviar a conclusão.</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Close />} onClick={() => setFinishOpen(false)} disabled={finishing}>Voltar</Button>
          <Button variant="contained" onClick={finish} disabled={finishing || !online}>{finishing ? 'Enviando…' : 'Concluir treino'}</Button>
        </DialogActions>
      </Dialog>
    </Template>
  );
}
