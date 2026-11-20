import { describe, expect, it } from 'vitest';
import { getWorkoutRoutes } from './workoutRoutes';

describe('rotas de execução por papel', () => {
  it('mantém o aluno no fluxo de meus treinos', () => {
    const routes = getWorkoutRoutes('STUDENT', 'training-1');

    expect(routes.list).toBe('/my-workouts');
    expect(routes.detail).toBe('/my-workouts/training-1');
    expect(routes.exercise('exercise-1')).toBe('/my-workouts/training-1/exercises/exercise-1');
  });

  it('mantém o personal no fluxo de gestão de treinos', () => {
    const routes = getWorkoutRoutes('PERSONAL', 'training-1');

    expect(routes.list).toBe('/trainings');
    expect(routes.detail).toBe('/trainings/training-1/run');
    expect(routes.exercise('exercise-1')).toBe('/trainings/training-1/run/exercises/exercise-1');
  });
});
