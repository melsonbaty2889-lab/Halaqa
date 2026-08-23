import React, { useState, useEffect } from 'react';
import { 
  User, Phone, Calendar, BookOpen, Award, FileText, 
  ArrowRight, Edit, Trash2, Clock 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/supabaseClient';
import { formatName } from '@/utils/formatters';
import StudentStatsCard from './StudentStatsCard';
import StudentDocuments from './StudentDocuments';
import StudentBadges from '@/components/Gamification/StudentBadges';
import AchievementChart from '@/components/Gamification/AchievementChart';

const StudentProfile = ({ student, onBack, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // حالات الإحصائيات والشارات
  const [stats, setStats] = useState({
    streakDays: 0,
    totalPoints: 0,
    weeklyData: [],
    badges: []
  });

  useEffect(() => {
    async function fetchStudentAnalytics() {
      if (!student?.id) return;
      setLoading(true);

      try {
        // 1. جلب سجلات الحضور والتسميع الأخيرة للطالب
        const { data: attendanceData, error: attError } = await supabase
          .from('attendance')
          .select('date, status, new_memorization, retention_assignment, session_grade')
          .eq('student_id', student.id)
          .order('date', { ascending: false });

        if (attError) throw attError;

        // 2. جلب الشارات المكتسبة للطالب من جدول student_badges مع الشارات المتاحة
        const { data: badgesData, error: badgeError } = await supabase
          .from('student_badges')
          .select('*, badge:badges(*)')
          .eq('student_id', student.id);

        if (badgeError) throw badgeError;

        // --- حساب متتالية الحضور (Streak Days) ---
        let streak = 0;
        if (attendanceData && attendanceData.length > 0) {
          for (const record of attendanceData) {
            if (record.status === 'present' || record.status === 'late') {
              streak++;
            } else if (record.status === 'absent') {
              break;
            }
          }
        }

        // --- تحويل بيانات التسميع إلى رسم بياني أسبوعي ---
        // نأخذ آخر 7 سجلات
        const daysMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const recentWeekly = (attendanceData || []).slice(0, 7).map((item) => {
          const d = new Date(item.date);
          const dayKey = daysMap[d.getDay()];
          // اعتبار الصفحة = 1 إذا وُجد مقطع جديد، أو استخدام القيمة إن وجدت
          const pages = item.new_memorization ? 1 : 0; 
          return { dayKey, pages };
        });

        // --- تنسيق الشارات للعرض ---
        const formattedBadges = (badgesData || []).map((b) => ({
          id: b.id,
          key: b.badge?.key || 'hifzSpark',
          title: b.badge?.title || b.reason || t('gamification.badgeAwarded', 'وسام تميز'),
          desc: b.badge?.description || '',
          unlocked: true,
          tier: b.metadata?.tier || 'Gold'
        }));

        setStats({
          streakDays: streak,
          totalPoints: streak * 15, // حساب نقاط تقريبي على كل يوم التزام
          weeklyData: recentWeekly,
          badges: formattedBadges
        });
      } catch (err) {
        console.error('Error loading student analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentAnalytics();
  }, [student?.id, t]);

  if (!student) return null;

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
          {t('common.backToList', 'الرجوع للقائمة')}
        </button>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(student)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all"
            >
              <Edit className="w-4 h-4 text-amber-400" />
              {t('common.edit', 'تعديل')}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(student.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              {t('common.delete', 'حذف')}
            </button>
          )}
        </div>
      </div>

      {/* الهيدر البطاقة التعريفية للطالب */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-700/80 border-2 border-amber-500/30 flex items-center justify-center text-slate-300 font-semibold text-2xl shadow-inner shrink-0">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt={student.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <User className="w-10 h-10 text-amber-400" />
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
                {student.status === 'active' ? t('common.active', 'نشط') : t('common.inactive', 'غير نشط')}
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
                  {new Date(student.join_date).toLocaleDateString('ar-EG')}
                </span>
              )}
              {age && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {age} {t('common.years', 'سنة')}
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
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          {t('gamification.tabs.overview', 'نظرة عامة وإحصائيات')}
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'badges'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Award className="w-4 h-4" />
          {t('gamification.tabs.badges', 'الأوسمة والإنجازات')}
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'documents'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          {t('gamification.tabs.documents', 'المستندات')}
        </button>
      </div>

      {/* محتوى التبويبات */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">
          {t('common.loading', 'جاري تحميل بيانات الطالب...')}
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <StudentStatsCard 
                streakDays={stats.streakDays} 
                totalPoints={stats.totalPoints} 
              />
              <AchievementChart weeklyData={stats.weeklyData} />
            </div>
          )}

          {activeTab === 'badges' && (
            <StudentBadges badges={stats.badges} />
          )}

          {activeTab === 'documents' && (
            <StudentDocuments studentId={student.id} />
          )}
        </>
      )}
    </div>
  );
};

export default StudentProfile;
