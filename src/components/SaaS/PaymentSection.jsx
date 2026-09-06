import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Upload, ShieldCheck, CreditCard, X } from 'lucide-react';
import { colors } from '@/theme';

// ==========================================
// 1. مكون شعارات وسائل الدفع (Memoized)
// ==========================================
const PaymentLogo = memo(({ type }) => {
  switch (type) {
    case 'instapay':
      return (
        <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="8" fill="#7B2CBF" />
          <path d="M12 12H17V28H12V12ZM23 12H28V28H23V12Z" fill="white" />
          <circle cx="20" cy="20" r="3" fill="#00F5D4" />
        </svg>
      );
    case 'vodafone':
      return (
        <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="8" fill="#E60000" />
          <path d="M20 10C14.477 10 10 14.477 10 20C10 25.523 14.477 30 20 30C25.523 30 30 25.523 30 20C30 14.477 25.523 10 20 10ZM20 25C17.239 25 15 22.761 15 20C15 17.239 17.239 15 20 15C22.761 15 25 17.239 25 20C25 22.761 22.761 25 20 25Z" fill="white" />
        </svg>
      );
    case 'fawry':
      return (
        <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="8" fill="#FFD100" />
          <path d="M10 14H30V18H10V14ZM10 22H24V26H10V22Z" fill="#003399" />
        </svg>
      );
    case 'mada':
      return (
        <svg className="w-8 h-5" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="50" height="30" rx="6" fill="#00A859" />
          <path d="M10 10L18 20L26 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="36" cy="15" r="4" fill="#0071CE" />
        </svg>
      );
    case 'apple_pay':
      return (
        <svg className="w-8 h-5" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="50" height="30" rx="6" fill="#000000" />
          <path d="M18 11.5C18.8 10.5 19.3 9.2 19.1 8C18 8.1 16.7 8.8 15.9 9.7C15.2 10.5 14.7 11.8 14.9 13C16.1 13.1 17.3 12.3 18 11.5ZM18.9 13.3C17.2 13.2 15.8 14.2 14.9 14.2C14 14.2 12.8 13.3 11.4 13.4C9.6 13.4 7.9 14.4 7 16C5.1 19.3 6.5 24.1 8.3 26.7C9.2 28 10.2 29.4 11.6 29.3C13 29.2 13.5 28.4 15.1 28.4C16.7 28.4 17.2 29.3 18.6 29.3C20 29.3 20.9 28 21.8 26.7C22.8 25.2 23.2 23.8 23.3 23.7C23.2 23.6 20.6 22.6 20.6 19.6C20.6 17.1 22.6 15.9 22.7 15.8C21.5 14.1 19.7 13.4 18.9 13.3Z" fill="white" />
        </svg>
      );
    case 'stc_pay':
      return (
        <svg className="w-8 h-5" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="50" height="30" rx="6" fill="#4F008C" />
          <path d="M12 12H20V15H15V17H20V20H12V12Z" fill="#FF375F" />
          <path d="M24 12H32V15H28V20H24V12Z" fill="white" />
        </svg>
      );
    case 'paypal':
      return (
        <svg className="w-8 h-5" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="50" height="30" rx="6" fill="#003087" />
          <path d="M18 9H24C26.2 9 27.5 10.1 27.2 12.2C26.8 14.8 24.8 16 22.8 16H20.5L19.5 22H16.5L18 9Z" fill="#0079C1" />
          <path d="M21 11H27C29.2 11 30.5 12.1 30.2 14.2C29.8 16.8 27.8 18 25.8 18H23.5L22.5 24H19.5L21 11Z" fill="#00457C" opacity="0.6" />
        </svg>
      );
    case 'crypto':
      return (
        <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#26A17B" />
          <path d="M22.5 17.5V15H27V12H13V15H17.5V17.5C13.8 17.8 11 18.7 11 19.8C11 21 13.8 21.9 17.5 22.2V27H22.5V22.2C26.2 21.9 29 21 29 19.8C29 18.7 26.2 17.8 22.5 17.5ZM20 21C16.1 21 14 20.3 14 19.8C14 19.3 16.1 18.6 20 18.6C23.9 18.6 26 19.3 26 19.8C26 20.3 23.9 21 20 21Z" fill="white" />
        </svg>
      );
    case 'card':
    default:
      return <CreditCard size={22} className="text-slate-300" />;
  }
});

PaymentLogo.displayName = 'PaymentLogo';

// ==========================================
// 2. المكون الرئيسي قسم الدفع
// ==========================================
export default function PaymentSection({ 
  region = 'egypt', 
  txId, 
  setTxId, 
  isSubmitted, 
  loading, 
  onSubmit, 
  isRTL 
}) {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const fileInputRef = useRef(null);

  // الألوان والأنماط الثابتة
  const cardBg = colors?.dark?.card || '#0F172A';
  const borderColor = colors?.dark?.border || '#1E293B';
  const primaryGold = colors?.accent?.gold || '#F59E0B';
  const primaryAmber = colors?.accent?.amber || '#D97706';
  const textPrimary = colors?.dark?.text || '#F8FAFC';
  const textMuted = colors?.dark?.textMuted || '#94A3B8';
  const textSubtle = colors?.dark?.textSubtle || '#64748B';
  const successGreen = '#10B981';

  // بناء وسائل الدفع مع الاستماع لتغيير اللغة
  const paymentMethods = useMemo(() => ({
    egypt: [
      { id: 'instapay', name: t('subscription.payment.instapay', 'InstaPay (تحويل بنكي فوري)'), isManual: true, number: 'username@instapay', logoType: 'instapay' },
      { id: 'vodafone', name: t('subscription.payment.vodafone', 'فودافون كاش والمحافظ الذكية'), isManual: true, number: '01012345678', logoType: 'vodafone' },
      { id: 'fawry', name: t('subscription.payment.fawry', 'فوري Pay (كود الدفع السريع)'), isManual: true, number: '987654321', logoType: 'fawry' },
      { id: 'card_eg', name: t('subscription.payment.cardEg', 'بطاقات الفيزا وميزة البنكية'), isManual: false, logoType: 'card' },
    ],
    gcc: [
      { id: 'apple_pay', name: 'Apple Pay', isManual: false, logoType: 'apple_pay', badgeText: t('subscription.payment.fastest', 'الأسرع') },
      { id: 'mada', name: t('subscription.payment.mada', 'بطاقات مدى (Mada)'), isManual: false, logoType: 'mada' },
      { id: 'stc_pay', name: t('subscription.payment.stcPay', 'STC Pay / المحافظ الخليجية'), isManual: false, logoType: 'stc_pay' },
      { id: 'iban', name: t('subscription.payment.iban', 'تحويل بنكي مباشر (IBAN)'), isManual: true, number: 'SA8200000012345678901234', logoType: 'card' },
    ],
    global: [
      { id: 'card_global', name: t('subscription.payment.cardGlobal', 'بطاقات ائتمان دولية Visa / MasterCard'), isManual: false, logoType: 'card' },
      { id: 'paypal', name: 'PayPal', isManual: false, logoType: 'paypal' },
      { id: 'crypto', name: 'USDT (TRC20 Wallet)', isManual: true, number: 'TYD4xK11s89PzL283kxXmQ2719s82xXzLq', logoType: 'crypto' },
    ]
  }), [t, i18n.language]);

  const activeMethods = paymentMethods[region] || paymentMethods.egypt;
  const [selectedMethod, setSelectedMethod] = useState(activeMethods[0]?.id || 'instapay');

  // مسح الملف وإعادة ضبط مدخل الملفات
  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setReceiptFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // تحديث الوسيلة الافتراضية عند تغيير الإقليم
  useEffect(() => {
    if (activeMethods.length > 0) {
      setSelectedMethod(activeMethods[0].id);
      setReceiptFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [region, activeMethods]);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentMethodObj = activeMethods.find(m => m.id === selectedMethod) || activeMethods[0];

  return (
    <div 
      style={{ backgroundColor: cardBg, borderColor: borderColor }}
      className="border rounded-2xl p-6 max-w-lg mx-auto shadow-2xl transition-all"
    >
      <h4 
        style={{ color: primaryGold, borderColor: borderColor }}
        className="font-bold text-sm mb-4 border-b pb-3 text-center"
      >
        {t('subscription.selectPaymentMethod', 'اختر وسيلة الدفع المناسبة:')}
      </h4>

      {/* قائمة وسائل الدفع المتاحة */}
      <div className="flex flex-col gap-2.5">
        {activeMethods.map((item) => {
          const isSelected = selectedMethod === item.id;
          return (
            <div 
              key={item.id}
              onClick={() => setSelectedMethod(item.id)}
              style={{
                backgroundColor: isSelected ? borderColor : 'rgba(9, 15, 22, 0.6)',
                borderColor: isSelected ? primaryAmber : 'rgba(34, 49, 71, 0.8)',
                boxShadow: isSelected ? `0 4px 12px rgba(0, 0, 0, 0.15), 0 0 10px ${primaryAmber}26` : 'none',
              }}
              className={`flex items-center justify-between p-3.5 min-h-[44px] rounded-xl cursor-pointer transition-all gap-3 border ${
                isSelected ? 'ring-1' : 'hover:opacity-90'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="shrink-0 flex items-center justify-center">
                  <PaymentLogo type={item.logoType} />
                </div>
                <span style={{ color: textPrimary }} className="font-semibold text-xs leading-snug break-words">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.badgeText && (
                  <span 
                    style={{ 
                      backgroundColor: `${primaryAmber}33`, 
                      color: primaryGold, 
                      borderColor: `${primaryAmber}4D` 
                    }}
                    className="text-[10px] px-2.5 py-0.5 rounded-full font-bold border"
                  >
                    {item.badgeText}
                  </span>
                )}
                <div 
                  style={{
                    borderColor: isSelected ? primaryAmber : textSubtle,
                    backgroundColor: isSelected ? primaryAmber : 'transparent'
                  }}
                  className="w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center"
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* تفاصيل الدفع اليدوي */}
      {currentMethodObj?.isManual && (
        <div 
          style={{ backgroundColor: 'rgba(9, 15, 22, 0.8)', borderColor: 'rgba(34, 49, 71, 0.8)' }}
          className="mt-4 border rounded-xl p-4 transition-all"
        >
          <p style={{ color: textMuted }} className="text-xs font-semibold mb-2.5">
            {t('subscription.transferNotice', 'يرجى تحويل المبلغ إلى الحساب التالي:')}
          </p>
          
          <div 
            style={{ backgroundColor: cardBg, borderColor: borderColor }}
            className="flex items-center justify-between p-3 rounded-lg border gap-2"
          >
            <div style={{ color: primaryGold }} className="font-mono text-xs font-bold break-all dir-ltr">
              {currentMethodObj.number}
            </div>

            <button 
              type="button"
              onClick={() => handleCopy(currentMethodObj.number)}
              style={{
                backgroundColor: copied ? successGreen : borderColor,
                color: '#FFFFFF'
              }}
              className="px-3 py-1.5 rounded-md text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 hover:opacity-90 min-h-[36px]"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? t('common.copied', 'تم النسخ') : t('common.copy', 'نسخ العنوان')}</span>
            </button>
          </div>

          {/* مدخل رقم المعاملة */}
          <div className="mt-3">
            <input 
              type="text" 
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder={t('subscription.txIdPlaceholder', 'رقم المعاملة / اسم المحول (اختياري)')}
              style={{
                backgroundColor: cardBg,
                borderColor: borderColor,
                color: textPrimary
              }}
              className="w-full p-3 rounded-lg border text-xs focus:outline-none focus:border-amber-600 transition-colors"
            />
          </div>

          {/* رفع إشعار التحويل */}
          <div className="mt-3">
            <label style={{ color: textMuted }} className="block text-[11px] font-semibold mb-1.5">
              {t('subscription.attachReceipt', 'إرفاق صورة إشعار التحويل:')}
            </label>
            
            <div className="relative flex items-center">
              <label 
                style={{ backgroundColor: cardBg, borderColor: 'rgba(34, 49, 71, 0.8)' }}
                className="w-full flex items-center justify-center p-3 min-h-[44px] rounded-lg border border-dashed hover:border-amber-600 cursor-pointer text-xs font-semibold text-center transition-colors gap-2 pr-8 pl-8"
              >
                <Upload size={16} style={{ color: primaryAmber }} />
                <span className={`truncate max-w-[180px] ${receiptFile ? 'font-bold' : ''}`} style={{ color: receiptFile ? successGreen : textMuted }}>
                  {receiptFile 
                    ? receiptFile.name 
                    : t('subscription.selectReceiptFile', 'اختر ملف الإشعار أو التقط صورة')}
                </span>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setReceiptFile(e.target.files[0] || null)} 
                  className="hidden" 
                />
              </label>

              {/* زر إزالة الملف بدعم RTL و LTR */}
              {receiptFile && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className={`absolute ${isRTL ? 'left-2' : 'right-2'} p-1 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors z-10`}
                  title={t('common.remove', 'إزالة')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* تنبيه الأمان */}
      <div 
        style={{
          backgroundColor: `${successGreen}14`,
          color: successGreen,
          borderColor: `${successGreen}33`
        }}
        className="border p-3 rounded-xl mt-4 text-center text-xs font-semibold"
      >
        {t('subscription.secureNotice', 'دفع آمن وفوري - يتم تفعيل الترخيص تلقائياً.')}
      </div>

      {/* زر التأكيد أو التنبيه بالاستلام */}
      {isSubmitted ? (
        <div 
          style={{
            backgroundColor: `${successGreen}1A`,
            color: successGreen,
            borderColor: `${successGreen}40`
          }}
          className="border p-3.5 rounded-xl mt-4 text-center text-xs font-extrabold flex items-center justify-center gap-2"
        >
          <ShieldCheck size={18} />
          <span>{t('subscription.orderReceived', 'تم استلام الطلب وستتم المراجعة والتفعيل فوراً')}</span>
        </div>
      ) : (
        <button 
          onClick={() => onSubmit(currentMethodObj.id, currentMethodObj.isManual, receiptFile)}
          disabled={loading}
          style={{
            backgroundColor: primaryAmber,
            color: '#FFFFFF'
          }}
          className="w-full mt-4 py-3.5 min-h-[44px] rounded-xl text-sm font-black transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {loading 
            ? t('common.processing', 'جاري المعالجة...') 
            : t('subscription.proceedToPayment', 'تأكيد وإتمام الطلب')}
        </button>
      )}

      {/* Footer الصغير */}
      <div style={{ color: textSubtle }} className="flex items-center justify-between text-[10px] mt-4 px-2 select-none">
        <span>Instant Activation</span>
        <span>•</span>
        <span>256-Bit SSL Encrypted</span>
      </div>
    </div>
  );
}
