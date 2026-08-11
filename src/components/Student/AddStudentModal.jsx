/* src/components/Student/AddStudentModal.jsx */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

// 🛠️ الخدمات والثوابت والأدوات المساعدة
import { supabase } from "@/lib/supabase";
import { COUNTRIES_LIST } from "@/constants/countries";

// 🧩 المكونات العامة
import { Btn, Input, Select } from "@/components/UI/UI.jsx"; 
import { X, UserPlus, CheckCircle, AlertCircle, GraduationCap } from 'lucide-react';

export default function AddStudentModal({ isOpen, onClose, onStudentAdded, halaqasList = [] }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');

  const [loading, setLoading] = useState(false);
  const [inlineMessage, setInlineMessage] = useState({ text: '', type: '' });

  // 📝 حالات النموذج (Form States)
  const [formData, setFormData] = useState({
    name: '',
    parent_name: '',
    parent_phone: '',
    birth_date: '',
    gender: 'male',
    country: 'EG',
    subscription_system: 'monthly',
    halaqa_id: halaqasList.length > 0 ? halaqasList[0].id : '',
    status: 'active'
  });

  const triggerToast = (text, type = 'success') => {
    setInlineMessage({ text, type });
    setTimeout(() => setInlineMessage({ text: '', type: '' }), 4000);
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
      // توليد كود طالب عشوائي أو تسلسلي مختصر
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
      
      // إغلاق النافذة بعد النجاح بقليل
      setTimeout(() => {
        onClose();
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
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ position: 'fixed', inset: 0, zIndex: 1300, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
      
      {/* 🚀 إشعار تنبيهي داخلي */}
      {inlineMessage.text && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: inlineMessage.type === 'success' ? '#059669' : '#DC2626', color: '#fff', padding: '10px 20px', borderRadius: '30px', zIndex: 1400, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold' }}>
          {inlineMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{inlineMessage.text}</span>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '520px', background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        {/* 🏷️ رأس النافذة */}
        <div style={{ padding: '16px 20px', background: '#0F172A', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '16px', fontWeight: 'bold' }}>
                {t('add_new_student') || (isRtl ? 'إضافة طالب جديد' : 'Add New Student')}
              </h3>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '11px' }}>
                {t('add_student_subtitle') || (isRtl ? 'تسجيل بيانات الطالب الجديد في المنظومة' : 'Register new student details')}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 📦 محتوى النموذج */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <Input 
            label={t('student_full_name') || (isRtl ? 'اسم الطالب الرباعي' : 'Full Student Name')} 
            value={formData.name} 
            placeholder={isRtl ? 'مثال: محمد أحمد علي' : 'e.g., John Doe'}
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

          <div style={{ background: '#0F172A', padding: '12px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Input 
              label={t('parent_custody_name') || (isRtl ? 'اسم ولي الأمر' : 'Parent Name')} 
              value={formData.parent_name} 
              placeholder={isRtl ? 'اسم ولي الأمر (اختياري)' : 'Parent name (optional)'} 
              onChange={(e) => setFormData({...formData, parent_name: e.target.value})} 
            />
            <Input 
              label={t('contact_hotline') || (isRtl ? 'رقم هاتف ولي الأمر (واتساب)' : 'Parent Phone (WhatsApp)')} 
              type="tel" 
              value={formData.parent_phone} 
              placeholder="01234567890" 
              onChange={(e) => setFormData({...formData, parent_phone: e.target.value})} 
              style={{ textAlign: 'left', direction: 'ltr' }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <Btn 
              variant="success" 
              type="submit" 
              disabled={loading} 
              style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 'bold' }}
            >
              <GraduationCap className="w-4 h-4" /> 
              {loading ? (t('saving') || (isRtl ? 'جاري الحفظ...' : 'Saving...')) : (t('save_student') || (isRtl ? 'إضافة وحفظ الطالب' : 'Save Student'))}
            </Btn>
            <Btn 
              variant="ghost" 
              type="button" 
              onClick={onClose} 
              style={{ padding: '12px 20px', color: '#94A3B8' }}
            >
              {t('cancel') || (isRtl ? 'إلغاء' : 'Cancel')}
            </Btn>
          </div>

        </form>

      </div>
    </div>
  );
}
