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
    chunkSizeWarningLimit: 1000, // رفع حد التحذيرات البرمجية للمكتبات الكبيرة مستقبلاً
    rollupOptions: {
      output: {
        // الهندسة العكسية لتقسيم الكود (Code Splitting) لضمان سرعة صاروخية للموقع
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'; // عزل مكتبة ريأكت الأساسية
            if (id.includes('lucide') || id.includes('icons')) return 'vendor-icons'; // عزل الأيقونات
            return 'vendor-libs'; // عزل باقي المكتبات وقاعدة البيانات تلقائياً
          }
        },
      },
    },
  },
})
