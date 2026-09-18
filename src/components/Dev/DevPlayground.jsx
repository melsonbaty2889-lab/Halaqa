/* src/components/Dev/DevPlayground.jsx */
import React, { useState } from 'react';
import { 
  CheckCircle, AlertTriangle, Trash2, HelpCircle, 
  ShieldAlert, MessageSquare, Globe, Calendar, FolderSearch, Plus 
} from 'lucide-react';

import C from '@/theme/colors';
import ConfirmModal from '@/components/UI/ConfirmModal';
import CountrySelect from '@/components/UI/CountrySelect';
import CustomDatePicker from '@/components/UI/CustomDatePicker';
import EmptyState from '@/components/UI/EmptyState';

export default function DevPlayground({ 
  t = (key, fallback) => fallback,
  lang = 'ar',
  isArabic = true
}) {
  const cleanLang = (lang || 'ar').toLowerCase().split('-')[0];
  const isRtl = isArabic !== undefined ? isArabic : ['ar', 'ur'].includes(cleanLang);

  // حالة الدولة المختارة لتجربة CountrySelect
  const [selectedCountry, setSelectedCountry] = useState('SA');

  // حالة التاريخ المختار لتجربة CustomDatePicker
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  return (
    <div 
      className="min-h-screen p-5 font-cairo"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ 
        backgroundColor: C?.dark?.bg,
        color: C?.text?.title
      }}
    >
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* رأس الصفحة */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold" style={{ color: C?.amber?.DEFAULT || C?.primary?.DEFAULT }}>
            🎨 {t('devPlayground.title', 'مختبر العناصر الشامل (Dev Playground)')}
          </h2>
          <p className="text-xs" style={{ color: C?.text?.sub }}>
            {t('devPlayground.subtitle', 'معاينة دقيقة ومطابقة تماماً لسلوك العناصر والنظام القياسي')}
          </p>
        </div>

        {/* تجربة مكون الحالة الفارغة (EmptyState) */}
        <section 
          className="p-5 rounded-2xl border space-y-3 text-start"
          style={{ 
            backgroundColor: C?.dark?.surface,
            borderColor: C?.dark?.borderInput || C?.inputs?.border
          }}
        >
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: C?.amber?.DEFAULT || C?.primary?.DEFAULT }}>
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

        {/* تجربة مكون اختيار التاريخ */}
        <section 
          className="p-5 rounded-2xl border space-y-3 text-start"
          style={{ 
            backgroundColor: C?.dark?.surface,
            borderColor: C?.dark?.borderInput || C?.inputs?.border
          }}
        >
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: C?.amber?.DEFAULT || C?.primary?.DEFAULT }}>
            <Calendar size={18} /> {t('devPlayground.datePickerTitle', 'تجربة اختيار التاريخ (CustomDatePicker)')}
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs block" style={{ color: C?.text?.sub }}>
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
            <p className="text-[11px] pt-1" style={{ color: C?.text?.sub }}>
              {t('devPlayground.selectedDate', 'التاريخ المختار حالياً:')} <strong style={{ color: C?.text?.title }}>{selectedDate ? selectedDate.toLocaleDateString() : '—'}</strong>
            </p>
          </div>
        </section>

        {/* تجربة مكون اختيار الدولة */}
        <section 
          className="p-5 rounded-2xl border space-y-3 text-start"
          style={{ 
            backgroundColor: C?.dark?.surface,
            borderColor: C?.dark?.borderInput || C?.inputs?.border
          }}
        >
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: C?.amber?.DEFAULT || C?.primary?.DEFAULT }}>
            <Globe size={18} /> {t('devPlayground.countrySelectTitle', 'تجربة اختيار الدولة (CountrySelect)')}
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs block" style={{ color: C?.text?.sub }}>
              {t('devPlayground.selectCountryLabel', 'اختر الدولة من القائمة:')}
            </label>
            <CountrySelect
              value={selectedCountry}
              onChange={(code) => setSelectedCountry(code)}
              isArabic={isRtl}
              lang={cleanLang}
              t={t}
            />
            <p className="text-[11px] pt-1" style={{ color: C?.text?.sub }}>
              {t('devPlayground.selectedCode', 'الكود المختار حالياً:')} <strong style={{ color: C?.text?.title }}>{selectedCountry}</strong>
            </p>
          </div>
        </section>

        {/* حالات النوافذ المنبثقة */}
        <section 
          className="p-5 rounded-2xl border space-y-4 text-start"
          style={{ 
            backgroundColor: C?.dark?.surface,
            borderColor: C?.dark?.borderInput || C?.inputs?.border
          }}
        >
          <h3 className="text-sm font-bold" style={{ color: C?.amber?.DEFAULT || C?.primary?.DEFAULT }}>
            {t('devPlayground.modalVariantsTitle', 'حالات النوافذ المنبثقة (ConfirmModal Variants)')}
          </h3>
          
          <div className="space-y-3">
            {/* خطر عادي */}
            <button 
              type="button"
              onClick={() => openTestModal({
                variant: 'danger',
                title: t('devPlayground.dangerModal.title', 'حذف الحلقة الدراسية'),
                message: t('devPlayground.dangerModal.message', 'هل أنت متأكد من حذف هذه الحلقة؟ لن تتمكن من التراجع بعد إتمام العملية.'),
                confirmText: t('devPlayground.dangerModal.confirm', 'نعم، احذف الحلقة'),
                cancelText: t('common.cancel', 'إلغاء')
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-between transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.error?.DEFAULT,
                borderColor: C?.error?.DEFAULT
              }}
            >
              <span className="flex items-center gap-2">
                <Trash2 size={16} /> 
                {t('devPlayground.dangerBtn', 'نافذة خطر عادي (Danger)')}
              </span>
            </button>

            {/* خطر شديد - تأكيد بالكلمة */}
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
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-between transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.error?.DEFAULT,
                borderColor: C?.error?.DEFAULT
              }}
            >
              <span className="flex items-center gap-2">
                <ShieldAlert size={16} /> 
                {t('devPlayground.secureDeleteBtn', 'نافذة حذف مشروط (Secure Delete)')}
              </span>
            </button>

            {/* تحذير / أرشفة */}
            <button 
              type="button"
              onClick={() => openTestModal({
                variant: 'warning',
                title: t('devPlayground.warningModal.title', 'أرشفة بيانات الطالب'),
                message: t('devPlayground.warningModal.message', 'هل تريد أرشفة بيانات الطالب؟ يمكن إعادة استعادتها لاحقاً.'),
                confirmText: t('devPlayground.warningModal.confirm', 'تأكيد الأرشفة'),
                cancelText: t('common.cancel', 'إلغاء')
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-between transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.amber?.DEFAULT || C?.primary?.DEFAULT,
                borderColor: C?.amber?.DEFAULT || C?.primary?.DEFAULT
              }}
            >
              <span className="flex items-center gap-2">
                <AlertTriangle size={16} /> 
                {t('devPlayground.warningBtn', 'نافذة تحذير / أرشفة (Warning)')}
              </span>
            </button>

            {/* إدخال سبب / Prompt */}
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
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-between transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.amber?.DEFAULT || C?.primary?.DEFAULT,
                borderColor: C?.amber?.DEFAULT || C?.primary?.DEFAULT
              }}
            >
              <span className="flex items-center gap-2">
                <MessageSquare size={16} /> 
                {t('devPlayground.promptBtn', 'نافذة إدخال نصي (Prompt Input)')}
              </span>
            </button>

            {/* استعادة / نجاح */}
            <button 
              type="button"
              onClick={() => openTestModal({
                variant: 'info',
                title: t('devPlayground.infoModal.title', 'استعادة البيانات'),
                message: t('devPlayground.infoModal.message', 'هل ترغب في استعادة البيانات المؤرشفة وإعادتها للعمل؟'),
                confirmText: t('devPlayground.infoModal.confirm', 'استعادة الآن'),
                cancelText: t('common.cancel', 'إلغاء')
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-between transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.emerald?.DEFAULT || C?.success?.DEFAULT,
                borderColor: C?.emerald?.DEFAULT || C?.success?.DEFAULT
              }}
            >
              <span className="flex items-center gap-2">
                <CheckCircle size={16} /> 
                {t('devPlayground.infoBtn', 'نافذة استعادة / نجاح (Info)')}
              </span>
            </button>

            {/* تنبيه بسيط */}
            <button 
              type="button"
              onClick={() => openTestModal({
                variant: 'alert',
                title: t('devPlayground.alertModal.title', 'تحديث النظام'),
                message: t('devPlayground.alertModal.message', 'تم إكمال عملية المزامنة بنجاح ولن تحتاج لإعادة التشغيل.'),
                confirmText: t('devPlayground.alertModal.confirm', 'حسناً، فهمت')
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-between transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.text?.title,
                borderColor: C?.dark?.borderInput || C?.inputs?.border
              }}
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
