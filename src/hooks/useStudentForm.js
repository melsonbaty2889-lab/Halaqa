// src/hooks/useStudentForm.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateAge } from '@/utils/dateUtils';

export const useStudentForm = ({ isOpen, studentToEdit, academyId, onSuccess, onClose, t }) => {
  const initialFormState = {
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
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParentFields, setShowParentFields] = useState(true);
  const [isWhatsappManuallyEdited, setIsWhatsappManuallyEdited] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (studentToEdit) {
      const nameObj = typeof studentToEdit.name === 'object' && studentToEdit.name !== null
        ? studentToEdit.name
        : { ar: studentToEdit.name || studentToEdit.full_name || '', en: '' };

      const notesObj = typeof studentToEdit.notes === 'object' && studentToEdit.notes !== null
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
      setShowParentFields(studentToEdit.birth_date ? (calculateAge(studentToEdit.birth_date) ?? 0) < 18 : true);
    } else {
      setFormData(initialFormState);
      setShowParentFields(true);
      setIsWhatsappManuallyEdited(false);
    }
    setErrors({});
  }, [studentToEdit, isOpen]);

  const handleDateChange = (date) => {
    let bDate = '';
    if (date && !isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      bDate = `${year}-${month}-${day}`;
    }

    setFormData((prev) => ({ ...prev, birth_date: bDate }));
    setShowParentFields(bDate ? (calculateAge(bDate) ?? 0) < 18 : true);
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
    setIsWhatsappManuallyEdited(true);
    setFormData((prev) => ({ ...prev, parent_whatsapp: e.target.value }));
  };

  const handleCopyPhoneToWhatsapp = () => {
    setIsWhatsappManuallyEdited(false);
    setFormData((prev) => ({ ...prev, parent_whatsapp: prev.parent_phone }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name_ar.trim()) {
      newErrors.name_ar = t('students.val_name_ar_required', 'يرجى إدخال اسم الطالب بالعربية');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        academy_id: academyId,
        name: { ar: formData.name_ar.trim(), en: formData.name_en.trim() || formData.name_ar.trim() },
        gender: formData.gender,
        birth_date: formData.birth_date || null,
        country: formData.country || null,
        nationality: formData.nationality || null,
        halaqa_id: formData.halaqa_id || null,
        preferred_riwayah: formData.preferred_riwayah || null,
        current_juz: formData.current_juz ? Number(formData.current_juz) : null,
        memorization_system: formData.memorization_system || null,
        parent_name: showParentFields && formData.parent_name.trim() ? formData.parent_name.trim() : null,
        parent_phone: showParentFields && formData.parent_phone.trim() ? formData.parent_phone.trim() : null,
        parent_whatsapp: showParentFields && formData.parent_whatsapp.trim() ? formData.parent_whatsapp.trim() : null,
        notes: formData.notes_text.trim() ? { text: formData.notes_text.trim() } : null,
        updated_at: new Date().toISOString(),
      };

      let resultData = null;
      if (studentToEdit?.id) {
        const { data, error } = await supabase.from('students').update(payload).eq('id', studentToEdit.id).select().single();
        if (error) throw error;
        resultData = data;
      } else {
        const { data, error } = await supabase.from('students').insert([{ ...payload, status: 'active', is_archived: false, created_at: new Date().toISOString() }]).select().single();
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

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    showParentFields,
    setShowParentFields,
    handleDateChange,
    handlePhoneChange,
    handleWhatsappChange,
    handleCopyPhoneToWhatsapp,
    handleSubmit,
  };
};
