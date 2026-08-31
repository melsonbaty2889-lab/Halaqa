// src/components/Student/StudentProfile.jsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, ArrowLeft, Edit, Trash2, BookOpen, FileText, 
  UserCheck, UserX, Phone, MessageSquare, Archive, ArchiveRestore 
} from 'lucide-react';
import { formatName, formatRiwayah, formatCountry } from '@/utils/formatters';
import { calculateAge } from '@/utils/dateUtils';
import StudentDocuments from './StudentDocuments';

const StudentProfile = ({ student, academyId, halaqas = [], onBack, onEdit, onDelete, onArchive }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = i18n.dir() === 'rtl';
  const [activeTab, setActiveTab] = useState('overview');

  if (!student) return null;

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const studentName = formatName(student.name || student.full_name || '');
  const currentHalaqa = halaqas.find((h) => h.id === student.halaqa_id);
  const halaqaName = currentHalaqa
    ? formatName(currentHalaqa.name || currentHalaqa.name_ar || '')
    : t('students.no_halaqa', 'غير مسكن بحلقة');

  const age = student.birth_date ? calculateAge(student.birth_date) : null;
  
  // التحقق الدقيق من حالة الأرشفة (مباشرة عبر is_archived أو status)
  const isArchived = Boolean(student.is_archived || student.status === 'archived' || student.status === 'graduated');

  const getMemorizationSystemLabel = (sys) => {
    switch (sys) {
      case 'juz': return t('students.sys_juz', 'أجزاء كاملة');
      case 'pages': return t('students.sys_pages', 'صفحات');
      case 'quarters': return t('students.sys_quarters', 'أرباع');
      case 'hizb': return t('students.sys_hizb', 'أحزاب');
      case 'lines': return t('students.sys_lines', 'أسطر');
      case 'ayah_based': return t('students.sys_ayah_based', 'بالآيات');
      default: return t('common.unspecified', 'غير محدد');
    }
  };

  return (
    <div className="space-y-6 text-appText-main" dir={i18n.dir()}>
      {/* شريط التحكم والأزرار العلوي */}
      <div className="bg-dark-card border border-appBorder-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 bg-dark-input hover:bg-appBorder-input/50 text-appText-sub hover:text-appText-main rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <BackIcon className="w-5 h-5" />
            <span>{t('common.back', 'رجوع')}</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-appText-main">{studentName}</h1>
            <p className="text-xs text-appText-sub mt-0.5">
              {t('students.profile_subtitle', 'الملف الشخصي للطالب')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onEdit && onEdit(student)}
            className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            <span>{t('common.edit', 'تعديل')}</span>
          </button>

          {/* زر الأرشفة التكيفي الحرج */}
          <button
            type="button"
            onClick={() => onArchive && onArchive(student)}
            className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isArchived
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/20'
            }`}
          >
            {isArchived ? (
              <>
                <ArchiveRestore className="w-4 h-4" />
                <span>{t('students.unarchive', 'إلغاء الأرشفة')}</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                <span>{t('students.archive', 'أرشفة')}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onDelete && onDelete(student.id)}
            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('common.delete', 'حذف')}</span>
          </button>
        </div>
      </div>

      {/* التبويبات Tabs */}
      <div className="flex items-center gap-2 border-b border-appBorder-card pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-primary text-appText-main shadow-md shadow-primary-glow font-bold'
              : 'text-appText-sub hover:bg-dark-card hover:text-appText-main'
          }`}
        >
          {t('students.tab_overview', 'نظرة عامة')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'bg-primary text-appText-main shadow-md shadow-primary-glow font-bold'
              : 'text-appText-sub hover:bg-dark-card hover:text-appText-main'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('students.tab_documents', 'المستندات والملفات')}</span>
        </button>
      </div>

      {/* محتوى التبويب */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-card border border-appBorder-card rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-appText-main border-b border-appBorder-card pb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>{t('students.academic_info', 'البيانات الأكاديمية')}</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-appText-sub block text-xs">{t('students.halaqa', 'الحلقة:')}</span>
                <span className="text-appText-main font-medium">{halaqaName}</span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">{t('students.preferred_riwayah', 'الرواية المفضلة:')}</span>
                <span className="text-appText-main font-medium">
                  {formatRiwayah(student.preferred_riwayah, currentLang, t('common.unspecified', 'غير محددة'))}
                </span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">{t('students.current_juz', 'الجزء الحالي:')}</span>
                <span className="text-appText-main font-medium">
                  {student.current_juz ? `${t('students.juz', 'الجزء')} ${student.current_juz}` : t('common.unspecified', 'غير محدد')}
                </span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">{t('students.memorization_system', 'نظام المراجعة:')}</span>
                <span className="text-appText-main font-medium">
                  {getMemorizationSystemLabel(student.memorization_system)}
                </span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">{t('students.status', 'حالة الطالب:')}</span>
                <span className="inline-block mt-1">
                  {isArchived ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <Archive className="w-3 h-3" />
                      <span>{student.status === 'graduated' ? t('common.graduated', 'متخرج') : t('common.archived', 'مؤرشف')}</span>
                    </span>
                  ) : student.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <UserCheck className="w-3 h-3" />
                      <span>{t('common.active', 'نشط')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <UserX className="w-3 h-3" />
                      <span>{t('common.inactive', 'غير نشط')}</span>
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-appBorder-card rounded-2xl p-5 space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-appText-main border-b border-appBorder-card pb-2">
              {t('students.personal_and_parent_info', 'البيانات الشخصية وولي الأمر')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-appText-sub block text-xs">{t('students.gender', 'الجنس:')}</span>
                <span className="text-appText-main font-medium">
                  {student.gender === 'female' ? t('common.female', 'أنثى') : t('common.male', 'ذكر')}
                </span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">{t('students.birth_date', 'تاريخ الميلاد والعمر:')}</span>
                <div className="text-appText-main font-medium flex items-center gap-2 mt-0.5" dir={isRtl ? 'rtl' : 'ltr'}>
                  <span dir="ltr" className="text-sm">{student.birth_date || t('common.unspecified', 'غير محدد')}</span>
                  {age !== null && (
                    <span className="text-xs text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-md">
                      ({age} {t('common.years_old', 'سنة')})
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">{t('students.country', 'دولة الإقامة:')}</span>
                <span className="text-appText-main font-medium">
                  {formatCountry(student.country, currentLang, t('common.unspecified', 'غير محددة'))}
                </span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">{t('students.nationality', 'الجنسية:')}</span>
                <span className="text-appText-main font-medium">
                  {formatCountry(student.nationality, currentLang, t('common.unspecified', 'غير محددة'))}
                </span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">{t('students.parent_name', 'ولي الأمر:')}</span>
                <span className="text-appText-main font-medium">
                  {student.parent_name || t('common.unspecified', 'غير محدد')}
                </span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">{t('students.parent_phone', 'هاتف ولي الأمر:')}</span>
                {student.parent_phone ? (
                  <a
                    href={`tel:${student.parent_phone}`}
                    className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                    dir="ltr"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{student.parent_phone}</span>
                  </a>
                ) : (
                  <span className="text-appText-main font-medium">{t('common.unspecified', 'غير محدد')}</span>
                )}
              </div>
              <div>
                <span className="text-appText-sub block text-xs">{t('students.parent_whatsapp', 'واتساب ولي الأمر:')}</span>
                {(student.parent_whatsapp || student.parent_phone) ? (
                  <a
                    href={`https://wa.me/${(student.parent_whatsapp || student.parent_phone).replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
                    dir="ltr"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{student.parent_whatsapp || student.parent_phone}</span>
                  </a>
                ) : (
                  <span className="text-appText-main font-medium">{t('common.unspecified', 'غير محدد')}</span>
                )}
              </div>
            </div>

            {student.notes && (typeof student.notes === 'string' ? student.notes : student.notes?.text) && (
              <div className="pt-3 border-t border-appBorder-card">
                <span className="text-appText-sub block text-xs mb-1">{t('common.notes', 'ملاحظات:')}</span>
                <p className="text-xs text-appText-sub bg-dark-input p-3 rounded-xl border border-appBorder-input">
                  {typeof student.notes === 'string' ? student.notes : student.notes?.text}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <StudentDocuments 
          studentId={student.id} 
          studentName={studentName} 
        />
      )}
    </div>
  );
};

export default StudentProfile;
