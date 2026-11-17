import { chromium } from '@playwright/test';
import { unlink } from 'node:fs/promises';
import sharp from 'sharp';

const exercises = [
  { id: 'e1', name: 'Aquecimento', type: 'CHEST', instructions: 'Prepare o movimento', rest: 30, load: 0, series: 2, load_progress: false },
  { id: 'e2', name: 'Supino reto', type: 'CHEST', instructions: 'Mantenha as escápulas firmes', rest: 60, load: 20, series: 4, load_progress: true },
  { id: 'e3', name: 'Flexão', type: 'CHEST', instructions: 'Mantenha o tronco alinhado', rest: 45, load: 0, series: 3, load_progress: false },
  { id: 'e4', name: 'Supino inclinado', type: 'CHEST', instructions: 'Controle a descida por 3 segundos', rest: 72, load: 24, repetitions: 10, series: 4, load_progress: true },
  { id: 'e5', name: 'Crucifixo com halteres', type: 'CHEST', instructions: 'Mantenha os cotovelos estáveis', rest: 60, load: 12, series: 3, load_progress: false },
];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2.184615 });
const page = await context.newPage();
await page.addInitScript(({ exercises }) => {
  localStorage.setItem('auth-token', 'visual-review-token');
  localStorage.setItem('user', JSON.stringify({ name: 'Lucas Aluno', email: 'lucas@example.com', type: 'STUDENT' }));
  sessionStorage.setItem('active-training-progress', JSON.stringify({ id: 'p1', training_id: 't1', exercises }));
  sessionStorage.setItem('series:p1:e4', '2');
  sessionStorage.setItem('rest:p1:e4', '72');
}, { exercises });
await page.route('**/training-progress/t1', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 't1', name: 'Treino A · Peito e tríceps', description: 'Foco em controle', show_to_student: true, student_id: 's1', exercises }) }));
await page.goto('http://127.0.0.1:4173/my-workouts/t1/exercises/e4');
await page.getByRole('heading', { name: 'Supino inclinado' }).waitFor();
await page.evaluate(() => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
});
await page.waitForTimeout(5500);
const rawPath = '.impeccable/review/hero-repro.raw.png';
await page.screenshot({ path: rawPath });
await browser.close();
await sharp(rawPath).resize(852, 1846, { fit: 'fill' }).png().toFile('.impeccable/review/hero-repro.png');
await unlink(rawPath);
