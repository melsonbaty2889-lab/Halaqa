/* src/components/Teachers/AddStaffModal.jsx */

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, UserPlus, Loader2, Award, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI } from '@/theme/styles';

export default function AddStaffModal({ isOpen, onClose, onSuccess, academyId }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'ar';
  const isRtl = ['ar', 'ur'].includes(currentLang);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher',
    title: 'معلّم / مقرئ',
    isTeaching: true,
    country: 'EG',
    timezone: 'Africa/Cairo',
    ijazat: [],
    compensationType: 'volunteer',
    hourlyRate: '',
    currency: 'EGP'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const titlesList = [
    'معلّم / مقرئ',
    'مشرف تعليمي',
    'مدير أكاديمية'
  ];

  const ijazatOptions = [
    'حفص عن عاصم',
    'ورش عن نافع',
    'قالون عن نافع',
    'الدوري عن أبي عمرو',
    'القراءات العشر الصغرى',
    'القراءات العشر الكبرى',
    'إجازة المتون'
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
      setErrorMsg(t('teachers.errorNameRequired', 'يرجى إدخال اسم الكادر'));
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. إضافة الكادر في جدول المعلمين
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            title: formData.title,
            is_teaching: formData.isTeaching,
            country: formData.country,
            timezone: formData.timezone,
            ijazas: formData.ijazat,
            employment_type: formData.compensationType,
            hourly_rate: formData.compensationType === 'hourly' ? parseFloat(formData.hourlyRate) || 0 : 0,
            monthly_salary: formData.compensationType === 'monthly' ? parseFloat(formData.hourlyRate) || 0 : 0,
            salary_system: formData.compensationType
          }
        ])
        .select()
        .single();

      if (teacherError) throw teacherError;

      // 2. ربط المعلم بالأكاديمية الحالية في جدول academy_teachers
      if (teacherData && academyId) {
        const { error: relError } = await supabase
          .from('academy_teachers')
          .insert([
            {
              academy_id: academyId,
              teacher_id: teacherData.id,
              is_active: true
            }
          ]);

        if (relError) throw relError;
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("🚨 خطأ أثناء إضافة الكادر:", err);
      setErrorMsg(err.message || t('common.errorOccurred', 'حدث خطأ أثناء حفظ البيانات'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-semantic-bgPage/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div 
        className={`${UI.card} w-full max-w-2xl p-6 text-semantic-textPrimary max-h-[90vh] overflow-y-auto`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-semantic-borderCard">
          <h3 className="text-lg font-bold flex items-center gap-2 text-semantic-actionPrimary">
            <UserPlus className="w-5 h-5" /> {t('teachers.addStaffTitle', 'إضافة كادر تعليمي / إداري')}
          </h3>
          <button onClick={onClose} className="text-semantic-textSecondary hover:text-semantic-textPrimary transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-semantic-dangerBg border border-semantic-danger/30 text-semantic-danger p-3 rounded-xl text-xs font-bold mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-semantic-textSecondary mb-1">{t('teachers.fullName', 'الاسم الكامل *')}</label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('teachers.namePlaceholder', 'اسم المعلم أو الإداري')}
                className={UI.input}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-semantic-textSecondary mb-1">{t('teachers.jobTitle', 'المسمى الوظيفي')}</label>
              <select 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={UI.input}
              >
                {titlesList.map((item, idx) => (
                  <option key={idx} value={item} className="bg-slate-900 text-white">{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-semantic-textSecondary mb-1">{t('teachers.email', 'البريد الإلكتروني')}</label>
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className={UI.input}
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs text-semantic-textSecondary mb-1">{t('teachers.phone', 'رقم الهاتف / الواتساب')}</label>
              <input 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+20 / +966 / +1 ..."
                className={UI.input}
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs text-semantic-textSecondary mb-1">{t('teachers.systemRole', 'الصلاحية للنظام')}</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={UI.input}
              >
                <option value="teacher" className="bg-slate-900 text-white">{t('teachers.roleTeacher', 'معلّم (حلقة)')}</option>
                <option value="admin" className="bg-slate-900 text-white">{t('teachers.roleAdmin', 'مدير أكاديمية (إدارة + تدريس)')}</option>
                <option value="supervisor" className="bg-slate-900 text-white">{t('teachers.roleSupervisor', 'مشرف تعليمي')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-semantic-textSecondary mb-1">{t('teachers.timezone', 'المنطقة الزمنية (Timezone)')}</label>
              <select 
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className={UI.input}
              >
                <option value="Africa/Cairo" className="bg-slate-900 text-white">مصر (UTC+2)</option>
                <option value="Asia/Riyadh" className="bg-slate-900 text-white">السعودية / الخليج (UTC+3)</option>
                <option value="UTC" className="bg-slate-900 text-white">جرينتش (UTC+0)</option>
                <option value="Africa/Casablanca" className="bg-slate-900 text-white">المغرب العربي (UTC+1)</option>
                <option value="America/New_York" className="bg-slate-900 text-white">نيويورك (UTC-5)</option>
              </select>
            </div>
          </div>

          {/* خيار التدريس الفعلي */}
          <div className="card-surface p-3 border-semantic-borderCard/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-semantic-textPrimary">{t('teachers.enableTeaching', 'إتاحة التدريس المباشر للحلقات')}</p>
              <p className="text-[10px] text-semantic-textSecondary">{t('teachers.enableTeachingDesc', 'تفعيل هذا الخيار يسمح ببيان الاسم في قائمة معلمي الحلقات')}</p>
            </div>
            <input 
              type="checkbox"
              checked={formData.isTeaching}
              onChange={(e) => setFormData({ ...formData, isTeaching: e.target.checked })}
              className="w-4 h-4 rounded border-semantic-borderInput bg-semantic-surfaceInput text-semantic-actionPrimary focus:ring-0 cursor-pointer"
            />
          </div>

          {/* الإجازات القرآنية */}
          {formData.isTeaching && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-semantic-actionPrimary mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> {t('teachers.ijazat', 'الإجازات القرآنية')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-semantic-surfaceInput/40 p-3 rounded-xl border border-semantic-borderCard">
                {ijazatOptions.map((ijaza, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-xs text-semantic-textSecondary cursor-pointer hover:text-semantic-textPrimary">
                    <input 
                      type="checkbox"
                      checked={formData.ijazat.includes(ijaza)}
                      onChange={() => handleIjazatChange(ijaza)}
                      className="rounded border-semantic-borderInput bg-semantic-surfaceInput text-semantic-actionPrimary focus:ring-0 cursor-pointer"
                    />
                    <span>{ijaza}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* النظام المالي */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-semantic-textSecondary mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-semantic-success" /> {t('teachers.financialSystem', 'التعاقد والماليات')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select 
                value={formData.compensationType}
                onChange={(e) => setFormData({ ...formData, compensationType: e.target.value })}
                className={UI.input}
              >
                <option value="volunteer" className="bg-slate-900 text-white">{t('teachers.volunteer', 'احتساب / تطوع')}</option>
                <option value="hourly" className="bg-slate-900 text-white">{t('teachers.hourly', 'بالساعة')}</option>
                <option value="monthly" className="bg-slate-900 text-white">{t('teachers.monthly', 'راتب شهري')}</option>
              </select>

              {formData.compensationType !== 'volunteer' && (
                <>
                  <input 
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder={t('teachers.amount', 'المبلغ')}
                    className={UI.input}
                  />
                  <select 
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className={UI.input}
                  >
                    <option value="EGP" className="bg-slate-900 text-white">EGP (ج.م)</option>
                    <option value="SAR" className="bg-slate-900 text-white">SAR (ر.س)</option>
                    <option value="USD" className="bg-slate-900 text-white">USD ($)</option>
                    <option value="EUR" className="bg-slate-900 text-white">EUR (€)</option>
                  </select>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-semantic-borderCard">
            <button type="submit" disabled={loading} className={`${UI.btnPrimary} flex-1 flex items-center justify-center gap-2 cursor-pointer`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.save', 'حفظ البيانات')}
            </button>
            <button type="button" onClick={onClose} className={`${UI.btnSecondary} flex-1 cursor-pointer`}>
              {t('common.cancel', 'إلغاء')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
