import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';

const branding = {
  appName: 'Studio Aurora',
  primaryColor: '#0E7490',
  footerColor: '#082F49',
  logoUrl: '',
};

const axePath = path.join(process.cwd(), 'node_modules/axe-core/axe.min.js');

async function seriousA11yViolations(page: Page) {
  await page.addScriptTag({ path: axePath });
  return page.evaluate(async () => {
    const result = await (window as typeof window & {
      axe: { run: () => Promise<{ violations: Array<{ id: string; impact: string | null; help: string }> }> };
    }).axe.run();
    return result.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
  });
}

test('aplica e permite editar a identidade do personal', async ({ page }, testInfo) => {
  await page.addInitScript(({ branding }) => {
    localStorage.setItem('auth-token', 'branding-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Marina Personal', email: 'marina@example.com', type: 'PERSONAL' }));
    localStorage.setItem('branding', JSON.stringify(branding));
  }, { branding });
  await page.route('**/branding', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(branding),
  }));

  await page.goto('/profile');

  await expect(page.getByRole('heading', { name: 'Identidade do seu app' })).toBeVisible();
  await expect(page.getByText('Studio Aurora').first()).toBeVisible();
  await expect(page.getByLabel('Nome do app')).toHaveValue('Studio Aurora');

  const primaryButtonColor = await page.getByRole('button', { name: 'Começar treino' }).evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  const navigationColor = await page.locator('[aria-label="Navegação principal"]:visible').evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(primaryButtonColor).toBe('rgb(14, 116, 144)');
  expect(navigationColor).toBe('rgb(8, 47, 73)');
  expect(await seriousA11yViolations(page)).toEqual([]);

  await page.screenshot({
    path: `.impeccable/review/branding-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
