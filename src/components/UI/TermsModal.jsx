import React from 'react';
import { X } from 'lucide-react';

export function TermsModal({ isOpen, onClose, contentType, isRtl }) {
  if (!isOpen) return null;

  const isTerms = contentType === 'terms';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl bg-slate-900 p-6 shadow-2xl border border-slate-800 text-slate-200 max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-lg font-semibold text-amber-500">
            {isTerms 
              ? (isRtl ? 'الشروط والأحكام' : 'Terms & Conditions')
              : (isRtl ? 'سياسة الخصوصية' : 'Privacy Policy')
            }
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto space-y-3 text-sm text-slate-300 leading-relaxed pr-2">
          {isTerms ? (
            isRtl ? (
              <>
                <p>مرحباً بك في منصة الحلقة الذكية. باستخدامك للمنصة، فإنك توافق على الالتزام بالشروط التالية:</p>
                <p>1. التعهد بصحة البيانات المدخلة عند إنشاء الحساب.</p>
                <p>2. الحفاظ على سرية معلومات الحساب وكلمة المرور.</p>
                <p>3. احترام حقوق الملكية الفكرية للمحتوى التعليمي والمناهج المرفوعة.</p>
              </>
            ) : (
              <>
                <p>Welcome to Smart Halaqa. By using our platform, you agree to the following terms:</p>
                <p>1. Provide accurate information during registration.</p>
                <p>2. Maintain the security of your account credentials.</p>
                <p>3. Respect all intellectual property rights of educational materials.</p>
              </>
            )
          ) : (
            isRtl ? (
              <>
                <p>نحن نلتزم بحماية خصوصيتك وبياناتك الشخصية وفقاً لأعلى معايير الأمان:</p>
                <p>1. يتم تشفير جميع البيانات باستخدام معايير SSL لحمايتها.</p>
                <p>2. لا نقوم بمشاركة أو بيع بياناتك الشخصية لأي طرف ثالث لأغراض إعلانية.</p>
                <p>3. نستخدم بريدك الإلكتروني للتواصل والتنبيهات المتعلقة بحسابك فقط.</p>
              </>
            ) : (
              <>
                <p>We are committed to protecting your personal data and privacy:</p>
                <p>1. All data is encrypted using standard SSL encryption.</p>
                <p>2. We do not sell or share your personal data with third parties.</p>
                <p>3. Email addresses are used strictly for account updates and authentication.</p>
              </>
            )
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 mt-4 text-left rtl:text-right">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
            }
