// src/components/SaaS/PaymentSection.jsx
import React, { useState, useEffect } from 'react';

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

  // وسائل الدفع بدون صور خارجية مكسورة
  const paymentMethods = {
    egypt: [
      { id: 'instapay', name: isRTL ? 'InstaPay (تحويل بنكي فوري)' : 'InstaPay Direct Transfer', isManual: true, number: 'username@instapay', icon: '⚡' },
      { id: 'vodafone', name: isRTL ? 'فودافون كاش / المحافظ الذكية' : 'Smart Wallets / Vodafone Cash', isManual: true, number: '01012345678', icon: '📱' },
      { id: 'fawry', name: isRTL ? 'فوري Pay (كود الدفع السريع)' : 'Fawry Pay Code', isManual: true, number: '987654321', icon: '🏧' },
      { id: 'card_eg', name: isRTL ? 'بطاقات الفيزا وميزة البنكية' : 'Visa / MasterCard / Meeza', isManual: false, icon: '💳' },
    ],
    gcc: [
      { id: 'apple_pay', name: 'Apple Pay', isManual: false, icon: '🍎', badge: isRTL ? 'الأسرع' : 'Fastest' },
      { id: 'mada', name: isRTL ? 'بطاقات مدى (Mada)' : 'Mada Debit Cards', isManual: false, icon: '💳' },
      { id: 'stc_pay', name: isRTL ? 'STC Pay / المحافظ الخليجية' : 'STC Pay & GCC Wallets', isManual: false, icon: '📲' },
      { id: 'iban', name: isRTL ? 'تحويل بنكي مباشر (IBAN)' : 'Direct IBAN Bank Transfer', isManual: true, number: 'SA8200000012345678901234', icon: '🏦' },
    ],
    global: [
      { id: 'card_global', name: isRTL ? 'بطاقات ائتمان دولية' : 'Visa / MasterCard / AMEX', isManual: false, icon: '💳' },
      { id: 'paypal', name: 'PayPal', isManual: false, icon: '🅿️' },
      { id: 'crypto', name: 'USDT (TRC20 Wallet)', isManual: true, number: 'TYD4xK11s89PzL283kxXmQ2719s82xXzLq', icon: '🪙' },
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
      dir={isRTL ? 'rtl' : 'ltr'} 
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md mx-auto text-slate-100 shadow-xl"
    >
      <h4 className="text-slate-200 font-bold text-sm mb-4 border-b border-slate-800 pb-3">
        {isRTL ? "اختر وسيلة الدفع المناسبة:" : "Select Payment Method:"}
      </h4>

      <div className="flex flex-col gap-2.5">
        {activeMethods.map((item) => {
          const isSelected = selectedMethod === item.id;
          return (
            <div 
              key={item.id}
              onClick={() => setSelectedMethod(item.id)}
              className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all gap-3 border ${
                isSelected 
                  ? 'bg-slate-800 border-emerald-500/80 text-emerald-400' 
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-lg">{item.icon}</span>
                <span className="font-semibold text-xs leading-snug break-words">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.badge && (
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
                <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                  isSelected ? 'border-4 border-emerald-500 bg-slate-950' : 'border-slate-600'
                }`} />
              </div>
            </div>
          );
        })}
      </div>

      {currentMethodObj.isManual && (
        <div className="mt-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs font-semibold mb-2.5">
            {isRTL ? 'يرجى تحويل المبلغ إلى الحساب التالي:' : 'Please transfer to:'}
          </p>
          
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 gap-2">
            <div className="text-emerald-400 font-mono text-xs font-bold break-all dir-ltr">
              {currentMethodObj.number}
            </div>

            <button 
              type="button"
              onClick={() => handleCopy(currentMethodObj.number)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors shrink-0 ${
                copied 
                  ? 'bg-emerald-500 text-slate-950' 
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {copied ? (isRTL ? 'تم النسخ' : 'Copied') : (isRTL ? 'نسخ' : 'Copy')}
            </button>
          </div>

          <div className="mt-3">
            <input 
              type="text" 
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder={isRTL ? "رقم المعاملة / اسم المحول (اختياري)" : "Transaction Reference"}
              className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-100 text-xs outline-none focus:border-emerald-500 transition-colors"
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
                accept="image/*" 
                onChange={(e) => setReceiptFile(e.target.files[0])} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      )}

      {isSubmitted ? (
        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 p-3.5 rounded-xl mt-5 text-center text-xs font-extrabold">
          {isRTL ? 'تم استلام الطلب وستتم المراجعة فوراً' : 'Order Processed Successfully'}
        </div>
      ) : (
        <button 
          onClick={() => onSubmit(currentMethodObj.id, currentMethodObj.isManual, receiptFile)}
          disabled={loading}
          className={`w-full mt-5 py-3.5 rounded-xl text-xs font-bold transition-all ${
            loading 
              ? 'bg-slate-800 text-slate-500 cursor-wait' 
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
          }`}
        >
          {loading 
            ? (isRTL ? "جاري المعالجة..." : "Processing...") 
            : (isRTL ? "تأكيد وإتمام الطلب" : "Proceed to Payment")}
        </button>
      )}
    </div>
  );
}
