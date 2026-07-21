import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const translations = {
  ar: {
    entityHeader: 'الحالية',
    defaultEntityLabel: 'الأكاديمية',
    defaultPlan: 'الباقة الاحترافية',
    searchPlaceholder: '🔍 ابحث عن طلاب، حلقات...',
    subValidity: 'صلاحية النظام:',
    daysLeft: 'متبقي {{days}} يوم',
    syncStatus: 'ربط سحابي متزامن',
    logoutBtn: '🚪 إنهاء الجلسة وتسجيل الخروج',
    loading: 'جاري التحميل...',
    defaultHijri: 'التقويم الهجري',
    pillars: {
      liveOps: '1. مركز القيادة الحية',
      academicCore: '2. الشؤون القرآنية والأكاديمية',
      engagement: '3. تفاعل الدارسين والأسر',
      governance: '4. الخزينة والحوكمة'
    },
    nodes: {
      dashboard: 'لوحة التحكم والأداء',
      realtimeAudit: 'السجل الحي للأنشطة',
      learnerDirectory: 'إدارة الدارسين',
      facultyReciters: 'الكادر والمقرئين',
      halaqasSanad: 'المقارئ والحلقات',
      dailyRecitation: 'التسميع والتحضير اليومي',
      curriculaDiplomas: 'المناهج والشهادات',
      guardianPortal: 'شبكة أسر الدارسين',
      gamificationStreaks: 'الإنجاز والحوافز',
      omnichannelHub: 'مركز التنبيهات الموحد',
      billingPayments: 'الخزينة والاشتراكات',
      assetManagement: 'المستندات والأصول',
      growthReferrals: 'برنامج النمو والإحالات',
      platformGovernance: 'ضبط المنظومة'
    }
  },
  en: {
    entityHeader: 'Current',
    defaultEntityLabel: 'Academy',
    defaultPlan: 'Pro Plan',
    searchPlaceholder: '🔍 Search students, halaqas...',
    subValidity: 'Subscription:',
    daysLeft: '{{days}} days left',
    syncStatus: 'Cloud Synchronized',
    logoutBtn: '🚪 Sign Out',
    loading: 'Loading...',
    defaultHijri: 'Hijri Calendar',
    pillars: {
      liveOps: '1. Live Operations Hub',
      academicCore: '2. Academic Core',
      engagement: '3. Engagement Network',
      governance: '4. Treasury & Governance'
    },
    nodes: {
      dashboard: 'Dashboard & Performance',
      realtimeAudit: 'Live Activity Audit',
      learnerDirectory: 'Student Directory',
      facultyReciters: 'Faculty & Reciters',
      halaqasSanad: 'Halaqas & Circles',
      dailyRecitation: 'Daily Recitation',
      curriculaDiplomas: 'Curricula & Certificates',
      guardianPortal: 'Guardian Portal',
      gamificationStreaks: 'Achievements & Streaks',
      omnichannelHub: 'Notification Hub',
      billingPayments: 'Treasury & Subscriptions',
      assetManagement: 'Assets & Documents',
      growthReferrals: 'Growth & Referrals',
      platformGovernance: 'Platform Governance'
    }
  }
};

export function EnterpriseSidebar({ 
  currentAcademyId, 
  currentUserRole = 'admin', 
  activeSection = 'dashboard', 
  setActiveSection,
  onOpenSearch,
  onSwitchAcademy,
  currentLang = 'ar',
  isOpen = false,
  onClose        
}) {
  const isRtl = currentLang === 'ar';
  const t = translations[currentLang] || translations.ar;

  // 1. التمييز بين الموبايل والكمبيوتر بدقة
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [userEntities, setUserEntities] = useState([]);
  const [currentEntity, setCurrentEntity] = useState(null);
  const [subscriptionDaysLeft, setSubscriptionDaysLeft] = useState(30);
  const [planTier, setPlanTier] = useState(t.defaultPlan);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [currentTime, isRtl]);

  const hijriDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(isRtl ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).format(currentTime);
    } catch {
      return t.defaultHijri;
    }
  }, [currentTime, isRtl, t.defaultHijri]);

  const gregorianDate = useMemo(() => {
    return new Intl.DateTimeFormat(isRtl ? 'ar-EG' : 'en-US', {
      day: 'numeric', month: 'short', year: 'numeric'
    }).format(currentTime);
  }, [currentTime, isRtl]);

  useEffect(() => {
    let isMounted = true;
    const fetchPermittedEntities = async () => {
      try {
        const { data, error } = await supabase
          .from('academies')
          .select('id, name, slug, metadata, subscription_end_date, plan_tier');

        if (error) throw error;

        if (isMounted && data && data.length > 0) {
          setUserEntities(data);
          const active = data.find(item => item.id === currentAcademyId) || data[0];
          setCurrentEntity(active);

          if (active.plan_tier) setPlanTier(active.plan_tier);

          if (active && active.subscription_end_date) {
            const endDate = new Date(active.subscription_end_date);
            const diffTime = endDate.getTime() - new Date().getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setSubscriptionDaysLeft(diffDays > 0 ? diffDays : 0);
          }
        }
      } catch (err) {
        console.error('Error fetching entities:', err);
      }
    };

    fetchPermittedEntities();
    return () => { isMounted = false; };
  }, [currentAcademyId]);

  const entityCustomLabel = useMemo(() => {
    if (isRtl) return currentEntity?.metadata?.entity_label_ar || t.defaultEntityLabel;
    return currentEntity?.metadata?.entity_label_en || t.defaultEntityLabel;
  }, [currentEntity, isRtl, t.defaultEntityLabel]);

  const handleGoToSaasSubscription = () => {
    if (setActiveSection) {
      setActiveSection('saas_subscriptions');
      if (isMobile && onClose) onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/login';
    }
  };

  const handleNodeClick = (nodeId) => {
    if (setActiveSection) setActiveSection(nodeId);
    if (isMobile && onClose) onClose();
  };

  const globalNavigationPillars = useMemo(() => [
    {
      pillarTitle: t.pillars.liveOps,
      allowedRoles: ['super_admin', 'admin', 'manager', 'teacher', 'student', 'parent'],
      nodes: [
        { id: 'dashboard', title: t.nodes.dashboard, icon: '📊' },
        { id: 'realtime-audit', title: t.nodes.realtimeAudit, icon: '⚡' }
      ]
    },
    {
      pillarTitle: t.pillars.academicCore,
      allowedRoles: ['super_admin', 'admin', 'manager', 'teacher'],
      nodes: [
        { id: 'learner-directory', title: t.nodes.learnerDirectory, icon: '🎓' },
        { id: 'faculty-reciters', title: t.nodes.facultyReciters, icon: '🕌' },
        { id: 'halaqas-sanad', title: t.nodes.halaqasSanad, icon: '👥' },
        { id: 'daily-recitation', title: t.nodes.dailyRecitation, icon: '📝' },
        { id: 'curricula-diplomas', title: t.nodes.curriculaDiplomas, icon: '📜' }
      ]
    },
    {
      pillarTitle: t.pillars.engagement,
      allowedRoles: ['super_admin', 'admin', 'manager', 'teacher', 'student', 'parent'],
      nodes: [
        { id: 'guardian-portal', title: t.nodes.guardianPortal, icon: '🏠' },
        { id: 'gamification-streaks', title: t.nodes.gamificationStreaks, icon: '🏆' },
        { id: 'omnichannel-hub', title: t.nodes.omnichannelHub, icon: '🔔' }
      ]
    },
    {
      pillarTitle: t.pillars.governance,
      allowedRoles: ['super_admin', 'admin', 'manager'],
      nodes: [
        { id: 'billing-payments', title: t.nodes.billingPayments, icon: '💳' },
        { id: 'asset-management', title: t.nodes.assetManagement, icon: '📁' },
        { id: 'growth-referrals', title: t.nodes.growthReferrals, icon: '🚀' },
        { id: 'platformGovernance', title: t.nodes.platformGovernance, icon: '⚙️' }
      ]
    }
  ], [t]);

  // 2. حساب التموضع الديناميكي (تأكيد الظهور في الكمبيوتر والتحريك في الموبايل)
  const computedSidebarStyle = useMemo(() => {
    if (!isMobile) {
      // الكمبيوتر: ثابتة دائماً
      return {
        width: '280px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        transform: 'none',
        zIndex: 30
      };
    }

    // الموبايل: منزلقة مع z-index مرتفع
    return {
      width: '280px',
      height: '100dvh',
      position: 'fixed',
      top: 0,
      bottom: 0,
      right: isRtl ? 0 : 'auto',
      left: !isRtl ? 0 : 'auto',
      transform: isOpen 
        ? 'translateX(0)' 
        : (isRtl ? 'translateX(100%)' : 'translateX(-100%)'),
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 9999, // لضمان ظهور القائمة فوق خلفية التمويه
      boxShadow: isOpen ? '0 0 25px rgba(0, 0, 0, 0.7)' : 'none'
    };
  }, [isMobile, isOpen, isRtl]);

  return (
    <>
      {/* 3. الخلفية المعتمة للموبايل فقط عند الفتح */}
      {isMobile && isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 9998 // أسفل القائمة الجانبية برقم واحد مباشرة
          }}
        />
      )}

      {/* 4. عنصر القائمة الجانبية الرئيسي */}
      <aside style={{
        ...computedSidebarStyle,
        backgroundColor: '#0f172a',
        borderInlineEnd: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        color: '#f8fafc',
        fontFamily: isRtl ? "'Cairo', sans-serif" : "system-ui, -apple-system, sans-serif",
        direction: isRtl ? 'rtl' : 'ltr',
        boxSizing: 'border-box',
        userSelect: 'none'
      }}>
        
        {/* رأس القائمة */}
        <div style={{ padding: '16px 16px 12px 16px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', letterSpacing: '0.5px' }}>
              {entityCustomLabel} {t.entityHeader}
            </span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={handleGoToSaasSubscription}
                style={{ 
                  fontSize: '10px', 
                  background: '#1e293b', 
                  color: '#38bdf8', 
                  padding: '3px 8px', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  border: '1px solid #334155',
                  cursor: 'pointer'
                }}
              >
                {planTier}
              </button>

              {isMobile && (
                <button 
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '0 4px',
                    lineHeight: 1
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {userEntities.length > 1 ? (
            <select
              value={currentAcademyId || ''}
              onChange={(e) => onSwitchAcademy && onSwitchAcademy(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '1px solid #334155',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {userEntities.map((entity) => (
                <option key={entity.id} value={entity.id} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                  {entity.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whitespace: 'nowrap' }}>
              {currentEntity?.name || t.loading}
            </div>
          )}

          {/* التاريخ والوقت */}
          <div style={{ 
            marginTop: '10px', 
            padding: '8px 10px', 
            background: '#162030', 
            borderRadius: '8px', 
            border: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b' }}>{hijriDate}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>{gregorianDate}</div>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8', fontFamily: 'monospace' }}>
              {formattedTime}
            </div>
          </div>

          {/* زر البحث */}
          <button
            onClick={() => {
              if (onOpenSearch) onOpenSearch();
              if (isMobile && onClose) onClose();
            }}
            style={{
              marginTop: '10px',
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              background: '#090d16',
              border: '1px solid #334155',
              color: '#94a3b8',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {t.searchPlaceholder}
            </span>
            {!isMobile && (
              <kbd style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '4px', border: '1px solid #475569', fontSize: '10px', color: '#cbd5e1' }}>
                Ctrl K
              </kbd>
            )}
          </button>
        </div>

        {/* مؤشر الاشتراك */}
        <div 
          onClick={handleGoToSaasSubscription}
          style={{ 
            padding: '8px 16px', 
            background: 'rgba(30, 41, 59, 0.2)', 
            borderBottom: '1px solid #1e293b', 
            flexShrink: 0,
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
            <span style={{ color: '#94a3b8' }}>{t.subValidity}</span>
            <span style={{ color: '#10b981', fontWeight: '800' }}>
              {t.daysLeft.replace('{{days}}', subscriptionDaysLeft)}
            </span>
          </div>
          <div style={{ width: '100%', height: '3px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min((subscriptionDaysLeft / 30) * 100, 100)}%`, height: '100%', background: '#10b981' }} />
          </div>
        </div>

        {/* عناصر التنقل */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {globalNavigationPillars.map((pillar, pIdx) => {
            if (!pillar.allowedRoles.includes(currentUserRole)) return null;

            return (
              <div key={pIdx} style={{ marginBottom: '14px' }}>
                <div style={{ 
                  padding: '0 8px 6px 8px', 
                  fontSize: '10px', 
                  fontWeight: '800', 
                  color: '#64748b'
                }}>
                  {pillar.pillarTitle}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {pillar.nodes.map((node) => {
                    const isActive = activeSection === node.id;

                    return (
                      <button
                        key={node.id}
                        onClick={() => handleNodeClick(node.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isActive ? 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)' : 'transparent',
                          color: isActive ? '#0f172a' : '#cbd5e1',
                          fontWeight: isActive ? '800' : '600',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: isRtl ? 'right' : 'left'
                        }}
                      >
                        <span style={{ fontSize: '15px', minWidth: '20px', textAlign: 'center' }}>{node.icon}</span>
                        <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whitespace: 'nowrap' }}>{node.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* الفوتر */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b', background: '#090d16', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 6px #10b981'
            }} />
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
              {t.syncStatus}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '9px',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#fca5a5',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {t.logoutBtn}
          </button>
        </div>

      </aside>
    </>
  );
}

export const Sidebar = EnterpriseSidebar;
export default EnterpriseSidebar;
