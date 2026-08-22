import React, { useState } from 'react';
import { 
  User, Phone, Calendar, BookOpen, Award, FileText, 
  ArrowRight, Edit, Trash2, CheckCircle2, Clock 
} from 'lucide-react';
import { formatName } from '@/utils/formatters';
import StudentStatsCard from './StudentStatsCard';
import StudentDocuments from './StudentDocuments';
import StudentBadges from '@/components/Gamification/StudentBadges';
import AchievementChart from '@/components/Gamification/AchievementChart';

const StudentProfile = ({ student, onBack, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!student) return null;

  // حساب العمر بناءً على تاريخ الميلاد إن وجد
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(student.birth_date);

  return (
    <div className="space-y-6">
      {/* العودة وأزرار التحكم */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800/50 border border-slate-700/50 rounded-xl transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          الرجوع للقائمة
        </button>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(student)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all"
            >
              <Edit className="w-4 h-4 text-amber-400" />
              تعديل
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(student.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              حذف
            </button>
          )}
        </div>
      </div>

      {/* الهيدر البطاقة التعريفية للطالب */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-700/80 border-2 border-primary-500/30 flex items-center justify-center text-slate-300 font-semibold text-2xl shadow-inner shrink-0">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={student.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <User className="w-10 h-10 text-primary-400" />
            )}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100">{formatName(student.name)}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                student.status === 'active' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {student.status === 'active' ? 'نشط' : 'غير نشط'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              {student.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {student.phone}
                </span>
              )}
              {student.halaqa_name && (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  {student.halaqa_name}
                </span>
              )}
              {student.join_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  انضم في {new Date(student.join_date).toLocaleDateString('ar-EG')}
                </span>
              )}
              {age && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {age} سنة
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* التبويبات الداخلية */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          نظرة عامة وإحصائيات
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'badges'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Award className="w-4 h-4" />
          الأوسمة والإنجازات
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'documents'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          المستندات
        </button>
      </div>

      {/* محتوى التبويبات */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <StudentStatsCard studentId={student.id} />
          <AchievementChart studentId={student.id} />
        </div>
      )}

      {activeTab === 'badges' && (
        <StudentBadges studentId={student.id} />
      )}

      {activeTab === 'documents' && (
        <StudentDocuments studentId={student.id} />
      )}
    </div>
  );
};

export default StudentProfile;
