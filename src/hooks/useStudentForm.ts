import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateAge } from '@/utils/dateUtils';

// ── Types & Interfaces ──────────────────────────────────────────

export interface StudentFormData {
  name: Record<string, string>;
  gender: 'male' | 'female' | string;
  birth_date: string;
  country: string;
  nationality: string;
  halaqa_id: string;
  preferred_riwayah: string;
  current_juz: number | null | string;
  memorization_system: string;
  parent_name: string;
  parent_phone: string;
  parent_whatsapp: string;
  notes_text: string;
}

export interface StudentToEdit {
  id?: string;
  academy_id?: string;
  name?: Record<string, string> | string | null;
  full_name?: string;
  gender?: string;
  birth_date?: string | null;
  country?: string | null;
  nationality?: string | null;
  halaqa_id?: string | null;
  preferred_riwayah?: string | null;
  current_juz?: number | null;
  memorization_system?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  parent_whatsapp?: string | null;
  notes?: { text?: string } | string | null;
  [key: string]: any;
}

export type TranslateFunction = (key: string, fallback?: string) => string;

export interface UseStudentFormProps {
  isOpen?: boolean;
  studentToEdit?: StudentToEdit | null;
  academyId?: string | null;
  onSuccess?: (data: any) => void | Promise<void>;
  onClose?: () => void;
  t?: TranslateFunction;
  currentLang?: string;
}

// ── Initial State ───────────────────────────────────────────────

const initialFormState: StudentFormData = {
  name: { ar: '', en: '' },
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

// ── Main Hook ───────────────────────────────────────────────────

export const useStudentForm = ({
  isOpen = false,
  studentToEdit = null,
  academyId = null,
  onSuccess,
  onClose,
  t,
  currentLang = 'ar',
}: UseStudentFormProps = {}) => {
  const [formData, setFormData] = useState<StudentFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showParentFields, setShowParentFields] = useState<boolean>(true);
  const [isWhatsappManuallyEdited, setIsWhatsappManuallyEdited] = useState<boolean>(false);

  const translate = useCallback(
    (key: string, fallback: string) => (t ? t(key, fallback) : fallback),
    [t]
  );

  useEffect(() => {
    if (!isOpen) return;

    if (studentToEdit) {
      let nameObj: Record<string, string> = {};
      if (typeof studentToEdit.name === 'object' && studentToEdit.name !== null) {
        nameObj = { ...studentToEdit.name };
      } else if (typeof studentToEdit.name === 'string') {
        nameObj = { [currentLang]: studentToEdit.name };
      } else if (studentToEdit.full_name) {
        nameObj = { [currentLang]: studentToEdit.full_name };
      }

      const notesObj =
        typeof studentToEdit.notes === 'object' && studentToEdit.notes !== null
          ? studentToEdit.notes
          : { text: typeof studentToEdit.notes === 'string' ? studentToEdit.notes : '' };

      const phone = studentToEdit.parent_phone || '';
      const whatsapp = studentToEdit.parent_whatsapp || '';

      setFormData({
        name: nameObj,
        gender: studentToEdit.gender || 'male',
        birth_date: studentToEdit.birth_date || '',
        country: studentToEdit.country || '',
        nationality: studentToEdit.nationality || '',
        halaqa_id: studentToEdit.halaqa_id || '',
        preferred_riwayah: studentToEdit.preferred_riwayah || '',
        current_juz: studentToEdit.current_juz ?? null,
        memorization_system: studentToEdit.memorization_system || '',
        parent_name: studentToEdit.parent_name || '',
        parent_phone: phone,
        parent_whatsapp: whatsapp,
        notes_text: notesObj.text || '',
      });

      setIsWhatsappManuallyEdited(Boolean(whatsapp && whatsapp !== phone));
      setShowParentFields(
        studentToEdit.birth_date
          ? (calculateAge(studentToEdit.birth_date) ?? 0) < 18
          : true
      );
    } else {
      setFormData(initialFormState);
      setShowParentFields(true);
      setIsWhatsappManuallyEdited(false);
    }
    setErrors({});
    setSubmitError(null);
  }, [studentToEdit, isOpen, currentLang]);

  const handleNameChange = (langKey: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: {
        ...prev.name,
        [langKey]: value,
      },
    }));
  };

  const handleDateChange = (date: Date | null) => {
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

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      parent_phone: val,
      ...(!isWhatsappManuallyEdited ? { parent_whatsapp: val } : {}),
    }));
  };

  const handleWhatsappChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsWhatsappManuallyEdited(true);
    setFormData((prev) => ({ ...prev, parent_whatsapp: e.target.value }));
  };

  const handleCopyPhoneToWhatsapp = () => {
    setIsWhatsappManuallyEdited(false);
    setFormData((prev) => ({ ...prev, parent_whatsapp: prev.parent_phone }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const hasAnyName = Object.values(formData.name).some((v) => v && v.trim().length > 0);

    if (!hasAnyName) {
      newErrors.name = translate(
        'students.val_name_required',
        'يرجى إدخال اسم الطالب'
      );
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!validate()) return;

    const targetAcademyId = academyId || studentToEdit?.academy_id;
    if (!targetAcademyId) {
      setSubmitError(
        translate('common.academy_required', 'خطأ: لم يتم تحديد الأكاديمية التابع لها الطالب')
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const cleanedName: Record<string, string> = {};
      Object.entries(formData.name).forEach(([lang, val]) => {
        if (val && val.trim()) {
          cleanedName[lang] = val.trim();
        }
      });

      const payload = {
        academy_id: targetAcademyId,
        name: cleanedName,
        gender: formData.gender,
        birth_date: formData.birth_date || null,
        country: formData.country || null,
        nationality: formData.nationality || null,
        halaqa_id: formData.halaqa_id || null,
        preferred_riwayah: formData.preferred_riwayah || null,
        current_juz: formData.current_juz ? Number(formData.current_juz) : null,
        memorization_system: formData.memorization_system || null,
        parent_name:
          showParentFields && formData.parent_name.trim()
            ? formData.parent_name.trim()
            : null,
        parent_phone:
          showParentFields && formData.parent_phone.trim()
            ? formData.parent_phone.trim()
            : null,
        parent_whatsapp:
          showParentFields && formData.parent_whatsapp.trim()
            ? formData.parent_whatsapp.trim()
            : null,
        notes: formData.notes_text.trim()
          ? { text: formData.notes_text.trim() }
          : null,
        updated_at: new Date().toISOString(),
      };

      let resultData: any = null;

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
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Execution error in useStudentForm:', err);
      setSubmitError(err?.message || translate('common.save_error', 'حدث خطأ أثناء الحفظ'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    submitError,
    error: submitError,
    isSubmitting,
    showParentFields,
    setShowParentFields,
    handleNameChange,
    handleDateChange,
    handlePhoneChange,
    handleWhatsappChange,
    handleCopyPhoneToWhatsapp,
    handleSubmit,
  };
};

export default useStudentForm;
