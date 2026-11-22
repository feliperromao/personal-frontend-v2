import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('auth-token', 'form-e2e-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Marina Personal', email: 'marina@example.com', type: 'PERSONAL' }));
  });
  await page.route('http://localhost:3020/exercises**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: [], total_documents: 0, per_page: 10 }),
  }));
  await page.route('http://localhost:3020/trainings**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: [], total: 0 }),
  }));
  await page.route('**/training-progress/current', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: 'null',
  }));
  await page.route('**/students/list-all', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
});

test('cadastros exibem os campos opcionais e não pedem carga planejada', async ({ page }) => {
  await page.goto('/exercises');
  await page.getByRole('button', { name: 'Adicionar' }).click();

  const exerciseDialog = page.getByRole('dialog', { name: 'Cadastrar exercício' });
  await expect(exerciseDialog).toBeVisible();
  await expect(exerciseDialog.getByLabel('Instruções (opcional)')).toBeVisible();
  await expect(exerciseDialog.getByText(/carga/i)).toHaveCount(0);

  await exerciseDialog.getByRole('button', { name: 'Cancelar' }).click();
  await page.goto('/trainings');
  await page.getByRole('button', { name: 'Adicionar' }).click();

  const trainingDialog = page.getByRole('dialog', { name: 'Criar treino' });
  await expect(trainingDialog).toBeVisible();
  await expect(trainingDialog.getByLabel('Orientação geral (opcional)')).toBeVisible();
});
