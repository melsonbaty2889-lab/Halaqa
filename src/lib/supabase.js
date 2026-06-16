import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🛡️ حزام أمان: تنبيه فوري في الـ Console في حال نسيان إضافة المفاتيح في Vercel
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ تحذير حرج: متغيرات بيئة Supabase مفقودة! تأكد من ملف .env محلياً أو إعدادات Environment Variables في Vercel.");
}

// تهيئة الاتصال مع ضبط إعدادات الجلسة صراحةً لضمان الاستقرار
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // حفظ الجلسة في المتصفح
    autoRefreshToken: true, // تجديد الجلسة تلقائياً
  }
});
