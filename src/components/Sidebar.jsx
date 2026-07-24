/* src/components/Sidebar.jsx */
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { formatHijriDate, formatGregorianDate, formatLiveTime } from '../utils/dateUtils';
import { 
  Search, LogOut, X, Cloud, BarChart2, 
  GraduationCap, Building2, Users, 
  Award, CreditCard, Settings, CheckCircle, BarChart3
} from 'lucide-react';

export function Sidebar({ 
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  userRole,
  isMobile,
  isRtl: isRtlProp,
  currentAcademyId, 
  currentUserRole, 
  activeSection, 
  setActiveSection,
  onOpenSearch,
  onSwitchAcademy,
  onNavigateToSubscription,
  isOpenMobile,
  onCloseMobile
}) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isRtl = isRtlProp !== undefined ? isRtlProp : currentLang.startsWith('ar');

  const activeKey = activeTab || activeSection || 'dashboard';
  const role = userRole || currentUserRole || 'admin';
  const isDrawerOpen = sidebarOpen || isOpenMobile || false;

  const handleSelectTab = (id) => {
    if (setActiveTab) setActiveTab(id);
    if (setActiveSection) setActiveSection(id);
    if (setSidebarOpen) setSidebarOpen(false);
    if (onCloseMobile) onCloseMobile();
  };

  const handleCloseDrawer = () => {
    if (setSidebarOpen) setSidebarOpen(false);
    if (onCloseMobile) onCloseMobile();
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [userEntities, setUserEntities] = useState([]);
  const [currentEntity, setCurrentEntity] = useState(null);
  const [loadingEntity, setLoadingEntity] = useState(true);

  const [subscriptionDaysLeft, setSubscriptionDaysLeft] = useState(0);
  const [planTier, setPlanTier] = useState('free');
  const [subStatus, setSubStatus] = useState('trial');

  // تحديث الوقت مباشرة
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = useMemo(() => formatLiveTime(currentTime, currentLang), [currentTime, currentLang]);
  const hijriDate = useMemo(() => formatHijriDate(currentTime, currentLang), [currentTime, currentLang]);
  const gregorianDate = useMemo(() => formatGregorianDate(currentTime, currentLang), [currentTime, currentLang]);

  // جلب معلومات الاشتراك والأكاديمية
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
            const { data: sub } = await supabase
              .from('saas_subscriptions')
              .select('*')
              .eq('academy_id', active.id)
              .maybeSingle();

            if (sub) {
              setPlanTier(sub.plan_tier || 'pro');
              setSubStatus(sub.status || 'active');
              if (sub.expires_at) {
                const diffTime = new Date(sub.expires_at).getTime() - new Date().getTime();
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
        console.error('Error fetching data:', err);
      } finally {
        if (isMounted) setLoadingEntity(false);
      }
    };

    fetchAcademyAndSubscription();
    return () => { isMounted = false; };
  }, [currentAcademyId]);

  const entityCustomLabel = useMemo(() => {
    if (isRtl) return currentEntity?.metadata?.entity_label_ar || 'الأكاديمية الحالية';
    return currentEntity?.metadata?.entity_label_en || 'Current Academy';
  }, [currentEntity, isRtl]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = '/login';
    } catch (err) {
      window.location.href = '/login';
    }
  };

  const globalNavigationPillars = useMemo(() => [
    {
      pillarTitle: isRtl ? '1. مركز القيادة والعمليات' : '1. Operations Hub',
      allowedRoles: ['super_admin', 'admin', 'manager', 'teacher', 'student', 'parent'],
      nodes: [
        { id: 'dashboard', title: isRtl ? 'لوحة التحكم والأداء' : 'Dashboard & Performance', icon: BarChart2 },
        { id: 'reports', title: isRtl ? 'التقارير والتحليلات' : 'Reports & Analytics', icon: BarChart3 }
      ]
    },
    {
      pillarTitle: isRtl ? '2. الشؤون القرآنية والأكاديمية' : '2. Academic Core',
      allowedRoles: ['super_admin', 'admin', 'manager', 'teacher'],
      nodes: [
        { id: 'students', title: isRtl ? 'إدارة الدارسين' : 'Learner Directory', icon: GraduationCap },
        { id: 'halaqas', title: isRtl ? 'المقارئ والحلقات' : 'Halaqas & Sanad', icon: Users },
        { id: 'attendance', title: isRtl ? 'التسميع والتحضير اليومي' : 'Daily Recitation', icon: CheckCircle },
        { id: 'teachers', title: isRtl ? 'الكادر والمقرئين' : 'Faculty & Reciters', icon: Building2 },
        { id: 'exams', title: isRtl ? 'الاختبارات والتقييم' : 'Exams & Diplomas', icon: Award }
      ]
    },
    {
      pillarTitle: isRtl ? '3. الخزينة والحوكمة' : '3. Governance & Treasury',
      allowedRoles: ['super_admin', 'admin', 'manager'],
      nodes: [
        { id: 'payments', title: isRtl ? 'الخزينة والاشتراكات' : 'Billing & Payments', icon: CreditCard },
        { id: 'settings', title: isRtl ? 'ضبط المنظومة' : 'Platform Governance', icon: Settings }
      ]
    }
  ], [isRtl]);

  const handleUpgradeClick = () => {
    if (onNavigateToSubscription) onNavigateToSubscription();
    else handleSelectTab('subscription');
  };

  // 🛡️ النمط الصارم الذي يضمن عدم إخفاء السايدبار في الكمبيوتر نهائياً
  const sidebarStyle = {
    position: isMobile ? 'fixed' : 'sticky',
    top: 0,
    [isRtl ? 'right' : 'left']: 0,
    height: '100vh',
    width: '280px',
    flexShrink: 0,
    zIndex: isMobile ? 9999 : 30,
    transform: isMobile 
      ? (isDrawerOpen ? 'translateX(0)' : (isRtl ? 'translateX(100%)' : 'translateX(-100%)')) 
      : 'none',
    transition: 'transform 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0f172a',
    borderLeft: isRtl ? '1px solid #1e293b' : 'none',
    borderRight: !isRtl ? '1px solid #1e293b' : 'none',
    color: '#f8fafc',
    boxSizing: 'border-box'
  };

  return (
    <>
      {/* خلفية التعتيم على الهواتف */}
      {isMobile && isDrawerOpen && (
        <div 
          onClick={handleCloseDrawer}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998
          }}
        />
      )}

      <aside style={sidebarStyle} className="select-none">
        {/* الهيدر العلوي */}
        <div className="p-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-amber-500 tracking-wide">
              {entityCustomLabel}
            </span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded font-bold border border-slate-700",
                subStatus === 'active' && "bg-emerald-950 text-emerald-400 border-emerald-800",
                subStatus === 'unpaid' && "bg-amber-950 text-amber-300 border-amber-800",
                subStatus !== 'active' && subStatus !== 'unpaid' && "bg-slate-800 text-sky-400"
              )}>
                {planTier.toUpperCase()} ({subStatus === 'active' ? (isRtl ? 'نشط' : 'Active') : subStatus === 'unpaid' ? (isRtl ? 'معلق' : 'Unpaid') : (isRtl ? 'مجاني' : 'Free')})
              </span>

              {isMobile && (
                <button 
                  onClick={handleCloseDrawer}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {loadingEntity ? (
            <div className="text-xs text-slate-400 italic">
              {isRtl ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : userEntities.length > 1 ? (
            <select
              value={currentEntity?.id || ''}
              onChange={(e) => onSwitchAcademy && onSwitchAcademy(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-800 text-white border border-slate-700 text-xs font-bold focus:outline-none"
            >
              {userEntities.map((entity) => (
                <option key={entity.id} value={entity.id} className="bg-slate-900 text-white">
                  {entity.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm font-extrabold text-white truncate">
              {currentEntity?.name || (isRtl ? 'الأكاديمية الرقمية' : 'Digital Academy')}
            </div>
          )}

          {/* التاريخ والساعة */}
          <div className="mt-3 p-2 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-extrabold text-amber-500">{hijriDate}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{gregorianDate}</div>
            </div>
            <div className="text-xs font-extrabold text-sky-400 font-mono">
              {formattedTime}
            </div>
          </div>

          {/* زر البحث */}
          <button
            onClick={onOpenSearch}
            className="mt-2.5 w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center justify-between hover:border-slate-700 transition"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              {isRtl ? 'ابحث عن طلاب، حلقات...' : 'Search students, halaqas...'}
            </span>
            <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-[10px] text-slate-300">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* حالة الاشتراك */}
        <div className="p-3 bg-slate-800/20 border-b border-slate-800 shrink-0">
          <div className="flex justify-between items-center text-[11px] mb-1.5">
            <span className="text-slate-400">{isRtl ? 'صلاحية النظام:' : 'Validity:'}</span>
            {subStatus === 'active' || subStatus === 'trial' ? (
              <span className={cn("font-extrabold", subscriptionDaysLeft <= 5 ? "text-red-500" : "text-emerald-400")}>
                {isRtl ? `متبقي ${subscriptionDaysLeft} يوم` : `${subscriptionDaysLeft} Days left`}
              </span>
            ) : (
              <button 
                onClick={handleUpgradeClick}
                className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-extrabold hover:bg-amber-400 transition"
              >
                {subStatus === 'unpaid' ? (isRtl ? 'تأكيد الدفع ⚡' : 'Confirm Payment ⚡') : (isRtl ? 'ترقية الآن 🚀' : 'Upgrade Now 🚀')}
              </button>
            )}
          </div>
          <div className="w-full h-1 bg-slate-800 rounded overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-300", subscriptionDaysLeft <= 5 ? "bg-red-500" : "bg-emerald-500")}
              style={{ width: subStatus === 'active' ? `${Math.min((subscriptionDaysLeft / 30) * 100, 100)}%` : '0%' }}
            />
          </div>
        </div>

        {/* عناصر التنقل */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {globalNavigationPillars.map((pillar, pIdx) => {
            if (!pillar.allowedRoles.includes(role)) return null;

            return (
              <div key={pIdx}>
                <div className="px-2 pb-1.5 text-[10px] font-extrabold text-slate-500">
                  {pillar.pillarTitle}
                </div>

                <div className="space-y-1">
                  {pillar.nodes.map((node) => {
                    const isActive = activeKey === node.id;
                    const IconComponent = node.icon;

                    return (
                      <button
                        key={node.id}
                        onClick={() => handleSelectTab(node.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150",
                          isRtl ? "text-right" : "text-left",
                          isActive 
                            ? "bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-extrabold shadow-sm" 
                            : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                        )}
                      >
                        <IconComponent className={cn("w-4 h-4 shrink-0", isActive ? "text-slate-950" : "text-amber-500/80")} />
                        <span>{node.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* الفوتر */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-2 mb-2.5">
            <span className={cn(
              "w-2 h-2 rounded-full",
              subStatus === 'active' ? "bg-emerald-500 shadow-[0_0_6px_#10b981]" : "bg-amber-500 shadow-[0_0_6px_#f59e0b]"
            )} />
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-slate-400 inline" />
              {isRtl ? 'ربط سحابي متزامن' : 'Cloud Synchronized'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full p-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isRtl ? 'إنهاء الجلسة وتسجيل الخروج' : 'End Session & Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
