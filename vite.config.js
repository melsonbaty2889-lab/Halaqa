import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // تحسين أداء البناء وتوزيع الملفات
  build: {
    outDir: 'dist',
    sourcemap: false, // تعطل لتقليل حجم ملفات البناء وزيادة الأمان
    rollupOptions: {
      output: {
        // تقسيم ملفات الـ JS الكبيرة لسرعة تحميل أكبر (Code Splitting)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    // تقليل حجم ملفات الكود لسرعة أفضل
    minify: 'terser',
  },
  
  // تحسين دقة المسارات لتجنب أخطاء النشر على Vercel
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  
  server: {
    port: 3000,
  }
})
