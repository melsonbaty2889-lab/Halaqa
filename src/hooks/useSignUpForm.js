import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { handleAuthError } from '@/utils/errorHandler';
import { signUpSchema, validateFormData } from '@/schemas/auth';

export function useSignUpForm(onSignUpSuccess) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const isRtl = i18n?.language === 'ar';

  // 1. استرجاع البيانات المحفوظة مسبقاً لمنع ضياع مدخلات المستخدم
  const [fullName, setFullName] = useState(() => {
    return localStorage.getItem('signup_draft_name') || '';
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('signup_draft_email') || '';
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: null, msg: '' });

  // 2. التحديث التلقائي للمسودة أثناء الكتابة
  useEffect(() => {
    localStorage.setItem('signup_draft_name', fullName);
  }, [fullName]);

  useEffect(() => {
    localStorage.setItem('signup_draft_email', email);
  }, [email]);

  const toggleLanguage = () => {
    const nextLang = isRtl ? 'en' : 'ar';
    if (i18n?.changeLanguage) {
      i18n.changeLanguage(nextLang);
    }
  };

  const handleKeyUp = (e) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  // وظيفة لتتبع محاولات التسجيل التعثرية (Lead Retention)
  const trackFailedAttempt = async (email, fullName, reason) => {
    try {
      if (!email) return;
      // يمكنك ربط هذه النقطة برابط Webhook خاص بك على Make.com
      // fetch('YOUR_MAKE_WEBHOOK_URL', { method: 'POST', body: JSON.stringify({ email, fullName, reason }) });
    } catch (e) {
      console.error('Failed to log lead:', e);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });
    setFieldErrors({});

    if (!agreeTerms) {
      setFieldErrors({ agreeTerms: true });
      setStatus({
        type: 'error',
        msg: isRtl 
          ? 'يرجى الموافقة على الشروط والأحكام وسياسة الخصوصية للمتابعة.' 
          : 'Please agree to the terms and privacy policy to continue.'
      });
      return;
    }

    const formData = {
      fullName: fullName.trim(),
      email: email.trim(),
      password: password.trim(),
      confirmPassword: confirmPassword.trim(),
      role,
      agreeTerms
    };

    const validationResult = validateFormData(formData, signUpSchema);

    if (!validationResult.valid) {
      setFieldErrors(validationResult.errors);
      
      if (validationResult.errors?.agreeTerms) {
        setStatus({
          type: 'error',
          msg: isRtl 
            ? 'يرجى الموافقة على الشروط والأحكام وسياسة الخصوصية للمتابعة.' 
            : 'Please agree to the terms and privacy policy to continue.'
        });
      } else {
        setStatus({
          type: 'error',
          msg: isRtl ? 'يرجى التأكد من صحة البيانات المدخلة أعلاه.' : 'Please correct the highlighted errors above.'
        });
      }
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validationResult.data.email,
        password: validationResult.data.password,
        options: {
          data: {
            full_name: validationResult.data.fullName,
            role: validationResult.data.role,
          },
          emailRedirectTo: `${window.location.origin}?lang=${i18n?.language || 'ar'}`
        }
      });

      if (authError) throw authError;

      // 3. مسح المسودة عند نجاح التسجيل
      localStorage.removeItem('signup_draft_name');
      localStorage.removeItem('signup_draft_email');

      setStatus({
        type: 'success',
        msg: isRtl 
          ? '✅ تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني لتأكيد الحساب.' 
          : '✅ Account created! Please check your email to activate.'
      });

      if (onSignUpSuccess) {
        onSignUpSuccess(authData);
      }

    } catch (err) {
      console.error('Sign Up Error:', err);
      
      // حفظ المحاولة التعثرية للتواصل مع المستخدم لاحقاً
      trackFailedAttempt(formData.email, formData.fullName, err.message);

      const userFriendlyMsg = handleAuthError(err, isRtl);
      setStatus({
        type: 'error',
        msg: userFriendlyMsg
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isRtl,
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    role,
    setRole,
    agreeTerms,
    setAgreeTerms,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    capsLockOn,
    fieldErrors,
    setFieldErrors,
    status,
    setStatus,
    toggleLanguage,
    handleKeyUp,
    handleSignUp,
  };
}
