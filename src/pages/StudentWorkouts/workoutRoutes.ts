import { UserRole } from '../../domain/types';

export function getWorkoutRoutes(mode: UserRole, trainingId: string) {
  const personal = mode === 'PERSONAL';
  const list = personal ? '/trainings' : '/my-workouts';
  const detail = personal ? `/trainings/${trainingId}/run` : `/my-workouts/${trainingId}`;

  return {
    list,
    detail,
    exercise: (exerciseId: string) => `${detail}/exercises/${exerciseId}`,
  };
}
