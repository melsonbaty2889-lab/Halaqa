import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit3, Shield, BookOpen, User, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RIWAYAT_LIST } from '@/constants/riwayat';
import CustomDatePicker from '@/components/UI/CustomDatePicker';
import CountrySelect from '@/components/UI/CountrySelect';

const AddStudentModal = ({
  isOpen,
  onClose,
  studentToEdit = null,
  academyId,
  halaqas = [],
  onSuccess,
  onStudentAdded,
}) => {
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    gender: 'male',
    birth_date: '',
    country: '',
    nationality: '',
    halaqa_id: '',
    preferred_riwayah: '',
    parent_name: '',
    parent_phone: '',
    parent_whatsapp: '',
    notes_text: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParentFields, setShowParentFields] = useState(true);

  useEffect(() => {
    if (studentToEdit) {
      const nameObj =
        typeof studentToEdit.name === 'object' && studentToEdit.name !== null
          ? studentToEdit.name
          : { ar: studentToEdit.name || '', en: '' };

      const notesObj =
        typeof studentToEdit.notes === 'object' && studentToEdit.notes !== null
          ? studentToEdit.notes
          : { text: studentToEdit.notes || '' };

      setFormData({
        name_ar: nameObj.ar || '',
        name_en: nameObj.en || '',
        gender: studentToEdit.gender || 'male',
        birth_date: studentToEdit.birth_date || '',
        country: studentToEdit.country || '',
        nationality: studentToEdit.nationality || '',
        halaqa_id: studentToEdit.halaqa_id || '',
        preferred_riwayah: studentToEdit.preferred_riwayah || '',
        parent_name: studentToEdit.parent_name || '',
        parent_phone: studentToEdit.parent_phone || '',
        parent_whatsapp: studentToEdit.parent_whatsapp || '',
        notes_text: notesObj.text || '',
      });

      if (studentToEdit.birth_date) {
        const age = calculateAge(studentToEdit.birth_date);
        setShowParentFields(age !== null && age < 18);
      }
    } else {
      setFormData({
        name_ar: '',
        name_en: '',
        gender: 'male',
        birth_date: '',
        country: '',
        nationality: '',
        halaqa_id: '',
        preferred_riwayah: '',
        parent_name: '',
        parent_phone: '',
        parent_whatsapp: '',
        notes_text: '',
      });
      setShowParentFields(true);
    }
    setErrors({});
  }, [studentToEdit, isOpen]);

  // تحديث تاريخ الميلاد وحساب السن تلقائياً
  const handleDateChange = (date) => {
    const bDate = date ? date.toISOString().split('T')[0] : '';
    setFormData((prev) => ({ ...prev, birth_date: bDate }));
    if (bDate) {
      const age = calculateAge(bDate);
      setShowParentFields(age !== null && age < 18);
    } else {
      setShowParentFields(true);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name_ar.trim()) {
      newErrors.name_ar = 'اسم الطالب بالعربية مطلوب';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const nameJson = {
        ar: formData.name_ar.trim(),
        en: formData.name_en.trim() || formData.name_ar.trim(),
      };

      const notesJson = formData.notes_text.trim() ? { text: formData.notes_text.trim() } : {};

      const payload = {
        academy_id: academyId,
        name: nameJson,
        gender: formData.gender,
        birth_date: formData.birth_date || null,
        country: formData.country || null,
        nationality: formData.nationality || null,
        halaqa_id: formData.halaqa_id || null,
        preferred_riwayah: formData.preferred_riwayah || null,
        parent_name: showParentFields ? formData.parent_name : null,
        parent_phone: showParentFields ? formData.parent_phone : null,
        parent_whatsapp: showParentFields ? formData.parent_whatsapp : null,
        notes: notesJson,
        updated_at: new Date().toISOString(),
      };

      let resultData = null;

      if (studentToEdit) {
        const { data, error } = await supabase
          .from('students')
          .update(payload)
          .eq('id', studentToEdit.id)
          .select()
          .single();

        if (error) throw error;
        resultData = data;
      } else {
        const { data, error } = await supabase
          .from('students')
          .insert([
            {
              ...payload,
              status: 'active',
              is_archived: false,
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        resultData = data;
      }

      if (onSuccess) await onSuccess(resultData);

      onClose();
    } catch (err) {
      console.error('خطأ أثناء حفظ البيانات:', err);
      alert(`حدث خطأ أثناء الحفظ: ${err.message || 'يرجى التثبت من البيانات والأذونات'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary-500/10 text-primary-400 rounded-xl">
              {studentToEdit ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                {studentToEdit ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
              </h2>
              <p className="text-xs text-slate-400">إدخال البيانات الأساسية والدولية والعائلية</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="add-student-form" onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" /> البيانات الأساسية
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  الاسم بالعربية *
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="مثال: عمار محمد"
                  className={`w-full px-3 py-2.5 bg-slate-800 border ${
                    errors.name_ar ? 'border-rose-500' : 'border-slate-700'
                  } rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors`}
                />
                {errors.name_ar && (
                  <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name_ar}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  الاسم بالإنجليزية
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Ammar Mohamed"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">الجنس</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>

              {/* حقل تاريخ الميلاد مع المكون المخصص */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  تاريخ الميلاد
                </label>
                <CustomDatePicker
                  selectedDate={formData.birth_date ? new Date(formData.birth_date) : null}
                  onChange={handleDateChange}
                  isArabic={true}
                  showAge={true}
                  placeholder="اختر تاريخ الميلاد..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* حقل اختيار الدولة مع المكون المخصص البحثي */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  دولة الإقامة
                </label>
                <CountrySelect
                  value={formData.country}
                  onChange={(code) => setFormData({ ...formData, country: code })}
                  isArabic={true}
                />
              </div>
            </div>
          </div>

          {/* الحلقة والرواية */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> الحلقة والتلاوة
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  تسكين الحلقة
                </label>
                <select
                  value={formData.halaqa_id}
                  onChange={(e) => setFormData({ ...formData, halaqa_id: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="">اختر الحلقة...</option>
                  {halaqas.map((h) => {
                    const hName =
                      typeof h.name === 'object' && h.name !== null
                        ? h.name.ar || h.name.en
                        : h.name_ar || h.name;
                    return (
                      <option key={h.id} value={h.id}>
                        {hName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  الرواية المفضلة
                </label>
                <select
                  value={formData.preferred_riwayah}
                  onChange={(e) => setFormData({ ...formData, preferred_riwayah: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="">اختر الرواية...</option>
                  {RIWAYAT_LIST.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* بيانات ولي الأمر */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> بيانات ولي الأمر
              </h3>
              <button
                type="button"
                onClick={() => setShowParentFields(!showParentFields)}
                className="text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
              >
                {showParentFields ? 'إخفاء حقول ولي الأمر' : 'إظهار حقول ولي الأمر'}
              </button>
            </div>

            {showParentFields && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    اسم ولي الأمر
                  </label>
                  <input
                    type="text"
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    placeholder="اسم ولي الأمر"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    هاتف ولي الأمر
                  </label>
                  <input
                    type="tel"
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                    placeholder="+20 123456789"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    واتساب ولي الأمر
                  </label>
                  <input
                    type="tel"
                    value={formData.parent_whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, parent_whatsapp: e.target.value })
                    }
                    placeholder="+20 123456789"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ملاحظات */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              ملاحظات إضافية
            </label>
            <textarea
              rows={2}
              value={formData.notes_text}
              onChange={(e) => setFormData({ ...formData, notes_text: e.target.value })}
              placeholder="أي ملاحظات تخص الطالب..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-slate-800 bg-slate-900 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="add-student-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
          >
            {isSubmitting ? 'جاري الحفظ...' : studentToEdit ? 'حفظ التعديلات' : 'إضافة الطالب'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddStudentModal;
