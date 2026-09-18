/* src/components/Dev/DevPlayground.jsx */
import React, { useState } from 'react';
import { 
  CheckCircle, AlertTriangle, User, BookOpen, Award, 
  Settings, LogOut, Shield, Bell, Zap, MessageSquare 
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
        backgroundColor: C.dark?.bg || '#0F172A',
        color: C.text?.title || '#F8FAFC'
      }}
    >
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* رأس الصفحة */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold" style={{ color: C.amber?.DEFAULT || '#F59E0B' }}>
            🎨 مختبر العناصر الحديث (Dev Playground)
          </h2>
          <p className="text-xs" style={{ color: C.text?.sub || '#94A3B8' }}>
            معاينة دقيقة لنظام الألوان القياسي والنوافذ التفاعلية
          </p>
        </div>

        {/* 1️⃣ قسم الألوان القياسية من C */}
        <section 
          className="p-5 rounded-2xl border space-y-4"
          style={{ 
            backgroundColor: C.dark?.surface || '#1E293B',
            borderColor: C.dark?.borderInput || '#334155'
          }}
        >
          <h3 className="text-sm font-bold" style={{ color: C.amber?.DEFAULT || '#F59E0B' }}>
            1. لوحة الألوان المعتمدة (Theme Colors)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border" style={{ backgroundColor: C.dark?.bg, borderColor: C.dark?.borderInput }}>
              <div className="h-7 rounded mb-2 border" style={{ backgroundColor: C.dark?.bg, borderColor: '#555' }} />
              <span className="text-[11px] block" style={{ color: C.text?.sub }}>الخلفية (C.dark.bg)</span>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: C.dark?.bg, borderColor: C.dark?.borderInput }}>
              <div className="h-7 rounded mb-2" style={{ backgroundColor: C.amber?.DEFAULT }} />
              <span className="text-[11px] block" style={{ color: C.text?.sub }}>الذهبي/الرئيسي (C.amber)</span>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: C.dark?.bg, borderColor: C.dark?.borderInput }}>
              <div className="h-7 rounded mb-2" style={{ backgroundColor: C.emerald?.DEFAULT }} />
              <span className="text-[11px] block" style={{ color: C.text?.sub }}>الزمردي/النجاح (C.emerald)</span>
            </div>
            <div className="p-3 rounded-xl border" style={{ backgroundColor: C.dark?.bg, borderColor: C.dark?.borderInput }}>
              <div className="h-7 rounded mb-2" style={{ backgroundColor: C.error?.DEFAULT }} />
              <span className="text-[11px] block" style={{ color: C.text?.sub }}>الخطأ/التحذير (C.error)</span>
            </div>
          </div>
        </section>

        {/* 2️⃣ قسم تجربة نافذة التأكيد (ConfirmModal) */}
        <section 
          className="p-5 rounded-2xl border space-y-4"
          style={{ 
            backgroundColor: C.dark?.surface || '#1E293B',
            borderColor: C.dark?.borderInput || '#334155'
          }}
        >
          <h3 className="text-sm font-bold" style={{ color: C.amber?.DEFAULT || '#F59E0B' }}>
            2. تجربة نوافذ التأكيد (ConfirmModal)
          </h3>
          <div className="space-y-3">
            
            <button 
              onClick={() => openTestModal('danger', 'حذف الحلقة الدراسية', 'هل أنت متأكد من حذف هذه الحلقة؟ لن تتمكن من التراجع بعد إتمام العملية.')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{
                backgroundColor: `${C.error?.DEFAULT}1A`,
                color: C.error?.DEFAULT,
                borderColor: C.error?.DEFAULT
              }}
            >
              <AlertTriangle size={16} /> تجربة نافذة خطر (Danger)
            </button>

            <button 
              onClick={() => openTestModal('warning', 'أرشفة بيانات الطالب', 'هل تريد أرشفة بيانات الطالب؟ يمكن إعادة استعادتها لاحقاً.')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{
                backgroundColor: `${C.amber?.DEFAULT}1A`,
                color: C.amber?.DEFAULT,
                borderColor: C.amber?.DEFAULT
              }}
            >
              <AlertTriangle size={16} /> تجربة نافذة أرشفة (Warning)
            </button>

            <button 
              onClick={() => openTestModal('info', 'استعادة البيانات', 'هل ترغب في استعادة البيانات المؤرشفة وإعادتها للعمل؟')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{
                backgroundColor: `${C.emerald?.DEFAULT}1A`,
                color: C.emerald?.DEFAULT,
                borderColor: C.emerald?.DEFAULT
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
            backgroundColor: C.dark?.surface || '#1E293B',
            borderColor: C.dark?.borderInput || '#334155'
          }}
        >
          <h3 className="text-sm font-bold" style={{ color: C.amber?.DEFAULT || '#F59E0B' }}>
            3. الأزرار القياسية
          </h3>
          <div className="space-y-3">
            <button 
              className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg"
              style={{
                backgroundColor: C.amber?.DEFAULT || '#F59E0B',
                color: C.dark?.bg || '#0F172A'
              }}
            >
              زر رئيسي (Primary Gold)
            </button>

            <button 
              className="w-full py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border"
              style={{
                backgroundColor: C.dark?.card || '#1E293B',
                color: C.text?.title || '#F8FAFC',
                borderColor: C.dark?.borderInput || '#334155'
              }}
            >
              زر ثانوي (Secondary Card)
            </button>
          </div>
        </section>

      </div>

      {/* المكون التفاعلي لاختبار النافذة */}
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
