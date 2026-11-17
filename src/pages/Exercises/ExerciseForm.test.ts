import { describe, expect, it } from 'vitest';
import { Exercise } from '../../domain/types';
import { toExerciseInput } from './ExerciseForm';

describe('payload do formulário de exercício', () => {
  it('remove campos retornados pela API antes de criar ou atualizar', () => {
    const exercise: Exercise = {
      id: 'exercise-123',
      name: 'Supino inclinado',
      type: 'CHEST',
      instructions: 'Controle a descida.',
      video: 'https://example.com/supino',
      rest: 30,
      load: 24,
      series: 4,
      repetitions: 10,
      load_progress: true,
    };

    expect(toExerciseInput(exercise)).toEqual({
      name: 'Supino inclinado',
      type: 'CHEST',
      instructions: 'Controle a descida.',
      video: 'https://example.com/supino',
      rest: 30,
      load: 24,
      series: 4,
      load_progress: true,
    });
  });
});
