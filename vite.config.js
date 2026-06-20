import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // المسار الذكي المعتمد لتسهيل استدعاء الملفات
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // إلغاء خرائط الكود في النسخة الحية لتسريع الـ Build وتقليص الحجم والأمان
    chunkSizeWarningLimit: 2000, // رفع الحد لاستيعاب ملف الـ vendor الموحد والمستقر
    rollupOptions: {
      output: {
        // تجميع ذكي ومستقر يمنع التداخل الدائري ويحمي إقلاع المنصة
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // تجميع كل مكتبات node_modules في حزمة موحدة ومستقرة تماماً
          }
        },
      },
    },
  },
})
