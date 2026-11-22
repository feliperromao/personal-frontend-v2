import { describe, expect, it } from 'vitest';
import { Exercise, ExerciseGroup, TrainingProgress } from '../../domain/types';
import { findNextPendingExercise, getExerciseProgress, getWorkoutProgress } from './workoutProgress';

const exercises = [
  { id: 'e1', name: 'Rosca direta', type: 'BICEPS', rest: 45, series: 3 },
  { id: 'e2', name: 'Rosca martelo', type: 'BICEPS', rest: 45, series: 3 },
  { id: 'e3', name: 'Tríceps', type: 'TRICEPS', rest: 60, series: 2 },
] as Exercise[];
const groups: ExerciseGroup[] = [{ id: 'g1', exercise_ids: ['e1', 'e2'], series: 3, rest: 60 }];

describe('progresso de séries combinadas', () => {
  it('conta uma rodada somente quando todos os exercícios do bloco foram concluídos', () => {
    const progress = {
      id: 'p1', training_id: 't1', exercise_groups: groups, exercises,
      completed_series: [
        { exercise_id: 'e1', series: 1, load: 10, completed_at: '' },
        { exercise_id: 'e2', series: 1, load: 8, completed_at: '' },
        { exercise_id: 'e1', series: 2, load: 10, completed_at: '' },
      ],
    } as TrainingProgress;

    expect(getExerciseProgress(exercises[0], progress, groups, exercises)).toMatchObject({ completedSeries: 1, totalSeries: 3, complete: false });
    expect(getWorkoutProgress(exercises, progress, groups)).toMatchObject({ completedSeries: 1, totalSeries: 5, totalBlocks: 2 });
  });

  it('avança para o próximo bloco, sem abrir o segundo exercício da combinação isoladamente', () => {
    expect(findNextPendingExercise(exercises, null, 'e1', groups)?.id).toBe('e3');
  });
});
