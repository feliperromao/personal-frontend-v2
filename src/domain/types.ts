
export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
}

export interface Exercise {
  id?: string;
  name: string;
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