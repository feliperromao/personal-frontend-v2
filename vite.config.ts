import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'REACT_APP_']);
  const apiUrl = env.VITE_BACKEND_API || env.REACT_APP_BACKEND_API || '';
  let apiOrigin = '';

  try {
    apiOrigin = apiUrl ? new URL(apiUrl).origin : '';
  } catch {
    apiOrigin = '';
  }

  return {
    envPrefix: ['VITE_', 'REACT_APP_'],
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: [
          'brand-mark.svg',
          'icons/apple-touch-icon-180x180.png',
          'icons/pwa-192x192.png',
          'icons/pwa-512x512.png',
          'icons/maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'MyPersonal.App',
          short_name: 'MyPersonal',
          description: 'Treinos orientados por personal trainer, do planejamento à execução.',
          lang: 'pt-BR',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'any',
          background_color: '#F8F8F8',
          theme_color: '#F8F8F8',
          categories: ['fitness', 'health', 'productivity'],
          icons: [
            { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          navigateFallback: '/index.html',
          globPatterns: ['**/*.{js,css,html,woff2,svg,png,ico}'],
          runtimeCaching: [
            ...(apiOrigin
              ? [{
                  urlPattern: ({ url }: { url: URL }) => url.origin === apiOrigin,
                  handler: 'NetworkOnly' as const,
                  options: { cacheName: 'api-network-only' },
                }]
              : []),
            {
              urlPattern: ({ url }: { url: URL }) => /(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|google\.com)$/.test(url.hostname),
              handler: 'NetworkOnly',
              options: { cacheName: 'media-network-only' },
            },
          ],
        },
      }),
    ],
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'mui-core': ['@mui/material', '@mui/icons-material'],
            'react-core': ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.ts',
      css: true,
      exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    },
  };
});
