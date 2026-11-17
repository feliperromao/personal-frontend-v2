import { expect, test } from '@playwright/test';

const viewports = [
  { width: 320, height: 720 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

test('shell do personal permanece responsivo nos breakpoints de aceitação', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('auth-token', 'e2e-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Marina Personal', email: 'marina@example.com', type: 'PERSONAL' }));
  });

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Bom treino começa/ })).toBeVisible();
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflows, `${viewport.width}×${viewport.height} não deve ter overflow horizontal`).toBe(false);
  }
});

test('reproduz a hierarquia aprovada no treino ativo', async ({ page }) => {
  const exercises = [
    { id: 'e1', name: 'Supino inclinado', type: 'CHEST', instructions: 'Controle a descida por 3 segundos', rest: 72, load: 24, series: 4, load_progress: true },
    { id: 'e2', name: 'Crucifixo com halteres', type: 'CHEST', instructions: 'Mantenha os cotovelos estáveis', rest: 60, load: 12, series: 3, load_progress: false },
  ];
  await page.addInitScript(({ exercises }) => {
    localStorage.setItem('auth-token', 'e2e-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Lucas Aluno', email: 'lucas@example.com', type: 'STUDENT' }));
    sessionStorage.setItem('active-training-progress', JSON.stringify({ id: 'p1', training_id: 't1', exercises }));
  }, { exercises });
  await page.route('**/training-progress/t1', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 't1', name: 'Treino A · Peito e tríceps', description: 'Foco em controle', show_to_student: true, student_id: 's1', exercises }) }));
  await page.setViewportSize({ width: 852, height: 1846 });
  await page.goto('/my-workouts/t1/exercises/e1');
  await expect(page.getByRole('heading', { name: 'Supino inclinado' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Concluir série' })).toBeVisible();
  await page.screenshot({ path: '.impeccable/review/hero-repro.png', fullPage: true });
});
