import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../@shared/api';
import StudentWorkoutDetails from './StudentWorkoutDetails';

vi.mock('../../components/Template', () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('../../platform/PwaContext', () => ({ usePwa: () => ({ online: true }) }));
vi.mock('../@shared/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const training = {
  id: 't1', name: 'Treino A', description: 'Peito e tríceps', show_to_student: true, student_id: 's1',
  exercises: [
    { id: 'e1', name: 'Supino', type: 'CHEST', instructions: 'Controle a descida', rest: 60, load: 20, series: 3, load_progress: true },
    { id: 'e2', name: 'Crucifixo', type: 'CHEST', instructions: 'Mantenha o controle', rest: 45, load: 10, series: 2, load_progress: true },
  ],
};

describe('detalhe do treino do aluno', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockImplementation((url) => Promise.resolve({ data: url.endsWith('/current') ? null : training }) as never);
  });

  it('inicia pela API e abre o primeiro exercício', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'p1', training_id: 't1', exercises: training.exercises } } as never);
    render(
      <MemoryRouter initialEntries={['/my-workouts/t1']}>
        <Routes>
          <Route path="/my-workouts/:trainingId" element={<StudentWorkoutDetails />} />
          <Route path="/my-workouts/:trainingId/exercises/:exerciseId" element={<h1>Exercício ativo</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Iniciar treino' }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/training-progress/start', { id: 't1' }));
    expect(await screen.findByRole('heading', { name: 'Exercício ativo' })).toBeInTheDocument();
  });

  it('retoma no primeiro exercício que ainda está pendente', async () => {
    const progress = {
      id: 'p1',
      training_id: 't1',
      exercises: training.exercises,
      completed_series: [1, 2, 3].map((series) => ({ exercise_id: 'e1', series, load: 20, completed_at: '2026-11-17T19:00:00.000Z' })),
    };
    vi.mocked(api.get).mockImplementation((url) => Promise.resolve({ data: url.endsWith('/current') ? progress : training }) as never);

    render(
      <MemoryRouter initialEntries={['/my-workouts/t1']}>
        <Routes>
          <Route path="/my-workouts/:trainingId" element={<StudentWorkoutDetails />} />
          <Route path="/my-workouts/:trainingId/exercises/:exerciseId" element={<RouteExerciseId />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Retomar treino' }));
    expect(await screen.findByRole('heading', { name: 'Exercício e2' })).toBeInTheDocument();
  });
});

function RouteExerciseId() {
  const { exerciseId } = useParams();
  return <h1>Exercício {exerciseId}</h1>;
}
