/* src/components/Dev/DevPlayground.jsx */
import React, { useState } from 'react';
import { 
  CheckCircle, AlertTriangle, User, BookOpen, Award, 
  Settings, LogOut, Shield, Bell, Zap 
} from 'lucide-react';

import C from '@/theme/colors';
import ConfirmModal from '@/components/UI/ConfirmModal';

export default function DevPlayground() {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    variant: 'warning',
    title: '',
    message: '',
    isLoading: false
  });

  const openTestModal = (variant, title, message) => {
    setModalConfig({
      isOpen: true,
      variant,
      title,
      message,
      isLoading: false
    });
  };

  const handleModalConfirm = () => {
    setModalConfig(prev => ({ ...prev, isLoading: true }));
    setTimeout(() => {
      setModalConfig({
        isOpen: false,
        variant: 'warning',
        title: '',
        message: '',
        isLoading: false
      });
    }, 1500);
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
            🎨 مختبر العناصر الحديث (Dev Playground)
          </h2>
          <p className="text-xs" style={{ color: C?.text?.sub }}>
            معاينة دقيقة لنظام الألوان القياسي والنوافذ التفاعلية
          </p>
        </div>

        {/* 1️⃣ قسم الألوان القياسية */}
        <section 
          className="p-5 rounded-2xl border space-y-4"
          style={{ 
            backgroundColor: C?.dark?.surface,
            borderColor: C?.dark?.borderInput || C?.inputs?.border
          }}
        >
          <h3 className="text-sm font-bold" style={{ color: C?.amber?.DEFAULT || C?.primary?.DEFAULT }}>
            1. لوحة الألوان المعتمدة (Theme Colors)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border" style={{ backgroundColor: C?.dark?.bg, borderColor: C?.dark?.borderInput || C?.inputs?.border }}>
              <div className="h-7 rounded mb-2 border" style={{ backgroundColor: C?.dark?.bg, borderColor: C?.dark?.borderInput || C?.inputs?.border }} />
              <span className="text-[11px] block" style={{ color: C?.text?.sub }}>الخلفية (dark.bg)</span>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: C?.dark?.bg, borderColor: C?.dark?.borderInput || C?.inputs?.border }}>
              <div className="h-7 rounded mb-2" style={{ backgroundColor: C?.amber?.DEFAULT || C?.primary?.DEFAULT }} />
              <span className="text-[11px] block" style={{ color: C?.text?.sub }}>الذهبي/الرئيسي (amber)</span>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: C?.dark?.bg, borderColor: C?.dark?.borderInput || C?.inputs?.border }}>
              <div className="h-7 rounded mb-2" style={{ backgroundColor: C?.emerald?.DEFAULT || C?.success?.DEFAULT }} />
              <span className="text-[11px] block" style={{ color: C?.text?.sub }}>الزمردي/النجاح (emerald)</span>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: C?.dark?.bg, borderColor: C?.dark?.borderInput || C?.inputs?.border }}>
              <div className="h-7 rounded mb-2" style={{ backgroundColor: C?.error?.DEFAULT }} />
              <span className="text-[11px] block" style={{ color: C?.text?.sub }}>الخطأ/التحذير (error)</span>
            </div>
          </div>
        </section>

        {/* 2️⃣ قسم تجربة نافذة التأكيد (ConfirmModal) */}
        <section 
          className="p-5 rounded-2xl border space-y-4"
          style={{ 
            backgroundColor: C?.dark?.surface,
            borderColor: C?.dark?.borderInput || C?.inputs?.border
          }}
        >
          <h3 className="text-sm font-bold" style={{ color: C?.amber?.DEFAULT || C?.primary?.DEFAULT }}>
            2. تجربة نوافذ التأكيد (ConfirmModal)
          </h3>
          <div className="space-y-3">
            
            <button 
              onClick={() => openTestModal('danger', 'حذف الحلقة الدراسية', 'هل أنت متأكد من حذف هذه الحلقة؟ لن تتمكن من التراجع بعد إتمام العملية.')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.error?.DEFAULT,
                borderColor: C?.error?.DEFAULT
              }}
            >
              <AlertTriangle size={16} /> تجربة نافذة خطر (Danger)
            </button>

            <button 
              onClick={() => openTestModal('warning', 'أرشفة بيانات الطالب', 'هل تريد أرشفة بيانات الطالب؟ يمكن إعادة استعادتها لاحقاً.')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.amber?.DEFAULT || C?.primary?.DEFAULT,
                borderColor: C?.amber?.DEFAULT || C?.primary?.DEFAULT
              }}
            >
              <AlertTriangle size={16} /> تجربة نافذة أرشفة (Warning)
            </button>

            <button 
              onClick={() => openTestModal('info', 'استعادة البيانات', 'هل ترغب في استعادة البيانات المؤرشفة وإعادتها للعمل؟')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.emerald?.DEFAULT || C?.success?.DEFAULT,
                borderColor: C?.emerald?.DEFAULT || C?.success?.DEFAULT
              }}
            >
              <CheckCircle size={16} /> تجربة نافذة استعادة (Info)
            </button>

          </div>
        </section>

        {/* 3️⃣ قسم الأزرار القياسية */}
        <section 
          className="p-5 rounded-2xl border space-y-4"
          style={{ 
            backgroundColor: C?.dark?.surface,
            borderColor: C?.dark?.borderInput || C?.inputs?.border
          }}
        >
          <h3 className="text-sm font-bold" style={{ color: C?.amber?.DEFAULT || C?.primary?.DEFAULT }}>
            3. الأزرار القياسية
          </h3>
          <div className="space-y-3">
            <button 
              className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg"
              style={{
                backgroundColor: C?.amber?.DEFAULT || C?.primary?.DEFAULT,
                color: C?.dark?.bg
              }}
            >
              زر رئيسي (Primary Gold)
            </button>

            <button 
              className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border"
              style={{
                backgroundColor: C?.dark?.card,
                color: C?.text?.title,
                borderColor: C?.dark?.borderInput || C?.inputs?.border
              }}
            >
              زر ثانوي (Secondary Card)
            </button>
          </div>
        </section>

      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        variant={modalConfig.variant}
        title={modalConfig.title}
        message={modalConfig.message}
        isLoading={modalConfig.isLoading}
        onClose={closeModal}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}
