/* src/components/Dashboard.jsx */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { getDashboardStats } from '../lib/dashboardService';
import AdminDashboard from './AdminDashboard';
import AcademyDashboard from './AcademyDashboard';

export default function Dashboard({ 
  session, 
  userRole,
  setActiveTab, 
  preloadedDashboardData, 
  currency,
  timezone = 'Africa/Cairo'
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language?.startsWith('ar');
  
  const [loading, setLoading] = useState(true);
  const [liveStats, setLiveStats] = useState(null);

  const isSuperAdmin = userRole === 'super_admin';
  const academyName = preloadedDashboardData?.academyName || "";
  const userFullName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || '';

  const baseStats = preloadedDashboardData?.stats || { students: 0, pending: 0, activeHalagas: 0, completedExams: 0 };
  const stats = {
    ...baseStats,
    students: liveStats?.studentsCount !== undefined ? liveStats.studentsCount : (baseStats.students || 0),
    pending: liveStats?.overdueCount !== undefined ? liveStats.overdueCount : (baseStats.pending || 0),
    attendanceRate: liveStats?.attendanceRate || null,
    totalPagesMuted: liveStats?.totalPagesMuted || null,
    activeHalaqasData: liveStats?.activeHalaqasData || [] 
  };

  const getGreeting = () => {
    return isRtl ? 'السلام عليكم ورحمة الله وبركاته' : 'Assalamu Alaikum';
  };

  const fetchDashboardData = useCallback(async (showOverlayLoading = true) => {
    if (showOverlayLoading) setLoading(true);
    try {
      if (!isSuperAdmin) {
        const profileMock = {
          role: userRole,
          academy_id: preloadedDashboardData?.academy_id || preloadedDashboardData?.id || session?.user?.user_metadata?.academy_id
        };
        const data = await getDashboardStats(supabase, profileMock);
        if (data) setLiveStats(data);
      }
    } catch (err) {
      console.error("Error loading dashboard live stats:", err);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, userRole, preloadedDashboardData, session]);

  useEffect(() => { 
    fetchDashboardData(true); 
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse" style={{ padding: '30px' }}>
        <div style={{ height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', width: '30%' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '30px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: '120px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (!isSuperAdmin && preloadedDashboardData?.is_active === false) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '20px', textAlign: 'center' }}>
        <div style={{ padding: '40px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>
            {isRtl ? 'حسابك قيد المراجعة والاعتماد' : 'Account Under Review'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: '1.6', margin: 0 }}>
            {isRtl ? 'مرحباً بك! سيتم تفعيل لوحة تحكم أكاديميتك فور مراجعة وتدقيق البيانات من قبل الإدارة العامة.' : 'Your workspace will unlock automatically upon admin approval.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-20">
      {isSuperAdmin ? (
        <AdminDashboard 
          isRtl={isRtl} 
          academyName={userFullName} 
          onLogout={() => supabase.auth.signOut()} 
        />
      ) : (
        <AcademyDashboard 
          {...{ isRtl, greeting: getGreeting(), academyName, stats, setActiveTab, t, currency }}
        />
      )}
    </div>
  );
}
