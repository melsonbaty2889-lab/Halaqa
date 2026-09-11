import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ── Types & Interfaces ──────────────────────────────────────────

export type SupportedLanguage = 'ar' | 'en' | 'fr' | 'tr' | 'ur' | 'id';

export interface MultiLangName {
  ar?: string;
  en?: string;
  fr?: string;
  tr?: string;
  ur?: string;
  id?: string;
  [key: string]: string | undefined;
}

export interface Badge {
  id: string;
  academy_id: string;
  title?: string;
  description?: string;
  titles?: MultiLangName | string;
  descriptions?: MultiLangName | string;
  icon_url?: string;
  points_rewarded?: number;
  is_active: boolean;
}

export interface StudentBadge {
  id: string;
  student_id: string;
  badge_id: string;
  unlocked_at?: string;
  academy_id?: string;
  reason?: string;
  badge?: Badge;
}

export interface StudentStreak {
  id?: string;
  student_id: string;
  academy_id?: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  total_active_days?: number;
}

export interface TopAchiever {
  id: string;
  academy_id: string;
  student_name: MultiLangName | string;
  points: number;
  level_score?: number;
  avatar_url?: string;
  halaqa_name?: MultiLangName | string;
}

// ── Helper Function ─────────────────────────────────────────────

export function getLocalizedName(
  name: MultiLangName | string | null | undefined,
  currentLang: SupportedLanguage = 'ar'
): string {
  if (!name) return '';
  if (typeof name === 'string') return name;

  return name[currentLang] || name.ar || name.en || Object.values(name).find(Boolean) || '';
}

// ── Main Hook ───────────────────────────────────────────────────

export function useBadgesAndStreaks(academyId?: string | null) {
  const [topAchievers, setTopAchievers] = useState<TopAchiever[]>([]);
  const [studentStreak, setStudentStreak] = useState<StudentStreak | null>(null);
  const [studentBadges, setStudentBadges] = useState<StudentBadge[]>([]);
  const [loadingAchievers, setLoadingAchievers] = useState<boolean>(false);
  const [loadingStreak, setLoadingStreak] = useState<boolean>(false);
  const [loadingBadges, setLoadingBadges] = useState<boolean>(false);

  const isValidAcademyId = Boolean(
    academyId &&
    academyId !== 'undefined' &&
    typeof academyId === 'string' &&
    academyId.trim() !== ''
  );

  // 1. جلب قائمة الأوائل والمتصدرين من الـ View
  const fetchTopAchievers = useCallback(
    async (limit = 10) => {
      if (!isValidAcademyId) return;
      setLoadingAchievers(true);

      try {
        const { data, error } = await supabase
          .from('vw_top_achievers')
          .select('*')
          .eq('academy_id', academyId!)
          .order('points', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setTopAchievers((data as TopAchiever[]) || []);
      } catch (err) {
        console.error('Error fetching top achievers:', err);
        setTopAchievers([]);
      } finally {
        setLoadingAchievers(false);
      }
    },
    [academyId, isValidAcademyId]
  );

  // 2. جلب سلسلة المواظبة (Streak) للطالب
  const fetchStudentStreak = useCallback(async (studentId: string) => {
    if (!studentId) return;
    setLoadingStreak(true);

    try {
      const { data, error } = await supabase
        .from('student_streaks')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) throw error;
      setStudentStreak((data as StudentStreak) || null);
    } catch (err) {
      console.error('Error fetching student streak:', err);
      setStudentStreak(null);
    } finally {
      setLoadingStreak(false);
    }
  }, []);

  // 3. جلب الأوسمة المكتسبة للطالب
  const fetchStudentBadges = useCallback(async (studentId: string) => {
    if (!studentId) return;
    setLoadingBadges(true);

    try {
      const { data, error } = await supabase
        .from('student_badges')
        .select('*, badge:badges(*)')
        .eq('student_id', studentId);

      if (error) throw error;
      setStudentBadges((data as StudentBadge[]) || []);
    } catch (err) {
      console.error('Error fetching student badges:', err);
      setStudentBadges([]);
    } finally {
      setLoadingBadges(false);
    }
  }, []);

  return {
    topAchievers,
    studentStreak,
    studentBadges,
    loadingAchievers,
    loadingStreak,
    loadingBadges,
    loading: loadingAchievers || loadingStreak || loadingBadges,
    fetchTopAchievers,
    fetchStudentStreak,
    fetchStudentBadges,
    getLocalizedName,
  };
}

export default useBadgesAndStreaks;
