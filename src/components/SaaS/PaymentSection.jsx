import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, ShieldCheck, Check, Copy, X } from 'lucide-react';
import { colors } from '@/theme/colors';
import PaymentMethods from './components/PaymentMethods';

export default function PaymentSection({ 
  region = 'EGP', 
  txId = '', 
  setTxId, 
  isSubmitted = false, 
  loading = false, 
  onSubmit, 
  isRTL = false 
}) {
  const { t } = useTranslation();
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const fileInputRef = useRef(null);

  // استخراج ألوان الثيم بأسلوب دفاعي لمنع أي كسر
  const cardBg = colors?.dark?.card || '#0F172A';
  const cardBorder = colors?.dark?.cardBorder || '#1E293B';
  const surfaceBg = colors?.dark?.surface || '#182234';
  const textPrimary = colors?.dark?.text || '#F8FAFC';
  const textMuted = colors?.dark?.textMuted || '#94A3B8';
  const accentEmerald = colors?.emerald?.light || '#10B981';
  const inputBg = colors?.inputs?.bg || 'rgba(15, 23, 42, 0.6)';
  const inputBorder = colors?.inputs?.border || '#334155';

  // توحيد رمز المنطقة المالي مع الحفاظ على التوافق الخلفي
  const normalizedRegion = useMemo(() => {
    if (region === 'egypt' || region === 'EGP') return 'EGP';
    if (region === 'gcc' || region === 'SAR') return 'SAR';
    return 'USD';
  }, [region]);

  const handleRemoveFile = useCallback((e) => {
    e.stopPropagation();
    setReceiptFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFormSubmit = (e) => {
    e?.preventDefault();
    if (onSubmit) {
      onSubmit(
        selectedGateway?.id, 
        Boolean(selectedGateway?.accountNumber || selectedGateway?.isManual), 
        receiptFile
      );
    }
  };

  return (
    <div 
      style={{
        backgroundColor: cardBg,
        borderColor: cardBorder,
      }}
      className="border rounded-2xl p-6 max-w-xl mx-auto shadow-2xl space-y-5"
    >
      {/* 💳 1. استدعاء مكون وسائل الدفع */}
      <PaymentMethods 
        region={normalizedRegion}
        onSelectPayment={(gateway) => setSelectedGateway(gateway)} 
      />

      {/* 📝 2. تفاصيل الإشعار ورقم المعاملة للدفع اليدوي */}
      {(selectedGateway?.accountNumber || selectedGateway?.isManual) && (
        <div 
          style={{
            backgroundColor: surfaceBg,
            borderColor: cardBorder,
          }}
          className="border rounded-xl p-4 space-y-3 transition-all duration-200"
        >
          {/* مدخل رقم المعاملة */}
          <div className="space-y-1">
            <label style={{ color: textMuted }} className="text-xs font-bold block">
              {t('subscription.txIdLabel', 'رقم عملية التحويل / المرجع (اختياري)')}
            </label>
            <input 
              type="text" 
              value={txId}
              onChange={(e) => setTxId?.(e.target.value)}
              placeholder={t('subscription.txIdPlaceholder', 'أدخل رقم المعاملة أو اسم المحوِّل')}
              style={{
                backgroundColor: inputBg,
                borderColor: inputBorder,
                color: textPrimary,
              }}
              className="w-full p-3 rounded-lg text-xs border outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* رفع صورة الإشعار */}
          <div className="space-y-1">
            <label style={{ color: textMuted }} className="text-xs font-bold block">
              {t('subscription.attachReceipt', 'إرفاق صورة إشعار التحويل:')}
            </label>
            
            <div className="relative flex items-center">
              <label 
                style={{
                  backgroundColor: inputBg,
                  borderColor: inputBorder,
                }}
                className="w-full flex items-center justify-center p-3 border border-dashed rounded-lg cursor-pointer text-xs gap-2 min-h-[44px] transition-all hover:border-slate-500"
              >
                <Upload size={16} style={{ color: accentEmerald }} />
                <span 
                  style={{ 
                    color: receiptFile ? accentEmerald : textMuted, 
                    fontWeight: receiptFile ? 'bold' : 'normal' 
                  }}
                  className="truncate max-w-[240px]"
                >
                  {receiptFile ? receiptFile.name : t('subscription.selectReceiptFile', 'اختر ملف الإشعار أو التقط صورة')}
                </span>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(e) => setReceiptFile(e.target.files[0] || null)} 
                  className="hidden" 
                />
              </label>

              {receiptFile && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  aria-label={t('common.remove', 'إزالة الملف')}
                  className="absolute inline-end-2 p-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🛡️ 3. تنبيه الأمان */}
      <div 
        style={{
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          color: accentEmerald,
          borderColor: 'rgba(16, 185, 129, 0.2)',
        }}
        className="border p-2.5 rounded-xl text-center text-xs font-bold"
      >
        {t('subscription.secureNotice', 'دفع آمن وفوري - يتم تفعيل الترخيص تلقائياً.')}
      </div>

      {/* 🚀 4. زر إتمام الطلب النهائي */}
      {isSubmitted ? (
        <div 
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: accentEmerald,
            borderColor: 'rgba(16, 185, 129, 0.3)',
          }}
          className="border p-3.5 rounded-xl text-center text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2"
        >
          <ShieldCheck size={18} />
          <span>{t('subscription.orderReceived', 'تم استلام الطلب وستتم المراجعة والتفعيل فوراً')}</span>
        </div>
      ) : (
        <button 
          type="button"
          onClick={handleFormSubmit}
          disabled={loading}
          aria-label={t('subscription.proceedToPayment', 'تأكيد وإتمام الطلب')}
          style={{
            backgroundColor: accentEmerald,
            color: colors?.dark?.bg || '#090F16',
            opacity: loading ? 0.6 : 1
          }}
          className="w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-emerald-950/20"
        >
          {loading 
            ? t('common.processing', 'جاري المعالجة...') 
            : t('subscription.proceedToPayment', 'تأكيد وإتمام الطلب')}
        </button>
      )}
    </div>
  );
}
