import React, { useState, useEffect } from 'react';
import { 
  User, Phone, Calendar, BookOpen, Award, FileText, 
  ArrowRight, Edit, Trash2, Flame, Crown, TrendingUp, Sparkles, Zap 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/supabaseClient';
import { formatName } from '@/utils/formatters';
import StudentDocuments from './StudentDocuments';
import StudentBadges from '@/components/Gamification/StudentBadges';
import AchievementChart from '@/components/Gamification/AchievementChart';
import confetti from 'canvas-confetti';

const StudentProfile = ({ student, onBack, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ streakDays: 0, totalPoints: 0, weeklyData: [], badges: [] });

  useEffect(() => {
    async function fetchStudentAnalytics() {
      if (!student?.id) return;
      setLoading(true);

      try {
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('date, status, new_memorization')
          .eq('student_id', student.id)
          .order('date', { ascending: false });

        const { data: badgesData } = await supabase
          .from('student_badges')
          .select('*, badge:badges(*)')
          .eq('student_id', student.id);

        let streak = 0;
        if (attendanceData) {
          for (const r of attendanceData) {
            if (r.status === 'present' || r.status === 'late') streak++;
            else if (r.status === 'absent') break;
          }
        }

        const daysMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const recentWeekly = (attendanceData || []).slice(0, 7).map((item) => ({
          dayKey: daysMap[new Date(item.date).getDay()],
          pages: item.new_memorization ? 1 : 0
        }));

        setStats({
          streakDays: streak,
          totalPoints: streak * 15,
          weeklyData: recentWeekly,
          badges: (badgesData || []).map(b => ({ id: b.id, key: b.badge?.key || 'hifzSpark', unlocked: true }))
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudentAnalytics();
  }, [student?.id]);

  const triggerCelebration = () => {
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 }, colors: ['#f59e0b', '#fbbf24', '#3b82f6'] });
  };

  if (!student) return null;

  return (
    <div className="space-y-6">
      {/* الأزرار العلوية */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-xl transition-all">
          <ArrowRight className="w-4 h-4" /> {t('common.backToList', 'الرجوع')}
        </button>
        <div className="flex items-center gap-2">
          {onEdit && <button onClick={() => onEdit(student)} className="px-3.5 py-2 text-sm text-slate-300 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800"><Edit className="w-4 h-4 text-amber-400 inline ml-1" />تعديل</button>}
          {onDelete && <button onClick={() => onDelete(student.id)} className="px-3.5 py-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20"><Trash2 className="w-4 h-4 inline ml-1" />حذف</button>}
        </div>
      </div>

      {/* بطاقة تعريف الطالب */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-amber-500/30 flex items-center justify-center text-slate-300 font-semibold text-2xl shrink-0">
            {student.avatar_url ? <img src={student.avatar_url} alt={student.name} className="w-full h-full rounded-2xl object-cover" /> : <User className="w-10 h-10 text-amber-400" />}
          </div>
          <div className="space-y-1.5 flex-1 text-center sm:text-right">
            <h1 className="text-2xl font-bold text-slate-100">{formatName(student.name)}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              {student.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{student.phone}</span>}
              {student.halaqa_name && <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{student.halaqa_name}</span>}
              {student.join_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(student.join_date).toLocaleDateString('ar-EG')}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {['overview', 'badges', 'documents'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}>
            {tab === 'overview' && <BookOpen className="w-4 h-4" />}
            {tab === 'badges' && <Award className="w-4 h-4" />}
            {tab === 'documents' && <FileText className="w-4 h-4" />}
            {tab === 'overview' ? 'الإحصائيات' : tab === 'badges' ? 'الأوسمة والتحديات' : 'المستندات'}
          </button>
        ))}
      </div>

      {loading ? <div className="p-8 text-center text-xs text-slate-500">جاري التحميل...</div> : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* بطاقة السلسلة والنقاط المدمجة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div onClick={triggerCelebration} className="bg-slate-900 p-4 rounded-2xl border border-rose-500/20 hover:border-rose-500/40 cursor-pointer transition-all shadow-lg active:scale-95">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400"><Flame className="w-6 h-6 animate-pulse" /></div>
                      <div>
                        <span className="text-xs text-slate-400">سلسلة الالتزام</span>
                        <div className="text-xl font-bold text-rose-400">{stats.streakDays} أيام</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div onClick={triggerCelebration} className="bg-slate-900 p-4 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all shadow-lg active:scale-95">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400"><Crown className="w-6 h-6" /></div>
                      <div>
                        <span className="text-xs text-slate-400">مجموع النقاط</span>
                        <div className="text-xl font-bold text-amber-400">{stats.totalPoints} نقطة</div>
                      </div>
                    </div>
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
              </div>

              <AchievementChart weeklyData={stats.weeklyData} />
            </div>
          )}

          {activeTab === 'badges' && <StudentBadges badges={stats.badges} streakDays={stats.streakDays} />}
          {activeTab === 'documents' && <StudentDocuments studentId={student.id} />}
        </>
      )}
    </div>
  );
};

export default StudentProfile;
