
export interface User {
  id?: string;
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

export interface Exercise {
  id: string;
  name: string;
  type: string;
  instructions: string;
  video?: string;
  rest: number;
  load?: number;
  series: number;
  load_progress: boolean;
}

export interface Training {
  id?: string,
  name: string,
  description: string,
  show_to_student: boolean,
  student_id: string,
  exercises: Exercise[]
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