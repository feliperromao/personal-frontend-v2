import { chromium } from '@playwright/test';

const points = [
  ['p1', '2026-08-05T10:00:00Z', 20, [18, 20, 20]],
  ['p2', '2026-08-19T10:00:00Z', 22.5, [20, 22.5, 22.5]],
  ['p3', '2026-09-02T10:00:00Z', 24, [22, 24, 24]],
  ['p4', '2026-09-16T10:00:00Z', 25, [22.5, 25, 25]],
  ['p5', '2026-10-01T10:00:00Z', 27.5, [25, 27.5, 27.5]],
  ['p6', '2026-10-21T10:00:00Z', 27.5, [25, 27.5, 27.5]],
  ['p7', '2026-11-18T10:00:00Z', 30, [27.5, 30, 30]],
].map(([progress_id, executed_at, max_load, loads]) => ({
  progress_id,
  training_id: 'training-1',
  training_name: 'Treino A · Peito e tríceps',
  executed_at,
  max_load,
  average_load: loads.reduce((total, load) => total + load, 0) / loads.length,
  completed_series: 3,
  planned_series: 3,
  loads,
}));

const report = {
  subject: { id: 'student-1', name: 'Ana Martins', type: 'STUDENT' },
  exercises: [
    { id: 'exercise-1', name: 'Supino inclinado', executions: 7, personal_best: 30 },
    { id: 'exercise-2', name: 'Crucifixo com halteres', executions: 5, personal_best: 16 },
  ],
  selected_exercise_id: 'exercise-1',
  summary: {
    initial_load: 20,
    current_load: 30,
    absolute_change: 10,
    percentage_change: 50,
    personal_best: 30,
    total_executions: 7,
    total_series: 21,
  },
  points,
};

const browser = await chromium.launch({ headless: true });

async function preparePage(viewport, type) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.addInitScript(({ type }) => {
    localStorage.setItem('auth-token', 'visual-review-token');
    localStorage.setItem('user', JSON.stringify({ name: type === 'STUDENT' ? 'Ana Martins' : 'Marina Personal', email: 'review@example.com', type }));
  }, { type });
  const responseReport = type === 'PERSONAL'
    ? { ...report, subject: { id: 'personal-1', name: 'Marina Personal', type: 'PERSONAL' } }
    : report;
  await page.route('**/reports/evolution**', (route) => {
    if (route.request().resourceType() === 'document') return route.continue();
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(responseReport) });
  });
  await page.route('**/students/list-all', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'student-1', name: 'Ana Martins', email: 'ana@example.com' }]) }));
  return { context, page };
}

async function captureStudent(viewport, output) {
  const { context, page } = await preparePage(viewport, 'STUDENT');
  await page.goto('http://127.0.0.1:4173/my-evolution');
  await page.getByRole('heading', { name: 'Minha evolução' }).waitFor();
  await page.getByRole('img', { name: /Evolução de carga em Supino inclinado/ }).waitFor();
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (overflows) throw new Error(`Overflow horizontal em ${viewport.width}px`);
  await page.screenshot({ path: output, fullPage: true });
  await context.close();
}

async function capturePersonal() {
  const { context, page } = await preparePage({ width: 1440, height: 900 }, 'PERSONAL');
  await page.goto('http://127.0.0.1:4173/reports/evolution');
  await page.getByRole('heading', { name: 'Evolução', exact: true }).waitFor();
  await page.getByRole('combobox', { name: 'Visualizar evolução de' }).waitFor();
  await page.getByRole('img', { name: /Evolução de carga em Supino inclinado/ }).waitFor();
  await page.screenshot({ path: '.impeccable/review/personal.png', fullPage: true });
  await context.close();
}

await captureStudent({ width: 390, height: 844 }, '.impeccable/review/mobile.png');
await captureStudent({ width: 1440, height: 900 }, '.impeccable/review/desktop.png');
await capturePersonal();
await browser.close();
