import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../@shared/api';
import StudentWorkoutDetails from './StudentWorkoutDetails';

vi.mock('../../components/Template', () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('../../platform/PwaContext', () => ({ usePwa: () => ({ online: true }) }));
vi.mock('../@shared/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const training = {
  id: 't1', name: 'Treino A', description: 'Peito e tríceps', show_to_student: true, student_id: 's1',
  exercises: [{ id: 'e1', name: 'Supino', type: 'CHEST', instructions: 'Controle a descida', rest: 60, load: 20, series: 3, load_progress: true }],
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
});
