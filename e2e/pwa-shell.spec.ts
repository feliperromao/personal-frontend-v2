import { expect, test } from '@playwright/test';

test('expõe manifesto instalável e não cria rolagem horizontal no login', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  const manifest = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifest).toBeTruthy();
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test('registra o service worker no build de produção', async ({ page, context }) => {
  await page.goto('/login');
  await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistrations()).length > 0);
  await page.reload({ waitUntil: 'networkidle' });
  const registrations = await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length);
  expect(registrations).toBeGreaterThan(0);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
});
