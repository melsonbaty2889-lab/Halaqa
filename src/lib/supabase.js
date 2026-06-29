import { createClient } from '@supabase/supabase-js';

// قراءة المتغيرات مع وضع بديل افتراضي آمن لمنع انهيار التطبيق أثناء الـ Import على Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-safe-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-safe-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error("🚨 خطأ مالي/تقني: متغيرات البيئة لـ Supabase مفقودة في لوحة تحكم Vercel!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
