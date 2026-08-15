import React, { useState, useEffect } from 'react';
import { 
  Gift, Copy, Check, Users, DollarSign, Award, 
  Share2, Clock, Sparkles, Loader2, AlertCircle, Tag 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAcademy } from '@/context/AcademyContext';

export default function AffiliateRewards() {
  const { academy } = useAcademy();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    totalReferrals: 0, 
    successfulConversions: 0, 
    pendingRewards: 0, 
    totalEarned: 0 
  });
  const [referralsList, setReferralsList] = useState([]);

  // كود ورابط الإحالة المعتمد
  const referralCode = academy?.referral_code || academy?.id?.slice(0, 8)?.toUpperCase() || 'SMART';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://halaqa.vercel.app';
  const referralLink = `${baseUrl}/signup?ref=${referralCode}`;

  useEffect(() => {
    if (academy?.id) fetchReferralData();
  }, [academy?.id]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saas_referrals')
        .select(`
          id, referral_code_used, referred_email, referred_academy_id,
          status, reward_amount, reward_type, reward_details, created_at,
          academies:referred_academy_id ( name )
        `)
        .eq('referrer_academy_id', academy.id)
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching referrals:', error);

      if (data) {
        setReferralsList(data);
        setStats({
          totalReferrals: data.length,
          successfulConversions: data.filter(r => ['subscribed', 'rewarded'].includes(r.status)).length,
          pendingRewards: data.filter(r => ['pending', 'registered'].includes(r.status)).reduce((s, r) => s + (Number(r.reward_amount) || 0), 0),
          totalEarned: data.filter(r => r.status === 'rewarded').reduce((s, r) => s + (Number(r.reward_amount) || 0), 0)
        });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'rewarded': 
        return { label: 'تم صرف المكافأة', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
      case 'subscribed': 
        return { label: 'مشترك (مستحق)', className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
      case 'registered': 
        return { label: 'سجل مؤخراً', className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
      case 'cancelled': 
        return { label: 'ملغي', className: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
      default: 
        return { label: status || 'قيد الانتظار', className: 'bg-slate-800 text-slate-400 border border-slate-700' };
    }
  };

  return (
    <div className="p-4 sm:p-6 text-slate-100 font-sans dir-rtl max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header & Link Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-xl">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Gift className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">برنامج الإحالة والشركاء</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              شارك كود الإحالة مع المقارئ والأكاديميات واحصل على رصيد ومكافآت مجانية تلقائياً.
            </p>
          </div>
        </div>

        {/* Link Box */}
        <div className="mt-6 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Share2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] text-slate-400 block font-medium">رابط الإحالة المباشر:</span>
              <input 
                type="text" 
                readOnly 
                value={referralLink} 
                className="bg-transparent border-none text-slate-200 text-xs sm:text-sm w-full outline-none font-mono dir-ltr text-left font-semibold select-all" 
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto w-full md:w-auto">
            <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> {referralCode}
            </span>

            <button 
              onClick={handleCopyLink} 
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                copied 
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'تم النسخ!' : 'نسخ الرابط'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">إجمالي الإحالات</span>
            <strong className="text-xl font-bold text-white mt-0.5 block">{stats.totalReferrals}</strong>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">أكاديميات مشتركة</span>
            <strong className="text-xl font-bold text-white mt-0.5 block">{stats.successfulConversions}</strong>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">مكافآت معلقة</span>
            <strong className="text-xl font-bold text-white mt-0.5 block">${stats.pendingRewards}</strong>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">إجمالي المكتسب</span>
            <strong className="text-xl font-bold text-emerald-400 mt-0.5 block">${stats.totalEarned}</strong>
          </div>
        </div>
      </div>

      {/* 3. Referrals Table Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">سجل الإحالات والأرباح</h3>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-400" />
            <span className="text-xs">جاري تحميل سجل الإحالات...</span>
          </div>
        ) : referralsList.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
            <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-200 mb-1">لا توجد إحالات مسجلة بعد</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              شارك رابط أو كود الإحالة الخاص بأكاديميتك لبدء كسب الرصيد والمكافآت التلقائية.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 px-3">الأكاديمية / البريد</th>
                  <th className="pb-3 px-3">تاريخ الدعوة</th>
                  <th className="pb-3 px-3">نوع المكافأة</th>
                  <th className="pb-3 px-3">الحالة</th>
                  <th className="pb-3 px-3">المبلغ / التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {referralsList.map((ref) => {
                  const badge = getStatusBadge(ref.status);
                  return (
                    <tr key={ref.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-3 font-semibold text-slate-100">
                        {ref.academies?.name || ref.referred_email || 'أكاديمية جديدة'}
                      </td>
                      <td className="py-4 px-3 text-slate-400">
                        {new Date(ref.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-4 px-3 text-slate-300">
                        {ref.reward_type === 'credit' ? 'رصيد حساب' : 
                         ref.reward_type === 'free_month' ? 'شهر مجاني' : 
                         ref.reward_type === 'cash' ? 'نقدي' : 'خصم'}
                      </td>
                      <td className="py-4 px-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-3 font-bold text-emerald-400">
                        {ref.reward_amount ? `$${ref.reward_amount}` : ref.reward_details || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
