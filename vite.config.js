/* vite.config.js */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path'; // 1. استيراد وحدة path من Node.js

export default defineConfig({
  // 2. إضافة إعداد الـ Alias
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'Smart Halaqa | الحلقة الذكية',
        short_name: 'SmartHalaqa',
        description: 'منصة عالمية متطورة لإدارة حلقات وأكاديميات تحفيظ القرآن الكريم',
        theme_color: '#090F17',
        background_color: '#090F17',
        display: 'standalone',
        orientation: 'portrait',
        dir: 'rtl',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
