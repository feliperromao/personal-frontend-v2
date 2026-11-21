import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../@shared/api';
import EvolutionReport from './EvolutionReport';

vi.mock('../../components/Template', () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('../@shared/api', () => ({ default: { get: vi.fn() } }));

const report = {
  student: { id: 'student-1', name: 'Ana' },
  exercises: [{ id: 'exercise-1', name: 'Supino inclinado', executions: 2, personal_best: 25 }],
  selected_exercise_id: 'exercise-1',
  summary: { initial_load: 20, current_load: 25, absolute_change: 5, percentage_change: 25, personal_best: 25, total_executions: 2, total_series: 5 },
  points: [
    { progress_id: 'p1', training_id: 't1', training_name: 'Treino A', executed_at: '2026-10-01T10:00:00Z', max_load: 20, average_load: 19, completed_series: 2, planned_series: 3, loads: [18, 20] },
    { progress_id: 'p2', training_id: 't1', training_name: 'Treino A', executed_at: '2026-10-08T10:00:00Z', max_load: 25, average_load: 24.2, completed_series: 3, planned_series: 3, loads: [22.5, 25, 25] },
  ],
};

describe('relatório de evolução', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: report } as never);
  });

  it('mostra a linha de evolução e os números de cada treino para o aluno', async () => {
    render(<MemoryRouter><EvolutionReport mode="STUDENT" /></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'Minha evolução' })).toBeInTheDocument();
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/reports/evolution', { params: {} }));
    expect(screen.getByRole('img', { name: /Evolução de carga em Supino inclinado/ })).toBeInTheDocument();
    expect(screen.getByText('+5 kg desde o início')).toBeInTheDocument();
    expect(screen.getAllByText('25 kg').length).toBeGreaterThan(0);
    expect(screen.getByText(/cargas: 22,5 · 25 · 25 kg/)).toBeInTheDocument();
  });

  it('permite que o personal selecione um aluno antes de consultar a evolução', async () => {
    vi.mocked(api.get).mockImplementation((url) => Promise.resolve({
      data: url === '/students/list-all'
        ? [{ id: 'student-1', name: 'Ana', email: 'ana@example.com' }]
        : report,
    }) as never);
    const user = userEvent.setup();

    render(<MemoryRouter><EvolutionReport mode="PERSONAL" /></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'Evolução dos alunos' })).toBeInTheDocument();
    await user.selectOptions(await screen.findByRole('combobox', { name: 'Aluno' }), 'student-1');

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/reports/evolution', { params: { student_id: 'student-1' } }));
    expect(await screen.findByRole('img', { name: /Evolução de carga em Supino inclinado/ })).toBeInTheDocument();
  });
});
