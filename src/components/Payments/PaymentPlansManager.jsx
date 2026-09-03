import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { CreditCard, Plus, Save, CheckCircle2, AlertCircle, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import colors from '@/theme/colors';

export default function PaymentPlansManager({ academyId, dir = 'rtl', t }) {
  const [plans, setPlans] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly, yearly, per_session
  const [currency, setCurrency] = useState('EGP');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState(null);

  // جلب خطط الأسعار الخاصة بالأكاديمية
  const fetchPlans = useCallback(async () => {
    setFetching(true);
    try {
      let query = supabase
        .from('payment_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (academyId) {
        query = query.eq('academy_id', academyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error('خطأ في جلب خطط الأسعار:', err.message);
    } finally {
      setFetching(false);
    }
  }, [academyId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // إنشاء خطة اشتراك جديدة
  const handleSavePlan = async (e) => {
    e.preventDefault();
    const numericPrice = parseFloat(price);

    if (!name.trim() || isNaN(numericPrice) || numericPrice < 0) {
      setMessage({ type: 'error', text: 'يرجى إدخال اسم الخطة وسعر صحيح.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        name: name.trim(),
        price: numericPrice,
        billing_cycle: billingCycle,
        currency,
        description: description.trim(),
        is_active: true,
        created_at: new Date().toISOString()
      };

      if (academyId) {
        payload.academy_id = academyId;
      }

      const { error } = await supabase
        .from('payment_plans')
        .insert([payload]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'تم إضافة خطة الاشتراك بنجاح!' });
      setName('');
      setPrice('');
      setDescription('');
      fetchPlans();
    } catch (err) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // حذف خطة اشتراك
  const handleDeletePlan = async (planId) => {
    if (!window.confirm('هل أنت تأكد من رغبتك في حذف هذه الخطة؟')) return;

    try {
      const { error } = await supabase
        .from('payment_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      setPlans(prev => prev.filter(p => p.id !== planId));
      setMessage({ type: 'success', text: 'تم حذف الخطة بنجاح.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'فشل حذف الخطة: ' + err.message });
    }
  };

  // تغيير حالة الخطة (تفعيل/تعطيل)
  const togglePlanStatus = async (planId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('payment_plans')
        .update({ is_active: !currentStatus })
        .eq('id', planId);

      if (error) throw error;
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, is_active: !currentStatus } : p));
    } catch (err) {
      console.error('خطأ أثناء تغيير حالة الخطة:', err.message);
    }
  };

  // تحويل دورة الدفع لنص عربي مقروء
  const getBillingCycleLabel = (cycle) => {
    switch (cycle) {
      case 'monthly': return 'شهري';
      case 'yearly': return 'سنوي';
      case 'per_session': return 'بالحصة';
      default: return cycle;
    }
  };

  return (
    <div 
      dir={dir} 
      style={{ backgroundColor: colors.surface || '#0F172A' }}
      className="w-full max-w-4xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-white font-['Cairo',sans-serif]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <CreditCard className="w-6 h-6 text-[#FBBF24]" />
          <h2 className="text-lg font-bold">إدارة خطط الأسعار والاشتراكات</h2>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Add Plan Form */}
      <form onSubmit={handleSavePlan} className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#FBBF24]">
          <Plus className="w-4 h-4" />
          <span>إضافة خطة اشتراك جديدة</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-300 mb-1">اسم الخطة *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: الخطة الشهرية الأساسية"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FBBF24] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">السعر *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FBBF24] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">دورية الدفع</label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FBBF24] transition-colors"
            >
              <option value="monthly">شهري (Monthly)</option>
              <option value="yearly">سنوي (Yearly)</option>
              <option value="per_session">بالحصة (Per Session)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1">وصف الخطة / الميزات المشمولة</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="تشمل 8 حصص شهرياً + متابعة التلاوة..."
            rows="2"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FBBF24] transition-colors resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#FBBF24] text-[#0F172A] text-xs font-bold rounded-xl hover:bg-[#FBBF24]/90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'جاري الحفظ...' : 'حفظ الخطة'}</span>
        </button>
      </form>

      {/* Plans List Grid */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-400">خطط الأسعار المتاحة ({plans.length})</h3>
        
        {fetching ? (
          <p className="text-xs text-slate-500 py-8 text-center">جاري تحميل الخطط...</p>
        ) : plans.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center bg-white/[0.01] rounded-xl border border-dashed border-white/5">
            لا توجد خطط اشتراك مسجلة حالياً.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`p-4 bg-white/[0.02] border rounded-xl flex flex-col justify-between gap-3 transition-all ${
                  plan.is_active !== false ? 'border-white/10' : 'border-rose-500/20 opacity-60'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm font-bold text-white line-clamp-1">{plan.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-[#FBBF24] font-bold border border-amber-500/20 whitespace-nowrap">
                      {getBillingCycleLabel(plan.billing_cycle)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 min-h-[32px] line-clamp-2">{plan.description || 'بدون وصف'}</p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-[#FBBF24]">{plan.price}</span>
                    <span className="text-xs text-slate-400">{plan.currency || 'EGP'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Toggle Active Status */}
                    <button
                      type="button"
                      onClick={() => togglePlanStatus(plan.id, plan.is_active !== false)}
                      title={plan.is_active !== false ? 'تعطيل الخطة' : 'تفعيل الخطة'}
                      className="p-1.5 text-slate-400 hover:text-white transition-colors"
                    >
                      {plan.is_active !== false ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-500" />
                      )}
                    </button>

                    {/* Delete Plan */}
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(plan.id)}
                      title="حذف الخطة"
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
