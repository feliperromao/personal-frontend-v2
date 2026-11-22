import { Exercise, ExerciseGroup, TrainingProgress } from '../../domain/types';
import { getWorkoutBlockForExercise, getWorkoutBlocks, WorkoutBlock } from '../../domain/workoutBlocks';

export interface ExerciseProgressSummary {
  completedSeries: number;
  totalSeries: number;
  complete: boolean;
}

function getBlockProgress(block: WorkoutBlock, progress: TrainingProgress | null): ExerciseProgressSummary {
  const completed = Array.from({ length: block.series }, (_, index) => index + 1)
    .filter(series => block.exercises.every(exercise => (progress?.completed_series || [])
      .some(item => item.exercise_id === exercise.id && item.series === series))).length;

  return {
    completedSeries: completed,
    totalSeries: block.series,
    complete: completed >= block.series,
  };
}

export function getExerciseProgress(
  exercise: Exercise,
  progress: TrainingProgress | null,
  groups: ExerciseGroup[] = progress?.exercise_groups || [],
  exercises: Exercise[] = progress?.exercises || [exercise],
): ExerciseProgressSummary {
  const block = getWorkoutBlockForExercise(exercises, groups, exercise.id)
    || { id: `exercise:${exercise.id}`, exercises: [exercise], series: exercise.series, rest: exercise.rest, isCombination: false };
  return getBlockProgress(block, progress);
}

export function getWorkoutProgress(exercises: Exercise[], progress: TrainingProgress | null, groups: ExerciseGroup[] = progress?.exercise_groups || []) {
  const blocks = getWorkoutBlocks(exercises, groups);
  const summaries = blocks.map(block => getBlockProgress(block, progress));
  const completedSeries = summaries.reduce((total, item) => total + item.completedSeries, 0);
  const totalSeries = summaries.reduce((total, item) => total + item.totalSeries, 0);
  const completedExercises = blocks.reduce((total, block, index) => total + (summaries[index].complete ? block.exercises.length : 0), 0);

  return {
    completedSeries,
    totalSeries,
    completedExercises,
    totalExercises: exercises.length,
    pendingExercises: exercises.length - completedExercises,
    completedBlocks: summaries.filter(item => item.complete).length,
    totalBlocks: blocks.length,
  };
}

export function findNextPendingExercise(
  exercises: Exercise[],
  progress: TrainingProgress | null,
  currentExerciseId: string,
  groups: ExerciseGroup[] = progress?.exercise_groups || [],
) {
  const blocks = getWorkoutBlocks(exercises, groups);
  if (blocks.length < 2) return undefined;
  const currentIndex = Math.max(0, blocks.findIndex(block => block.exercises.some(item => item.id === currentExerciseId)));

  for (let offset = 1; offset < blocks.length; offset += 1) {
    const candidate = blocks[(currentIndex + offset) % blocks.length];
    if (!getBlockProgress(candidate, progress).complete) return candidate.exercises[0];
  }

  return undefined;
}

export function findFirstPendingExercise(exercises: Exercise[], progress: TrainingProgress | null, groups: ExerciseGroup[] = progress?.exercise_groups || []) {
  const block = getWorkoutBlocks(exercises, groups).find(item => !getBlockProgress(item, progress).complete);
  return block?.exercises[0];
}
