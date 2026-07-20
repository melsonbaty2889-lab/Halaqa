import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase'; // التأكد من صحة مسار سوبابيز لديك

export default function EnterpriseSidebar({ 
  currentAcademyId, 
  currentUserRole = 'admin', 
  activeSection, 
  setActiveSection,
  onOpenSearch,
  onSwitchAcademy
}) {
  // 1. حالات الساعة الرقمية والتقويم المزدوج
  const [currentTime, setCurrentTime] = useState(new Date());

  // 2. حالات الكيانات والفروع المتاحة (Entity Switcher)
  const [userEntities, setUserEntities] = useState([]);
  const [currentEntity, setCurrentEntity] = useState(null);

  // تحديث الساعة الرقمية فورياً
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // تنسيق الوقت
  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [currentTime]);

  // حساب التاريخ الهجري تلقائياً
  const hijriDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(currentTime);
    } catch {
      return 'التقويم الهجري';
    }
  }, [currentTime]);

  // حساب التاريخ الميلادي
  const gregorianDate = useMemo(() => {
    return new Intl.DateTimeFormat('ar-EG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(currentTime);
  }, [currentTime]);

  // جلب الكيانات/الفروع المتاحة للمستخدم واستخراج المسمى الديناميكي
  useEffect(() => {
    const fetchPermittedEntities = async () => {
      try {
        const { data, error } = await supabase
          .from('academies')
          .select('id, name, slug, metadata');

        if (error) throw error;

        if (data && data.length > 0) {
          setUserEntities(data);
          const active = data.find(item => item.id === currentAcademyId) || data[0];
          setCurrentEntity(active);
        }
      } catch (err) {
        console.error('Error fetching entities:', err);
      }
    };

    fetchPermittedEntities();
  }, [currentAcademyId]);

  // قراءة مسمى الكيان (المقرأة / الفرع / المركز / الأكاديمية) من الـ metadata
  const entityCustomLabel = useMemo(() => {
    return currentEntity?.metadata?.entity_label_ar || 'الأكاديمية';
  }, [currentEntity]);

  return (
    <aside dir="rtl" style={{
      width: '300px',
      height: '100vh',
      backgroundColor: '#0f172a',
      borderLeft: '1px solid #1e293b',
      display: 'flex',
      flexDirection: 'column',
      color: '#f8fafc',
      fontFamily: "'Cairo', sans-serif",
      position: 'sticky',
      top: 0,
      userSelect: 'none'
    }}>
      
      {/* رأس القائمة: محوّل الكيانات + الساعة والتقويم + زر البحث */}
      <div style={{ padding: '20px 18px 14px 18px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {entityCustomLabel} الحالية
          </span>
        </div>

        {/* محوّل الفروع/الكيانات الديناميكي */}
        {userEntities.length > 1 ? (
          <select
            value={currentAcademyId}
            onChange={(e) => onSwitchAcademy && onSwitchAcademy(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              backgroundColor: '#162030',
              color: '#f8fafc',
              border: '1px solid #334155',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {userEntities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name} ({entity.metadata?.entity_label_ar || 'كيان'})
              </option>
            ))}
          </select>
        ) : (
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whitespace: 'nowrap' }}>
            {currentEntity?.name || 'جاري التحميل...'}
          </div>
        )}

        {/* شريط الساعة والتقويم المزدوج */}
        <div style={{ 
          marginTop: '14px', 
          padding: '10px 12px', 
          background: '#162030', 
          borderRadius: '8px', 
          border: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#f59e0b' }}>{hijriDate}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{gregorianDate}</div>
          </div>
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8', fontFamily: 'monospace' }}>
            {formattedTime}
          </div>
        </div>

        {/* زر البحث السريع */}
        <button
          onClick={onOpenSearch}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '9px 12px',
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
            🔍 ابحث عن طلاب، حلقات أو معلمين...
          </span>
          <kbd style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '4px', border: '1px solid #475569', fontSize: '10px', color: '#cbd5e1' }}>
            Ctrl K
          </kbd>
        </button>
      </div>

    </aside>
  );
}
