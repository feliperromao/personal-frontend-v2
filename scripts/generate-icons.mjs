import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const source = await readFile(new URL('../public/brand-mark.svg', import.meta.url));
const outputDirectory = new URL('../public/icons/', import.meta.url);
await mkdir(outputDirectory, { recursive: true });
const output = (name) => fileURLToPath(new URL(name, outputDirectory));

await Promise.all([
  sharp(source).resize(192, 192).png().toFile(output('pwa-192x192.png')),
  sharp(source).resize(512, 512).png().toFile(output('pwa-512x512.png')),
  sharp(source).resize(408, 408).extend({ top: 52, bottom: 52, left: 52, right: 52, background: '#F7F8FB' }).png().toFile(output('maskable-512x512.png')),
  sharp(source).resize(180, 180).png().toFile(output('apple-touch-icon-180x180.png')),
]);
