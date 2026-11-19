import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'cones/*.svg'],
      workbox: {
        navigateFallback: '/index.html',
        // static shell only; Firestore data is always online-first (never cached by SW)
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
      manifest: {
        name: 'KADALUCK Mystery Drop',
        short_name: 'KADALUCK',
        description: 'Buy kadala. Discover the mystery shop.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#190D35',
        theme_color: '#190D35',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: { output: { manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], firestore: ['firebase/app', 'firebase/firestore'], fbauth: ['firebase/auth'] } } },
  },
  test: { environment: 'node' },
});
