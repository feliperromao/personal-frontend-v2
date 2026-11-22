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
      series: 4,
    } as Exercise & { personal_id: string };
    const training: Training = {
      id: 'training-1',
      personal_id: 'personal-1',
      name: 'Peito',
      description: 'Faça o treino com controle.',
      show_to_student: true,
      student_id: 'student-1',
      exercises: [exercise],
      exercise_groups: [],
    };

    const payload = toTrainingInput(training);

    expect(payload).toEqual({
      name: 'Peito',
      description: 'Faça o treino com controle.',
      show_to_student: true,
      student_id: 'student-1',
      exercises: [exercise],
      exercise_groups: [],
    });
    expect(payload).not.toHaveProperty('id');
    expect(payload).not.toHaveProperty('personal_id');
    expect(payload.exercises[0]).toHaveProperty('id', 'exercise-1');
  });

  it('preserva a configuração de uma série combinada', () => {
    const exercises = [
      { id: 'e1', name: 'Rosca direta', type: 'BICEPS', rest: 45, series: 3 },
      { id: 'e2', name: 'Rosca martelo', type: 'BICEPS', rest: 45, series: 3 },
    ] as Exercise[];

    const payload = toTrainingInput({
      name: 'Braços',
      show_to_student: false,
      exercises,
      exercise_groups: [{ id: 'g1', exercise_ids: ['e1', 'e2'], series: 3, rest: 60 }],
    });

    expect(payload.exercise_groups).toEqual([
      { id: 'g1', exercise_ids: ['e1', 'e2'], series: 3, rest: 60 },
    ]);
  });

  it('permite um treino sem aluno e impede publicação inconsistente', () => {
    const payload = toTrainingInput({
      name: 'Treino do personal',
      description: 'Ficha para uso próprio.',
      show_to_student: true,
      exercises: [],
    });

    expect(payload.student_id).toBeUndefined();
    expect(payload.show_to_student).toBe(false);
  });
});
