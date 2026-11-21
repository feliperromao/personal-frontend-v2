import { expect, test } from '@playwright/test';

test('personal e aluno podem definir uma nova senha no perfil', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem('auth-token', 'e2e-token');
    localStorage.setItem('user', JSON.stringify({
      name: 'Lucas Aluno',
      email: 'lucas@example.com',
      type: 'STUDENT',
    }));
  });
  await page.route('**/auth/change-password', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Senha redefinida com sucesso.' }),
  }));

  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Sua conta' })).toBeVisible();
  await expect(page.getByLabel('Senha atual')).toBeVisible();
  await expect(page.getByLabel('Nova senha', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Confirmar nova senha')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  await page.screenshot({ path: `.impeccable/review/change-password-${testInfo.project.name}.png`, fullPage: true });

  await page.getByLabel('Senha atual').fill('senha-atual');
  await page.getByLabel('Nova senha', { exact: true }).fill('nova-senha-segura');
  await page.getByLabel('Confirmar nova senha').fill('nova-senha-segura');
  await page.getByRole('button', { name: 'Salvar nova senha' }).click();
  await expect(page.getByText('Senha redefinida com sucesso.')).toBeVisible();
});
