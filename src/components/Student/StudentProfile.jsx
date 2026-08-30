// src/components/Student/StudentProfile.jsx

import React, { useState } from 'react';
import { 
  ArrowRight, Edit, Trash2, Phone, Calendar, Globe, MapPin, 
  BookOpen, FileText, UserCheck, UserX, AlertCircle 
} from 'lucide-react';
import { formatName } from '@/utils/formatters';
import StudentDocuments from './StudentDocuments';

const StudentProfile = ({ student, academyId, halaqas = [], onBack, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!student) return null;

  const studentName = formatName(student.name || student.full_name || '');
  const currentHalaqa = halaqas.find((h) => h.id === student.halaqa_id);
  const halaqaName = currentHalaqa
    ? formatName(currentHalaqa.name || currentHalaqa.name_ar || '')
    : 'غير مسكن بحلقة';

  return (
    <div className="space-y-6 text-appText-main">
      {/* شريط التحكم والأزرار العلوي */}
      <div className="bg-dark-card border border-appBorder-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 bg-dark-input hover:bg-appBorder-input/50 text-appText-sub hover:text-appText-main rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
            <span>رجوع</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-appText-main">{studentName}</h1>
            <p className="text-xs text-appText-sub mt-0.5">الملف الشخصي للطالب</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(student)}
            className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            <span>تعديل</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(student.id)}
            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف</span>
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
          نظرة عامة
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
          <span>المستندات والملفات</span>
        </button>
      </div>

      {/* محتوى التبويب */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-card border border-appBorder-card rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-appText-main border-b border-appBorder-card pb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              البيانات الأكاديمية
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-appText-sub block text-xs">الحلقة:</span>
                <span className="text-appText-main font-medium">{halaqaName}</span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">الرواية المفضلة:</span>
                <span className="text-appText-main font-medium">{student.preferred_riwayah || 'غير محددة'}</span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">حالة الطالب:</span>
                <span className="inline-block mt-1">
                  {student.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brandEmerald-bg text-brandEmerald border border-brandEmerald-border">
                      <UserCheck className="w-3 h-3" /> نشط
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <UserX className="w-3 h-3" /> غير نشط
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-appBorder-card rounded-2xl p-5 space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-appText-main border-b border-appBorder-card pb-2">
              البيانات الشخصية وولي الأمر
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-appText-sub block text-xs">الجنس:</span>
                <span className="text-appText-main font-medium">{student.gender === 'female' ? 'أنثى' : 'ذكر'}</span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">تاريخ الميلاد:</span>
                <span className="text-appText-main font-medium" dir="ltr">{student.birth_date || 'غير محدد'}</span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">الدولة:</span>
                <span className="text-appText-main font-medium">{student.country || 'غير محددة'}</span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">ولي الأمر:</span>
                <span className="text-appText-main font-medium">{student.parent_name || 'غير محدد'}</span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">هاتف ولي الأمر:</span>
                <span className="text-appText-main font-medium" dir="ltr">{student.parent_phone || 'غير محدد'}</span>
              </div>
              <div>
                <span className="text-appText-sub block text-xs">واتساب ولي الأمر:</span>
                <span className="text-appText-main font-medium" dir="ltr">{student.parent_whatsapp || 'غير محدد'}</span>
              </div>
            </div>

            {student.notes?.text && (
              <div className="pt-3 border-t border-appBorder-card">
                <span className="text-appText-sub block text-xs mb-1">ملاحظات:</span>
                <p className="text-xs text-appText-sub bg-dark-input p-3 rounded-xl border border-appBorder-input">
                  {student.notes.text}
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
