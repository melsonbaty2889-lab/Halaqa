import React, { useState, useEffect } from 'react';
import { Copy, Check, Upload, ShieldCheck, CreditCard, Smartphone, Building2, Banknote } from 'lucide-react';

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

  // وسائل الدفع المقسمة بإيقونات موثوقة ومطابقة للهوية
  const paymentMethods = {
    egypt: [
      { id: 'instapay', name: isRTL ? 'InstaPay (تحويل بنكي فوري)' : 'InstaPay Direct Transfer', isManual: true, number: 'username@instapay', icon: <Banknote size={18} className="text-[#34D399]" /> },
      { id: 'vodafone', name: isRTL ? 'فودافون كاش / المحافظ الذكية' : 'Smart Wallets / Vodafone Cash', isManual: true, number: '01012345678', icon: <Smartphone size={18} className="text-[#F59E0B]" /> },
      { id: 'fawry', name: isRTL ? 'فوري Pay (كود الدفع السريع)' : 'Fawry Pay Code', isManual: true, number: '987654321', icon: <Building2 size={18} className="text-[#D97706]" /> },
      { id: 'card_eg', name: isRTL ? 'بطاقات الفيزا وميزة البنكية' : 'Visa / MasterCard / Meeza', isManual: false, icon: <CreditCard size={18} className="text-[#CBD5E1]" /> },
    ],
    gcc: [
      { id: 'apple_pay', name: 'Apple Pay', isManual: false, icon: <Smartphone size={18} className="text-[#F8FAFC]" />, badge: isRTL ? 'الأسرع' : 'Fastest' },
      { id: 'mada', name: isRTL ? 'بطاقات مدى (Mada)' : 'Mada Debit Cards', isManual: false, icon: <CreditCard size={18} className="text-[#34D399]" /> },
      { id: 'stc_pay', name: isRTL ? 'STC Pay / المحافظ الخليجية' : 'STC Pay & GCC Wallets', isManual: false, icon: <Smartphone size={18} className="text-[#F59E0B]" /> },
      { id: 'iban', name: isRTL ? 'تحويل بنكي مباشر (IBAN)' : 'Direct IBAN Bank Transfer', isManual: true, number: 'SA8200000012345678901234', icon: <Building2 size={18} className="text-[#CBD5E1]" /> },
    ],
    global: [
      { id: 'card_global', name: isRTL ? 'بطاقات ائتمان دولية' : 'Visa / MasterCard / AMEX', isManual: false, icon: <CreditCard size={18} className="text-[#34D399]" /> },
      { id: 'paypal', name: 'PayPal', isManual: false, icon: <Banknote size={18} className="text-[#F59E0B]" /> },
      { id: 'crypto', name: 'USDT (TRC20 Wallet)', isManual: true, number: 'TYD4xK11s89PzL283kxXmQ2719s82xXzLq', icon: <Banknote size={18} className="text-[#D97706]" /> },
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
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 max-w-lg mx-auto text-[#F8FAFC] shadow-2xl">
      <h4 className="text-[#E2E8F0] font-bold text-sm mb-4 border-b border-[#1E293B] pb-3">
        {isRTL ? 'اختر وسيلة الدفع المناسبة:' : 'Select Payment Method:'}
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
                  ? 'bg-[#1E293B] border-[#D97706] text-[#F8FAFC] shadow-md ring-1 ring-[#D97706]' 
                  : 'bg-[#090F16] border-[#223147] hover:border-[#334155] text-[#CBD5E1]'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-[#0F172A] border border-[#1E293B]">
                  {item.icon}
                </div>
                <span className="font-semibold text-xs leading-snug break-words">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.badge && (
                  <span className="bg-[rgba(217,119,6,0.15)] text-[#F59E0B] text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-[rgba(217,119,6,0.3)]">
                    {item.badge}
                  </span>
                )}
                <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                  isSelected ? 'border-4 border-[#D97706] bg-[#090F16]' : 'border-[#64748B]'
                }`} />
              </div>
            </div>
          );
        })}
      </div>

      {currentMethodObj.isManual && (
        <div className="mt-4 bg-[#090F16] border border-[#223147] rounded-xl p-4">
          <p className="text-[#94A3B8] text-xs font-semibold mb-2.5">
            {isRTL ? 'يرجى تحويل المبلغ إلى الحساب التالي:' : 'Please transfer to:'}
          </p>
          
          <div className="flex items-center justify-between bg-[#0F172A] p-3 rounded-lg border border-[#1E293B] gap-2">
            <div className="text-[#F59E0B] font-mono text-xs font-bold break-all dir-ltr">
              {currentMethodObj.number}
            </div>

            <button 
              type="button"
              onClick={() => handleCopy(currentMethodObj.number)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
                copied 
                  ? 'bg-[#10B981] text-white' 
                  : 'bg-[#1E293B] text-[#E2E8F0] hover:bg-[#223147]'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? (isRTL ? 'تم النسخ' : 'Copied') : (isRTL ? 'نسخ' : 'Copy')}</span>
            </button>
          </div>

          <div className="mt-3">
            <input 
              type="text" 
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder={isRTL ? "رقم المعاملة / اسم المحول (اختياري)" : "Transaction Reference"}
              className="app-input text-xs"
            />
          </div>

          <div className="mt-3">
            <label className="block text-[#94A3B8] text-[11px] font-semibold mb-1.5">
              {isRTL ? "إرفاق صورة إشعار التحويل:" : "Attach Transfer Receipt:"}
            </label>
            
            <label className="flex items-center justify-center p-3 rounded-lg border border-dashed border-[#223147] bg-[#0F172A] text-[#94A3B8] hover:border-[#D97706] cursor-pointer text-xs font-semibold text-center transition-colors gap-2">
              <Upload size={16} className="text-[#D97706]" />
              <span className={receiptFile ? 'text-[#34D399] font-bold' : ''}>
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
        <div className="bg-[rgba(16,185,129,0.1)] text-[#34D399] border border-[rgba(16,185,129,0.25)] p-3.5 rounded-xl mt-5 text-center text-xs font-extrabold flex items-center justify-center gap-2">
          <ShieldCheck size={18} />
          <span>{isRTL ? 'تم استلام الطلب وستتم المراجعة والتفعيل فوراً' : 'Order Received & Under Verification'}</span>
        </div>
      ) : (
        <button 
          onClick={() => onSubmit(currentMethodObj.id, currentMethodObj.isManual, receiptFile)}
          disabled={loading}
          className="btn-primary w-full mt-5 py-3.5 text-xs font-bold"
        >
          {loading 
            ? (isRTL ? "جاري المعالجة..." : "Processing...") 
            : (isRTL ? "تأكيد وإتمام الطلب" : "Proceed to Payment")}
        </button>
      )}

      <div className="flex items-center justify-center gap-2 text-[11px] text-[#64748B] mt-4">
        <ShieldCheck size={14} className="text-[#10B981]" />
        <span>{isRTL ? 'بياناتك مشفرة ومحمية وفق معايير 256-bit SSL' : '256-bit SSL Encrypted & Secure Payment'}</span>
      </div>
    </div>
  );
}
