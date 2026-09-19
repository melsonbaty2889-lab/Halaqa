/* src/components/Dev/DevPlayground.jsx */
import React, { useState } from 'react';
import { 
  CheckCircle, AlertTriangle, Trash2, HelpCircle, 
  ShieldAlert, MessageSquare, Globe, Calendar, FolderSearch, Plus, ListFilter, Sparkles, KeyRound, RefreshCw,
  Layout, Bookmark
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
import LoadingButton from '@/components/UI/LoadingButton';
import SelectModal from '@/components/UI/SelectModal';
import { Skeleton, CardSkeleton, PageSkeleton } from '@/components/UI/Skeleton';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo';
import { formatHijriDate, calculateAge } from '@/utils/dateUtils';

export default function DevPlayground({ 
  t = (key, fallback) => fallback,
  lang = 'ar',
  isArabic = true
}) {
  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const isRtl = isArabic !== undefined ? isArabic : ['ar', 'ur'].includes(cleanLang);

  // الحالات التفاعلية للنماذج والقوائم
  const [selectedRole, setSelectedRole] = useState('teacher');
  const [selectedCountry, setSelectedCountry] = useState('SA');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [converterDate, setConverterDate] = useState(new Date());

  // حالات التحميل لأزرار الإجراءات والدخول
  const [btnLoading, setBtnLoading] = useState(false);
  const [loadingBtnState, setLoadingBtnState] = useState(false);

  // حالات النوافذ المنبثقة
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [selectedModalValue, setSelectedModalValue] = useState('student_1');

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

  // معالجات النوافذ المنبثقة الإرشاديّة والتأكيدية
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

  // معالجات اختبار التحميل للزر
  const handleTestAuthClick = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      alert(t('devPlayground.authSuccess', 'تم تنفيذ الإجراء بنجاح!'));
    }, 1500);
  };

  const handleTestLoadingBtn = () => {
    setLoadingBtnState(true);
    setTimeout(() => {
      setLoadingBtnState(false);
    }, 1500);
  };

  // بيانات الأدوار والنوافذ المنسدلة
  const roleOptions = [
    { value: 'admin', label: t('roles.admin', 'مدير النظام') },
    { value: 'teacher', label: t('roles.teacher', 'معلم الحلقة') },
    { value: 'student', label: t('roles.student', 'طالب') },
    { value: 'parent', label: t('roles.parent', 'ولي أمر') },
  ];

  const modalOptions = [
    { value: 'student_1', label: 'محمد أحمد علي', subLabel: 'حلقة الإيمان - الجزء 30' },
    { value: 'student_2', label: 'عبدالرحمن خالد', subLabel: 'حلقة النور - الجزء 29' },
    { value: 'student_3', label: 'عمر فاروق', subLabel: 'حلقة الفرقان - الجزء 1' },
    { value: 'student_4', label: 'يوسف إبراهيم', subLabel: 'حلقة الترتيل - الجزء 15' },
    { value: 'student_5', label: 'حمزة محمود', subLabel: 'حلقة الحفاظ - الجزء 5' },
    { value: 'student_6', label: 'بلال عثمان', subLabel: 'حلقة التقوى - الجزء 10' },
  ];

  // عمليات حسابية مشتقة من التاريخ للمحول
  const converterDateObj = converterDate instanceof Date ? converterDate : new Date(converterDate);
  const formattedGregorian = converterDateObj.toLocaleDateString(cleanLang, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedHijri = formatHijriDate(converterDateObj, cleanLang, 0);
  const computedAge = calculateAge(converterDateObj);

  return (
    <div 
      className="min-h-screen p-5 font-cairo bg-semantic-bgPage text-semantic-textPrimary"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* رأس الصفحة */}
        <header className="text-center space-y-2">
          <h2 className={`${UI.title} text-lg sm:text-xl font-bold`}>
            🎨 {t('devPlayground.title', 'مختبر العناصر الشامل')} <span className="inline-block text-xs font-normal text-semantic-textSecondary">(Dev Playground)</span>
          </h2>
          <p className={UI.subtitle}>
            {t('devPlayground.subtitle', 'معاينة دقيقة ومطابقة تماماً لسلوك العناصر والنظام القياسي')}
          </p>
        </header>

        {/* 1. معاينة شعار المكون SmartHalaqaProLogo */}
        <section className={`${UI.card} space-y-4 text-center`}>
          <h3 className="text-sm font-bold flex items-center justify-center gap-2 text-semantic-actionPrimary">
            <Bookmark size={18} /> {t('devPlayground.logoPreviewTitle', 'معاينة شعار SmartHalaqaProLogo')}
          </h3>
          
          <div className="p-4 rounded-xl bg-semantic-surfaceInput/50 border border-semantic-borderCard space-y-4">
            <div className="flex items-center justify-around gap-4 flex-wrap">
              <div className="flex flex-col items-center gap-1.5">
                <SmartHalaqaProLogo size={40} />
                <span className="text-[10px] text-semantic-textSecondary">صغير (40px)</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <SmartHalaqaProLogo size={56} />
                <span className="text-[10px] text-semantic-textSecondary">افتراضي (56px)</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <SmartHalaqaProLogo size={72} />
                <span className="text-[10px] text-semantic-textSecondary">كبير (72px)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. شعار المنصة الهوية (AppBrand) */}
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

        {/* 3. أزرار الهوية والدخول (AuthButtons) */}
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

        {/* 4. أزرار التحميل والتفاعلات (LoadingButton) */}
        <section className={`${UI.card} space-y-4 text-start`}>
          <h3 className="text-sm font-bold flex items-center gap-2 text-semantic-actionPrimary">
            <Sparkles size={18} /> {t('devPlayground.loadingButtonTitle', 'تجربة أزرار التحميل (LoadingButton)')}
          </h3>
          
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs text-semantic-textSecondary block mb-1.5">
                Primary Variant:
              </label>
              <LoadingButton 
                variant="primary" 
                isLoading={loadingBtnState} 
                onClick={handleTestLoadingBtn}
                fullWidth
              >
                {t('common.save', 'حفظ التغييرات')}
              </LoadingButton>
            </div>

            <div>
              <label className="text-xs text-semantic-textSecondary block mb-1.5">
                Emerald Variant:
              </label>
              <LoadingButton 
                variant="emerald" 
                isLoading={loadingBtnState} 
                onClick={handleTestLoadingBtn}
                fullWidth
              >
                {t('common.confirm', 'تأكيد العملية')}
              </LoadingButton>
            </div>

            <div>
              <label className="text-xs text-semantic-textSecondary block mb-1.5">
                Danger Variant:
              </label>
              <LoadingButton 
                variant="danger" 
                isLoading={loadingBtnState} 
                onClick={handleTestLoadingBtn}
                fullWidth
              >
                {t('common.delete', 'حذف العنصر')}
              </LoadingButton>
            </div>

            <div>
              <label className="text-xs text-semantic-textSecondary block mb-1.5">
                Outline Variant:
              </label>
              <LoadingButton 
                variant="outline" 
                isLoading={loadingBtnState} 
                onClick={handleTestLoadingBtn}
                fullWidth
              >
                {t('common.cancel', 'إلغاء')}
              </LoadingButton>
            </div>
          </div>
        </section>

        {/* 5. القائمة المخصصة (CustomSelect) */}
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

        {/* 6. الحالة الفارغة (EmptyState) */}
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

        {/* 7. مكون اختيار التاريخ القياسي (CustomDatePicker) */}
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
              showAge={true}
            />
            <p className="text-[11px] pt-1 text-semantic-textSecondary">
              {t('devPlayground.selectedDate', 'التاريخ المختار حالياً:')} <strong className="text-semantic-textPrimary">{selectedDate ? selectedDate.toLocaleDateString() : '—'}</strong>
            </p>
          </div>
        </section>

        {/* 8. محول التاريخ التفاعلي (Date Converter) */}
        <section className={`${UI.card} space-y-4 text-start border-semantic-actionPrimary/30 bg-semantic-surfaceInput/20`}>
          <h3 className="text-sm font-bold flex items-center gap-2 text-semantic-actionPrimary">
            <RefreshCw size={18} /> {t('devPlayground.dateConverterTitle', 'معاينة محول التاريخ الهجري والميلادي (Date Converter)')}
          </h3>
          
          <div className="space-y-3">
            <label className="text-xs block text-semantic-textSecondary">
              {t('devPlayground.converterSelectLabel', 'حدد التاريخ المُراد تحويله:')}
            </label>
            
            <CustomDatePicker 
              selectedDate={converterDate} 
              onChange={(newDate) => setConverterDate(newDate)} 
              showAge={false}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 rounded-xl border border-semantic-borderInput bg-semantic-surfaceInput space-y-1">
                <span className="text-[10px] font-bold text-semantic-textSecondary uppercase tracking-wider block">
                  {t('devPlayground.gregorianDate', 'التاريخ الميلادي')}
                </span>
                <p className="text-xs font-bold text-semantic-textPrimary">
                  {formattedGregorian}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-semantic-borderInput bg-semantic-surfaceInput space-y-1">
                <span className="text-[10px] font-bold text-semantic-actionPrimary uppercase tracking-wider block">
                  {t('devPlayground.hijriDate', 'التاريخ الهجري')}
                </span>
                <p className="text-xs font-bold text-semantic-actionPrimary">
                  {formattedHijri}
                </p>
              </div>
            </div>

            {computedAge !== null && (
              <div className="p-2.5 rounded-xl border border-semantic-borderInput bg-semantic-surfaceCard flex justify-between items-center">
                <span className="text-xs font-medium text-semantic-textSecondary">
                  {t('devPlayground.calculatedAge', 'العمر المحسوب تلقائياً:')}
                </span>
                <span className="text-xs font-bold text-semantic-actionPrimary bg-semantic-surfaceInput px-2.5 py-1 rounded-lg border border-semantic-borderInput">
                  {computedAge} {t('datePicker.yearsUnit', 'سنة')}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 9. اختيار الدولة (CountrySelect) */}
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

        {/* 10. محول اللغة (LanguageSwitcher) */}
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

        {/* 11. حالات النوافذ المنبثقة التنبيهية والتأكيدية (ConfirmModal) */}
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

        {/* 12. النافذة المنسدلة الاختيارية (SelectModal) */}
        <section className={`${UI.card} space-y-3 text-start`}>
          <h3 className="text-sm font-bold flex items-center gap-2 text-semantic-actionPrimary">
            <ListFilter size={18} /> {t('devPlayground.selectModalTitle', 'تجربة النافذة المنسدلة (SelectModal)')}
          </h3>
          
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsSelectModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border border-semantic-borderInput bg-semantic-surfaceInput text-semantic-textPrimary flex items-center justify-between transition-all cursor-pointer hover:border-semantic-actionPrimary"
            >
              <span>{t('devPlayground.openSelectModal', 'فتح نافذة الاختيار')}</span>
              <span className="text-semantic-actionPrimary">
                {modalOptions.find(o => o.value === selectedModalValue)?.label || 'اختر...'}
              </span>
            </button>

            <p className="text-[11px] text-semantic-textSecondary">
              {t('devPlayground.selectedModalValue', 'القيمة المختارة حالياً:')} <strong className="text-semantic-textPrimary">{selectedModalValue}</strong>
            </p>
          </div>
        </section>

        {/* 13. الهيكل العظمي والتحميل (Skeleton) */}
        <section className={`${UI.card} space-y-4 text-start`}>
          <h3 className="text-sm font-bold flex items-center gap-2 text-semantic-actionPrimary">
            <Layout size={18} /> {t('devPlayground.skeletonTitle', 'تجربة تحميل الهيكل العظمي (Skeleton)')}
          </h3>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-semantic-textSecondary">
              {t('devPlayground.skeletonBasic', 'عناصر تحميل منفصلة:')}
            </p>
            <div className="flex items-center gap-3">
              <Skeleton width="48px" height="48px" borderRadius="50%" />
              <div className="space-y-2 flex-1">
                <Skeleton width="60%" height="16px" />
                <Skeleton width="40%" height="12px" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-semantic-textSecondary">
              {t('devPlayground.skeletonCard', 'بطاقة إحصائية (CardSkeleton):')}
            </p>
            <CardSkeleton />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-semantic-textSecondary">
              {t('devPlayground.skeletonPage', 'هيكل كامل للصفحة (PageSkeleton):')}
            </p>
            <PageSkeleton />
          </div>
        </section>

      </div>

      {/* المكونات المنبثقة */}
      <SelectModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        title={t('devPlayground.selectModalHeader', 'اختر الطالب من القائمة')}
        options={modalOptions}
        selectedValue={selectedModalValue}
        onSelect={(val) => setSelectedModalValue(val)}
      />
      
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
