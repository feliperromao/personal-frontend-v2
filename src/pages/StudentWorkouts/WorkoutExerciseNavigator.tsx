import { Check, Close, FlagOutlined, PlayArrow } from '@mui/icons-material';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Exercise, ExerciseGroup, TrainingProgress } from '../../domain/types';
import { getWorkoutBlocks } from '../../domain/workoutBlocks';
import { tokens } from '../../theme';
import { getExerciseProgress, getWorkoutProgress } from './workoutProgress';

interface WorkoutExerciseNavigatorProps {
  open: boolean;
  exercises: Exercise[];
  groups?: ExerciseGroup[];
  progress: TrainingProgress | null;
  currentExerciseId: string;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  onFinish: () => void;
}

export default function WorkoutExerciseNavigator({ open, exercises, groups = [], progress, currentExerciseId, onClose, onSelect, onFinish }: WorkoutExerciseNavigatorProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const workout = getWorkoutProgress(exercises, progress, groups);
  const blocks = getWorkoutBlocks(exercises, groups);

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm" aria-labelledby="exercise-navigator-title">
      <DialogTitle id="exercise-navigator-title" sx={{ pr: 7 }}>
        Etapas do treino
        <Button aria-label="Fechar lista de exercícios" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, minWidth: 44, width: 44, height: 44 }}><Close /></Button>
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Faça na ordem que funcionar melhor hoje. O que ficar pendente não será contado como realizado.
        </Typography>
        <Box sx={{ py: 1.5, borderBlock: `1px solid ${tokens.color.line}`, mb: 1 }} aria-live="polite">
          <Typography fontWeight={750}>{workout.completedExercises} de {workout.totalExercises} exercícios concluídos</Typography>
          <Typography variant="body2" color="text.secondary">{workout.completedSeries} de {workout.totalSeries} séries registradas</Typography>
        </Box>
        <Stack divider={<Divider flexItem />}>
          {blocks.map((block, index) => {
            const exercise = block.exercises[0];
            const item = getExerciseProgress(exercise, progress, groups, exercises);
            const current = block.exercises.some(member => member.id === currentExerciseId);
            const name = block.exercises.map(member => member.name).join(' + ');
            const status = item.complete ? 'Concluído' : item.completedSeries > 0 ? `${item.completedSeries} de ${item.totalSeries} séries` : 'Não iniciado';
            return (
              <Box key={block.id} sx={{ py: 1.5, display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr)', columnGap: 1.5, rowGap: 1, alignItems: 'center' }}>
                <Box aria-hidden="true" sx={{ width: 40, height: 40, display: 'grid', placeItems: 'center', borderRadius: '50%', bgcolor: item.complete ? 'success.main' : current ? 'primary.main' : 'background.default', color: item.complete || current ? '#fff' : 'text.secondary', border: `2px solid ${item.complete ? tokens.color.success : current ? tokens.color.primary : tokens.color.line}`, fontWeight: 800 }}>
                  {item.complete ? <Check fontSize="small" /> : index + 1}
                </Box>
                <Box minWidth={0}>
                  <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography fontWeight={750} sx={{ overflowWrap: 'anywhere' }}>{name}</Typography>
                    {block.isCombination && <Chip label={`${block.exercises.length} combinados`} size="small" variant="outlined" />}
                    {current && <Chip label="Atual" size="small" color="primary" />}
                  </Stack>
                  <Typography variant="body2" color={item.complete ? 'success.main' : 'text.secondary'}>{status}</Typography>
                </Box>
                <Button
                  variant={current ? 'text' : 'outlined'}
                  startIcon={<PlayArrow />}
                  disabled={current}
                  onClick={() => onSelect(exercise)}
                  sx={{ gridColumn: '2', justifySelf: 'start' }}
                  aria-label={`${item.completedSeries > 0 ? 'Continuar' : 'Fazer'} ${name}`}
                >
                  {current ? 'Em execução' : item.complete ? 'Revisar' : item.completedSeries > 0 ? 'Continuar' : 'Fazer agora'}
                </Button>
              </Box>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, flexWrap: 'wrap' }}>
        <Button onClick={onClose}>Continuar exercício</Button>
        <Button variant="outlined" startIcon={<FlagOutlined />} onClick={onFinish}>Finalizar treino</Button>
      </DialogActions>
    </Dialog>
  );
}
