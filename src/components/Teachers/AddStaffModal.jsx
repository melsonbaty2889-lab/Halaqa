import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, UserPlus, Loader2, Award, Globe, DollarSign } from 'lucide-react';
import { C } from '@/theme/colors';
import { Btn, Input } from '@/components/UI/UI';

export default function AddStaffModal({ isOpen, onClose, onSuccess, academyId }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher',
    title: 'شيخ / معلم',
    country: 'EG',
    timezone: 'UTC+02:00',
    ijazat: [],
    compensationType: 'volunteer', // volunteer, hourly, monthly
    hourlyRate: '',
    currency: 'USD'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const titlesList = [
    'شيخ / مقرئ',
    'محفظ / معلّم',
    'شيخة / معلّمة',
    'شيخ المقارئ',
    'Ustaz / Ustazah',
    'Quran Instructor',
    'مشرف تربوي'
  ];

  const ijazatOptions = [
    'حفص عن عاصم',
    'ورش عن نافع',
    'قالون عن نافع',
    'الدوري عن أبي عمرو',
    'القراءات العشر الصغرى',
    'القراءات العشر الكبرى',
    'إجازة في المتون الجزرية/الأطفال'
  ];

  const handleIjazatChange = (ijaza) => {
    setFormData(prev => ({
      ...prev,
      ijazat: prev.ijazat.includes(ijaza)
        ? prev.ijazat.filter(i => i !== ijaza)
        : [...prev.ijazat, ijaza]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('يرجى إدخال اسم المعلم');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('teachers')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            role: formData.role,
            title: formData.title,
            country: formData.country,
            timezone: formData.timezone,
            ijazat: formData.ijazat,
            compensation_type: formData.compensationType,
            hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : 0,
            currency: formData.currency,
            academy_id: academyId || null
          }
        ]);

      if (error) throw error;

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("🚨 خطأ أثناء إضافة الكادر:", err);
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div 
        className="w-full max-w-2xl rounded-2xl p-6 shadow-2xl border text-white max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: C.surface, borderColor: C.border }}
      >
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/10">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: C.primary }}>
            <UserPlus className="w-5 h-5" /> إضافة كادر تعليمي / مقرئ جديد
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-bold mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">الاسم الكامل *</label>
              <Input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="الاسم الكامل"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">المسمى/المرتبة العلمية</label>
              <select 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none"
              >
                {titlesList.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">البريد الإلكتروني</label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">رقم الهاتف / الواتساب</label>
              <Input 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+20 / +966 / +1 ..."
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">الدور النظامي</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none"
              >
                <option value="teacher">مقرئ / معلم حلقات</option>
                <option value="supervisor">مشرف تعليمي</option>
                <option value="admin">مدير أكاديمية</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">المنطقة الزمنية (Timezone)</label>
              <select 
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none"
              >
                <option value="UTC+00:00">جرينتش (UTC+0)</option>
                <option value="UTC+01:00">المغرب / أوروبا الوسطى (UTC+1)</option>
                <option value="UTC+02:00">مصر / فلسطين / أوروبا الشرقية (UTC+2)</option>
                <option value="UTC+03:00">السعودية / الخليج / تركيا (UTC+3)</option>
                <option value="UTC+07:00">إندونيسيا / جنوب شرق آسيا (UTC+7)</option>
                <option value="UTC-05:00">شرق أمريكا / كندا (UTC-5)</option>
              </select>
            </div>
          </div>

          {/* الإجازات القرآنية */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> الإجازات والروايات المعتمدة
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-white/[0.02] p-3 rounded-xl border border-white/5">
              {ijazatOptions.map((ijaza, idx) => (
                <label key={idx} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                  <input 
                    type="checkbox"
                    checked={formData.ijazat.includes(ijaza)}
                    onChange={() => handleIjazatChange(ijaza)}
                    className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
                  />
                  <span>{ijaza}</span>
                </label>
              ))}
            </div>
          </div>

          {/* النظام المالي */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> نظام التعويض / التعاقد
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select 
                value={formData.compensationType}
                onChange={(e) => setFormData({ ...formData, compensationType: e.target.value })}
                className="p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none"
              >
                <option value="volunteer">احتساب / تطوع</option>
                <option value="hourly">بالساعة</option>
                <option value="monthly">راتب شهري ثابت</option>
              </select>

              {formData.compensationType !== 'volunteer' && (
                <>
                  <Input 
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder="القيمة"
                  />
                  <select 
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="SAR">SAR (ر.س)</option>
                    <option value="EGP">EGP (ج.م)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="MAD">MAD (د.م)</option>
                  </select>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Btn type="submit" disabled={loading} variant="primary" className="flex-1 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ الكادر التعليمي'}
            </Btn>
            <Btn type="button" onClick={onClose} variant="secondary" className="flex-1">
              إلغاء
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
