import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, UserPlus, Edit3, Shield, BookOpen, User, AlertCircle } from 'lucide-react';
import { RIWAYAT_LIST } from '@/constants/riwayat';
import CustomDatePicker from '@/components/UI/CustomDatePicker';
import CountrySelect from '@/components/UI/CountrySelect';
import Select from '@/components/UI/Select';
import PhoneInput from '@/components/UI/PhoneInput';
import { useStudentForm } from '@/hooks/useStudentForm';

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const AddStudentModal = ({
  isOpen,
  onClose,
  studentToEdit = null,
  academyId,
  halaqas = [],
  onSuccess,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = i18n.dir() === 'rtl';

  const {
    formData,
    setFormData,
    errors,
    submitError,
    isSubmitting,
    showParentFields,
    setShowParentFields,
    handleNameChange,
    handleDateChange,
    handlePhoneCountryChange,
    handlePhoneChange,
    handleWhatsappCountryChange,
    handleWhatsappChange,
    handleCopyPhoneToWhatsapp,
    handleSubmit,
  } = useStudentForm({ isOpen, studentToEdit, academyId, onSuccess, onClose, t, currentLang });

  if (!isOpen) return null;

  const genderOptions = [
    { label: t('common.male', 'ذكر'), value: 'male' },
    { label: t('common.female', 'أنثى'), value: 'female' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="bg-semantic-surfaceCard border border-semantic-borderCard rounded-2xl w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col shadow-2xl relative my-auto text-semantic-textPrimary">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-semantic-borderCard bg-semantic-surfaceCard rounded-t-2xl shrink-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-semantic-actionPrimary/10 text-semantic-actionPrimary rounded-xl shrink-0">
              {studentToEdit ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-semantic-textPrimary leading-snug">
                {studentToEdit
                  ? t('students.edit_title', 'تعديل بيانات الطالب')
                  : t('students.add_title', 'إضافة طالب جديد')}
              </h2>
              <p className="text-xs text-semantic-textSecondary">
                {t('students.modal_subtitle', 'إدخال البيانات الأساسية والدولية والعائلية')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-semantic-textSecondary hover:text-semantic-textPrimary rounded-lg hover:bg-semantic-surfaceInput transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form 
          id="add-student-form" 
          onSubmit={handleSubmit} 
          className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar min-h-0"
        >
          {submitError && (
            <div className="p-3 rounded-xl text-xs bg-semantic-danger/10 text-semantic-danger border border-semantic-danger/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* 1. البيانات الأساسية */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-semantic-actionPrimary uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{t('students.basic_info', 'البيانات الأساسية')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-semantic-textSecondary mb-1.5">
                  {t('students.name_ar', 'الاسم بالعربية')} *
                </label>
                <input
                  type="text"
                  value={formData.name.ar || ''}
                  onChange={(e) => handleNameChange('ar', e.target.value)}
                  placeholder={t('students.ph_name_ar', 'ادخل الاسم بالعربية')}
                  className={`w-full px-3 py-2.5 bg-semantic-surfaceInput border ${
                    errors.name ? 'border-semantic-error' : 'border-semantic-borderInput'
                  } rounded-xl text-semantic-textPrimary text-sm placeholder:text-semantic-textSecondary/50 focus:outline-none focus:border-semantic-actionPrimary transition-colors`}
                />
                {errors.name && (
                  <p className="text-semantic-error text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-semantic-textSecondary mb-1.5">
                  {t('students.name_en', 'الاسم بالإنجليزية')}
                </label>
                <input
                  type="text"
                  value={formData.name.en || ''}
                  onChange={(e) => handleNameChange('en', e.target.value)}
                  placeholder={t('students.ph_name_en', 'Enter name in English')}
                  className="w-full px-3 py-2.5 bg-semantic-surfaceInput border border-semantic-borderInput rounded-xl text-semantic-textPrimary text-sm placeholder:text-semantic-textSecondary/50 focus:outline-none focus:border-semantic-actionPrimary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label={t('students.gender', 'الجنس')}
                value={formData.gender}
                onChange={(val) => setFormData({ ...formData, gender: val })}
                options={genderOptions}
              />

              <div className="sm:col-span-2">
                <CustomDatePicker
                  label={t('students.birth_date', 'تاريخ الميلاد')}
                  value={parseLocalDate(formData.birth_date)}
                  selectedDate={parseLocalDate(formData.birth_date)}
                  onChange={handleDateChange}
                  lang={isRtl ? 'ar' : 'en'}
                  showAge={true}
                  disableFuture={true}
                  placeholder={t('students.ph_birth_date', 'اختر تاريخ الميلاد...')}
                  t={t}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative z-10">
                <label className="block text-xs font-medium text-semantic-textSecondary mb-1.5">
                  {t('students.country', 'دولة الإقامة')}
                </label>
                <CountrySelect
                  value={formData.country}
                  onChange={(code) => setFormData({ ...formData, country: code })}
                  isArabic={isRtl}
                />
              </div>

              <div className="relative z-10">
                <label className="block text-xs font-medium text-semantic-textSecondary mb-1.5">
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

          {/* 2. الحلقة والتلاوة والمستوى */}
          <div className="space-y-4 pt-4 border-t border-semantic-borderCard">
            <h3 className="text-xs font-semibold text-semantic-actionPrimary uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{t('students.halaqa_and_recitation', 'الحلقة والتلاوة والمستوى')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative z-10">
                <Select
                  label={t('students.select_halaqa', 'تسكين الحلقة')}
                  placeholder={t('students.ph_select_halaqa', 'اختر الحلقة...')}
                  value={formData.halaqa_id}
                  onChange={(val) => setFormData({ ...formData, halaqa_id: val })}
                  options={halaqas.map((h) => ({
                    value: h.id,
                    label:
                      typeof h.name === 'object' && h.name !== null
                        ? isRtl ? (h.name.ar || h.name.en || '') : (h.name.en || h.name.ar || '')
                        : h.name_ar || h.name || '',
                  }))}
                />
              </div>

              <div className="relative z-10">
                <Select
                  label={t('students.preferred_riwayah', 'الرواية المفضلة')}
                  placeholder={t('students.ph_select_riwayah', 'اختر الرواية...')}
                  value={formData.preferred_riwayah}
                  onChange={(val) => setFormData({ ...formData, preferred_riwayah: val })}
                  options={(RIWAYAT_LIST || []).map((r) => ({
                    value: r.id,
                    label: isRtl ? r.nameAr || r.name : r.nameEn || r.nameAr || r.name,
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-semantic-textSecondary mb-1.5">
                  {t('students.current_juz', 'الجزء الحالي (1 - 30)')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.current_juz ?? ''}
                  onChange={(e) => setFormData({ ...formData, current_juz: e.target.value ? parseInt(e.target.value, 10) : null })}
                  placeholder="1 - 30"
                  className="w-full px-3 py-2 bg-semantic-surfaceInput border border-semantic-borderInput rounded-xl text-semantic-textPrimary text-sm focus:outline-none focus:border-semantic-actionPrimary transition-colors"
                />
              </div>

              <div className="relative z-10">
                <Select
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
          </div>

          {/* 3. بيانات ولي الأمر */}
          <div className="space-y-4 pt-4 border-t border-semantic-borderCard">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-semantic-actionPrimary uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>{t('students.parent_info', 'بيانات ولي الأمر')}</span>
              </h3>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs text-semantic-textSecondary">
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
                      showParentFields ? 'bg-semantic-actionPrimary' : 'bg-semantic-surfaceInput border border-semantic-borderInput'
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
              <div className="space-y-4 bg-semantic-surfaceInput/40 p-4 rounded-xl border border-semantic-borderCard animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-medium text-semantic-textSecondary mb-1.5">
                    {t('students.parent_name', 'اسم ولي الأمر')}
                  </label>
                  <input
                    type="text"
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    placeholder={t('students.ph_parent_name', 'ادخل الاسم الكامل')}
                    className="w-full px-3 py-2 bg-semantic-surfaceInput border border-semantic-borderInput rounded-lg text-semantic-textPrimary text-sm placeholder:text-semantic-textSecondary/50 focus:outline-none focus:border-semantic-actionPrimary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* هاتف ولي الأمر */}
                  <PhoneInput
                    label={t('students.parent_phone', 'هاتف ولي الأمر')}
                    countryCode={formData.parent_phone_country}
                    phone={formData.parent_phone}
                    onCountryChange={handlePhoneCountryChange}
                    onPhoneChange={handlePhoneChange}
                    error={errors.parent_phone}
                    lang={currentLang}
                    activeRtl={isRtl}
                    t={t}
                  />

                  {/* واتساب ولي الأمر */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      {formData.parent_phone && (
                        <button
                          type="button"
                          onClick={handleCopyPhoneToWhatsapp}
                          className="text-[11px] text-semantic-actionPrimary hover:underline transition-all cursor-pointer mr-auto"
                        >
                          {t('common.same_as_phone', 'نفس الهاتف')}
                        </button>
                      )}
                    </div>
                    <PhoneInput
                      label={t('students.parent_whatsapp', 'واتساب ولي الأمر')}
                      countryCode={formData.parent_whatsapp_country}
                      phone={formData.parent_whatsapp}
                      onCountryChange={handleWhatsappCountryChange}
                      onPhoneChange={handleWhatsappChange}
                      error={errors.parent_whatsapp}
                      lang={currentLang}
                      activeRtl={isRtl}
                      t={t}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. ملاحظات */}
          <div>
            <label className="block text-xs font-medium text-semantic-textSecondary mb-1.5">
              {t('common.notes', 'ملاحظات إضافية')}
            </label>
            <textarea
              rows={2}
              value={formData.notes_text}
              onChange={(e) => setFormData({ ...formData, notes_text: e.target.value })}
              placeholder={t('students.ph_notes', 'أي ملاحظات تخص الطالب...')}
              className="w-full px-3 py-2 bg-semantic-surfaceInput border border-semantic-borderInput rounded-xl text-semantic-textPrimary text-sm placeholder:text-semantic-textSecondary/50 focus:outline-none focus:border-semantic-actionPrimary transition-colors resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-semantic-borderCard bg-semantic-surfaceCard rounded-b-2xl shrink-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-semantic-textSecondary hover:text-semantic-textPrimary transition-colors cursor-pointer"
          >
            {t('common.cancel', 'إلغاء')}
          </button>
          <button
            type="submit"
            form="add-student-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-semantic-actionPrimary hover:bg-semantic-actionPrimary/90 text-white rounded-xl text-sm font-bold transition-all shadow-lg disabled:opacity-50 cursor-pointer"
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
