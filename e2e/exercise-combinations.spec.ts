import { expect, test } from '@playwright/test';

const exercises = [
  { id: 'e1', name: 'Rosca direta', type: 'BICEPS', instructions: 'Cotovelos junto ao corpo.', rest: 45, series: 3 },
  { id: 'e2', name: 'Rosca martelo', type: 'BICEPS', instructions: 'Pegada neutra.', rest: 60, series: 3 },
  { id: 'e3', name: 'Tríceps testa', type: 'TRICEPS', instructions: 'Controle a descida.', rest: 60, series: 3 },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('auth-token', 'combination-e2e-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Marina Personal', email: 'marina@example.com', type: 'PERSONAL' }));
  });
  await page.route('**/training-progress/current', route => route.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
  await page.route('**/students/list-all', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route('http://localhost:3020/trainings**', async route => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { id: 't1', ...route.request().postDataJSON() } }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0 }) });
  });
  await page.route('http://localhost:3020/exercises**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: exercises, total_documents: exercises.length, per_page: 10 }),
  }));
});

test('personal combina exercícios e salva o descanso do bloco', async ({ page }) => {
  let savedPayload: any;
  await page.route('http://localhost:3020/trainings', async route => {
    if (route.request().method() !== 'POST') return route.fallback();
    savedPayload = route.request().postDataJSON();
    return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { id: 't1', ...savedPayload } }) });
  });

  await page.goto('/trainings');
  await page.getByRole('button', { name: 'Adicionar' }).click();
  const form = page.getByRole('dialog', { name: 'Criar treino' });
  await form.getByLabel('Nome do treino').fill('Braços combinado');
  await form.getByRole('button', { name: 'Adicionar' }).click();

  await page.getByRole('button', { name: /Rosca direta/ }).click();
  await page.getByRole('button', { name: /Rosca martelo/ }).click();
  await page.getByRole('button', { name: 'Fechar seletor de exercícios' }).click();

  await form.getByRole('checkbox', { name: 'Selecionar Rosca direta para combinar' }).check();
  await form.getByRole('checkbox', { name: 'Selecionar Rosca martelo para combinar' }).check();
  await form.getByRole('button', { name: 'Combinar (2)' }).click();

  await expect(form.getByText('Série combinada')).toBeVisible();
  await expect(form.getByText('Sem descanso entre os exercícios; uma série conta após concluir todos.')).toBeVisible();
  await form.getByLabel('Descanso ao final').fill('75');
  await form.getByRole('button', { name: 'Salvar treino' }).click();

  await expect.poll(() => savedPayload).toBeTruthy();
  expect(savedPayload.exercise_groups).toHaveLength(1);
  expect(savedPayload.exercise_groups[0]).toMatchObject({ exercise_ids: ['e1', 'e2'], series: 3, rest: 75 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('aluno conclui uma rodada combinada com cargas independentes', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('auth-token', 'student-combination-token');
    localStorage.setItem('user', JSON.stringify({ id: 's1', name: 'Ana Aluna', email: 'ana@example.com', type: 'STUDENT' }));
  });
  const group = { id: 'g1', exercise_ids: ['e1', 'e2'], series: 3, rest: 75 };
  const current = { id: 'p1', training_id: 't1', name: 'Braços', exercises: exercises.slice(0, 2), exercise_groups: [group], completed_series: [], last_loads: { e1: 10, e2: 8 } };
  const training = { id: 't1', name: 'Braços', show_to_student: true, student_id: 's1', exercises: exercises.slice(0, 2), exercise_groups: [group] };
  let savedPayload: any;
  await page.route('**/training-progress/current', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(current) }));
  await page.route('**/training-progress/t1', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(training) }));
  await page.route('**/training-progress/series-group', route => {
    savedPayload = route.request().postDataJSON();
    const completed_at = '2026-11-22T12:00:00.000Z';
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
      ...current,
      completed_series: savedPayload.exercises.map((item: any) => ({ ...item, series: 1, completed_at })),
    }) });
  });

  await page.goto('/my-workouts/t1/exercises/e1');
  await expect(page.getByRole('heading', { name: 'Série combinada' })).toBeVisible();
  await expect(page.getByText('Faça todos na ordem abaixo, sem pausa. O descanso começa somente depois do último.')).toBeVisible();
  await page.getByRole('spinbutton', { name: 'Carga de Rosca direta em quilogramas' }).fill('12');
  await page.getByRole('spinbutton', { name: 'Carga de Rosca martelo em quilogramas' }).fill('9');
  await page.getByRole('button', { name: 'Concluir série combinada' }).click();

  await expect.poll(() => savedPayload).toBeTruthy();
  expect(savedPayload).toMatchObject({ group_id: 'g1', series: 1, exercises: [{ exercise_id: 'e1', load: 12 }, { exercise_id: 'e2', load: 9 }] });
  await expect(page.getByText('Série 2 de 3 · 2 exercícios seguidos')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
