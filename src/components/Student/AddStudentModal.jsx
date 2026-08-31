// src/components/Student/AddStudentModal.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, UserPlus, Edit3, Shield, BookOpen, User, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RIWAYAT_LIST } from '@/constants/riwayat';
import { calculateAge } from '@/utils/dateUtils';
import CustomDatePicker from '@/components/UI/CustomDatePicker';
import CountrySelect from '@/components/UI/CountrySelect';
import CustomSelect from '@/components/UI/CustomSelect';

const AddStudentModal = ({
  isOpen,
  onClose,
  studentToEdit = null,
  academyId,
  halaqas = [],
  onSuccess,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    gender: 'male',
    birth_date: '',
    country: '',
    nationality: '',
    halaqa_id: '',
    preferred_riwayah: '',
    current_juz: null,
    memorization_system: '',
    parent_name: '',
    parent_phone: '',
    parent_whatsapp: '',
    notes_text: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParentFields, setShowParentFields] = useState(true);
  const [isWhatsappManuallyEdited, setIsWhatsappManuallyEdited] = useState(false);

  useEffect(() => {
    if (studentToEdit) {
      const nameObj =
        typeof studentToEdit.name === 'object' && studentToEdit.name !== null
          ? studentToEdit.name
          : { ar: studentToEdit.name || studentToEdit.full_name || '', en: '' };

      const notesObj =
        typeof studentToEdit.notes === 'object' && studentToEdit.notes !== null
          ? studentToEdit.notes
          : { text: studentToEdit.notes || '' };

      const phone = studentToEdit.parent_phone || '';
      const whatsapp = studentToEdit.parent_whatsapp || '';

      setFormData({
        name_ar: nameObj.ar || (typeof studentToEdit.name === 'string' ? studentToEdit.name : ''),
        name_en: nameObj.en || '',
        gender: studentToEdit.gender || 'male',
        birth_date: studentToEdit.birth_date || '',
        country: studentToEdit.country || '',
        nationality: studentToEdit.nationality || '',
        halaqa_id: studentToEdit.halaqa_id || '',
        preferred_riwayah: studentToEdit.preferred_riwayah || '',
        current_juz: studentToEdit.current_juz || null,
        memorization_system: studentToEdit.memorization_system || '',
        parent_name: studentToEdit.parent_name || '',
        parent_phone: phone,
        parent_whatsapp: whatsapp,
        notes_text: notesObj.text || '',
      });

      setIsWhatsappManuallyEdited(Boolean(whatsapp && whatsapp !== phone));

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
        current_juz: null,
        memorization_system: '',
        parent_name: '',
        parent_phone: '',
        parent_whatsapp: '',
        notes_text: '',
      });
      setShowParentFields(true);
      setIsWhatsappManuallyEdited(false);
    }
    setErrors({});
  }, [studentToEdit, isOpen]);

  const handleDateChange = (date) => {
    let bDate = '';
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      bDate = `${year}-${month}-${day}`;
    }

    setFormData((prev) => ({ ...prev, birth_date: bDate }));
    if (bDate) {
      const age = calculateAge(bDate);
      setShowParentFields(age !== null && age < 18);
    } else {
      setShowParentFields(true);
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      parent_phone: val,
      ...(!isWhatsappManuallyEdited ? { parent_whatsapp: val } : {}),
    }));
  };

  const handleWhatsappChange = (e) => {
    const val = e.target.value;
    setIsWhatsappManuallyEdited(true);
    setFormData((prev) => ({ ...prev, parent_whatsapp: val }));
  };

  const handleCopyPhoneToWhatsapp = () => {
    setIsWhatsappManuallyEdited(false);
    setFormData((prev) => ({
      ...prev,
      parent_whatsapp: prev.parent_phone,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name_ar.trim()) {
      newErrors.name_ar = t('students.val_name_ar_required', 'يرجى إدخال اسم الطالب بالعربية');
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

      const notesJson = formData.notes_text.trim() ? { text: formData.notes_text.trim() } : null;

      const payload = {
        academy_id: academyId,
        name: nameJson,
        gender: formData.gender,
        birth_date: formData.birth_date || null,
        country: formData.country || null,
        nationality: formData.nationality || null,
        halaqa_id: formData.halaqa_id || null,
        preferred_riwayah: formData.preferred_riwayah || null,
        current_juz: formData.current_juz || null,
        memorization_system: formData.memorization_system || null,
        parent_name: showParentFields && formData.parent_name.trim() ? formData.parent_name.trim() : null,
        parent_phone: showParentFields && formData.parent_phone.trim() ? formData.parent_phone.trim() : null,
        parent_whatsapp: showParentFields && formData.parent_whatsapp.trim() ? formData.parent_whatsapp.trim() : null,
        notes: notesJson,
        updated_at: new Date().toISOString(),
      };

      let resultData = null;

      if (studentToEdit?.id) {
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
      console.error('Error saving data:', err);
      alert(`${t('common.save_error', 'حدث خطأ أثناء الحفظ:')} ${err.message || ''}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const genderOptions = [
    { label: t('common.male', 'ذكر'), value: 'male' },
    { label: t('common.female', 'أنثى'), value: 'female' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden" dir={i18n.dir()}>
      <div className="bg-dark-card border border-appBorder-card rounded-2xl w-full max-w-2xl max-h-[90dvh] h-[90dvh] md:h-auto flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header - ثابت */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-appBorder-card bg-dark-card shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
              {studentToEdit ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-appText-main leading-snug">
                {studentToEdit
                  ? t('students.edit_title', 'تعديل بيانات الطالب')
                  : t('students.add_title', 'إضافة طالب جديد')}
              </h2>
              <p className="text-xs text-appText-sub">
                {t('students.modal_subtitle', 'إدخال البيانات الأساسية والدولية والعائلية')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-appText-sub hover:text-appText-main rounded-lg hover:bg-dark-input transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content - قابل للتمرير فقط */}
        <form id="add-student-form" onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto min-h-0 flex-1 custom-scrollbar">
          {/* البيانات الأساسية */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{t('students.basic_info', 'البيانات الأساسية')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-appText-sub mb-1.5">
                  {t('students.name_ar', 'الاسم بالعربية')} *
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder={t('students.ph_name_ar', 'ادخل الاسم بالعربية')}
                  className={`w-full px-3 py-2.5 bg-dark-input border ${
                    errors.name_ar ? 'border-rose-500' : 'border-appBorder-input'
                  } rounded-xl text-appText-main text-sm placeholder:text-appText-sub/50 focus:outline-none focus:border-appBorder-hover transition-colors`}
                />
                {errors.name_ar && (
                  <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.name_ar}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-appText-sub mb-1.5">
                  {t('students.name_en', 'الاسم بالإنجليزية')}
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder={t('students.ph_name_en', 'Enter name in English')}
                  className="w-full px-3 py-2.5 bg-dark-input border border-appBorder-input rounded-xl text-appText-main text-sm placeholder:text-appText-sub/50 focus:outline-none focus:border-appBorder-hover transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CustomSelect
                label={t('students.gender', 'الجنس')}
                value={formData.gender}
                onChange={(val) => setFormData({ ...formData, gender: val })}
                options={genderOptions}
              />

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-appText-sub mb-1.5">
                  {t('students.birth_date', 'تاريخ الميلاد')}
                </label>
                <CustomDatePicker
                  selectedDate={formData.birth_date ? new Date(formData.birth_date) : null}
                  onChange={handleDateChange}
                  isArabic={isRtl}
                  showAge={true}
                  placeholder={t('students.ph_birth_date', 'اختر تاريخ الميلاد...')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-appText-sub mb-1.5">
                  {t('students.country', 'دولة الإقامة')}
                </label>
                <CountrySelect
                  value={formData.country}
                  onChange={(code) => setFormData({ ...formData, country: code })}
                  isArabic={isRtl}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-appText-sub mb-1.5">
                  {t('students.nationality', 'الجنسية')}
                </label>
                <CountrySelect
                  value={formData.nationality}
                  onChange={(code) => setFormData({ ...formData, nationality: code })}
                  isArabic={isRtl}
                  placeholder={t('students.ph_select_nationality', 'اختر الجنسية...')}
                />
              </div>
            </div>
          </div>

          {/* الحلقة والتلاوة والمستوى */}
          <div className="space-y-4 pt-4 border-t border-appBorder-card">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{t('students.halaqa_and_recitation', 'الحلقة والتلاوة والمستوى')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomSelect
                label={t('students.select_halaqa', 'تسكين الحلقة')}
                placeholder={t('students.ph_select_halaqa', 'اختر الحلقة...')}
                value={formData.halaqa_id}
                onChange={(val) => setFormData({ ...formData, halaqa_id: val })}
                options={halaqas.map((h) => ({
                  value: h.id,
                  label:
                    typeof h.name === 'object' && h.name !== null
                      ? isRtl ? (h.name.ar || h.name.en) : (h.name.en || h.name.ar)
                      : h.name_ar || h.name,
                }))}
              />

              <CustomSelect
                label={t('students.preferred_riwayah', 'الرواية المفضلة')}
                placeholder={t('students.ph_select_riwayah', 'اختر الرواية...')}
                value={formData.preferred_riwayah}
                onChange={(val) => setFormData({ ...formData, preferred_riwayah: val })}
                options={RIWAYAT_LIST.map((r) => ({
                  value: r.id,
                  label: isRtl ? r.nameAr : (r.nameEn || r.nameAr),
                }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-appText-sub mb-1.5">
                  {t('students.current_juz', 'الجزء الحالي (1 - 30)')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.current_juz || ''}
                  onChange={(e) => setFormData({ ...formData, current_juz: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="1 - 30"
                  className="w-full px-3 py-2 bg-dark-input border border-appBorder-input rounded-xl text-appText-main text-sm focus:outline-none focus:border-appBorder-hover transition-colors"
                />
              </div>

              <CustomSelect
                label={t('students.memorization_system', 'نظام المراجعة/الحفظ')}
                placeholder={t('students.ph_memorization_system', 'اختر النظام...')}
                value={formData.memorization_system || ''}
                onChange={(val) => setFormData({ ...formData, memorization_system: val })}
                options={[
                  { label: t('students.sys_juz', 'أجزاء كاملة'), value: 'juz' },
                  { label: t('students.sys_pages', 'صفحات'), value: 'pages' },
                  { label: t('students.sys_quarters', 'أرباع'), value: 'quarters' },
                ]}
              />
            </div>
          </div>

          {/* بيانات ولي الأمر */}
          <div className="space-y-4 pt-4 border-t border-appBorder-card">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>{t('students.parent_info', 'بيانات ولي الأمر')}</span>
              </h3>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs text-appText-sub">
                  {showParentFields ? t('common.enabled', 'مفعل') : t('common.disabled', 'معطل')}
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showParentFields}
                    onChange={() => setShowParentFields(!showParentFields)}
                    className="sr-only"
                  />
                  <div
                    className={`w-9 h-5 rounded-full transition-colors ${
                      showParentFields ? 'bg-primary' : 'bg-dark-input border border-appBorder-input'
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      showParentFields ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </label>
            </div>

            {showParentFields && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-dark-input/40 p-4 rounded-xl border border-appBorder-card animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-medium text-appText-sub mb-1.5">
                    {t('students.parent_name', 'اسم ولي الأمر')}
                  </label>
                  <input
                    type="text"
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    placeholder={t('students.ph_parent_name', 'ادخل الاسم الكامل')}
                    className="w-full px-3 py-2 bg-dark-input border border-appBorder-input rounded-lg text-appText-main text-sm placeholder:text-appText-sub/50 focus:outline-none focus:border-appBorder-hover transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-appText-sub mb-1.5">
                    {t('students.parent_phone', 'هاتف ولي الأمر')}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={formData.parent_phone}
                    onChange={handlePhoneChange}
                    placeholder={t('students.ph_phone', 'رقم الهاتف مع رمز الدولة')}
                    className="w-full px-3 py-2 bg-dark-input border border-appBorder-input rounded-lg text-appText-main text-sm placeholder:text-appText-sub/50 focus:outline-none focus:border-appBorder-hover transition-colors text-start"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-appText-sub">
                      {t('students.parent_whatsapp', 'واتساب ولي الأمر')}
                    </label>
                    {formData.parent_phone && (
                      <button
                        type="button"
                        onClick={handleCopyPhoneToWhatsapp}
                        className="text-[11px] text-primary hover:underline transition-all"
                      >
                        {t('common.same_as_phone', 'نفس الهاتف')}
                      </button>
                    )}
                  </div>
                  <input
                    type="tel"
                    dir="ltr"
                    value={formData.parent_whatsapp}
                    onChange={handleWhatsappChange}
                    placeholder={t('students.ph_whatsapp', 'رقم الواتساب مع رمز الدولة')}
                    className="w-full px-3 py-2 bg-dark-input border border-appBorder-input rounded-lg text-appText-main text-sm placeholder:text-appText-sub/50 focus:outline-none focus:border-appBorder-hover transition-colors text-start"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ملاحظات */}
          <div>
            <label className="block text-xs font-medium text-appText-sub mb-1.5">
              {t('common.notes', 'ملاحظات إضافية')}
            </label>
            <textarea
              rows={2}
              value={formData.notes_text}
              onChange={(e) => setFormData({ ...formData, notes_text: e.target.value })}
              placeholder={t('students.ph_notes', 'أي ملاحظات تخص الطالب...')}
              className="w-full px-3 py-2 bg-dark-input border border-appBorder-input rounded-xl text-appText-main text-sm placeholder:text-appText-sub/50 focus:outline-none focus:border-appBorder-hover transition-colors resize-none"
            />
          </div>
        </form>

        {/* Footer - ثابت */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-appBorder-card bg-dark-card/95 backdrop-blur-md shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-appText-sub hover:text-appText-main transition-colors"
          >
            {t('common.cancel', 'إلغاء')}
          </button>
          <button
            type="submit"
            form="add-student-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-appText-main rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary-glow disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? t('common.saving', 'جاري الحفظ...')
              : studentToEdit
              ? t('common.save_changes', 'حفظ التعديلات')
              : t('students.add_btn', 'إضافة الطالب')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddStudentModal;
