import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Badge {
  id: string;
  academy_id: string;
  titles?: Record<string, string> | string;
  descriptions?: Record<string, string> | string;
  icon_url?: string;
  points_rewarded?: number;
  is_active: boolean;
}

export interface StudentStreak {
  student_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  total_active_days?: number;
}

export interface TopAchiever {
  id: string;
  academy_id: string;
  student_name: Record<string, string> | string;
  points: number;
  level_score?: number;
  avatar_url?: string;
  halaqa_name?: Record<string, string> | string;
}

export function useBadgesAndStreaks(academyId?: string) {
  const [topAchievers, setTopAchievers] = useState<TopAchiever[]>([]);
  const [studentStreak, setStudentStreak] = useState<StudentStreak | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // جلب لائحة الأوائل والطلاب المتصدرين من الـ View الجاهز
  const fetchTopAchievers = useCallback(async (limit = 10) => {
    if (!academyId) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('vw_top_achievers')
        .select('*')
        .eq('academy_id', academyId)
        .order('points', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setTopAchievers(data as TopAchiever[]);
    } catch (err) {
      console.error('Error fetching top achievers:', err);
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  // جلب سلسلة المواظبة (Streak) للطالب
  const fetchStudentStreak = useCallback(async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_streaks')
        .select('*')
        .eq('student_id', studentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setStudentStreak(data as StudentStreak);
    } catch (err) {
      console.error('Error fetching student streak:', err);
    }
  }, []);

  return {
    topAchievers,
    studentStreak,
    loading,
    fetchTopAchievers,
    fetchStudentStreak,
  };
}

export default useBadgesAndStreaks;
