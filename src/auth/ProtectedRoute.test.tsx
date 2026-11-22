import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute', () => {
  beforeEach(() => localStorage.clear());

  it('redireciona visitantes sem sessão para o login', () => {
    render(<MemoryRouter initialEntries={['/students']}><Routes><Route path="/students" element={<ProtectedRoute allowedType="PERSONAL" element={<h1>Alunos</h1>} />} /><Route path="/login" element={<h1>Entrar</h1>} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('mantém estudantes fora das rotas do personal', () => {
    localStorage.setItem('auth-token', 'token');
    localStorage.setItem('user', JSON.stringify({ type: 'STUDENT' }));
    render(<MemoryRouter initialEntries={['/students']}><Routes><Route path="/students" element={<ProtectedRoute allowedType="PERSONAL" element={<h1>Alunos</h1>} />} /><Route path="/my-workouts" element={<h1>Meus treinos</h1>} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Meus treinos' })).toBeInTheDocument();
  });

  it('direciona administradores para a área administrativa', () => {
    localStorage.setItem('auth-token', 'token');
    localStorage.setItem('user', JSON.stringify({ type: 'ADMIN' }));
    render(<MemoryRouter initialEntries={['/students']}><Routes><Route path="/students" element={<ProtectedRoute allowedType="PERSONAL" element={<h1>Alunos</h1>} />} /><Route path="/admin/personals" element={<h1>Personals</h1>} /></Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Personals' })).toBeInTheDocument();
  });
});
