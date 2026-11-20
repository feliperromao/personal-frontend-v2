import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../@shared/api';
import ActiveExercise from './ActiveExercise';

vi.mock('../../components/Template', () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('../../platform/PwaContext', () => ({ usePwa: () => ({ online: true }) }));
vi.mock('../@shared/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const exercise = {
  id: 'e1',
  name: 'Supino inclinado',
  type: 'CHEST',
  instructions: 'Controle a descida',
  rest: 60,
  load: 20,
  series: 3,
  load_progress: true,
};

const secondExercise = {
  ...exercise,
  id: 'e2',
  name: 'Crucifixo com halteres',
  load: 12,
};

const training = {
  id: 't1',
  name: 'Treino A',
  description: 'Peito e tríceps',
  show_to_student: true,
  student_id: 's1',
  exercises: [exercise],
};

function mockTrainingRequests(detail = training) {
  vi.mocked(api.get).mockImplementation((url) => Promise.resolve({
    data: url.endsWith('/current')
      ? JSON.parse(sessionStorage.getItem('active-training-progress') || 'null')
      : detail,
  }) as never);
}

describe('execução do exercício', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    sessionStorage.setItem('active-training-progress', JSON.stringify({
      id: 'p1',
      training_id: 't1',
      exercises: [exercise],
      completed_series: [],
    }));
    mockTrainingRequests();
  });

  it('registra no progresso a carga informada para a série', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {
      id: 'p1',
      training_id: 't1',
      exercises: [exercise],
      completed_series: [{ exercise_id: 'e1', series: 1, load: 22.5, completed_at: '2026-11-17T19:00:00.000Z' }],
    } } as never);

    render(
      <MemoryRouter initialEntries={['/my-workouts/t1/exercises/e1']}>
        <Routes>
          <Route path="/my-workouts/:trainingId/exercises/:exerciseId" element={<ActiveExercise />} />
        </Routes>
      </MemoryRouter>,
    );

    const loadInput = await screen.findByRole('spinbutton', { name: 'Carga da série em quilogramas' });
    fireEvent.change(loadInput, { target: { value: '22.5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Concluir série' }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/training-progress/series', {
      id: 'p1',
      exercise_id: 'e1',
      series: 1,
      load: 22.5,
    }));
    expect(sessionStorage.getItem('load:p1:e1')).toBe('22.5');
    expect(await screen.findByText('Série 2 de 3')).toBeInTheDocument();
  });

  it('permite pular um exercício e continuar no próximo pendente', async () => {
    const flexibleTraining = { ...training, exercises: [exercise, secondExercise] };
    sessionStorage.setItem('active-training-progress', JSON.stringify({
      id: 'p1',
      training_id: 't1',
      exercises: flexibleTraining.exercises,
      completed_series: [],
    }));
    mockTrainingRequests(flexibleTraining);

    render(
      <MemoryRouter initialEntries={['/my-workouts/t1/exercises/e1']}>
        <Routes>
          <Route path="/my-workouts/:trainingId/exercises/:exerciseId" element={<ActiveExercise />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Pular por agora' }));

    expect(await screen.findByRole('heading', { name: 'Crucifixo com halteres' })).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('permite escolher exercícios fora de ordem e finalizar com pendências', async () => {
    const flexibleTraining = { ...training, exercises: [exercise, secondExercise] };
    sessionStorage.setItem('active-training-progress', JSON.stringify({
      id: 'p1',
      training_id: 't1',
      exercises: flexibleTraining.exercises,
      completed_series: [],
    }));
    mockTrainingRequests(flexibleTraining);
    vi.mocked(api.post).mockResolvedValue({ data: {} } as never);

    render(
      <MemoryRouter initialEntries={['/my-workouts/t1/exercises/e1']}>
        <Routes>
          <Route path="/my-workouts/:trainingId/exercises/:exerciseId" element={<ActiveExercise />} />
          <Route path="/my-workouts" element={<h1>Meus treinos</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /Exercícios · 0\/2/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Fazer Crucifixo com halteres' }));
    expect(await screen.findByRole('heading', { name: 'Crucifixo com halteres' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Exercícios · 0\/2/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar treino' }));
    expect(await screen.findByText(/O que ficou pendente será registrado como não realizado/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Concluir treino' }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/training-progress/finish', {
      id: 'p1',
      status: 'MODERADA',
      feedback: undefined,
    }));
  });
});
