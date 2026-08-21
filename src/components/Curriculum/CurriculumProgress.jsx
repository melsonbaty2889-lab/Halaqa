import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { CheckCircle, Clock, BookOpen } from 'lucide-react';
import colors from '@/theme/colors';

export default function CurriculumProgress({ studentId, dir = 'rtl' }) {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) fetchProgress();
  }, [studentId]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_progress')
        .select('*, curricula(name)')
        .eq('student_id', studentId);

      if (error) throw error;
      if (data) setProgressData(data);
    } catch (err) {
      console.error('خطأ في جلب تقدم الطالب:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      dir={dir} 
      style={{ backgroundColor: colors?.surface || '#0F172A' }}
      className="w-full border border-white/10 rounded-2xl p-5 shadow-2xl text-white"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#FBBF24]" />
          <h3 className="font-bold text-base">تقدم الطالب في المنهج</h3>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-6 text-xs text-slate-400">جاري تحميل التقدم...</div>
      ) : !progressData || progressData.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400">لا يوجد تقدم مسجل بعد لهذا الطالب.</div>
      ) : (
        <div className="space-y-4">
          {progressData.map((item) => (
            <div key={item.id} className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-white">{item.curricula?.name || 'المنهج'}</span>
                <span className="text-[#FBBF24] font-bold">{item.completion_percentage || 0}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#FBBF24] transition-all duration-300" 
                  style={{ width: `${item.completion_percentage || 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
