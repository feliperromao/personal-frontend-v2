
export interface User {
  id?: string;
  type?: UserRole;
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone: string;
  birthdate: string;
  weight: number;
  height: number;
  monthly_value_brl: number;
  blocked: boolean;
}

export type UserRole = 'PERSONAL' | 'STUDENT';

export interface Exercise {
  id: string;
  name: string;
  type: string;
  instructions: string;
  video?: string;
  rest: number;
  load?: number;
  series: number;
  repetitions?: number;
  load_progress: boolean;
}

export interface ExerciseInput {
  name: string;
  type: string;
  instructions: string;
  video: string;
  rest: number;
  load: number;
  series: number;
  load_progress: boolean;
}

export interface TrainingInput {
  name: string,
  description: string,
  show_to_student: boolean,
  student_id?: string,
  exercises: Exercise[]
}

export interface Training extends TrainingInput {
  id?: string,
  personal_id?: string,
}

export type FinishStatus = 'LEVE' | 'MODERADA' | 'INTENSA' | 'MUITO_INTENSA';

export interface CompletedSeries {
  exercise_id: string;
  series: number;
  load: number;
  completed_at: string;
}

export interface TrainingProgress {
  id: string;
  training_id: string;
  name?: string;
  description?: string;
  student_id?: string;
  personal_id?: string;
  executor_id?: string;
  executor_type?: UserRole;
  training?: Training;
  exercises?: Exercise[];
  status?: string;
  started_at?: string;
  finished_at?: string;
  current_exercise_id?: string;
  completed_exercises?: string[];
  completed_series?: CompletedSeries[];
  finish_feedback?: string;
  finish_status?: FinishStatus;
}

export interface EvolutionExercise {
  id: string;
  name: string;
  executions: number;
  personal_best: number;
}

export interface EvolutionPoint {
  progress_id: string;
  training_id: string;
  training_name: string;
  executed_at: string;
  max_load: number;
  average_load: number;
  completed_series: number;
  planned_series: number;
  loads: number[];
}

export interface EvolutionReport {
  student: { id: string; name: string };
  exercises: EvolutionExercise[];
  selected_exercise_id: string | null;
  summary: {
    initial_load: number | null;
    current_load: number | null;
    absolute_change: number | null;
    percentage_change: number | null;
    personal_best: number | null;
    total_executions: number;
    total_series: number;
  };
  points: EvolutionPoint[];
}

export interface RouteMetadata {
  path: string;
  label: string;
  roles: UserRole[];
}

export interface NavigationItem extends RouteMetadata {
  icon: string;
}

export type ExerciseCategory = {
  name: string;
  type: string;
};

export const exerciseCategories: ExerciseCategory[] = [
  { name: "CHEST", type: "Peito" },
  { name: "BACK", type: "Costas" },
  { name: "LEGS", type: "Pernas" },
  { name: "SHOULDERS", type: "Ombros" },
  { name: "BICEPS", type: "Biceps" },
  { name: "TRICEPS", type: "Triceps" },
  { name: "ABS", type: "Abdomem" },
  { name: "GLUTES", type: "Gluteos" },
  { name: "CALVES", type: "Panturrilhas" },
  { name: "CARDIO", type: "Cardio" },
  { name: "MOBILITY", type: "Mobilidade" }
];
