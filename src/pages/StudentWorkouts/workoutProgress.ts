import { Exercise, TrainingProgress } from '../../domain/types';

export interface ExerciseProgressSummary {
  completedSeries: number;
  totalSeries: number;
  complete: boolean;
}

export function getExerciseProgress(exercise: Exercise, progress: TrainingProgress | null): ExerciseProgressSummary {
  const completed = new Set(
    (progress?.completed_series || [])
      .filter((item) => item.exercise_id === exercise.id && item.series >= 1 && item.series <= exercise.series)
      .map((item) => item.series),
  ).size;

  return {
    completedSeries: completed,
    totalSeries: exercise.series,
    complete: completed >= exercise.series,
  };
}

export function getWorkoutProgress(exercises: Exercise[], progress: TrainingProgress | null) {
  const summaries = exercises.map((exercise) => getExerciseProgress(exercise, progress));
  const completedSeries = summaries.reduce((total, item) => total + item.completedSeries, 0);
  const totalSeries = summaries.reduce((total, item) => total + item.totalSeries, 0);
  const completedExercises = summaries.filter((item) => item.complete).length;

  return {
    completedSeries,
    totalSeries,
    completedExercises,
    totalExercises: exercises.length,
    pendingExercises: exercises.length - completedExercises,
  };
}

export function findNextPendingExercise(exercises: Exercise[], progress: TrainingProgress | null, currentExerciseId: string) {
  if (exercises.length < 2) return undefined;
  const currentIndex = Math.max(0, exercises.findIndex((item) => item.id === currentExerciseId));

  for (let offset = 1; offset < exercises.length; offset += 1) {
    const candidate = exercises[(currentIndex + offset) % exercises.length];
    if (!getExerciseProgress(candidate, progress).complete) return candidate;
  }

  return undefined;
}

export function findFirstPendingExercise(exercises: Exercise[], progress: TrainingProgress | null) {
  return exercises.find((exercise) => !getExerciseProgress(exercise, progress).complete);
}
