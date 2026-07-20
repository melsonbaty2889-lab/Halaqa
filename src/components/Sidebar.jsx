/* src/components/Sidebar.jsx */
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export function EnterpriseSidebar({ 
  currentAcademyId, 
  currentUserRole = 'admin', 
  activeSection = 'dashboard', 
  setActiveSection,
  onOpenSearch,
  onSwitchAcademy
}) {
  // 1. حالات الوقت والتقويم
  const [currentTime, setCurrentTime] = useState(new Date());

  // 2. حالات الكيانات للفروع
  const [userEntities, setUserEntities] = useState([]);
  const [currentEntity, setCurrentEntity] = useState(null);

  // 3. حالات اشتراك الـ SaaS والربط السحابي
  const [subscriptionDaysLeft, setSubscriptionDaysLeft] = useState(30);
  const [planTier, setPlanTier] = useState('الباقة الاحترافية');

  // تحديث الساعة فورياً
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // تنسيق الوقت
  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [currentTime]);

  // التاريخ الهجري
  const hijriDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(currentTime);
    } catch {
      try {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(currentTime);
      } catch {
        return 'التقويم الهجري';
      }
    }
  }, [currentTime]);

  // التاريخ الميلادي
  const gregorianDate = useMemo(() => {
    return new Intl.DateTimeFormat('ar-EG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(currentTime);
  }, [currentTime]);

  // جلب الكيانات المتاحة للمستخدم
  useEffect(() => {
    let isMounted = true;
    const fetchPermittedEntities = async () => {
      try {
        const { data, error } = await supabase
          .from('academies')
          .select('id, name, slug, metadata, subscription_end_date');

        if (error) throw error;

        if (isMounted && data && data.length > 0) {
          setUserEntities(data);
          const active = data.find(item => item.id === currentAcademyId) || data[0];
          setCurrentEntity(active);

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

  // المسمى المخصص للكيان
  const entityCustomLabel = useMemo(() => {
    return currentEntity?.metadata?.entity_label_ar || 'الأكاديمية';
  }, [currentEntity]);

  // دالة الخروج الأمني مع مسح الجلسة
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

  // المحاور الأربعة الذهبية المعتمدة نهائياً
  const globalNavigationPillars = useMemo(() => [
    {
      pillarTitle: '1. مركز القيادة الحية | Live Operations Hub',
      allowedRoles: ['super_admin', 'admin', 'manager', 'teacher', 'student', 'parent'],
      nodes: [
        { id: 'dashboard', title: 'لوحة التحكم والأداء', icon: '📊' },
        { id: 'realtime-audit', title: 'السجل الحي للأنشطة', icon: '⚡' }
      ]
    },
    {
      pillarTitle: '2. الشؤون القرآنية والأكاديمية | Academic Core',
      allowedRoles: ['super_admin', 'admin', 'manager', 'teacher'],
      nodes: [
        { id: 'learner-directory', title: 'إدارة الدارسين', icon: '🎓' },
        { id: 'faculty-reciters', title: 'الكادر والمقرئين', icon: '🕌' },
        { id: 'halaqas-sanad', title: 'المقارئ والحلقات', icon: '👥' },
        { id: 'daily-recitation', title: 'التسميع والتحضير اليومي', icon: '📝' },
        { id: 'curricula-diplomas', title: 'المناهج والشهادات', icon: '📜' }
      ]
    },
    {
      pillarTitle: '3. تفاعل الدارسين والأسر | Engagement Network',
      allowedRoles: ['super_admin', 'admin', 'manager', 'teacher', 'student', 'parent'],
      nodes: [
        { id: 'guardian-portal', title: 'شبكة أسر الدارسين', icon: '🏠' },
        { id: 'gamification-streaks', title: 'الإنجاز والحوافز', icon: '🏆' },
        { id: 'omnichannel-hub', title: 'مركز التنبيهات الموحد', icon: '🔔' }
      ]
    },
    {
      pillarTitle: '4. الخزينة والحوكمة | Treasury & Governance',
      allowedRoles: ['super_admin', 'admin', 'manager'],
      nodes: [
        { id: 'billing-payments', title: 'الخزينة والاشتراكات', icon: '💳' },
        { id: 'asset-management', title: 'المستندات والأصول', icon: '📁' },
        { id: 'growth-referrals', title: 'برنامج النمو والإحالات', icon: '🚀' },
        { id: 'platform-governance', title: 'ضبط المنظومة', icon: '⚙️' }
      ]
    }
  ], []);

  return (
    <aside style={{
      width: '300px',
      height: '100vh',
      backgroundColor: '#0f172a',
      borderInlineEnd: '1px solid #1e293b',
      display: 'flex',
      flexDirection: 'column',
      color: '#f8fafc',
      fontFamily: "'Cairo', sans-serif",
      position: 'sticky',
      top: 0,
      userSelect: 'none',
      zIndex: 50
    }}>
      
      {/* 1. رأس القائمة: اختيار الكيان والمسمى */}
      <div style={{ padding: '16px 16px 12px 16px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', letterSpacing: '0.5px' }}>
            {entityCustomLabel} الحالية
          </span>
          <span style={{ fontSize: '10px', background: '#1e293b', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #334155' }}>
            {planTier}
          </span>
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
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whitespace: 'nowrap' }}>
            {currentEntity?.name || 'جاري التحميل...'}
          </div>
        )}

        {/* 2. شريط الساعة والتقويم المزدوج */}
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

        {/* 3. زر البحث السريع */}
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
            🔍 ابحث عن طلاب، حلقات...
          </span>
          <kbd style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '4px', border: '1px solid #475569', fontSize: '10px', color: '#cbd5e1' }}>
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* 4. مؤشر صلاحية الاشتراك */}
      <div style={{ padding: '8px 16px', background: 'rgba(30, 41, 59, 0.2)', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
          <span style={{ color: '#94a3b8' }}>صلاحية النظام:</span>
          <span style={{ color: '#10b981', fontWeight: '800' }}>متبقي {subscriptionDaysLeft} يوم</span>
        </div>
        <div style={{ width: '100%', height: '3px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min((subscriptionDaysLeft / 30) * 100, 100)}%`, height: '100%', background: '#10b981' }} />
        </div>
      </div>

      {/* 5. القوائم والمحاور التشغيلية الأربعة */}
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
                      onClick={() => setActiveSection && setActiveSection(node.id)}
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
                        textAlign: 'start'
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

      {/* 6. أسفل القائمة: حالة الربط السحابي وزر إنهاء الجلسة */}
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
            ربط سحابي متزامن
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
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
        >
          🚪 إنهاء الجلسة وتسجيل الخروج
        </button>
      </div>

    </aside>
  );
}

// تصدير متوافق مع كافة أنماط الـ Import
export const Sidebar = EnterpriseSidebar;
export default EnterpriseSidebar;
