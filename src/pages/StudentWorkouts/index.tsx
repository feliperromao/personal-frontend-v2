import { useCallback, useEffect, useState } from 'react';
import { ArrowForward, Replay } from '@mui/icons-material';
import { Alert, Box, Button, Chip, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Template from '../../components/Template';
import { Training, TrainingProgress } from '../../domain/types';
import { tokens } from '../../theme';
import api from '../@shared/api';

export default function StudentWorkouts() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [current, setCurrent] = useState<TrainingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [trainingResponse, currentResponse] = await Promise.all([
        api.get('/training-progress'),
        api.get('/training-progress/current').catch(() => ({ data: null })),
      ]);
      const list = Array.isArray(trainingResponse.data) ? trainingResponse.data : trainingResponse.data?.data || [];
      setTrainings(list);
      setCurrent(currentResponse.data || null);
    } catch (requestError: any) {
      setError(requestError?.response ? 'Não foi possível carregar seus treinos. Tente novamente.' : 'Sem conexão com o servidor. Reconecte-se para carregar seus treinos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <Template type="STUDENT" pageName="Meus treinos">
      <Stack spacing={3}>
        <Box>
          <Typography component="h2" variant="h2">Treinos no seu ritmo</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: '65ch' }}>Escolha uma ficha para ver a sequência. O treino só começa depois da sua confirmação.</Typography>
        </Box>

        {error && (
          <Alert severity="error" action={<Button color="inherit" startIcon={<Replay />} onClick={fetchData}>Tentar novamente</Button>}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box aria-label="Carregando treinos" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0,1fr))' }, gap: 2 }}>
            {[1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={190} />)}
          </Box>
        ) : trainings.length === 0 && !error ? (
          <Paper sx={{ p: { xs: 3, md: 5 }, border: `1px solid ${tokens.color.line}`, maxWidth: 680 }}>
            <Typography variant="h4">Nenhum treino liberado</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Quando seu personal publicar uma ficha, ela aparecerá aqui.</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0,1fr))', xl: 'repeat(3, minmax(0,1fr))' }, gap: 2 }}>
            {trainings.map((training, index) => {
              const isCurrent = current?.training_id === training.id;
              return (
                <Paper key={training.id} sx={{ p: 2.5, border: `1px solid ${isCurrent ? tokens.color.primary : tokens.color.line}`, display: 'flex', flexDirection: 'column', minHeight: 190 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                    <Typography aria-hidden="true" sx={{ color: 'primary.main', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{String(index + 1).padStart(2, '0')}</Typography>
                    {isCurrent && <Chip size="small" color="secondary" label="Em andamento" />}
                  </Stack>
                  <Typography component="h3" variant="h4" sx={{ mt: 2 }}>{training.name}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.75, mb: 2 }}>{training.description || `${training.exercises?.length || 0} exercícios`}</Typography>
                  <Button component={Link} to={`/my-workouts/${training.id}`} endIcon={<ArrowForward />} sx={{ mt: 'auto', alignSelf: 'flex-start' }}>
                    {isCurrent ? 'Retomar treino' : 'Ver treino'}
                  </Button>
                </Paper>
              );
            })}
          </Box>
        )}
      </Stack>
    </Template>
  );
}
