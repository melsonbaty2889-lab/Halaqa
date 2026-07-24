/* src/components/Sidebar.jsx */
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { formatHijriDate, formatGregorianDate, formatLiveTime } from '../utils/dateUtils';

export function EnterpriseSidebar({ 
  currentAcademyId, 
  currentUserRole = 'admin', 
  activeSection = 'dashboard', 
  setActiveSection,
  onOpenSearch,
  onSwitchAcademy,
  onNavigateToSubscription,
  isOpenMobile = false,       // حالة الفتح على الهواتف
  onCloseMobile = () => {}    // دالة الإغلاق للموبايل
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang.startsWith('ar');

  // 1. حالات الوقت والتقويم
  const [currentTime, setCurrentTime] = useState(new Date());

  // 2. حالات الكيانات للفروع
  const [userEntities, setUserEntities] = useState([]);
  const [currentEntity, setCurrentEntity] = useState(null);
  const [loadingEntity, setLoadingEntity] = useState(true);

  // 3. حالات اشتراك الـ SaaS
  const [subscriptionDaysLeft, setSubscriptionDaysLeft] = useState(0);
  const [planTier, setPlanTier] = useState('free');
  const [subStatus, setSubStatus] = useState('trial');

  // تحديث الساعة فورياً
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = useMemo(() => formatLiveTime(currentTime, currentLang), [currentTime, currentLang]);
  const hijriDate = useMemo(() => formatHijriDate(currentTime, currentLang), [currentTime, currentLang]);
  const gregorianDate = useMemo(() => formatGregorianDate(currentTime, currentLang), [currentTime, currentLang]);

  // جلب الكيانات والاشتراكات
  useEffect(() => {
    let isMounted = true;

    const fetchAcademyAndSubscription = async () => {
      setLoadingEntity(true);
      try {
        const { data: academies, error: acaError } = await supabase
          .from('academies')
          .select('id, name, slug, metadata');

        if (acaError) throw acaError;

        if (isMounted && academies && academies.length > 0) {
          setUserEntities(academies);
          const active = academies.find(item => item.id === currentAcademyId) || academies[0];
          setCurrentEntity(active);

          if (active?.id) {
            const { data: sub, error: subError } = await supabase
              .from('saas_subscriptions')
              .select('*')
              .eq('academy_id', active.id)
              .maybeSingle();

            if (!subError && sub) {
              setPlanTier(sub.plan_tier || 'pro');
              setSubStatus(sub.status || 'active');

              if (sub.expires_at) {
                const endDate = new Date(sub.expires_at);
                const diffTime = endDate.getTime() - new Date().getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setSubscriptionDaysLeft(diffDays > 0 ? diffDays : 0);
              }
            } else {
              setPlanTier('free');
              setSubStatus('unpaid');
              setSubscriptionDaysLeft(0);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching entities/subscription:', err);
      } finally {
        if (isMounted) setLoadingEntity(false);
      }
    };

    fetchAcademyAndSubscription();
    return () => { isMounted = false; };
  }, [currentAcademyId]);

  // المسمى المخصص للكيان بدون خلط لغوي
  const entityCustomLabel = useMemo(() => {
    if (isRtl) {
      return currentEntity?.metadata?.entity_label_ar || 'الأكاديمية الحالية';
    }
    return currentEntity?.metadata?.entity_label_en || 'Current Academy';
  }, [currentEntity, isRtl]);

  // تسجيل الخروج
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

  // 🔄 إصلاح الترجمة: إدراج currentLang داخل قائمة الاعتماديات مع نصوص احتياطية بكلتا اللغتين
  const globalNavigationPillars = useMemo(() => [
    {
      pillarTitle: t('sidebar.pillars.liveOps', isRtl ? '1. مركز القيادة الحية | Live Operations' : '1. Live Operations Hub'),
      allowedRoles: ['super_admin', 'admin', 'manager', 'teacher', 'student', 'parent'],
      nodes: [
        { id: 'dashboard', title: t('sidebar.nodes.dashboard', isRtl ? 'لوحة التحكم والأداء' : 'Dashboard & Performance'), icon: '📊' },
        { id: 'realtime-audit', title: t('sidebar.nodes.realtimeAudit', isRtl ? 'السجل الحي للأنشطة' : 'Realtime Audit Log'), icon: '⚡' }
      ]
    },
    {
      pillarTitle: t('sidebar.pillars.academicCore', isRtl ? '2. الشؤون القرآنية والأكاديمية' : '2. Academic Core'),
      allowedRoles: ['super_admin', 'admin', 'manager', 'teacher'],
      nodes: [
        { id: 'learner-directory', title: t('sidebar.nodes.learnerDirectory', isRtl ? 'إدارة الدارسين' : 'Learner Directory'), icon: '🎓' },
        { id: 'faculty-reciters', title: t('sidebar.nodes.facultyReciters', isRtl ? 'الكادر والمقرئين' : 'Faculty & Reciters'), icon: '🕌' },
        { id: 'halaqas-sanad', title: t('sidebar.nodes.halaqasSanad', isRtl ? 'المقارئ والحلقات' : 'Halaqas & Sanad'), icon: '👥' },
        { id: 'daily-recitation', title: t('sidebar.nodes.dailyRecitation', isRtl ? 'التسميع والتحضير اليومي' : 'Daily Recitation'), icon: '📝' },
        { id: 'curricula-diplomas', title: t('sidebar.nodes.curriculaDiplomas', isRtl ? 'المناهج والشهادات' : 'Curricula & Diplomas'), icon: '📜' }
      ]
    },
    {
      pillarTitle: t('sidebar.pillars.engagement', isRtl ? '3. تفاعل الدارسين والأسر' : '3. Engagement Network'),
      allowedRoles: ['super_admin', 'admin', 'manager', 'teacher', 'student', 'parent'],
      nodes: [
        { id: 'guardian-portal', title: t('sidebar.nodes.guardianPortal', isRtl ? 'شبكة أسر الدارسين' : 'Guardian Portal'), icon: '🏠' },
        { id: 'gamification-streaks', title: t('sidebar.nodes.gamificationStreaks', isRtl ? 'الإنجاز والحوافز' : 'Gamification & Streaks'), icon: '🏆' },
        { id: 'omnichannel-hub', title: t('sidebar.nodes.omnichannelHub', isRtl ? 'مركز التنبيهات الموحد' : 'Omnichannel Hub'), icon: '🔔' }
      ]
    },
    {
      pillarTitle: t('sidebar.pillars.governance', isRtl ? '4. الخزينة والحوكمة' : '4. Treasury & Governance'),
      allowedRoles: ['super_admin', 'admin', 'manager'],
      nodes: [
        { id: 'billing-payments', title: t('sidebar.nodes.billingPayments', isRtl ? 'الخزينة والاشتراكات' : 'Billing & Payments'), icon: '💳' },
        { id: 'asset-management', title: t('sidebar.nodes.assetManagement', isRtl ? 'المستندات والأصول' : 'Asset Management'), icon: '📁' },
        { id: 'growth-referrals', title: t('sidebar.nodes.growthReferrals', isRtl ? 'برنامج النمو والإحالات' : 'Growth & Referrals'), icon: '🚀' },
        { id: 'platform-governance', title: t('sidebar.nodes.platformGovernance', isRtl ? 'ضبط المنظومة' : 'Platform Governance'), icon: '⚙️' }
      ]
    }
  ], [t, currentLang, isRtl]);

  const handleUpgradeClick = () => {
    if (onNavigateToSubscription) onNavigateToSubscription();
    else if (setActiveSection) setActiveSection('subscription');
  };

  return (
    <>
      {/* خلفية معتمة للهواتف لتسهيل الإغلاق عند الضغط خارج السايدبار */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
            display: 'block'
          }}
        />
      )}

      <aside style={{
        width: '280px',
        height: '100vh',
        backgroundColor: '#0f172a',
        borderInlineEnd: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        color: '#f8fafc',
        fontFamily: isRtl ? "'Cairo', sans-serif" : "system-ui, -apple-system, sans-serif",
        direction: isRtl ? 'rtl' : 'ltr',
        position: 'fixed',
        top: 0,
        [isRtl ? 'right' : 'left']: 0,
        transform: isOpenMobile || window.innerWidth >= 1024 ? 'translateX(0)' : isRtl ? 'translateX(100%)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        userSelect: 'none',
        zIndex: 100,
        boxSizing: 'border-box'
      }}>
        
        {/* 1. الهيدر */}
        <div style={{ padding: '16px 16px 12px 16px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', letterSpacing: '0.5px' }}>
              {entityCustomLabel}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontSize: '10px', 
                background: subStatus === 'active' ? '#065f46' : subStatus === 'unpaid' ? '#854d0e' : '#1e293b', 
                color: subStatus === 'active' ? '#34d399' : subStatus === 'unpaid' ? '#fde047' : '#38bdf8', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                fontWeight: 'bold', 
                border: '1px solid #334155' 
              }}>
                {planTier.toUpperCase()} ({subStatus === 'active' ? (isRtl ? 'نشط' : 'Active') : subStatus === 'unpaid' ? (isRtl ? 'معلق' : 'Unpaid') : (isRtl ? 'مجاني' : 'Free')})
              </span>

              {/* زر إغلاق للموبايل */}
              <button 
                onClick={onCloseMobile}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'inline-flex'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {loadingEntity ? (
            <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
              {t('common.loading', isRtl ? 'جاري التحميل...' : 'Loading...')}
            </div>
          ) : userEntities.length > 1 ? (
            <select
              value={currentEntity?.id || ''}
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
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whitespace: 'nowrap' }}>
              {currentEntity?.name || (isRtl ? 'الأكاديمية الرقمية' : 'Digital Academy')}
            </div>
          )}

          {/* 2. التاريخ والساعة */}
          <div style={{ 
            marginTop: '12px', 
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

          {/* 3. زر البحث */}
          <button
            onClick={onOpenSearch}
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
              🔍 {t('sidebar.searchPlaceholder', isRtl ? 'ابحث عن طلاب، حلقات...' : 'Search students, halaqas...')}
            </span>
            <kbd style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '4px', border: '1px solid #475569', fontSize: '10px', color: '#cbd5e1' }}>
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* 4. شريط حالة وأيام الاشتراك */}
        <div style={{ padding: '10px 16px', background: 'rgba(30, 41, 59, 0.3)', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginBottom: '6px' }}>
            <span style={{ color: '#94a3b8' }}>{t('sidebar.subValidity', isRtl ? 'صلاحية النظام:' : 'Validity:')}</span>
            {subStatus === 'active' || subStatus === 'trial' ? (
              <span style={{ color: subscriptionDaysLeft <= 5 ? '#ef4444' : '#10b981', fontWeight: '800' }}>
                {isRtl ? `متبقي ${subscriptionDaysLeft} يوم` : `${subscriptionDaysLeft} Days left`}
              </span>
            ) : (
              <button 
                onClick={handleUpgradeClick}
                style={{ background: '#f59e0b', color: '#0f172a', border: 'none', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', cursor: 'pointer' }}
              >
                {subStatus === 'unpaid' ? (isRtl ? 'تأكيد الدفع ⚡' : 'Confirm Payment ⚡') : (isRtl ? 'ترقية الآن 🚀' : 'Upgrade Now 🚀')}
              </button>
            )}
          </div>
          <div style={{ width: '100%', height: '4px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ 
              width: subStatus === 'active' ? `${Math.min((subscriptionDaysLeft / 30) * 100, 100)}%` : '0%', 
              height: '100%', 
              background: subscriptionDaysLeft <= 5 ? '#ef4444' : '#10b981',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* 5. القوائم */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {globalNavigationPillars.map((pillar, pIdx) => {
            if (!pillar.allowedRoles.includes(currentUserRole)) return null;

            return (
              <div key={pIdx} style={{ marginBottom: '16px' }}>
                <div style={{ 
                  padding: '0 8px 6px 8px', 
                  fontSize: '10px', 
                  fontWeight: '800', 
                  color: '#64748b'
                }}>
                  {pillar.pillarTitle}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {pillar.nodes.map((node) => {
                    const isActive = activeSection === node.id;

                    return (
                      <button
                        key={node.id}
                        onClick={() => {
                          if (setActiveSection) setActiveSection(node.id);
                          onCloseMobile(); // إغلاق تلقائي عند التحديد من الموبايل
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '9px 12px',
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
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = '#1e293b';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span style={{ fontSize: '15px' }}>{node.icon}</span>
                        <span>{node.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 6. الفوتر */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b', background: '#090d16', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: subStatus === 'active' ? '#10b981' : '#f59e0b',
              boxShadow: subStatus === 'active' ? '0 0 6px #10b981' : '0 0 6px #f59e0b'
            }} />
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
              {t('sidebar.syncStatus', isRtl ? 'ربط سحابي متزامن' : 'Cloud Synchronized')}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px',
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
            {t('sidebar.logoutBtn', isRtl ? '🚪 إنهاء الجلسة وتسجيل الخروج' : '🚪 End Session & Logout')}
          </button>
        </div>

      </aside>
    </>
  );
}

export const Sidebar = EnterpriseSidebar;
export default EnterpriseSidebar;
