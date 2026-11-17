import { useCallback, useEffect, useState } from 'react';
import { ArrowBack, ArrowForward, Close, PlayArrow, Replay } from '@mui/icons-material';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, Typography } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Template from '../../components/Template';
import { Training, TrainingProgress } from '../../domain/types';
import { usePwa } from '../../platform/PwaContext';
import { tokens } from '../../theme';
import api from '../@shared/api';
import { findFirstPendingExercise, getExerciseProgress } from './workoutProgress';

export default function StudentWorkoutDetails() {
  const { trainingId = '' } = useParams();
  const navigate = useNavigate();
  const { online } = usePwa();
  const [training, setTraining] = useState<Training | null>(null);
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);

  const load = useCallback(async () => {
    if (!online) { setLoading(false); setError('Reconecte-se para consultar os detalhes deste treino.'); return; }
    setLoading(true); setError('');
    try {
      const [detail, current] = await Promise.all([
        api.get(`/training-progress/${trainingId}`),
        api.get('/training-progress/current').catch(() => ({ data: null })),
      ]);
      setTraining(detail.data);
      setProgress(current.data?.training_id === trainingId ? current.data : null);
    } catch {
      setError('Não foi possível abrir este treino. Tente novamente.');
    } finally { setLoading(false); }
  }, [online, trainingId]);

  useEffect(() => { load(); }, [load]);

  const firstExercisePath = (data: TrainingProgress | Training, activeProgress: TrainingProgress | null = null) => {
    const exercises = data.exercises || [];
    const exercise = activeProgress ? findFirstPendingExercise(exercises, activeProgress) || exercises[0] : exercises[0];
    return exercise ? `/my-workouts/${trainingId}/exercises/${exercise.id}` : `/my-workouts/${trainingId}`;
  };

  const start = async () => {
    if (!online || !training) return;
    if (!training.exercises?.length) { setError('Este treino ainda não possui exercícios.'); return; }
    setWorking(true); setError('');
    try {
      const { data } = await api.post<TrainingProgress>('/training-progress/start', { id: trainingId });
      sessionStorage.setItem('active-training-progress', JSON.stringify(data));
      navigate(firstExercisePath(data));
    } catch (requestError: any) {
      try {
        const { data } = await api.get<TrainingProgress>('/training-progress/current');
        if (data?.training_id === trainingId) {
          sessionStorage.setItem('active-training-progress', JSON.stringify(data));
          navigate(firstExercisePath(data));
          return;
        }
      } catch { /* keep the original start error */ }
      setError(requestError?.response ? 'Já existe um treino em andamento ou não foi possível iniciar. Retome o treino atual antes de começar outro.' : 'A conexão caiu antes de iniciar. Tente novamente quando estiver online.');
    } finally { setWorking(false); }
  };

  const resume = () => {
    if (!progress) return;
    sessionStorage.setItem('active-training-progress', JSON.stringify(progress));
    navigate(firstExercisePath(progress, progress));
  };

  const cancel = async () => {
    if (!progress || !online) return;
    setWorking(true);
    try {
      await api.post('/training-progress/calcel', { id: progress.id });
      sessionStorage.removeItem('active-training-progress');
      setProgress(null);
      setCancelOpen(false);
    } catch { setError('Não foi possível cancelar o treino. Mantenha a página aberta e tente novamente.'); }
    finally { setWorking(false); }
  };

  return (
    <Template type="STUDENT" pageName={training?.name || 'Detalhes do treino'}>
      <Stack spacing={3} sx={{ maxWidth: 900 }}>
        <Button component={Link} to="/my-workouts" startIcon={<ArrowBack />} sx={{ alignSelf: 'flex-start' }}>Voltar aos treinos</Button>
        {error && <Alert severity="error" action={online ? <Button color="inherit" startIcon={<Replay />} onClick={load}>Tentar novamente</Button> : undefined}>{error}</Alert>}
        {loading ? <Stack spacing={2} alignItems="center" py={8}><CircularProgress /><Typography>Carregando treino…</Typography></Stack> : training && (
          <>
            <Box>
              <Typography component="h2" variant="h2">{training.name}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, maxWidth: '65ch' }}>{training.description || 'Siga os exercícios na ordem indicada pelo seu personal.'}</Typography>
            </Box>
            {!online && <Alert severity="warning">Sem conexão: iniciar, retomar e cancelar permanecem bloqueados.</Alert>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {progress ? (
                <>
                  <Button variant="contained" startIcon={<PlayArrow />} disabled={!online || working} onClick={resume}>Retomar treino</Button>
                  <Button color="error" variant="outlined" startIcon={<Close />} disabled={!online || working} onClick={() => setCancelOpen(true)}>Cancelar treino</Button>
                </>
              ) : (
                <Button variant="contained" size="large" startIcon={<PlayArrow />} disabled={!online || working || !training.exercises?.length} onClick={start}>
                  {working ? 'Iniciando…' : 'Iniciar treino'}
                </Button>
              )}
            </Stack>
            <Paper sx={{ border: `1px solid ${tokens.color.line}`, overflow: 'hidden' }}>
              <Box sx={{ p: 2.5 }}>
                <Typography component="h3" variant="h4">Sequência</Typography>
                <Typography color="text.secondary">{training.exercises?.length || 0} exercícios</Typography>
              </Box>
              <Divider />
              <Stack divider={<Divider flexItem />}>
                {training.exercises?.map((exercise, index) => {
                  const exerciseProgress = getExerciseProgress(exercise, progress);
                  return (
                  <Box key={exercise.id} sx={{ p: 2.5, display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 1.5, alignItems: 'center' }}>
                    <Chip label={exerciseProgress.complete ? '✓' : index + 1} color={exerciseProgress.complete ? 'success' : 'default'} variant={exerciseProgress.complete ? 'filled' : 'outlined'} aria-label={`Exercício ${index + 1}${exerciseProgress.complete ? ' concluído' : ''}`} />
                    <Box minWidth={0}>
                      <Typography fontWeight={750}>{exercise.name}</Typography>
                      <Typography variant="body2" color={exerciseProgress.complete ? 'success.main' : 'text.secondary'}>
                        {progress ? `${exerciseProgress.completedSeries} de ${exercise.series} séries` : `${exercise.series} séries · descanso de ${exercise.rest}s`}
                      </Typography>
                    </Box>
                    {progress && <Button component={Link} to={`/my-workouts/${trainingId}/exercises/${exercise.id}`} aria-label={`Abrir ${exercise.name}`}><ArrowForward /></Button>}
                  </Box>
                  );
                })}
              </Stack>
            </Paper>
          </>
        )}
      </Stack>

      <Dialog open={cancelOpen} onClose={() => !working && setCancelOpen(false)} aria-labelledby="cancel-title">
        <DialogTitle id="cancel-title">Cancelar treino?</DialogTitle>
        <DialogContent><Typography>O progresso desta execução será descartado. Essa ação não pode ser desfeita.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)} disabled={working}>Continuar treino</Button>
          <Button color="error" variant="contained" onClick={cancel} disabled={working || !online}>Cancelar treino</Button>
        </DialogActions>
      </Dialog>
    </Template>
  );
}
