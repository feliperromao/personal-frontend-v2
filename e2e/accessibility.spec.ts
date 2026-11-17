import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';

const axePath = path.join(process.cwd(), 'node_modules/axe-core/axe.min.js');

async function expectNoSeriousViolations(page: Page) {
  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(async () => {
    const result = await (window as typeof window & { axe: { run: () => Promise<{ violations: Array<{ id: string; impact: string | null; help: string }> }> } }).axe.run();
    return result.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
  });
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}

test('login e início do personal não têm violações axe sérias ou críticas', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.evaluate(() => {
    localStorage.setItem('auth-token', 'axe-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Marina Personal', email: 'marina@example.com', type: 'PERSONAL' }));
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Bom treino começa/ })).toBeVisible();
  await expectNoSeriousViolations(page);
});

test('treino ativo não tem violações axe sérias ou críticas', async ({ page }) => {
  const exercises = [
    { id: 'e1', name: 'Supino inclinado', type: 'CHEST', instructions: 'Controle a descida por 3 segundos', rest: 72, load: 24, repetitions: 10, series: 4, load_progress: true },
    { id: 'e2', name: 'Crucifixo com halteres', type: 'CHEST', instructions: 'Mantenha os cotovelos estáveis', rest: 60, load: 12, series: 3, load_progress: false },
  ];
  await page.addInitScript(({ exercises }) => {
    localStorage.setItem('auth-token', 'axe-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Lucas Aluno', email: 'lucas@example.com', type: 'STUDENT' }));
    sessionStorage.setItem('active-training-progress', JSON.stringify({ id: 'p1', training_id: 't1', exercises }));
  }, { exercises });
  await page.route('**/training-progress/t1', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ id: 't1', name: 'Treino A · Peito e tríceps', description: 'Foco em controle', show_to_student: true, student_id: 's1', exercises }),
  }));
  await page.goto('/my-workouts/t1/exercises/e1');
  await expect(page.getByRole('heading', { name: 'Supino inclinado' })).toBeVisible();
  await expectNoSeriousViolations(page);
  await page.getByRole('button', { name: /Exercícios ·/ }).click();
  await expect(page.getByRole('dialog', { name: 'Exercícios do treino' })).toBeVisible();
  await page.waitForTimeout(300);
  await expectNoSeriousViolations(page);
});
