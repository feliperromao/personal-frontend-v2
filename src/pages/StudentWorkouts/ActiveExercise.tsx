import { useEffect, useMemo, useState } from 'react';
import { Add, Check, Close, FormatListNumbered, Remove, SkipNext } from '@mui/icons-material';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, IconButton, InputAdornment, Paper, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Template from '../../components/Template';
import { FinishStatus, Training, TrainingProgress, UserRole } from '../../domain/types';
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
  const [seriesLoad, setSeriesLoad] = useState('0');
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
          setProgress(current);
          setTraining({ ...detail.data, exercises: executionExercises });
          sessionStorage.setItem('active-training-progress', JSON.stringify(current));
          const exercise = executionExercises.find(item => item.id === exerciseId);
          const history = (current.completed_series || [])
            .filter(item => item.exercise_id === exerciseId)
            .sort((a, b) => a.series - b.series);
          const localSeries = Number(sessionStorage.getItem(`series:${current.id}:${exerciseId}`) || 0);
          const serverSeries = history.reduce((highest, item) => Math.max(highest, item.series), 0);
          setCompletedSeries(Math.max(serverSeries, localSeries));
          const pendingLoad = sessionStorage.getItem(`load:${current.id}:${exerciseId}`);
          setSeriesLoad(pendingLoad ?? String(history.at(-1)?.load ?? current.last_loads?.[exerciseId] ?? 0));
          setRestSeconds(Number(sessionStorage.getItem(`rest:${current.id}:${exerciseId}`) || 0));
        }
      } catch { if (active) setError('Não encontramos uma execução ativa deste treino. Volte e inicie ou retome o treino.'); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [exerciseId, online, trainingId]);

  const exerciseIndex = training?.exercises?.findIndex((item) => item.id === exerciseId) ?? -1;
  const exercise = exerciseIndex >= 0 ? training?.exercises?.[exerciseIndex] : undefined;
  const allSeriesDone = Boolean(exercise && completedSeries >= exercise.series);
  const exercises = useMemo(() => training?.exercises || [], [training?.exercises]);
  const nextPendingExercise = useMemo(() => findNextPendingExercise(exercises, progress, exerciseId), [exerciseId, exercises, progress]);
  const workoutSummary = useMemo(() => getWorkoutProgress(exercises, progress), [exercises, progress]);

  useEffect(() => {
    if (restSeconds <= 0) return;
    const timer = window.setInterval(() => setRestSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [restSeconds]);

  useEffect(() => {
    if (progress && exerciseId) sessionStorage.setItem(`rest:${progress.id}:${exerciseId}`, String(restSeconds));
  }, [exerciseId, progress, restSeconds]);

  const updateSeriesLoad = (value: string) => {
    setSeriesLoad(value);
    if (progress && exerciseId) {
      sessionStorage.setItem(`load:${progress.id}:${exerciseId}`, value);
    }
  };

  const adjustLoad = (amount: number) => {
    const parsed = Number(seriesLoad.replace(',', '.'));
    const next = Math.max(0, (Number.isFinite(parsed) ? parsed : 0) + amount);
    updateSeriesLoad(String(Math.round(next * 10) / 10));
  };

  const completeSeries = async () => {
    if (!exercise || !progress || allSeriesDone || !online || savingSeries) return;
    const load = Number(seriesLoad.replace(',', '.'));
    if (!Number.isFinite(load) || load < 0) {
      setError('Informe uma carga válida antes de concluir a série.');
      return;
    }
    const next = Math.min(completedSeries + 1, exercise.series);
    setSavingSeries(true);
    setError('');
    try {
      const { data } = await api.post<TrainingProgress>('/training-progress/series', {
        id: progress.id,
        exercise_id: exercise.id,
        series: next,
        load,
      });
      setProgress(data);
      setCompletedSeries(next);
      setRestSeconds(next < exercise.series ? exercise.rest : 0);
      sessionStorage.setItem('active-training-progress', JSON.stringify(data));
      sessionStorage.setItem(`series:${progress.id}:${exercise.id}`, String(next));
      sessionStorage.setItem(`load:${progress.id}:${exercise.id}`, String(load));
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

  const setStops = useMemo(() => Array.from({ length: exercise?.series || 0 }), [exercise?.series]);

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
              <Typography component="h2" variant="h1" sx={{ maxWidth: { xs: '64%', sm: '70%' }, position: 'relative', zIndex: 1, fontSize: { xs: 'clamp(2.75rem, 11.5vw, 3.5rem)', sm: '4.75rem' }, transform: 'translateY(-8px)' }}>{exercise.name}</Typography>
              <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: '1.15rem', fontWeight: 650 }}>Série {Math.min(completedSeries + 1, exercise.series)} de {exercise.series}</Typography>
              <Typography aria-hidden="true" sx={{ position: 'absolute', right: 0, top: -34, color: '#8989A3', fontSize: { xs: '8rem', sm: '11rem' }, lineHeight: 1, fontWeight: 850, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', pointerEvents: 'none' }}>
                {String(exerciseIndex + 1).padStart(2, '0')}
              </Typography>
            </Box>

            <Box sx={{ py: 2, pl: 3, borderBlock: `1px solid ${tokens.color.line}`, position: 'relative', '&::before': { content: '""', position: 'absolute', left: 0, top: -6, width: 6, height: 36, borderRadius: 3, bgcolor: 'secondary.main' } }}>
              <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 700, transform: 'translateY(-30px)' }}>{exercise.instructions || 'Sem instruções adicionais para este exercício.'}</Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', borderBottom: `1px solid ${tokens.color.line}` }}>
              <Box sx={{ py: 2, pr: 2, borderRight: `1px solid ${tokens.color.line}` }}>
                <Typography color="text.primary" fontWeight={650} sx={{ transform: 'translateY(-32px)' }}>Carga desta série</Typography>
                <TextField
                  value={seriesLoad}
                  onChange={(event) => updateSeriesLoad(event.target.value)}
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
                  <IconButton aria-label="Diminuir carga em 1 kg" onClick={() => adjustLoad(-1)} disabled={savingSeries || allSeriesDone || Number(seriesLoad) <= 0} sx={{ width: 44, height: 44, border: `1px solid ${tokens.color.line}`, borderRadius: 1.5 }}><Remove /></IconButton>
                  <IconButton aria-label="Aumentar carga em 1 kg" onClick={() => adjustLoad(1)} disabled={savingSeries || allSeriesDone} sx={{ width: 44, height: 44, border: `1px solid ${tokens.color.line}`, borderRadius: 1.5 }}><Add /></IconButton>
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

            <Box aria-label={`${completedSeries} de ${exercise.series} séries concluídas`} sx={{ display: 'grid', gridTemplateColumns: `repeat(${exercise.series}, minmax(0,1fr))`, gap: 1, py: 1, mt: '-24px', borderBottom: `1px solid ${tokens.color.line}`, position: 'relative', '&::before': { content: '""', position: 'absolute', left: '9%', right: '9%', top: 27, height: 2, bgcolor: 'divider' } }}>
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
              bottom: { xs: 'var(--app-bottom-nav)', md: 'auto' },
              zIndex: { xs: 1100, md: 'auto' },
              mt: { md: 2 },
              px: { xs: 2, md: 0 },
              py: { xs: 1, md: 0 },
              bgcolor: { xs: 'rgba(248, 248, 248, 0.96)', md: 'transparent' },
              borderTop: { xs: `1px solid ${tokens.color.line}`, md: 0 },
            }}>
              <Button fullWidth variant="contained" size="large" disabled={savingSeries || (!allSeriesDone && !online)} onClick={allSeriesDone ? continueWorkout : completeSeries} sx={{ minHeight: 56, maxWidth: 900, mx: 'auto', display: 'flex', fontSize: '1.15rem' }}>
                {savingSeries ? 'Registrando série…' : allSeriesDone ? (nextPendingExercise ? 'Próximo exercício pendente' : 'Finalizar treino') : 'Concluir série'}
              </Button>
            </Box>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {!allSeriesDone && (
                <Button variant="text" startIcon={<SkipNext />} disabled={savingSeries} onClick={skipExercise} sx={{ minHeight: 48 }}>
                  Pular por agora
                </Button>
              )}
            </Stack>
            {exercise.video && (
              <VideoCard url={exercise.video} title={exercise.name} collapsible />
            )}
          </>
        ) : !error && <Alert severity="error">Exercício não encontrado neste treino.</Alert>}
      </Stack>

      <WorkoutExerciseNavigator
        open={exercisesOpen}
        exercises={exercises}
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
