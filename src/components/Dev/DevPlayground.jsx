/* src/components/Dev/DevPlayground.jsx */
import React, { useState } from 'react';
import { 
  CheckCircle, AlertTriangle, Trash2, HelpCircle, 
  ShieldAlert, MessageSquare, Globe, Calendar, FolderSearch, Plus, ListFilter, Sparkles, KeyRound 
} from 'lucide-react';

import { UI } from '@/theme/styles';
import ConfirmModal from '@/components/UI/ConfirmModal';
import CountrySelect from '@/components/UI/CountrySelect';
import CustomDatePicker from '@/components/UI/CustomDatePicker';
import EmptyState from '@/components/UI/EmptyState';
import CustomSelect from '@/components/UI/CustomSelect';
import AppBrand from '@/components/UI/AppBrand';
import { PrimaryButton, GoogleButton } from '@/components/UI/AuthButtons';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';

export default function DevPlayground({ 
  t = (key, fallback) => fallback,
  lang = 'ar',
  isArabic = true
}) {
  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const isRtl = isArabic !== undefined ? isArabic : ['ar', 'ur'].includes(cleanLang);

  const [selectedRole, setSelectedRole] = useState('teacher');
  const [selectedCountry, setSelectedCountry] = useState('SA');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // حالة اختبار التحميل لأزرار AuthButtons
  const [btnLoading, setBtnLoading] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    variant: 'warning',
    title: '',
    message: '',
    confirmText: t('common.confirm', 'تأكيد'),
    cancelText: t('common.cancel', 'إلغاء'),
    promptPlaceholder: '',
    requiredConfirmWord: '',
    isLoading: false
  });

  const openTestModal = (config) => {
    setModalConfig({
      isOpen: true,
      variant: config.variant || 'warning',
      title: config.title || '',
      message: config.message || '',
      confirmText: config.confirmText || t('common.confirm', 'تأكيد'),
      cancelText: config.cancelText || t('common.cancel', 'إلغاء'),
      promptPlaceholder: config.promptPlaceholder || '',
      requiredConfirmWord: config.requiredConfirmWord || '',
      isLoading: false
    });
  };

  const handleModalConfirm = (inputValue) => {
    setModalConfig(prev => ({ ...prev, isLoading: true }));
    
    setTimeout(() => {
      setModalConfig(prev => ({ ...prev, isOpen: false, isLoading: false }));
      if (inputValue) {
        alert(`${t('devPlayground.receivedInput', 'تم استلام القيمة المدخلة:')} ${inputValue}`);
      }
    }, 1200);
  };

  const closeModal = () => {
    if (!modalConfig.isLoading) {
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleTestAuthClick = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      alert(t('devPlayground.authSuccess', 'تم تنفيذ الإجراء بنجاح!'));
    }, 1500);
  };

  const roleOptions = [
    { value: 'admin', label: t('roles.admin', 'مدير النظام') },
    { value: 'teacher', label: t('roles.teacher', 'معلم الحلقة') },
    { value: 'student', label: t('roles.student', 'طالب') },
    { value: 'parent', label: t('roles.parent', 'ولي أمر') },
  ];

  return (
    <div 
      className="min-h-screen p-5 font-cairo bg-semantic-bgPage text-semantic-textPrimary"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* رأس الصفحة */}
        <div className="text-center space-y-2">
          <h2 className={`${UI.title} text-lg sm:text-xl font-bold`}>
            🎨 {t('devPlayground.title', 'مختبر العناصر الشامل')} <span className="inline-block text-xs font-normal text-semantic-textSecondary">(Dev Playground)</span>
          </h2>
          <p className={UI.subtitle}>
            {t('devPlayground.subtitle', 'معاينة دقيقة ومطابقة تماماً لسلوك العناصر والنظام القياسي')}
          </p>
        </div>

        {/* 1. تجربة هويات وشعار التطبيق (AppBrand) */}
        <section className={`${UI.card} space-y-4 text-center`}>
          <h3 className="text-sm font-bold flex items-center justify-center gap-2 text-semantic-actionPrimary">
            <Sparkles size={18} /> {t('devPlayground.appBrandTitle', 'معاينة شعار وهوية المنصة (AppBrand)')}
          </h3>
          
          <div className="p-4 rounded-xl bg-semantic-surfaceInput/50 border border-semantic-borderCard">
            <AppBrand 
              lang={cleanLang}
              t={t}
              subtitle={t('devPlayground.appBrandSubtitle', 'منصة إدارة الحلقات القرآنية والتعليمية')}
            />
          </div>
        </section>

        {/* 2. تجربة أزرار تسجيل الدخول والدخول السريع (AuthButtons) */}
        <section className={`${UI.card} space-y-4 text-start`}>
          <h3 className="text-sm font-bold flex items-center gap-2 text-semantic-actionPrimary">
            <KeyRound size={18} /> {t('devPlayground.authButtonsTitle', 'تجربة أزرار الهوية وتأكيد العمليات (AuthButtons)')}
          </h3>
          
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs text-semantic-textSecondary block mb-1.5">
                {t('devPlayground.primaryButtonLabel', 'الزر الرئيسي (PrimaryButton):')}
              </label>
              <PrimaryButton 
                loading={btnLoading} 
                onClick={handleTestAuthClick}
              >
                {t('auth.login', 'تسجيل الدخول')}
              </PrimaryButton>
            </div>

            <div>
              <label className="text-xs text-semantic-textSecondary block mb-1.5">
                {t('devPlayground.googleButtonLabel', 'زر دخول Google الموحد (GoogleButton):')}
              </label>
              <GoogleButton 
                loading={btnLoading} 
                onClick={handleTestAuthClick}
                t={t}
              />
            </div>
          </div>
        </section>

        {/* 3. تجربة القائمة المخصصة CustomSelect */}
        <section className={`${UI.card} space-y-3 text-start`}>
          <h3 className="text-sm font-bold flex items-center gap-2 text-semantic-actionPrimary">
            <ListFilter size={18} /> {t('devPlayground.customSelectTitle', 'تجربة القائمة المخصصة (CustomSelect)')}
          </h3>
          
          <div className="space-y-2">
            <CustomSelect
              label={t('devPlayground.selectRoleLabel', 'اختر الدور الوظيفي:')}
              options={roleOptions}
              value={selectedRole}
              onChange={(val) => setSelectedRole(val)}
              searchable={true}
              isArabic={isRtl}
              lang={cleanLang}
              t={t}
            />
            <p className="text-[11px] pt-1 text-semantic-textSecondary">
              {t('devPlayground.selectedRole', 'الدور المختار حالياً:')} <strong className="text-semantic-textPrimary">{selectedRole}</strong>
            </p>
          </div>
        </section>

        {/* 4. تجربة مكون الحالة الفارغة (EmptyState) */}
        <section className={`${UI.card} space-y-3 text-start`}>
          <h3 className="text-sm font-bold flex items-center gap-2 text-semantic-actionPrimary">
            <FolderSearch size={18} /> {t('devPlayground.emptyStateTitle', 'تجربة الحالة الفارغة (EmptyState)')}
          </h3>
          
          <div className="pt-2">
            <EmptyState 
              icon={FolderSearch}
              title={t('devPlayground.emptyTitle', 'لا توجد حلقات دراسية حالياً')}
              description={t('devPlayground.emptyDesc', 'لم يتم العثور على أي حلقات مسجلة في هذا القسم. يمكنك البدء بإضافة حلقتك الأولى الآن.')}
              actionText={t('devPlayground.emptyAction', 'إضافة حلقتك الأولى')}
              actionIcon={Plus}
              onAction={() => alert(t('devPlayground.emptyAlert', 'تم النقر على زر الإجراء بنجاح!'))}
              isRtl={isRtl}
            />
          </div>
        </section>

        {/* 5. تجربة مكون اختيار التاريخ */}
        <section className={`${UI.card} space-y-3 text-start`}>
          <h3 className="text-sm font-bold flex items-center gap-2 text-semantic-actionPrimary">
            <Calendar size={18} /> {t('devPlayground.datePickerTitle', 'تجربة اختيار التاريخ (CustomDatePicker)')}
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs block text-semantic-textSecondary">
              {t('devPlayground.selectDateLabel', 'اختر التاريخ الهجري / الميلادي:')}
            </label>
            <CustomDatePicker
              selectedDate={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              isArabic={isRtl}
              lang={cleanLang}
              t={t}
              showAge={true}
            />
            <p className="text-[11px] pt-1 text-semantic-textSecondary">
              {t('devPlayground.selectedDate', 'التاريخ المختار حالياً:')} <strong className="text-semantic-textPrimary">{selectedDate ? selectedDate.toLocaleDateString() : '—'}</strong>
            </p>
          </div>
        </section>

        {/* 6. تجربة مكون اختيار الدولة */}
        <section className={`${UI.card} space-y-3 text-start`}>
          <h3 className="text-sm font-bold flex items-center gap-2 text-semantic-actionPrimary">
            <Globe size={18} /> {t('devPlayground.countrySelectTitle', 'تجربة اختيار الدولة (CountrySelect)')}
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs block text-semantic-textSecondary">
              {t('devPlayground.selectCountryLabel', 'اختر الدولة من القائمة:')}
            </label>
            <CountrySelect
              value={selectedCountry}
              onChange={(code) => setSelectedCountry(code)}
              isArabic={isRtl}
              lang={cleanLang}
              t={t}
            />
            <p className="text-[11px] pt-1 text-semantic-textSecondary">
              {t('devPlayground.selectedCode', 'الكود المختار حالياً:')} <strong className="text-semantic-textPrimary">{selectedCountry}</strong>
            </p>
          </div>
        </section>

        {/* 7. تجربة محول اللغة (LanguageSwitcher) */}
        <section className={`${UI.card} space-y-3 text-start relative z-20`}>
          <h3 className="text-sm font-bold flex items-center gap-2 text-semantic-actionPrimary">
            <Globe size={18} /> {t('devPlayground.languageSwitcherTitle', 'تجربة محول اللغة (LanguageSwitcher)')}
          </h3>
          
          <div className="flex items-center justify-between pt-1 relative z-30">
            <span className="text-xs text-semantic-textSecondary">
              {t('devPlayground.selectLanguageLabel', 'اختر لغة الواجهة:')}
            </span>
            <LanguageSwitcher />
          </div>
        </section>

        {/* 8. حالات النوافذ المنبثقة */}
        <section className={`${UI.card} space-y-4 text-start`}>
          <h3 className="text-sm font-bold text-semantic-actionPrimary">
            {t('devPlayground.modalVariantsTitle', 'حالات النوافذ المنبثقة (ConfirmModal Variants)')}
          </h3>
          
          <div className="space-y-3">
            <button 
              type="button"
              onClick={() => openTestModal({
                variant: 'danger',
                title: t('devPlayground.dangerModal.title', 'حذف الحلقة الدراسية'),
                message: t('devPlayground.dangerModal.message', 'هل أنت متأكد من حذف هذه الحلقة؟ لن تتمكن من التراجع بعد إتمام العملية.'),
                confirmText: t('devPlayground.dangerModal.confirm', 'نعم، احذف الحلقة'),
                cancelText: t('common.cancel', 'إلغاء')
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border border-semantic-danger bg-semantic-surfaceInput text-semantic-danger flex items-center justify-between transition-all cursor-pointer hover:bg-semantic-dangerBg"
            >
              <span className="flex items-center gap-2">
                <Trash2 size={16} /> 
                {t('devPlayground.dangerBtn', 'نافذة خطر عادي (Danger)')}
              </span>
            </button>

            <button 
              type="button"
              onClick={() => openTestModal({
                variant: 'secure-delete',
                title: t('devPlayground.secureDeleteModal.title', 'حذف الحساب نهائياً'),
                message: t('devPlayground.secureDeleteModal.message', 'سيتم حذف كافة البيانات والصلاحيات المتعلقة بهذا الحساب تماماً.'),
                requiredConfirmWord: t('devPlayground.secureDeleteModal.confirmWord', 'حذف'),
                confirmText: t('devPlayground.secureDeleteModal.confirm', 'تأكيد الحذف النهائي'),
                cancelText: t('common.cancel', 'إلغاء')
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border border-semantic-danger bg-semantic-surfaceInput text-semantic-danger flex items-center justify-between transition-all cursor-pointer hover:bg-semantic-dangerBg"
            >
              <span className="flex items-center gap-2">
                <ShieldAlert size={16} /> 
                {t('devPlayground.secureDeleteBtn', 'نافذة حذف مشروط (Secure Delete)')}
              </span>
            </button>

            <button 
              type="button"
              onClick={() => openTestModal({
                variant: 'warning',
                title: t('devPlayground.warningModal.title', 'أرشفة بيانات الطالب'),
                message: t('devPlayground.warningModal.message', 'هل تريد أرشفة بيانات الطالب؟ يمكن إعادة استعادتها لاحقاً.'),
                confirmText: t('devPlayground.warningModal.confirm', 'تأكيد الأرشفة'),
                cancelText: t('common.cancel', 'إلغاء')
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border border-semantic-actionPrimary bg-semantic-surfaceInput text-semantic-actionPrimary flex items-center justify-between transition-all cursor-pointer hover:bg-semantic-actionPrimaryGlow/10"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle size={16} /> 
                {t('devPlayground.warningBtn', 'نافذة تحذير / أرشفة (Warning)')}
              </span>
            </button>

            <button 
              type="button"
              onClick={() => openTestModal({
                variant: 'prompt',
                title: t('devPlayground.promptModal.title', 'إلغاء الموعد المحدد'),
                message: t('devPlayground.promptModal.message', 'يرجى كتابة سبب إلغاء الجلسة الدراسية قبل الإرسال للطلاب:'),
                promptPlaceholder: t('devPlayground.promptModal.placeholder', 'اكتب سبب الإلغاء هنا...'),
                confirmText: t('devPlayground.promptModal.confirm', 'إرسال وثبيت الإلغاء'),
                cancelText: t('common.cancel', 'إلغاء')
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border border-semantic-actionPrimary bg-semantic-surfaceInput text-semantic-actionPrimary flex items-center justify-between transition-all cursor-pointer hover:bg-semantic-actionPrimaryGlow/10"
            >
              <span className="flex items-center gap-2">
                <MessageSquare size={16} /> 
                {t('devPlayground.promptBtn', 'نافذة إدخال نصي (Prompt Input)')}
              </span>
            </button>

            <button 
              type="button"
              onClick={() => openTestModal({
                variant: 'info',
                title: t('devPlayground.infoModal.title', 'استعادة البيانات'),
                message: t('devPlayground.infoModal.message', 'هل ترغب في استعادة البيانات المؤرشفة وإعادتها للعمل؟'),
                confirmText: t('devPlayground.infoModal.confirm', 'استعادة الآن'),
                cancelText: t('common.cancel', 'إلغاء')
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border border-semantic-successBg bg-semantic-surfaceInput text-semantic-success flex items-center justify-between transition-all cursor-pointer hover:bg-semantic-successBg/50"
            >
              <span className="flex items-center gap-2">
                <CheckCircle size={16} /> 
                {t('devPlayground.infoBtn', 'نافذة استعادة / نجاح (Info)')}
              </span>
            </button>

            <button 
              type="button"
              onClick={() => openTestModal({
                variant: 'alert',
                title: t('devPlayground.alertModal.title', 'تحديث النظام'),
                message: t('devPlayground.alertModal.message', 'تم إكمال عملية المزامنة بنجاح ولن تحتاج لإعادة التشغيل.'),
                confirmText: t('devPlayground.alertModal.confirm', 'حسناً، فهمت')
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border border-semantic-borderInput bg-semantic-surfaceInput text-semantic-textPrimary flex items-center justify-between transition-all cursor-pointer hover:border-semantic-borderHover"
            >
              <span className="flex items-center gap-2">
                <HelpCircle size={16} /> 
                {t('devPlayground.alertBtn', 'نافذة تنبيه أحادي (Alert Only)')}
              </span>
            </button>
          </div>
        </section>

      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        variant={modalConfig.variant}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        promptPlaceholder={modalConfig.promptPlaceholder}
        requiredConfirmWord={modalConfig.requiredConfirmWord}
        isLoading={modalConfig.isLoading}
        onClose={closeModal}
        onConfirm={handleModalConfirm}
        t={t}
        lang={cleanLang}
        isArabic={isRtl}
      />
    </div>
  );
}
