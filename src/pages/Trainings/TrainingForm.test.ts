import { describe, expect, it } from 'vitest';
import { Exercise, Training } from '../../domain/types';
import { toTrainingInput } from './TrainingForm';

describe('payload do formulário de treino', () => {
  it('remove os campos de leitura do treino e preserva a identidade dos exercícios', () => {
    const exercise = {
      id: 'exercise-1',
      personal_id: 'personal-1',
      name: 'Supino inclinado',
      type: 'CHEST',
      instructions: 'Controle a descida.',
      video: '',
      rest: 60,
      load: 24,
      series: 4,
      load_progress: true,
    } as Exercise & { personal_id: string };
    const training: Training = {
      id: 'training-1',
      personal_id: 'personal-1',
      name: 'Peito',
      description: 'Faça o treino com controle.',
      show_to_student: true,
      student_id: 'student-1',
      exercises: [exercise],
    };

    const payload = toTrainingInput(training);

    expect(payload).toEqual({
      name: 'Peito',
      description: 'Faça o treino com controle.',
      show_to_student: true,
      student_id: 'student-1',
      exercises: [exercise],
    });
    expect(payload).not.toHaveProperty('id');
    expect(payload).not.toHaveProperty('personal_id');
    expect(payload.exercises[0]).toHaveProperty('id', 'exercise-1');
  });
});
