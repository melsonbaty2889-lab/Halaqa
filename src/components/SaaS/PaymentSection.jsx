import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Upload, ShieldCheck, CreditCard, Smartphone, Building2, Banknote, Globe } from 'lucide-react';
import { colors } from '@/theme';

export default function PaymentSection({ 
  region, 
  txId, 
  setTxId, 
  isSubmitted, 
  loading, 
  onSubmit, 
  isRTL 
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);

  // استخراج القيم من ثيم الألوان الموحد
  const cardBg = colors?.dark?.card || '#0F172A';
  const borderColor = colors?.dark?.border || '#1E293B';
  const primaryGold = colors?.accent?.gold || '#F59E0B';
  const primaryAmber = colors?.accent?.amber || '#D97706';
  const textPrimary = colors?.dark?.text || '#F8FAFC';
  const textMuted = colors?.dark?.textMuted || '#94A3B8';
  const textSubtle = colors?.dark?.textSubtle || '#64748B';
  const successGreen = '#10B981';

  // قوائم وسائط الدفع موحدة الأيقونات والترجمة
  const paymentMethods = {
    egypt: [
      { id: 'instapay', name: t('subscription.payment.instapay', 'InstaPay (تحويل بنكي فوري)'), isManual: true, number: 'username@instapay', icon: <Banknote size={18} style={{ color: successGreen }} /> },
      { id: 'vodafone', name: t('subscription.payment.vodafone', 'فودافون كاش والمحافظ الذكية'), isManual: true, number: '01012345678', icon: <Smartphone size={18} style={{ color: primaryGold }} /> },
      { id: 'fawry', name: t('subscription.payment.fawry', 'فوري Pay (كود الدفع السريع)'), isManual: true, number: '987654321', icon: <Building2 size={18} style={{ color: primaryAmber }} /> },
      { id: 'card_eg', name: t('subscription.payment.cardEg', 'بطاقات الفيزا وميزة البنكية'), isManual: false, icon: <CreditCard size={18} style={{ color: textMuted }} /> },
    ],
    gcc: [
      { id: 'apple_pay', name: 'Apple Pay', isManual: false, icon: <Smartphone size={18} style={{ color: textPrimary }} />, badge: t('subscription.payment.fastest', 'الأسرع') },
      { id: 'mada', name: t('subscription.payment.mada', 'بطاقات مدى (Mada)'), isManual: false, icon: <CreditCard size={18} style={{ color: successGreen }} /> },
      { id: 'stc_pay', name: t('subscription.payment.stcPay', 'STC Pay / المحافظ الخليجية'), isManual: false, icon: <Smartphone size={18} style={{ color: primaryGold }} /> },
      { id: 'iban', name: t('subscription.payment.iban', 'تحويل بنكي مباشر (IBAN)'), isManual: true, number: 'SA8200000012345678901234', icon: <Building2 size={18} style={{ color: textMuted }} /> },
    ],
    global: [
      { id: 'card_global', name: t('subscription.payment.cardGlobal', 'بطاقات ائتمان دولية Visa / MasterCard'), isManual: false, icon: <CreditCard size={18} style={{ color: successGreen }} /> },
      { id: 'paypal', name: 'PayPal', isManual: false, icon: <Globe size={18} style={{ color: primaryGold }} /> },
      { id: 'crypto', name: 'USDT (TRC20 Wallet)', isManual: true, number: 'TYD4xK11s89PzL283kxXmQ2719s82xXzLq', icon: <Banknote size={18} style={{ color: primaryAmber }} /> },
    ]
  };

  const activeMethods = paymentMethods[region] || paymentMethods.egypt;
  const [selectedMethod, setSelectedMethod] = useState(activeMethods[0]?.id || 'instapay');

  useEffect(() => {
    if (activeMethods.length > 0) {
      setSelectedMethod(activeMethods[0].id);
      setReceiptFile(null);
    }
  }, [region]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentMethodObj = activeMethods.find(m => m.id === selectedMethod) || activeMethods[0];

  return (
    <div 
      style={{ backgroundColor: cardBg, borderColor: borderColor }}
      className="border rounded-2xl p-6 max-w-lg mx-auto shadow-2xl"
    >
      <h4 
        style={{ color: primaryGold, borderColor: borderColor }}
        className="font-bold text-sm mb-4 border-b pb-3 text-center"
      >
        {t('subscription.selectPaymentMethod', 'اختر وسيلة الدفع المناسبة:')}
      </h4>

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
                <div 
                  style={{ backgroundColor: cardBg, borderColor: borderColor }}
                  className="p-2 rounded-lg border shrink-0 flex items-center justify-center"
                >
                  {item.icon}
                </div>
                <span style={{ color: textPrimary }} className="font-semibold text-xs leading-snug break-words">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.badge && (
                  <span 
                    style={{ 
                      backgroundColor: `${primaryAmber}33`, 
                      color: primaryGold, 
                      borderColor: `${primaryAmber}4D` 
                    }}
                    className="text-[10px] px-2.5 py-0.5 rounded-full font-bold border"
                  >
                    {item.badge}
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

      {currentMethodObj.isManual && (
        <div 
          style={{ backgroundColor: 'rgba(9, 15, 22, 0.8)', borderColor: 'rgba(34, 49, 71, 0.8)' }}
          className="mt-4 border rounded-xl p-4"
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

          <div className="mt-3">
            <label style={{ color: textMuted }} className="block text-[11px] font-semibold mb-1.5">
              {t('subscription.attachReceipt', 'إرفاق صورة إشعار التحويل:')}
            </label>
            
            <label 
              style={{ backgroundColor: cardBg, borderColor: 'rgba(34, 49, 71, 0.8)' }}
              className="flex items-center justify-center p-3 min-h-[44px] rounded-lg border border-dashed hover:border-amber-600 cursor-pointer text-xs font-semibold text-center transition-colors gap-2"
            >
              <Upload size={16} style={{ color: primaryAmber }} />
              <span className={receiptFile ? 'font-bold' : ''} style={{ color: receiptFile ? successGreen : textMuted }}>
                {receiptFile 
                  ? receiptFile.name 
                  : t('subscription.selectReceiptFile', 'اختر ملف الإشعار أو التقط صورة')}
              </span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setReceiptFile(e.target.files[0])} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      )}

      {/* تنبيه التفعيل التلقائي */}
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
          className="w-full mt-4 py-3.5 min-h-[44px] rounded-xl text-sm font-black transition-all hover:opacity-90 disabled:opacity-50"
        >
          {loading 
            ? t('common.processing', 'جاري المعالجة...') 
            : t('subscription.proceedToPayment', 'تأكيد وإتمام الطلب')}
        </button>
      )}

      <div style={{ color: textSubtle }} className="flex items-center justify-between text-[10px] mt-4 px-2">
        <span>Instant Activation</span>
        <span>•</span>
        <span>256-Bit SSL Encrypted</span>
      </div>
    </div>
  );
}
