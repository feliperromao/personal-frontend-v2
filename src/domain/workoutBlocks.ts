import { Exercise, ExerciseGroup } from './types';

export interface WorkoutBlock {
  id: string;
  exercises: Exercise[];
  series: number;
  rest: number;
  isCombination: boolean;
}

export function getWorkoutBlocks(exercises: Exercise[] = [], groups: ExerciseGroup[] = []): WorkoutBlock[] {
  const exerciseById = new Map(exercises.map(exercise => [exercise.id, exercise]));
  const validGroups = groups
    .map(group => ({ ...group, exercises: group.exercise_ids.map(id => exerciseById.get(id)).filter(Boolean) as Exercise[] }))
    .filter(group => group.exercises.length >= 2);
  const groupByExercise = new Map<string, typeof validGroups[number]>();
  validGroups.forEach(group => group.exercises.forEach(exercise => groupByExercise.set(exercise.id, group)));

  const emitted = new Set<string>();
  return exercises.reduce<WorkoutBlock[]>((blocks, exercise) => {
    const group = groupByExercise.get(exercise.id);
    if (!group) {
      blocks.push({ id: `exercise:${exercise.id}`, exercises: [exercise], series: exercise.series, rest: exercise.rest, isCombination: false });
      return blocks;
    }
    if (emitted.has(group.id)) return blocks;
    emitted.add(group.id);
    blocks.push({ id: group.id, exercises: group.exercises, series: group.series, rest: group.rest, isCombination: true });
    return blocks;
  }, []);
}

export function getWorkoutBlockForExercise(exercises: Exercise[] = [], groups: ExerciseGroup[] = [], exerciseId: string) {
  return getWorkoutBlocks(exercises, groups).find(block => block.exercises.some(exercise => exercise.id === exerciseId));
}
