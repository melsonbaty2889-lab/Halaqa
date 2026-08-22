import { supabase } from './supabase';

/**
 * تسجيل مدير أكاديمية جديد بأسلوب آمن عبر الدالة RPC
 */
export const registerAcademyAdmin = async ({
  userId,
  email,
  fullNameAr,
  fullNameEn,
  academyNameAr,
  academyNameEn,
  academySlug,
  tokenHash,
}) => {
  const { data, error } = await supabase.rpc('register_academy_admin', {
    p_user_id: userId,
    p_email: email,
    p_full_name: { ar: fullNameAr, en: fullNameEn },
    p_academy_name: { ar: academyNameAr, en: academyNameEn },
    p_academy_slug: academySlug,
    p_token_hash: tokenHash,
  });

  if (error) {
    throw new Error(error.message || 'حدث خطأ أثناء إنشاء حساب المدير');
  }

  return data;
};

export default {
  registerAcademyAdmin,
};
