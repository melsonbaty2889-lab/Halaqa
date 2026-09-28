import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ShieldCheck, Copy, Check, ArrowRight } from 'lucide-react';
import { useAcademy } from '@/context/AcademyContext';
import { UI } from '@/theme/styles';
import { getText } from '@/utils/textUtils';

// 💳 مصادر وسائل الدفع مرتبطة بالعملة مباشرة
const CURRENCY_PAYMENT_GATEWAYS = {
  EGP: [
    {
      id: 'instapay',
      nameKey: 'payment.instapay',
      defaultName: 'أنستا باي (InstaPay)',
      logo: '/logos/instapay.svg',
      type: 'instant',
      accountNumber: 'username@instapay',
      accountName: 'الحلقة الذكية - Smart Halaqa',
      badgeKey: 'payment.badge_fast',
      defaultBadge: 'الأسرع بمصر ⚡'
    },
    {
      id: 'vodafone',
      nameKey: 'payment.vodafone',
      defaultName: 'فودافون كاش والمحافظ الذكية',
      logo: '/logos/vodafone.png',
      type: 'wallet',
      accountNumber: '01012345678',
      accountName: 'محفظة فودافون كاش'
    },
    {
      id: 'fawry',
      nameKey: 'payment.fawry',
      defaultName: 'فوري Pay',
      logo: '/logos/fawry.svg',
      type: 'kiosk',
      accountNumber: '987654321',
      accountName: 'رقم الخدمة الموحد'
    },
    {
      id: 'cards_eg',
      nameKey: 'payment.cards_eg',
      defaultName: 'بطاقات الفيزا وميزة البنكية',
      logos: ['/logos/visa.svg', '/logos/mastercard.svg', '/logos/meeza.svg'],
      type: 'card'
    }
  ],
  SAR: [
    {
      id: 'apple_pay',
      nameKey: 'payment.apple_pay',
      defaultName: 'Apple Pay',
      logo: '/logos/applepay.svg',
      type: 'instant',
      badgeKey: 'payment.badge_fastest',
      defaultBadge: 'الأسرع ⚡'
    },
    {
      id: 'mada',
      nameKey: 'payment.mada',
      defaultName: 'بطاقات مدى (Mada)',
      logo: '/logos/mada.svg',
      type: 'card'
    },
    {
      id: 'stc',
      nameKey: 'payment.stc',
      defaultName: 'STC Pay / المحافظ الخليجية',
      logo: '/logos/stc_pay.svg',
      type: 'wallet'
    },
    {
      id: 'iban_gcc',
      nameKey: 'payment.iban',
      defaultName: 'تحويل بنكي مباشر (IBAN)',
      logo: '/logos/bank.svg',
      type: 'bank',
      accountNumber: 'SA8200000012345678901234',
      accountName: 'الحلقة الذكية الخليج'
    }
  ],
  USD: [
    {
      id: 'card_global',
      nameKey: 'payment.card_global',
      defaultName: 'بطاقات ائتمان دولية (Visa / MasterCard)',
      logos: ['/logos/visa.svg', '/logos/mastercard.svg'],
      type: 'card'
    },
    {
      id: 'paypal',
      nameKey: 'payment.paypal',
      defaultName: 'PayPal',
      logo: '/logos/paypal.svg',
      type: 'instant'
    },
    {
      id: 'usdt',
      nameKey: 'payment.usdt',
      defaultName: 'عملات رقمية (USDT TRC20)',
      logo: '/logos/usdt.svg',
      type: 'crypto',
      accountNumber: 'TYD4xK11s89PzL283kxXmQ2719s82xXzLq',
      accountName: 'محفظة TRC20'
    }
  ]
};

export default function PaymentMethods({ currency = 'EGP', onSelectPayment }) {
  const { t } = useAcademy();

  // 1. معالجة وتوحيد رمز العملة
  const normalizedCurrency = useMemo(() => {
    const curr = String(currency || '').toUpperCase();
    if (curr === 'EGYPT' || curr === 'EGP') return 'EGP';
    if (curr === 'GCC' || curr === 'SAR') return 'SAR';
    return 'USD';
  }, [currency]);

  // 2. تصفية وسائل الدفع بحسب العملة
  const availableGateways = useMemo(() => {
    return CURRENCY_PAYMENT_GATEWAYS[normalizedCurrency] || CURRENCY_PAYMENT_GATEWAYS.USD;
  }, [normalizedCurrency]);

  const [selectedGatewayId, setSelectedGatewayId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // 3. تحديث وسيلة الدفع عند تغيير العملة مع حماية من الأخطاء
  useEffect(() => {
    if (availableGateways.length > 0) {
      const defaultGateway = availableGateways[0];
      setSelectedGatewayId(defaultGateway.id);
      if (typeof onSelectPayment === 'function') {
        onSelectPayment(defaultGateway);
      }
    }
  }, [normalizedCurrency, availableGateways]);

  const activeGateway = useMemo(() => {
    return availableGateways.find(g => g.id === selectedGatewayId) || availableGateways[0];
  }, [availableGateways, selectedGatewayId]);

  const handleSelectGateway = useCallback((gateway) => {
    setSelectedGatewayId(gateway.id);
    if (typeof onSelectPayment === 'function') {
      onSelectPayment(gateway);
    }
  }, [onSelectPayment]);

  // 4. دالة نسخ آمنة ومحمية
  const handleCopy = useCallback(async (text, id) => {
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, []);

  return (
    <div className={`${UI.card} w-full max-w-[680px] mx-auto p-7 shadow-2xl space-y-6 font-cairo`}>
      <div className="text-center space-y-1">
        <h3 className={`${UI.title} text-xl font-bold m-0`}>
          {getText(t, 'payment.title', 'اختر طريقة الدفع المناسبة')}
        </h3>
        <p className={`${UI.subtitle} text-sm m-0`}>
          {getText(t, 'payment.subtitle', 'معاملات فورية ومشفرة بأعلى معايير الأمان')}
        </p>
      </div>

      {/* شبكة بوابات الدفع */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {availableGateways.map((gateway) => {
          const isSelected = activeGateway?.id === gateway.id;
          const gatewayTitle = getText(t, gateway.nameKey, gateway.defaultName);

          return (
            <button
              key={gateway.id}
              type="button"
              onClick={() => handleSelectGateway(gateway)}
              aria-pressed={isSelected}
              aria-label={gatewayTitle}
              title={gatewayTitle}
              className={`relative flex flex-col items-center justify-center gap-2 p-3 min-h-[80px] rounded-xl cursor-pointer transition-all duration-200 border ${
                isSelected 
                  ? 'bg-semantic-bgMain border-semantic-actionPrimary shadow-lg shadow-emerald-500/10 ring-1 ring-semantic-actionPrimary' 
                  : 'bg-semantic-bgCard/40 border-semantic-borderCard hover:border-semantic-borderInput opacity-80 hover:opacity-100'
              }`}
            >
              {gateway.badgeKey && (
                <span className="absolute -top-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-semantic-actionPrimary text-semantic-bgMain shadow-sm">
                  {getText(t, gateway.badgeKey, gateway.defaultBadge)}
                </span>
              )}

              {gateway.logos ? (
                <div className="flex items-center gap-1">
                  {gateway.logos.map((logoPath, idx) => (
                    <img key={idx} src={logoPath} alt="gateway logo" className="h-5 object-contain" />
                  ))}
                </div>
              ) : (
                <img src={gateway.logo} alt={gatewayTitle} className="h-7 max-w-[80px] object-contain" />
              )}

              <span className={`text-xs text-center ${
                isSelected 
                  ? 'font-bold text-semantic-actionPrimary' 
                  : 'font-normal text-semantic-textSecondary'
              }`}>
                {gatewayTitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* تفاصيل بيانات التحويل */}
      {activeGateway && (
        <div className="bg-semantic-bgMain border border-semantic-borderCard rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-semantic-textSecondary">
              {getText(t, 'payment.details_for', 'بيانات التحويل لـ:')} <strong className="text-semantic-textPrimary">{getText(t, activeGateway.nameKey, activeGateway.defaultName)}</strong>
            </span>
            <ShieldCheck size={18} className="text-semantic-success" />
          </div>

          {activeGateway.accountNumber && (
            <div className="flex items-center justify-between bg-semantic-bgCard border border-semantic-borderInput px-3.5 py-2.5 rounded-lg">
              <span className="font-mono text-base font-bold text-semantic-actionPrimary tracking-wider">
                {activeGateway.accountNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(activeGateway.accountNumber, 'num')}
                aria-label={getText(t, 'common.copy', 'نسخ')}
                title={getText(t, 'common.copy', 'نسخ')}
                className="flex items-center gap-1 px-2 min-h-[36px] text-xs text-semantic-textSecondary hover:text-semantic-textPrimary transition-colors bg-transparent border-0 cursor-pointer"
              >
                {copiedId === 'num' ? <Check size={14} className="text-semantic-success" /> : <Copy size={14} />}
                <span>{copiedId === 'num' ? getText(t, 'common.copied', 'تم النسخ') : getText(t, 'common.copy', 'نسخ')}</span>
              </button>
            </div>
          )}

          {activeGateway.accountName && (
            <div className="text-xs text-semantic-textSecondary">
              {getText(t, 'payment.account_name_label', 'اسم الحساب:')} <strong className="text-semantic-textPrimary">{activeGateway.accountName}</strong>
            </div>
          )}
        </div>
      )}

      {/* زر المتابعة */}
      <button
        type="button"
        onClick={() => onSelectPayment && onSelectPayment(activeGateway)}
        aria-label={getText(t, 'payment.confirm_btn', 'متابعة عملية الدفع')}
        title={getText(t, 'payment.confirm_btn', 'متابعة عملية الدفع')}
        className={`${UI.btnEmerald} w-full py-3.5 px-4 min-h-[48px] text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20`}
      >
        <span>{getText(t, 'payment.confirm_btn', 'متابعة عملية الدفع')}</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
