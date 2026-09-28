import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, ShieldCheck, Check, Copy, X } from 'lucide-react';
import { colors } from '@/theme/colors';
import { UI } from '@/theme/styles';
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
    <div className={`${UI.card} max-w-xl mx-auto shadow-2xl space-y-5 p-6`}>
      {/* 💳 1. استدعاء مكون وسائل الدفع */}
      <PaymentMethods 
        region={normalizedRegion}
        onSelectPayment={(gateway) => setSelectedGateway(gateway)} 
      />

      {/* 📝 2. تفاصيل الإشعار ورقم المعاملة للدفع اليدوي */}
      {(selectedGateway?.accountNumber || selectedGateway?.isManual) && (
        <div className="bg-semantic-bgMain border border-semantic-borderCard rounded-xl p-4 space-y-3 transition-all duration-200">
          {/* مدخل رقم المعاملة */}
          <div className="space-y-1">
            <label className={`${UI.subtitle} block font-bold text-xs`}>
              {t('subscription.txIdLabel', 'رقم عملية التحويل / المرجع (اختياري)')}
            </label>
            <input 
              type="text" 
              value={txId}
              onChange={(e) => setTxId?.(e.target.value)}
              placeholder={t('subscription.txIdPlaceholder', 'أدخل رقم المعاملة أو اسم المحوِّل')}
              className={UI.input}
            />
          </div>

          {/* رفع صورة الإشعار */}
          <div className="space-y-1">
            <label className={`${UI.subtitle} block font-bold text-xs`}>
              {t('subscription.attachReceipt', 'إرفاق صورة إشعار التحويل:')}
            </label>
            
            <div className="relative flex items-center">
              <label className="w-full flex items-center justify-center p-3 bg-semantic-bgCard border border-dashed border-semantic-borderInput rounded-lg cursor-pointer text-xs gap-2 min-h-[44px] transition-all hover:border-semantic-actionPrimary">
                <Upload size={16} className="text-semantic-success" />
                <span 
                  className={`truncate max-w-[240px] ${
                    receiptFile ? 'text-semantic-success font-bold' : 'text-semantic-textMuted font-normal'
                  }`}
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
      <div className="border border-semantic-successBorder/30 bg-semantic-successBg/10 text-semantic-success p-2.5 rounded-xl text-center text-xs font-bold">
        {t('subscription.secureNotice', 'دفع آمن وفوري - يتم تفعيل الترخيص تلقائياً.')}
      </div>

      {/* 🚀 4. زر إتمام الطلب النهائي */}
      {isSubmitted ? (
        <div className="border border-semantic-successBorder/40 bg-semantic-successBg/20 text-semantic-success p-3.5 rounded-xl text-center text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2">
          <ShieldCheck size={18} />
          <span>{t('subscription.orderReceived', 'تم استلام الطلب وستتم المراجعة والتفعيل فوراً')}</span>
        </div>
      ) : (
        <button 
          type="button"
          onClick={handleFormSubmit}
          disabled={loading}
          aria-label={t('subscription.proceedToPayment', 'تأكيد وإتمام الطلب')}
          className={`${UI.btnEmerald} w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 ${
            loading ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-110 cursor-pointer'
          }`}
        >
          {loading 
            ? t('common.processing', 'جاري المعالجة...') 
            : t('subscription.proceedToPayment', 'تأكيد وإتمام الطلب')}
        </button>
      )}
    </div>
  );
}
