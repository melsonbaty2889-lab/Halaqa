import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Award, 
  Sparkles, 
  Percent, 
  Tag, 
  ShieldCheck,
  Loader2,
  Building2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { UI } from '@/theme/styles';

export default function AffiliateRewards({ academyId, currency = 'USD', isRtl: isRtlProp, currentLang: currentLangProp }) {
  const { t, i18n } = useTranslation();
  
  const currentLang = currentLangProp || i18n?.language || 'ar';
  const rtlLanguages = ['ar', 'ur'];
  const isRtl = isRtlProp !== undefined 
    ? isRtlProp 
    : rtlLanguages.some(lang => currentLang.startsWith(lang));

  const [copiedLink, setCopiedLink] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [referralList, setReferralList] = useState([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeAcademies: 0,
    pendingDiscount: 0,
    totalDiscountEarned: 0
  });

  const loadReferralData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let targetAcademyId = academyId;
      if (!targetAcademyId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('academy_id')
          .eq('id', user.id)
          .maybeSingle();
        targetAcademyId = profile?.academy_id;
      }

      if (targetAcademyId) {
        const { data: academy } = await supabase
          .from('academies')
          .select('referral_code, id')
          .eq('id', targetAcademyId)
          .maybeSingle();

        if (academy?.referral_code) {
          setReferralCode(academy.referral_code);
        } else {
          const generatedCode = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
          await supabase
            .from('academies')
            .update({ referral_code: generatedCode })
            .eq('id', targetAcademyId);
          setReferralCode(generatedCode);
        }

        const { data: referrals } = await supabase
          .from('saas_referrals')
          .select('*')
          .eq('referrer_academy_id', targetAcademyId)
          .order('created_at', { ascending: false });

        if (referrals) {
          setReferralList(referrals);
          const total = referrals.length;
          const active = referrals.filter(r => r.status === 'subscribed' || r.status === 'rewarded').length;
          const pending = referrals.filter(r => r.status === 'pending').reduce((sum, r) => sum + (Number(r.reward_amount) || 0), 0);
          const earned = referrals.filter(r => r.status === 'rewarded').reduce((sum, r) => sum + (Number(r.reward_amount) || 0), 0);

          setStats({
            totalReferrals: total,
            activeAcademies: active,
            pendingDiscount: pending,
            totalDiscountEarned: earned
          });
        }
      }
    } catch (err) {
      console.error('🚨 Error fetching referral data:', err);
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  useEffect(() => {
    loadReferralData();
  }, [loadReferralData]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://smart-halaqa.vercel.app';
  const referralLink = `${baseUrl}/signup?ref=${referralCode || 'REF-27TJK2'}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const msg = `${t('affiliate.whatsappShareMessage', 'أدعوك لتجربة المنظومة مع الحصول على خصم خاص عبر الرابط التالي:')}\n${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div 
      className="flex flex-col gap-4 max-w-3xl mx-auto p-2 font-cairo text-semantic-textPrimary"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 🟢 1. HERO SECTION & WALLET BANNER */}
      <div className={`${UI.cardGlass} p-5 relative overflow-hidden border border-semantic-successBorder/40 bg-semantic-successBg/10`}>
        
        {/* Top Tag */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-semantic-successBg border border-semantic-successBorder text-semantic-success rounded-xl text-xs font-bold">
            <Tag size={12} />
            <span>{t('affiliate.badge', 'برنامج شركاء النجاح')}</span>
          </div>
          <div className="text-xs text-semantic-textSecondary flex items-center gap-1">
            <ShieldCheck size={14} className="text-semantic-success" />
            <span>{t('affiliate.autoDiscount', 'تطبيق تلقائي للخصم')}</span>
          </div>
        </div>

        {/* Heading */}
        <h2 className={`${UI.title} mb-1.5 leading-snug`}>
          {t('affiliate.heroTitle', 'ادعُ المقارئ واخصِم من اشتراكك')}
        </h2>
        <p className={`${UI.subtitle} mb-4 leading-relaxed`}>
          {t('affiliate.heroDesc', 'احصل على خصومات فورية تُطبّق تلقائياً على فاتورة تجديدك القادمة لكل أكاديمية تنضم عن طريقك.')}
        </p>

        {/* Link Box Container */}
        <div className="bg-semantic-bgCard border border-semantic-borderInput rounded-2xl p-3 flex flex-col gap-2.5">
          <span className="text-xs text-semantic-textMuted font-semibold">
            {t('affiliate.directLink', 'رابط الإحالة المباشر')}
          </span>
          
          <div className="flex gap-2 items-center">
            <div className="flex-1 bg-semantic-bgMain border border-semantic-borderInput rounded-lg px-3 py-2 text-semantic-textSecondary text-xs font-mono whitespace-nowrap overflow-hidden text-ellipsis ltr text-left">
              {referralLink}
            </div>

            <button
              type="button"
              onClick={() => handleCopy(referralLink)}
              className={`${UI.btnPrimary} px-3.5 py-2 text-xs shrink-0`}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? t('affiliate.copied', 'تم النسخ') : t('affiliate.copyLink', 'نسخ')}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className={`${UI.btnEmerald} w-full py-2.5 px-3 text-xs mt-0.5`}
          >
            <Share2 size={15} />
            <span>{t('affiliate.whatsapp', 'مشاركة عبر واتساب')}</span>
          </button>
        </div>
      </div>

      {/* 🟢 2. STEPS FLOW */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { step: '1', title: t('affiliate.step1Title', '1. شارك'), desc: t('affiliate.step1Desc', 'أرسل رابطك للمديرين') },
          { step: '2', title: t('affiliate.step2Title', '2. اشتركوا'), desc: t('affiliate.step2Desc', 'تسجل الأكاديمية بالمنظومة') },
          { step: '3', title: t('affiliate.step3Title', '3. وفّر'), desc: t('affiliate.step3Desc', 'يُخصم التخفيض من فاتورتك') }
        ].map((item, idx) => (
          <div key={idx} className={`${UI.card} p-2.5 flex flex-col items-center text-center gap-1`}>
            <div className="w-6 h-6 rounded-full bg-semantic-successBg text-semantic-success border border-semantic-successBorder flex items-center justify-center font-extrabold text-xs">
              {item.step}
            </div>
            <div className="font-bold text-xs text-semantic-textPrimary">{item.title}</div>
            <div className="text-[10px] text-semantic-textMuted leading-tight">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* 🟢 3. METRICS GRID */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* إجمالي الإحالات */}
        <div className={`${UI.card} p-3 flex items-center justify-between`}>
          <div>
            <div className="text-xs text-semantic-textSecondary mb-0.5">{t('affiliate.totalReferrals', 'إجمالي الإحالات')}</div>
            <div className="text-lg font-extrabold text-semantic-textPrimary">{stats.totalReferrals}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-semantic-bgCard border border-semantic-borderInput text-semantic-textSecondary flex items-center justify-center">
            <Users size={18} />
          </div>
        </div>

        {/* أكاديميات مشتركة */}
        <div className={`${UI.card} p-3 flex items-center justify-between`}>
          <div>
            <div className="text-xs text-semantic-textSecondary mb-0.5">{t('affiliate.activeAcademies', 'أكاديميات مشتركة')}</div>
            <div className="text-lg font-extrabold text-semantic-textPrimary">{stats.activeAcademies}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-semantic-successBg border border-semantic-successBorder text-semantic-success flex items-center justify-center">
            <Award size={18} />
          </div>
        </div>

        {/* خصم التجديد القادم */}
        <div className={`${UI.card} border-semantic-actionPrimary/40 p-3 flex items-center justify-between`}>
          <div>
            <div className="text-xs text-semantic-actionPrimary mb-0.5">{t('affiliate.pendingDiscount', 'خصم التجديد القادم')}</div>
            <div className="text-base font-extrabold text-semantic-actionPrimary">{stats.pendingDiscount} {currency}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-semantic-actionPrimary/10 border border-semantic-actionPrimary/30 text-semantic-actionPrimary flex items-center justify-center">
            <Percent size={18} />
          </div>
        </div>

        {/* إجمالي الوفر */}
        <div className={`${UI.card} border-semantic-successBorder p-3 flex items-center justify-between`}>
          <div>
            <div className="text-xs text-semantic-success mb-0.5">{t('affiliate.totalDiscountEarned', 'إجمالي الوفر')}</div>
            <div className="text-base font-extrabold text-semantic-success">{stats.totalDiscountEarned} {currency}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-semantic-successBg border border-semantic-successBorder text-semantic-success flex items-center justify-center">
            <Sparkles size={18} />
          </div>
        </div>

      </div>

      {/* 🟢 4. RECORDS SECTION */}
      <div className={`${UI.card} p-4 flex flex-col gap-3`}>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-semantic-actionPrimary text-xs font-semibold">
            <Loader2 size={18} className="animate-spin" />
            <span>{t('affiliate.loading', 'جاري تحميل سجل الإحالات...')}</span>
          </div>
        ) : referralList.length === 0 ? (
          <div className="text-center flex flex-col items-center gap-2 py-4">
            <div className="w-10 h-10 rounded-full bg-semantic-bgMain border border-semantic-borderInput flex items-center justify-center text-semantic-textMuted">
              <Sparkles size={18} />
            </div>
            <h3 className="text-semantic-textPrimary text-sm font-bold m-0">
              {t('affiliate.emptyTitle', 'لا توجد إحالات بعد')}
            </h3>
            <p className="text-semantic-textSecondary text-xs m-0 max-w-xs leading-relaxed">
              {t('affiliate.emptyDesc', 'شارك رابطك المباشر مع زملائك لبدء تخفيض قيمة اشتراكك القادم تلقائياً.')}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-1.5 text-semantic-textPrimary text-xs font-bold mb-3">
              <Building2 size={16} className="text-semantic-success" />
              <span>{t('affiliate.recordsTitle', 'سجل الأكاديميات المُحالة')}</span>
            </div>

            <div className="overflow-x-auto">
              <table className={`w-full text-xs border-collapse ${isRtl ? 'text-right' : 'text-left'}`}>
                <thead>
                  <tr className="text-semantic-textSecondary border-b border-semantic-borderCard">
                    <th className="p-2 font-bold">{t('affiliate.table.academy', 'الأكاديمية / المستخدم')}</th>
                    <th className="p-2 font-bold">{t('affiliate.table.status', 'الحالة')}</th>
                    <th className="p-2 font-bold">{t('affiliate.table.reward', 'قيمة الخصم')}</th>
                    <th className="p-2 font-bold text-center">{t('affiliate.table.date', 'التاريخ')}</th>
                  </tr>
                </thead>
                <tbody>
                  {referralList.map((item) => (
                    <tr key={item.id} className="border-b border-semantic-borderCard text-semantic-textPrimary">
                      <td className="p-2.5 font-semibold">
                        {item.referred_academy_name || item.referred_email || t('affiliate.defaultAcademyName', 'أكاديمية مجاورة')}
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                          item.status === 'rewarded' 
                            ? 'bg-semantic-successBg text-semantic-success border-semantic-successBorder' 
                            : item.status === 'subscribed' 
                              ? 'bg-semantic-actionPrimary/10 text-semantic-actionPrimary border-semantic-actionPrimary/30' 
                              : 'bg-semantic-bgMain text-semantic-textSecondary border-semantic-borderInput'
                        }`}>
                          {item.status === 'rewarded' 
                            ? t('affiliate.status.rewarded', 'تم الخصم') 
                            : item.status === 'subscribed' 
                              ? t('affiliate.status.subscribed', 'مشترك نشط') 
                              : t('affiliate.status.pending', 'قيد الانتظار')}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-semantic-actionPrimary">
                        {Number(item.reward_amount) || 0} {currency}
                      </td>
                      <td className="p-2.5 text-center text-semantic-textSecondary font-mono text-[11px]">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString(currentLang) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
