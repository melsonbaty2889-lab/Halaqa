/* src/components/Dev/DevPlayground.jsx */
import React, { useState } from 'react';
import { 
  CheckCircle, AlertTriangle, Trash2, HelpCircle, 
  ShieldAlert, MessageSquare, Globe 
} from 'lucide-react';

import C from '@/theme/colors';
import ConfirmModal from '@/components/UI/ConfirmModal';
import CountrySelect from '@/components/UI/CountrySelect';

export default function DevPlayground() {
  // حالة الدولة المختارة لتجربة CountrySelect
  const [selectedCountry, setSelectedCountry] = useState('SA');

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    variant: 'warning',
    title: '',
    message: '',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
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
      confirmText: config.confirmText || 'تأكيد',
      cancelText: config.cancelText || 'إلغاء',
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
        alert(`تم استلام القيمة المدخلة: ${inputValue}`);
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
      dir="rtl"
      style={{ 
        backgroundColor: C?.dark?.bg,
        color: C?.text?.title
      }}
    >
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* رأس الصفحة */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold" style={{ color: C?.amber?.DEFAULT || C?.primary?.DEFAULT }}>
            🎨 مختبر العناصر الشامل (Dev Playground)
          </h2>
          <p className="text-xs" style={{ color: C?.text?.sub }}>
            معاينة دقيقة ومطابقة تماماً لسلوك العناصر والنظام القياسي
          </p>
        </div>

        {/* تجربة مكون اختيار الدولة */}
        <section 
          className="p-5 rounded-2xl border space-y-3"
          style={{ 
            backgroundColor: C?.dark?.surface,
            borderColor: C?.dark?.borderInput || C?.inputs?.border
          }}
        >
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: C?.amber?.DEFAULT || C?.primary?.DEFAULT }}>
            <Globe size={18} /> تجربة اختيار الدولة (CountrySelect)
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs block" style={{ color: C?.text?.sub }}>
              اختر الدولة من القائمة:
            </label>
            <CountrySelect
              value={selectedCountry}
              onChange={(code) => setSelectedCountry(code)}
              isArabic={true}
            />
            <p className="text-[11px] pt-1" style={{ color: C?.text?.sub }}>
              الكود المختار حالياً: <strong style={{ color: C?.text?.title }}>{selectedCountry}</strong>
            </p>
          </div>
        </section>

        {/* حالات النوافذ المنبثقة */}
        <section 
          className="p-5 rounded-2xl border space-y-4"
          style={{ 
            backgroundColor: C?.dark?.surface,
            borderColor: C?.dark?.borderInput || C?.inputs?.border
          }}
        >
          <h3 className="text-sm font-bold" style={{ color: C?.amber?.DEFAULT || C?.primary?.DEFAULT }}>
            حالات النوافذ المنبثقة (ConfirmModal Variants)
          </h3>
          
          <div className="space-y-3">
            {/* خطر عادي */}
            <button 
              onClick={() => openTestModal({
                variant: 'danger',
                title: 'حذف الحلقة الدراسية',
                message: 'هل أنت متأكد من حذف هذه الحلقة؟ لن تتمكن من التراجع بعد إتمام العملية.',
                confirmText: 'نعم، احذف الحلقة',
                cancelText: 'إلغاء'
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-between transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.error?.DEFAULT,
                borderColor: C?.error?.DEFAULT
              }}
            >
              <span className="flex items-center gap-2"><Trash2 size={16} /> نافذة خطر عادي (Danger)</span>
            </button>

            {/* خطر شديد - تأكيد بالكلمة */}
            <button 
              onClick={() => openTestModal({
                variant: 'secure-delete',
                title: 'حذف الحساب نهائياً',
                message: 'سيتم حذف كافة البيانات والصلاحيات المتعلقة بهذا الحساب تماماً.',
                requiredConfirmWord: 'حذف',
                confirmText: 'تأكيد الحذف النهائي',
                cancelText: 'تراجع'
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-between transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.error?.DEFAULT,
                borderColor: C?.error?.DEFAULT
              }}
            >
              <span className="flex items-center gap-2"><ShieldAlert size={16} /> نافذة حذف مشروط (Secure Delete)</span>
            </button>

            {/* تحذير / أرشفة */}
            <button 
              onClick={() => openTestModal({
                variant: 'warning',
                title: 'أرشفة بيانات الطالب',
                message: 'هل تريد أرشفة بيانات الطالب؟ يمكن إعادة استعادتها لاحقاً.',
                confirmText: 'تأكيد الأرشفة',
                cancelText: 'إلغاء'
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-between transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.amber?.DEFAULT || C?.primary?.DEFAULT,
                borderColor: C?.amber?.DEFAULT || C?.primary?.DEFAULT
              }}
            >
              <span className="flex items-center gap-2"><AlertTriangle size={16} /> نافذة تحذير / أرشفة (Warning)</span>
            </button>

            {/* إدخال سبب / Prompt */}
            <button 
              onClick={() => openTestModal({
                variant: 'prompt',
                title: 'إلغاء الموعد المحدد',
                message: 'يرجى كتابة سبب إلغاء الجلسة الدراسية قبل الإرسال للطلاب:',
                promptPlaceholder: 'اكتب سبب الإلغاء هنا...',
                confirmText: 'إرسال وثبيت الإلغاء',
                cancelText: 'إلغاء'
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-between transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.amber?.DEFAULT || C?.primary?.DEFAULT,
                borderColor: C?.amber?.DEFAULT || C?.primary?.DEFAULT
              }}
            >
              <span className="flex items-center gap-2"><MessageSquare size={16} /> نافذة إدخال نصي (Prompt Input)</span>
            </button>

            {/* استعادة / نجاح */}
            <button 
              onClick={() => openTestModal({
                variant: 'info',
                title: 'استعادة البيانات',
                message: 'هل ترغب في استعادة البيانات المؤرشفة وإعادتها للعمل؟',
                confirmText: 'استعادة الآن',
                cancelText: 'إلغاء'
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-between transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.emerald?.DEFAULT || C?.success?.DEFAULT,
                borderColor: C?.emerald?.DEFAULT || C?.success?.DEFAULT
              }}
            >
              <span className="flex items-center gap-2"><CheckCircle size={16} /> نافذة استعادة / نجاح (Info)</span>
            </button>

            {/* تنبيه بسيط */}
            <button 
              onClick={() => openTestModal({
                variant: 'alert',
                title: 'تحديث النظام',
                message: 'تم إكمال عملية المزامنة بنجاح ولن تحتاج لإعادة التشغيل.',
                confirmText: 'حسناً، فهمت'
              })}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-between transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.text?.title,
                borderColor: C?.dark?.borderInput || C?.inputs?.border
              }}
            >
              <span className="flex items-center gap-2"><HelpCircle size={16} /> نافذة تنبيه أحادي (Alert Only)</span>
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
      />
    </div>
  );
}
