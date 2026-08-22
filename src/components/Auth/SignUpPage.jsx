import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSignUpForm } from '@/hooks/useSignUpForm';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { TermsModal } from '@/components/UI/TermsModal';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Globe, 
  Loader2, 
  UserCheck
} from 'lucide-react';

export default function SignUpPage({ onSwitchToLogin, onSignUpSuccess }) {
  const {
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
    fieldErrors,
    setFieldErrors,
    status,
    toggleLanguage,
    handleKeyUp,
    handleSignUp,
  } = useSignUpForm(onSignUpSuccess);

  // حالات إدارة نافذة الشروط والأحكام
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('terms');

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const inputPadding = isRtl ? 'pr-11 pl-11' : 'pl-11 pr-11';

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_50%_25%,rgba(15,118,110,0.18)_0%,#070C12_70%)] pt-12 pb-10 px-5 font-['Cairo',sans-serif] relative box-border"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* زر تغيير اللغة */}
      <button
        type="button"
        onClick={toggleLanguage}
        className={`absolute top-5 ${isRtl ? 'left-5' : 'right-5'} bg-slate-900 border border-slate-800 text-slate-300 py-2 px-3.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg z-50 hover:bg-slate-800 transition-colors`}
      >
        <Globe size={14} className="text-amber-500" />
        <span>{isRtl ? 'English' : 'العربية'}</span>
      </button>

      {/* بطاقة إنشاء الحساب */}
      <div className="w-full max-w-[440px] bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-[0_20px_40px_rgba(0,0,0,0.5)] my-auto relative">
        
        {/* الشعار */}
        <div className="flex flex-col items-center mb-4">
          <SmartHalaqaProLogo size={48} />
          <h1 className="text-slate-50 text-xl font-bold mt-2 mb-0.5">
            {isRtl ? 'انضم إلى الحلقة الذكية' : 'Join Smart Halaqa'}
          </h1>
          <p className="text-amber-500 text-[10px] font-bold tracking-wider uppercase m-0">
            {isRtl ? 'أنشئ حسابك وابدأ رحلتك التعليمية' : 'CREATE YOUR ACCOUNT TO GET STARTED'}
          </p>
        </div>

        {/* التنبيهات */}
        {status.msg && (
          <div className={`p-3 rounded-xl mb-4 text-xs leading-relaxed flex items-center gap-2 ${
            status.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
              : 'bg-red-500/10 text-red-400 border border-red-500/25'
          }`}>
            <AlertCircle size={16} className="shrink-0" />
            <div>{status.msg}</div>
          </div>
        )}

        {/* النموذج */}
        <form onSubmit={handleSignUp} className="flex flex-col gap-3">
          
          {/* الاسم الكامل */}
          <div className="relative flex items-center">
            <User 
              size={18} 
              className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors ${fullName ? 'text-amber-500' : 'text-slate-500'}`} 
            />
            <input 
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: '' }));
              }}
              placeholder={isRtl ? 'الاسم الثلاثي أو الكامل' : 'Full Name'}
              required
              className={`w-full py-2.5 ${inputPadding} rounded-lg border border-slate-700/80 bg-slate-950/60 text-white text-sm outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${fieldErrors.fullName ? '!border-red-500' : ''}`}
            />
          </div>

          {/* البريد الإلكتروني */}
          <div className="relative flex items-center">
            <Mail 
              size={18} 
              className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors ${email ? 'text-amber-500' : 'text-slate-500'}`} 
            />
            <input 
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
              }}
              placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
              required
              className={`w-full py-2.5 ${inputPadding} rounded-lg border border-slate-700/80 bg-slate-950/60 text-white text-sm outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${fieldErrors.email ? '!border-red-500' : ''}`}
            />
          </div>

          {/* نوع الحساب */}
          <div className="relative flex items-center">
            <UserCheck size={18} className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} text-amber-500 pointer-events-none`} />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`w-full py-2.5 ${inputPadding} rounded-lg border border-slate-700/80 bg-slate-950/60 text-slate-200 text-sm outline-none cursor-pointer focus:border-amber-500`}
            >
              <option value="student">{isRtl ? 'طالب / دارس' : 'Student'}</option>
              <option value="teacher">{isRtl ? 'معلم / محفظ' : 'Teacher'}</option>
              <option value="parent">{isRtl ? 'ولي أمر' : 'Parent'}</option>
              <option value="academy_admin">{isRtl ? 'مدير أكاديمية / مقرأة' : 'Academy Admin'}</option>
            </select>
          </div>

          {/* كلمة المرور */}
          <div className="relative flex items-center">
            <Lock 
              size={18} 
              className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors ${password ? 'text-amber-500' : 'text-slate-500'}`} 
            />
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onKeyUp={handleKeyUp}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
              }}
              placeholder={isRtl ? 'كلمة المرور' : 'Password'}
              required
              className={`w-full py-2.5 ${inputPadding} rounded-lg border border-slate-700/80 bg-slate-950/60 text-white text-sm outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${fieldErrors.password ? '!border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${isRtl ? 'left-3.5' : 'right-3.5'} bg-transparent border-none cursor-pointer flex items-center text-slate-500 hover:text-slate-300`}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* تأكيد كلمة المرور */}
          <div className="relative flex items-center">
            <Lock 
              size={18} 
              className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none transition-colors ${confirmPassword ? 'text-amber-500' : 'text-slate-500'}`} 
            />
            <input 
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
              }}
              placeholder={isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              required
              className={`w-full py-2.5 ${inputPadding} rounded-lg border border-slate-700/80 bg-slate-950/60 text-white text-sm outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${fieldErrors.confirmPassword ? '!border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute ${isRtl ? 'left-3.5' : 'right-3.5'} bg-transparent border-none cursor-pointer flex items-center text-slate-500 hover:text-slate-300`}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* الشروط والأحكام التفاعلية */}
          <div className="flex items-start gap-2 text-xs text-slate-300 my-1">
            <input 
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="accent-amber-500 w-4 h-4 cursor-pointer mt-0.5 shrink-0"
            />
            <label htmlFor="agreeTerms" className="cursor-pointer leading-tight select-none">
              {isRtl ? (
                <>
                  أوافق على{' '}
                  <button
                    type="button"
                    onClick={() => openModal('terms')}
                    className="text-amber-500 underline font-medium hover:text-amber-400 focus:outline-none p-0 bg-transparent border-none cursor-pointer"
                  >
                    الشروط والأحكام
                  </button>
                  {' '}و{' '}
                  <button
                    type="button"
                    onClick={() => openModal('privacy')}
                    className="text-amber-500 underline font-medium hover:text-amber-400 focus:outline-none p-0 bg-transparent border-none cursor-pointer"
                  >
                    سياسة الخصوصية
                  </button>
                </>
              ) : (
                <>
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => openModal('terms')}
                    className="text-amber-500 underline font-medium hover:text-amber-400 focus:outline-none p-0 bg-transparent border-none cursor-pointer"
                  >
                    Terms & Conditions
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => openModal('privacy')}
                    className="text-amber-500 underline font-medium hover:text-amber-400 focus:outline-none p-0 bg-transparent border-none cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </>
              )}
            </label>
          </div>

          {/* زر التسجيل */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{isRtl ? 'جاري إنشاء الحساب...' : 'Creating Account...'}</span>
              </>
            ) : (
              <span>{isRtl ? 'إنشاء حساب جديد' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* العودة لتسجيل الدخول */}
        <div className="mt-4 text-center text-xs text-slate-400">
          {isRtl ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
          <button 
            type="button"
            onClick={onSwitchToLogin} 
            className="bg-transparent border-none text-amber-500 font-bold cursor-pointer hover:underline p-0"
          >
            {isRtl ? 'تسجيل الدخول' : 'Sign In'}
          </button>
        </div>

      </div>

      {/* المودال المنبثق للشروط وسياسة الخصوصية */}
      <TermsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        contentType={modalType}
        isRtl={isRtl}
      />
    </div>
  );
}
