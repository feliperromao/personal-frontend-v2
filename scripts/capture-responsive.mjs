import { chromium } from '@playwright/test';

const exercises = [
  { id: 'e1', name: 'Aquecimento', type: 'CHEST', instructions: 'Prepare o movimento', rest: 30, load: 0, series: 2, load_progress: false },
  { id: 'e2', name: 'Supino reto', type: 'CHEST', instructions: 'Mantenha as escápulas firmes', rest: 60, load: 20, series: 4, load_progress: true },
  { id: 'e3', name: 'Flexão', type: 'CHEST', instructions: 'Mantenha o tronco alinhado', rest: 45, load: 0, series: 3, load_progress: false },
  { id: 'e4', name: 'Supino inclinado', type: 'CHEST', instructions: 'Controle a descida por 3 segundos', rest: 72, load: 24, repetitions: 10, series: 4, load_progress: true },
  { id: 'e5', name: 'Crucifixo com halteres', type: 'CHEST', instructions: 'Mantenha os cotovelos estáveis', rest: 60, load: 12, series: 3, load_progress: false },
];

const browser = await chromium.launch({ headless: true });

async function capture(viewport, output, navigatorOutput) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.addInitScript(({ exercises }) => {
    localStorage.setItem('auth-token', 'visual-review-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Lucas Aluno', email: 'lucas@example.com', type: 'STUDENT' }));
    sessionStorage.setItem('active-training-progress', JSON.stringify({
      id: 'p1',
      training_id: 't1',
      exercises,
      completed_series: [
        { exercise_id: 'e1', series: 1, load: 0, completed_at: '2026-11-17T19:00:00.000Z' },
        { exercise_id: 'e1', series: 2, load: 0, completed_at: '2026-11-17T19:01:00.000Z' },
        { exercise_id: 'e4', series: 1, load: 24, completed_at: '2026-11-17T19:02:00.000Z' },
        { exercise_id: 'e4', series: 2, load: 26, completed_at: '2026-11-17T19:03:00.000Z' },
      ],
    }));
    sessionStorage.setItem('series:p1:e4', '2');
    sessionStorage.setItem('rest:p1:e4', '72');
  }, { exercises });
  await page.route('**/training-progress/t1', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ id: 't1', name: 'Treino A · Peito e tríceps', description: 'Foco em controle', show_to_student: true, student_id: 's1', exercises }),
  }));
  await page.goto('http://127.0.0.1:4173/my-workouts/t1/exercises/e4');
  await page.getByRole('heading', { name: 'Supino inclinado' }).waitFor();
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
  await page.waitForTimeout(5500);
  await page.screenshot({ path: output, fullPage: true });
  await page.getByRole('button', { name: /Exercícios ·/ }).click();
  await page.getByRole('dialog', { name: 'Exercícios do treino' }).waitFor();
  await page.screenshot({ path: navigatorOutput, fullPage: true });
  await context.close();
}

await capture({ width: 390, height: 844 }, '.impeccable/review/mobile.png', '.impeccable/review/mobile-exercises.png');
await capture({ width: 1440, height: 900 }, '.impeccable/review/desktop.png', '.impeccable/review/desktop-exercises.png');
await browser.close();
