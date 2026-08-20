import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CreditCard, Plus, Save, CheckCircle2, AlertCircle, Tag, DollarSign } from 'lucide-react';
import colors from '@/theme/colors';

export default function PaymentPlansManager({ dir = 'rtl' }) {
  const [plans, setPlans] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly, yearly, per_session
  const [currency, setCurrency] = useState('EGP');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  // جلب خطط الأسعار من Supabase
  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPlans(data);
    } catch (err) {
      console.error('خطأ في جلب خطط الأسعار:', err.message);
    }
  };

  // إنشاء خطة اشتراك جديدة
  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      setMessage({ type: 'error', text: 'يرجى إدخال اسم الخطة وسعر الاشتراك.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('payment_plans')
        .insert([
          {
            name,
            price: parseFloat(price),
            billing_cycle: billingCycle,
            currency,
            description,
            created_at: new Date().toISOString()
          }
        ]);

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

  return (
    <div 
      dir={dir} 
      style={{ backgroundColor: colors.surface || '#0F172A' }}
      className="w-full max-w-4xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <CreditCard className="w-6 h-6 text-[#FBBF24]" />
          <h2 className="text-lg font-bold">إدارة خطط الأسعار والاشتراكات</h2>
        </div>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-bold ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Add Plan Form */}
      <form onSubmit={handleSavePlan} className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#FBBF24]">
          <Plus className="w-4 h-4" />
          <span>إضافة خطة اشتراك جديدة</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-300 mb-1">اسم الخطة</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: الخطة الشهرية الأساسية"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FBBF24]"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">السعر</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FBBF24]"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">دورية الدفع</label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FBBF24]"
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
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FBBF24]"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FBBF24] text-[#0F172A] text-xs font-bold rounded-xl hover:bg-[#FBBF24]/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'جاري الحفظ...' : 'حفظ الخطة'}</span>
        </button>
      </form>

      {/* Plans List Grid */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-400">خطط الأسعار المتاحة ({plans.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plans.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 col-span-3 text-center">لا توجد خطط اشتراك مسجلة حالياً.</p>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-white">{plan.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      {plan.billing_cycle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{plan.description || 'بدون وصف'}</p>
                </div>
                
                <div className="flex items-baseline gap-1 border-t border-white/5 pt-3">
                  <span className="text-lg font-black text-[#FBBF24]">{plan.price}</span>
                  <span className="text-xs text-slate-400">{plan.currency || 'EGP'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
