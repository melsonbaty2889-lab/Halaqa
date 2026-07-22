/* src/components/Sidebar.jsx */
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

// ==========================================
// 1. ACADEMY SWITCHER (محول الأكاديميات الديناميكي)
// ==========================================
export function AcademySwitcher({ userEntities = [], currentEntity, onSwitchAcademy, isRtl, t }) {
  if (!userEntities || userEntities.length === 0) {
    return (
      <div style={styles.noEntitiesText}>
        {t('sidebar.noAcademies', isRtl ? 'لا توجد أكاديميات مسجلة' : 'No Academies Found')}
      </div>
    );
  }

  const getLocalizedEntityName = (entity) => {
    if (!entity) return '';
    if (!isRtl && entity.metadata?.name_en) {
      return entity.metadata.name_en;
    }
    return entity.name || entity.metadata?.name_ar || '';
  };

  return (
    <div style={styles.switcherWrapper}>
      <select
        value={currentEntity?.id || ''}
        onChange={(e) => {
          const selectedId = e.target.value;
          const selectedEntity = userEntities.find((item) => item.id === selectedId);
          if (selectedEntity && onSwitchAcademy) {
            onSwitchAcademy(selectedEntity);
          }
        }}
        style={styles.selectDropdown}
      >
        {userEntities.map((entity) => (
          <option key={entity.id} value={entity.id} style={styles.selectOption}>
            🏛️ {getLocalizedEntityName(entity)}
          </option>
        ))}
      </select>
      <span style={styles.dropdownArrow}>▼</span>
    </div>
  );
}

// ==========================================
// 2. HOOKS (الساعة والبيانات)
// ==========================================
function useLiveClock(isRtl, t) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [currentTime, isRtl]);

  const hijriDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(
        isRtl ? 'ar-SA-u-ca-islamic-umalqura' : 'en-US-u-ca-islamic-umalqura',
        { day: 'numeric', month: 'long', year: 'numeric' }
      ).format(currentTime);
    } catch {
      return t('calendar.hijri', isRtl ? 'التقويم الهجري' : 'Hijri Calendar');
    }
  }, [currentTime, isRtl, t]);

  const gregorianDate = useMemo(() => {
    return new Intl.DateTimeFormat(isRtl ? 'ar-EG' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(currentTime);
  }, [currentTime, isRtl]);

  return { formattedTime, hijriDate, gregorianDate };
}

function useAcademyData(currentAcademyId) {
  const [userEntities, setUserEntities] = useState([]);
  const [currentEntity, setCurrentEntity] = useState(null);
  const [loadingEntity, setLoadingEntity] = useState(true);
  const [subscriptionDaysLeft, setSubscriptionDaysLeft] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchPermittedEntities = async () => {
      setLoadingEntity(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        let academiesList = [];

        if (user) {
          const { data: staffData } = await supabase
            .from('staff')
            .select('academy_id, academies(*)')
            .eq('user_id', user.id);

          if (staffData && staffData.length > 0) {
            academiesList = staffData.map(s => s.academies).filter(Boolean);
          }
        }

        if (academiesList.length === 0 && user) {
          const { data: ownedData } = await supabase
            .from('academies')
            .select('id, name, slug, metadata, subscription_end_date, trial_ends_at, plan_tier')
            .eq('owner_id', user.id);

          if (ownedData && ownedData.length > 0) {
            academiesList = ownedData;
          }
        }

        if (academiesList.length === 0) {
          const { data: allData, error } = await supabase
            .from('academies')
            .select('id, name, slug, metadata, subscription_end_date, trial_ends_at, plan_tier');

          if (error) throw error;
          if (allData) academiesList = allData;
        }

        if (isMounted && academiesList.length > 0) {
          setUserEntities(academiesList);
          const active = academiesList.find((item) => item.id === currentAcademyId) || academiesList[0];
          setCurrentEntity(active);

          const expiryDate = active.trial_ends_at || active.subscription_end_date;
          if (expiryDate) {
            const endDate = new Date(expiryDate);
            const diffTime = endDate.getTime() - new Date().getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setSubscriptionDaysLeft(diffDays > 0 ? diffDays : 0);
          } else {
            setSubscriptionDaysLeft(0);
          }
        } else if (isMounted) {
          setUserEntities([]);
          setCurrentEntity(null);
        }
      } catch (err) {
        console.error('Supabase Fetch Error:', err);
      } finally {
        if (isMounted) setLoadingEntity(false);
      }
    };

    fetchPermittedEntities();
    return () => { isMounted = false; };
  }, [currentAcademyId]);

  return { userEntities, currentEntity, setCurrentEntity, loadingEntity, subscriptionDaysLeft };
}

function useNavigationConfig(t, isRtl) {
  return useMemo(
    () => [
      {
        pillarTitle: t('sidebar.pillars.liveOps', isRtl ? '1. مركز القيادة الحية' : '1. Live Operations Hub'),
        allowedRoles: ['super_admin', 'admin', 'manager', 'teacher', 'student', 'parent'],
        nodes: [
          { id: 'dashboard', title: t('sidebar.nodes.dashboard', isRtl ? 'لوحة التحكم والأداء' : 'Dashboard & Performance'), icon: '📊' },
          { id: 'reports', title: t('sidebar.nodes.reports', isRtl ? 'التقارير والإحصاءات' : 'Reports & Analytics'), icon: '📈' },
        ],
      },
      {
        pillarTitle: t('sidebar.pillars.academicCore', isRtl ? '2. الشؤون القرآنية والأكاديمية' : '2. Academic & Quranic Core'),
        allowedRoles: ['super_admin', 'admin', 'manager', 'teacher'],
        nodes: [
          { id: 'students', title: t('sidebar.nodes.learnerDirectory', isRtl ? 'إدارة الدارسين' : 'Learners Directory'), icon: '🎓' },
          { id: 'teachers', title: t('sidebar.nodes.facultyReciters', isRtl ? 'الكادر والمقرئين' : 'Faculty & Reciters'), icon: '🕌' },
          { id: 'halaqas', title: t('sidebar.nodes.halaqasSanad', isRtl ? 'المقارئ والحلقات' : 'Halaqas & Sanad'), icon: '👥' },
          { id: 'attendance', title: t('sidebar.nodes.dailyRecitation', isRtl ? 'التسميع والتحضير اليومي' : 'Daily Recitation Log'), icon: '📝' },
          { id: 'exams', title: t('sidebar.nodes.curriculaDiplomas', isRtl ? 'الاختبارات والشهادات' : 'Exams & Diplomas'), icon: '📜' },
        ],
      },
      {
        pillarTitle: t('sidebar.pillars.engagement', isRtl ? '3. تفاعل الدارسين والأسر' : '3. Engagement Network'),
        allowedRoles: ['super_admin', 'admin', 'manager', 'teacher', 'student', 'parent'],
        nodes: [
          { id: 'payments', title: t('sidebar.nodes.billingPayments', isRtl ? 'الخزينة والاشتراكات' : 'Billing & Subscriptions'), icon: '💳' },
        ],
      },
      {
        pillarTitle: t('sidebar.pillars.governance', isRtl ? '4. الخزينة والحوكمة' : '4. Treasury & Governance'),
        allowedRoles: ['super_admin', 'admin', 'manager'],
        nodes: [
          { id: 'settings', title: t('sidebar.nodes.platformGovernance', isRtl ? 'ضبط المنظومة والأعدادات' : 'Platform Settings'), icon: '⚙️' },
        ],
      },
    ],
    [t, isRtl]
  );
}

// ==========================================
// 3. MAIN COMPONENT (متوافق تماماً مع MainApp)
// ==========================================
export function EnterpriseSidebar({
  currentAcademyId,
  currentUserRole = 'admin',
  activeTab,             // 👈 متوافق مع MainApp
  setActiveTab,         // 👈 متوافق مع MainApp
  onOpenSearch,         // 👈 فتح نافذة البحث
  onSwitchAcademy,
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = currentLang.startsWith('ar');

  const { formattedTime, hijriDate, gregorianDate } = useLiveClock(isRtl, t);
  const { userEntities, currentEntity, setCurrentEntity, loadingEntity, subscriptionDaysLeft } =
    useAcademyData(currentAcademyId);
  const navigationPillars = useNavigationConfig(t, isRtl);

  const currentEntityHeaderLabel = useMemo(() => {
    const label = currentEntity?.metadata?.entity_label || (isRtl ? 'الأكاديمية' : 'Academy');
    return isRtl ? `${label} الحالية` : `Current ${label}`;
  }, [currentEntity, isRtl]);

  const localizedPlanTier = useMemo(() => {
    if (!currentEntity?.plan_tier) return '';
    const rawTier = currentEntity.plan_tier.toLowerCase();
    const plansMap = {
      pro: isRtl ? 'الباقة الاحترافية' : 'Pro Plan',
      basic: isRtl ? 'الباقة الأساسية' : 'Basic Plan',
      enterprise: isRtl ? 'باقة المؤسسات' : 'Enterprise Plan',
    };
    return plansMap[rawTier] || currentEntity.plan_tier;
  }, [currentEntity, isRtl]);

  const handleAcademySwitch = (selectedEntity) => {
    setCurrentEntity(selectedEntity);
    if (onSwitchAcademy) onSwitchAcademy(selectedEntity);
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

  return (
    <aside
      style={{
        ...styles.aside,
        fontFamily: isRtl ? "'Cairo', sans-serif" : "system-ui, -apple-system, sans-serif",
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.entityMeta}>
          <span style={styles.entityLabel}>{currentEntityHeaderLabel}</span>
          {localizedPlanTier && <span style={styles.planBadge}>{localizedPlanTier}</span>}
        </div>

        {loadingEntity ? (
          <div style={styles.loadingText}>
            {t('common.loading', isRtl ? 'جاري التحميل...' : 'Loading...')}
          </div>
        ) : (
          <AcademySwitcher
            userEntities={userEntities}
            currentEntity={currentEntity}
            onSwitchAcademy={handleAcademySwitch}
            isRtl={isRtl}
            t={t}
          />
        )}

        {/* الوقت والتاريخ */}
        <div style={styles.clockCard}>
          <div>
            <div style={styles.hijriText}>{hijriDate}</div>
            <div style={styles.gregorianText}>{gregorianDate}</div>
          </div>
          <div style={styles.timeText}>{formattedTime}</div>
        </div>

        {/* زر البحث الفوري */}
        <button onClick={onOpenSearch} style={styles.searchBtn}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {t('sidebar.searchPlaceholder', isRtl ? '🔍 ابحث عن طلاب، حلقات...' : '🔍 Search students, halaqas...')}
          </span>
          <kbd style={styles.kbd}>Ctrl K</kbd>
        </button>
      </div>

      {/* صلاحية النظام */}
      <div style={styles.subContainer}>
        <div style={styles.subHeader}>
          <span style={{ color: '#94a3b8' }}>{t('sidebar.subValidity', isRtl ? 'صلاحية النظام:' : 'System Validity:')}</span>
          <span style={{ color: '#10b981', fontWeight: '800' }}>
            {t('sidebar.daysRemaining', isRtl ? 'متبقي {{days}} يوم' : '{{days}} days left', { days: subscriptionDaysLeft })}
          </span>
        </div>
        <div style={styles.subTrack}>
          <div
            style={{
              ...styles.subBar,
              width: `${Math.min((subscriptionDaysLeft / 30) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* روابط القائمة */}
      <div style={styles.scrollArea}>
        {navigationPillars.map((pillar, pIdx) => {
          if (!pillar.allowedRoles.includes(currentUserRole)) return null;

          return (
            <div key={pIdx} style={{ marginBottom: '16px' }}>
              <div style={styles.pillarTitle}>{pillar.pillarTitle}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {pillar.nodes.map((node) => {
                  const isActive = activeTab === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setActiveTab && setActiveTab(node.id)}
                      style={{
                        ...styles.navButton,
                        background: isActive
                          ? 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)'
                          : 'transparent',
                        color: isActive ? '#0f172a' : '#cbd5e1',
                        fontWeight: isActive ? '800' : '600',
                        textAlign: isRtl ? 'right' : 'left',
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

      {/* Footer */}
      <div style={styles.footerContainer}>
        <div style={styles.syncStatus}>
          <span style={styles.statusDot} />
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
            {t('sidebar.syncStatus', isRtl ? 'ربط سحابي متزامن' : 'Cloud Synchronized')}
          </span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          {t('sidebar.logoutBtn', isRtl ? '🚪 إنهاء الجلسة وتسجيل الخروج' : '🚪 End Session & Logout')}
        </button>
      </div>
    </aside>
  );
}

// ==========================================
// 4. STYLES
// ==========================================
const styles = {
  aside: {
    width: '300px',
    height: '100vh',
    backgroundColor: '#0f172a',
    borderInlineEnd: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    color: '#f8fafc',
    position: 'sticky',
    top: 0,
    userSelect: 'none',
    zIndex: 50,
    boxSizing: 'border-box',
  },
  header: {
    padding: '16px 16px 12px 16px',
    borderBottom: '1px solid #1e293b',
    flexShrink: 0,
  },
  entityMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  entityLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#f59e0b',
    letterSpacing: '0.5px',
  },
  planBadge: {
    fontSize: '10px',
    background: '#1e293b',
    color: '#38bdf8',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    border: '1px solid #334155',
  },
  switcherWrapper: {
    position: 'relative',
    width: '100%',
    marginTop: '4px',
  },
  selectDropdown: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#1e293b',
    color: '#38bdf8',
    border: '1px solid #334155',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
  },
  selectOption: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    padding: '8px',
  },
  dropdownArrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    insetInlineEnd: '10px',
    fontSize: '10px',
    color: '#38bdf8',
    pointerEvents: 'none',
  },
  noEntitiesText: {
    fontSize: '12px',
    color: '#94a3b8',
    padding: '6px 0',
  },
  loadingText: {
    fontSize: '13px',
    color: '#94a3b8',
    fontStyle: 'italic',
    padding: '8px 0',
  },
  clockCard: {
    marginTop: '12px',
    padding: '8px 10px',
    background: '#162030',
    borderRadius: '8px',
    border: '1px solid #1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hijriText: { fontSize: '11px', fontWeight: '800', color: '#f59e0b' },
  gregorianText: { fontSize: '10px', color: '#94a3b8', marginTop: '1px' },
  timeText: { fontSize: '12px', fontWeight: '800', color: '#38bdf8', fontFamily: 'monospace' },
  searchBtn: {
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
    cursor: 'pointer',
  },
  kbd: {
    background: '#1e293b',
    padding: '1px 5px',
    borderRadius: '4px',
    border: '1px solid #475569',
    fontSize: '10px',
    color: '#cbd5e1',
  },
  subContainer: {
    padding: '8px 16px',
    background: 'rgba(30, 41, 59, 0.2)',
    borderBottom: '1px solid #1e293b',
    flexShrink: 0,
  },
  subHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    marginBottom: '4px',
  },
  subTrack: {
    width: '100%',
    height: '3px',
    background: '#334155',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  subBar: {
    height: '100%',
    background: '#10b981',
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 10px',
  },
  pillarTitle: {
    padding: '0 8px 6px 8px',
    fontSize: '10px',
    fontWeight: '800',
    color: '#64748b',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  footerContainer: {
    padding: '12px 16px',
    borderTop: '1px solid #1e293b',
    background: '#090d16',
    flexShrink: 0,
  },
  syncStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 6px #10b981',
  },
  logoutBtn: {
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
    gap: '6px',
  },
};

export const Sidebar = EnterpriseSidebar;
export default EnterpriseSidebar;
