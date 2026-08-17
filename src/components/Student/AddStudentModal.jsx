import React, { useState } from "react";
import { useTranslation } from "react-i18next";

// 🛠️ الخدمات والثوابت والأدوات المساعدة
import { supabase } from "@/lib/supabase";
import { COUNTRIES_LIST } from "@/constants/countries";
import colors from "@/theme/colors";

// 🧩 المكونات العامة والأيقونات
import { Btn, Input, Select } from "@/components/UI/UI.jsx"; 
import { X, UserPlus, CheckCircle, AlertCircle, GraduationCap } from 'lucide-react';

export default function AddStudentModal({ isOpen, onClose, onStudentAdded, halaqasList = [] }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');

  const [loading, setLoading] = useState(false);
  const [inlineMessage, setInlineMessage] = useState({ text: '', type: '' });

  // 📝 حالات النموذج الأولى (Form Initial States)
  const initialFormState = {
    name: '',
    parent_name: '',
    parent_phone: '',
    birth_date: '',
    gender: 'male',
    country: 'EG',
    subscription_system: 'monthly',
    halaqa_id: halaqasList.length > 0 ? halaqasList[0].id : '',
    status: 'active'
  };

  const [formData, setFormData] = useState(initialFormState);

  const triggerToast = (text, type = 'success') => {
    setInlineMessage({ text, type });
    setTimeout(() => setInlineMessage({ text: '', type: '' }), 4000);
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setInlineMessage({ text: '', type: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      triggerToast(t('student_name_required') || (isRtl ? 'اسم الطالب مطلوب' : 'Student name is required'), 'error');
      return;
    }

    setLoading(true);
    try {
      // توليد كود طالب تسلسلي مختصر
      const studentCode = 'ST-' + Math.floor(1000 + Math.random() * 9000);

      const payload = {
        name: formData.name.trim(),
        parent_name: formData.parent_name.trim() || null,
        parent_phone: formData.parent_phone.trim() || null,
        birth_date: formData.birth_date || null,
        gender: formData.gender,
        country: formData.country,
        country_code: formData.country,
        subscription_system: formData.subscription_system,
        halaqa_id: formData.halaqa_id || null,
        status: formData.status,
        student_code: studentCode,
        current_quarter_index: 0,
        current_juz: 1,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('students')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      triggerToast(t('student_added_success') || (isRtl ? 'تم إضافة الطالب بنجاح' : 'Student added successfully'), 'success');
      
      if (onStudentAdded) onStudentAdded(data);
      
      setTimeout(() => {
        handleClose();
      }, 1000);

    } catch (error) {
      console.error("Error adding student:", error);
      triggerToast(t('student_added_failed') || (isRtl ? 'فشل إضافة الطالب' : 'Failed to add student'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { value: "male", label: t('gender_male') || (isRtl ? 'ذكر' : 'Male') },
    { value: "female", label: t('gender_female') || (isRtl ? 'أنثى' : 'Female') }
  ];

  const statusOptions = [
    { value: "active", label: t('status_active') || (isRtl ? 'نشط' : 'Active') },
    { value: "paused", label: t('status_paused') || (isRtl ? 'موقوف' : 'Paused') },
    { value: "inactive", label: t('status_inactive') || (isRtl ? 'غير نشط' : 'Inactive') }
  ];

  const paymentOptions = [
    { value: "monthly", label: t('plan_monthly') || (isRtl ? 'اشتراك شهري' : 'Monthly Subscription') },
    { value: "per_hour", label: t('plan_per_hour') || (isRtl ? 'بالساعة' : 'Per Hour') },
    { value: "free", label: t('plan_free') || (isRtl ? 'مجاني / منحة' : 'Free / Scholarship') }
  ];

  const countryOptions = (COUNTRIES_LIST || []).map(c => ({
    value: c.code,
    label: `${c.flag} ${isRtl ? (c.name_ar || c.nameAr) : (c.name_en || c.nameEn)} (${c.code})`
  }));

  const halaqaOptions = halaqasList.map(h => ({
    value: h.id,
    label: h.name
  }));

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="fixed inset-0 z-[1300] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
    >
      
      {/* 🚀 إشعار تنبيهي داخلي */}
      {inlineMessage.text && (
        <div 
          className="fixed top-5 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full z-[1400] flex items-center gap-2 text-xs font-bold text-white shadow-xl animate-fade-in"
          style={{ 
            backgroundColor: inlineMessage.type === 'success' ? colors.brandEmerald.DEFAULT : colors.danger 
          }}
        >
          {inlineMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{inlineMessage.text}</span>
        </div>
      )}

      {/* 📦 النافذة الرئيسية */}
      <div 
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all"
        style={{ 
          backgroundColor: colors.card, 
          borderColor: colors.borderCard 
        }}
      >
        
        {/* 🏷️ رأس النافذة */}
        <div 
          className="px-5 py-4 flex items-center justify-between border-b"
          style={{ 
            backgroundColor: colors.input, 
            borderColor: colors.borderCard 
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{ 
                backgroundColor: 'rgba(217, 119, 6, 0.15)', 
                borderColor: colors.border,
                color: colors.primary 
              }}
            >
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="m-0 text-base font-bold" style={{ color: colors.text }}>
                {t('add_new_student') || (isRtl ? 'إضافة طالب جديد' : 'Add New Student')}
              </h3>
              <p className="m-0 text-xs" style={{ color: colors.textMuted }}>
                {t('add_student_subtitle') || (isRtl ? 'تسجيل بيانات الطالب الجديد في المنظومة' : 'Register new student details')}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1.5 rounded-lg border-0 bg-transparent cursor-pointer transition-colors hover:bg-slate-800/60"
            style={{ color: colors.textMuted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 📦 محتوى النموذج */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex flex-col gap-3.5">
          
          <Input 
            label={t('student_full_name') || (isRtl ? 'اسم الطالب الرباعي' : 'Full Student Name')} 
            value={formData.name} 
            placeholder={isRtl ? 'أدخل اسم الطالب' : 'Enter student name'}
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select 
              label={t('gender') || (isRtl ? 'الجنس' : 'Gender')} 
              value={formData.gender} 
              onChange={(e) => setFormData({...formData, gender: e.target.value})} 
              options={genderOptions}
            />
            <Input 
              label={t('birth_date') || (isRtl ? 'تاريخ الميلاد' : 'Birth Date')} 
              type="date" 
              value={formData.birth_date} 
              onChange={(e) => setFormData({...formData, birth_date: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select 
              label={t('halaqa') || (isRtl ? 'الحلقة الدراسية' : 'Halaqa')} 
              value={formData.halaqa_id} 
              onChange={(e) => setFormData({...formData, halaqa_id: e.target.value})} 
              options={halaqaOptions.length > 0 ? halaqaOptions : [{ value: '', label: isRtl ? 'لا توجد حلقات متاحة' : 'No halaqas available' }]}
            />
            <Select 
              label={t('country_geographic_region') || (isRtl ? 'الدولة / المنطقة' : 'Country')} 
              value={formData.country} 
              onChange={(e) => setFormData({...formData, country: e.target.value})} 
              options={countryOptions}
            />
          </div>

          {/* 👨‍👩‍👦 قسم بيانات ولي الأمر */}
          <div 
            className="p-3.5 rounded-xl border flex flex-col gap-3"
            style={{ 
              backgroundColor: colors.input, 
              borderColor: colors.border 
            }}
          >
            <Input 
              label={t('parent_custody_name') || (isRtl ? 'اسم ولي الأمر' : 'Parent Name')} 
              value={formData.parent_name} 
              placeholder={isRtl ? 'أدخل اسم ولي الأمر' : 'Enter parent name'} 
              onChange={(e) => setFormData({...formData, parent_name: e.target.value})} 
            />
            <Input 
              label={t('contact_hotline') || (isRtl ? 'رقم هاتف ولي الأمر (واتساب)' : 'Parent Phone (WhatsApp)')} 
              type="tel" 
              value={formData.parent_phone} 
              placeholder={isRtl ? 'أدخل رقم الهاتف' : 'Enter phone number'} 
              onChange={(e) => setFormData({...formData, parent_phone: e.target.value})} 
              style={{ textAlign: isRtl ? 'right' : 'left', direction: 'ltr' }} 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select 
              label={t('financial_tariff_plan') || (isRtl ? 'نظام الاشتراك' : 'Subscription Plan')} 
              value={formData.subscription_system} 
              onChange={(e) => setFormData({...formData, subscription_system: e.target.value})} 
              options={paymentOptions}
            />
            <Select 
              label={t('status') || (isRtl ? 'حالة الطالب' : 'Status')} 
              value={formData.status} 
              onChange={(e) => setFormData({...formData, status: e.target.value})} 
              options={statusOptions}
            />
          </div>

          {/* 🔘 الأزرار */}
          <div className="flex gap-2.5 mt-2.5">
            <Btn 
              variant="success" 
              type="submit" 
              disabled={loading} 
              className="flex-1 py-3 flex items-center justify-center gap-1.5 font-bold rounded-xl transition-all active:scale-95"
              style={{ backgroundColor: colors.primary }}
            >
              <GraduationCap className="w-4 h-4" /> 
              {loading ? (t('saving') || (isRtl ? 'جاري الحفظ...' : 'Saving...')) : (t('save_student') || (isRtl ? 'إضافة وحفظ الطالب' : 'Save Student'))}
            </Btn>
            <Btn 
              variant="ghost" 
              type="button" 
              onClick={handleClose} 
              className="px-5 py-3 rounded-xl transition-all hover:bg-slate-800"
              style={{ color: colors.textMuted }}
            >
              {t('cancel') || (isRtl ? 'إلغاء' : 'Cancel')}
            </Btn>
          </div>

        </form>

      </div>
    </div>
  );
}
