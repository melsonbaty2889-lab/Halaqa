// src/components/SaaS/PaymentSection.jsx
import React, { useState, useEffect } from 'react';

// حاوية قياسية للشعارات المفرغة
const LogoSlot = ({ src, alt }) => (
  <div className="w-12 h-8 flex items-center justify-center shrink-0">
    <img 
      src={src} 
      alt={alt} 
      className="max-w-full max-h-full object-contain" 
    />
  </div>
);

// الشعارات الرسمية
const PaymentLogos = {
  applePay: <LogoSlot src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" />,
  mada: <LogoSlot src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mada_Logo.svg" alt="Mada" />,
  instapay: <LogoSlot src="https://instapay.eg/wp-content/uploads/2022/03/instapay-logo.png" alt="InstaPay" />,
  vodafone: <LogoSlot src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Vodafone_icon.svg" alt="Vodafone Cash" />,
  fawry: <LogoSlot src="https://fawry.com/wp-content/uploads/2022/07/fawry-logo.png" alt="Fawry" />,
  stcPay: <LogoSlot src="https://upload.wikimedia.org/wikipedia/commons/e/e6/STC_Pay_logo.svg" alt="STC Pay" />,
  paypal: <LogoSlot src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />,
  card: <LogoSlot src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="MasterCard / Visa" />,
  bank: (
    <div className="w-12 h-8 flex items-center justify-center">
      <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
      </svg>
    </div>
  ),
  crypto: <LogoSlot src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=035" alt="USDT" />
};

export default function PaymentSection({ 
  region, 
  txId, 
  setTxId, 
  isSubmitted, 
  loading, 
  onSubmit, 
  isRTL 
}) {
  const [copied, setCopied] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);

  const paymentMethods = {
    egypt: [
      { id: 'instapay', name: isRTL ? 'InstaPay (تحويل بنكي فوري)' : 'InstaPay Direct Transfer', isManual: true, number: 'username@instapay', logo: PaymentLogos.instapay },
      { id: 'vodafone', name: isRTL ? 'فودافون كاش والمحافظ الذكية' : 'Smart Wallets / Vodafone Cash', isManual: true, number: '01012345678', logo: PaymentLogos.vodafone },
      { id: 'fawry', name: isRTL ? 'فوري Pay (كود الدفع السريع)' : 'Fawry Pay Code', isManual: true, number: '987654321', logo: PaymentLogos.fawry },
      { id: 'card_eg', name: isRTL ? 'بطاقات الفيزا وميزة البنكية' : 'Visa / MasterCard / Meeza', isManual: false, logo: PaymentLogos.card },
    ],
    gcc: [
      { id: 'apple_pay', name: 'Apple Pay', isManual: false, logo: PaymentLogos.applePay, badge: isRTL ? 'الأسرع' : 'Fastest' },
      { id: 'mada', name: isRTL ? 'بطاقات مدى (Mada)' : 'Mada Debit/Credit Cards', isManual: false, logo: PaymentLogos.mada },
      { id: 'stc_pay', name: isRTL ? 'STC Pay / المحافظ الخليجية' : 'STC Pay & GCC Wallets', isManual: false, logo: PaymentLogos.stcPay },
      { id: 'iban', name: isRTL ? 'تحويل بنكي مباشر (IBAN)' : 'Direct IBAN Bank Transfer', isManual: true, number: 'SA8200000012345678901234', logo: PaymentLogos.bank },
    ],
    global: [
      { id: 'card_global', name: isRTL ? 'بطاقات ائتمان دولية (Visa / MasterCard)' : 'Visa / MasterCard / AMEX', isManual: false, logo: PaymentLogos.card },
      { id: 'paypal', name: 'PayPal', isManual: false, logo: PaymentLogos.paypal },
      { id: 'crypto', name: 'USDT (TRC20 Wallet)', isManual: true, number: 'TYD4xK11s89PzL283kxXmQ2719s82xXzLq', logo: PaymentLogos.crypto },
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
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const currentMethodObj = activeMethods.find(m => m.id === selectedMethod) || activeMethods[0];

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md mx-auto text-slate-100 shadow-xl"
    >
      {/* عنوان الوسائل */}
      <h4 className="text-amber-500 font-bold text-sm mb-4 border-b border-slate-800 pb-3">
        {isRTL ? "اختر وسيلة الدفع المناسبة:" : "Select Payment Method:"}
      </h4>

      {/* خيارات وسائل الدفع */}
      <div className="flex flex-col gap-2.5">
        {activeMethods.map((item) => {
          const isSelected = selectedMethod === item.id;
          return (
            <div 
              key={item.id}
              onClick={() => setSelectedMethod(item.id)}
              className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all gap-3 border ${
                isSelected 
                  ? 'bg-amber-500/10 border-amber-500' 
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                {item.logo}
                <span className="text-slate-100 font-semibold text-xs leading-snug break-words">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.badge && (
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                    {item.badge}
                  </span>
                )}
                <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                  isSelected ? 'border-4 border-amber-500 bg-slate-950' : 'border-slate-600'
                }`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* تفاصيل التحويل اليدوي */}
      {currentMethodObj.isManual && (
        <div className="mt-4 bg-slate-950/80 border border-dashed border-amber-500/60 rounded-xl p-4">
          <p className="text-slate-400 text-xs font-semibold mb-2.5">
            {isRTL ? 'يرجى تحويل المبلغ إلى الحساب التالي:' : 'Please transfer to the following details:'}
          </p>
          
          <div className="flex flex-col gap-2.5 bg-slate-900 p-3 rounded-lg border border-slate-800">
            <div className="text-amber-400 font-mono text-xs font-bold break-all dir-ltr text-left">
              {currentMethodObj.number}
            </div>

            <button 
              type="button"
              onClick={() => handleCopy(currentMethodObj.number)}
              className={`self-end px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                copied 
                  ? 'bg-emerald-500 text-slate-950' 
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {copied ? (isRTL ? 'تم النسخ' : 'Copied') : (isRTL ? 'نسخ العنوان' : 'Copy Address')}
            </button>
          </div>

          <div className="mt-3">
            <input 
              type="text" 
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder={isRTL ? "رقم المعاملة / اسم المحول (اختياري)" : "Transaction Reference / Sender ID (Optional)"}
              className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-100 text-xs outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="mt-3">
            <label className="block text-slate-400 text-[11px] font-semibold mb-1.5">
              {isRTL ? "إرفاق صورة إشعار التحويل:" : "Attach Transfer Receipt:"}
            </label>
            
            <label className="flex items-center justify-center p-3 rounded-lg border border-dashed border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 cursor-pointer text-xs font-semibold text-center transition-colors">
              <span className={receiptFile ? 'text-emerald-400 font-bold' : ''}>
                {receiptFile 
                  ? receiptFile.name 
                  : (isRTL ? 'اختر ملف الإشعار أو التقط صورة' : 'Select receipt file')}
              </span>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp" 
                onClick={(e) => { e.target.value = null; }}
                onChange={(e) => setReceiptFile(e.target.files[0])} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      )}

      {/* تنبيه الدفع المباشر */}
      {!currentMethodObj.isManual && (
        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
          <p className="text-emerald-400 text-xs font-bold m-0">
            {isRTL ? "دفع آمن وفوري - يتم تفعيل الترخيص تلقائياً." : "Instant & Secure Checkout - Immediate License Grant."}
          </p>
        </div>
      )}

      {/* زر التأكيد أو حالة النجاح */}
      {isSubmitted ? (
        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 p-3.5 rounded-xl mt-5 text-center text-xs font-extrabold">
          {isRTL ? 'تم استلام الطلب وستتم المراجعة فوراً' : 'Order Processed Successfully'}
        </div>
      ) : (
        <button 
          onClick={() => onSubmit(currentMethodObj.id, currentMethodObj.isManual, receiptFile)}
          disabled={loading}
          className={`w-full mt-5 py-3.5 rounded-xl text-xs font-extrabold transition-all shadow-md ${
            loading 
              ? 'bg-slate-800 text-slate-500 cursor-wait' 
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
          }`}
        >
          {loading 
            ? (isRTL ? "جاري المعالجة..." : "Processing...") 
            : (isRTL ? "تأكيد وإتمام الطلب" : "Proceed to Payment")}
        </button>
      )}

      {/* تذييل الأمان */}
      <div className="flex justify-center gap-3 mt-4 pt-3 border-t border-slate-800 text-slate-500 text-[10px] font-mono dir-ltr">
        <span>256-Bit SSL Encrypted</span>
        <span>•</span>
        <span>Instant Activation</span>
      </div>

    </div>
  );
}
