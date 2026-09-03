// src/components/Sidebar/Sidebar.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { formatHijriDate } from '@/utils/dateUtils';
import { supabase } from '@/lib/supabase';
import { getMenuSections } from '@/constants/sidebarMenu';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo.jsx';
import { X } from "lucide-react";
import { colors as C } from '@/theme/colors';

import AcademySelector from './AcademySelector';
import SidebarWidget from './SidebarWidget';
import SidebarSearch from './SidebarSearch';
import SidebarMenu from './SidebarMenu';
import SidebarFooter from './SidebarFooter';

export default function Sidebar({
  currentAcademyId,
  academy,
  onSwitchAcademy,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  isRtl,
  t,
  trialDaysLeft = 0,
  setShowEarlyUpgrade,
  academyTime,
  userRole = 'admin'
}) {
  const [academiesList, setAcademiesList] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // حماية دالة الترجمة
  const safeT = useCallback((key, fallback) => {
    return typeof t === 'function' ? t(key, fallback) : (fallback || key);
  }, [t]);

  // استخدام useMemo لمنع إعادة الحسابات غير الضرورية للقوائم
  const menuSections = useMemo(() => {
    return getMenuSections(safeT, userRole);
  }, [safeT, userRole]);

  const [openSectionId, setOpenSectionId] = useState(null);

  // دالة منيعة ومحميّة ضد خطأ Minified React error #31
  const getText = useCallback((val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      const extracted = isRtl ? (val.ar || val.en) : (val.en || val.ar);
      if (extracted && typeof extracted !== 'object') return String(extracted);
      
      const firstVal = Object.values(val)[0];
      if (firstVal && typeof firstVal !== 'object') return String(firstVal);
      return '';
    }
    return '';
  }, [isRtl]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (isMobile && typeof setSidebarOpen === 'function') {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  useEffect(() => {
    const activeSection = menuSections.find(sec => sec.items && sec.items.some(item => item.id === activeTab));
    if (activeSection) {
      setOpenSectionId(activeSection.id);
    } else if (menuSections.length > 0) {
      setOpenSectionId(menuSections[0].id);
    }
  }, [activeTab, menuSections]);

  const toggleSection = (sectionId) => {
    setOpenSectionId(prev => (prev === sectionId ? null : sectionId));
  };

  const currentLocale = isRtl ? 'ar' : 'en';
  const hijri = useMemo(() => formatHijriDate(new Date(), currentLocale), [currentLocale]);

  // جلب الأكاديميات بشكل آمن ومتزن
  const loadAcademies = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let list = [];
      const { data: rpcAcademyId, error: rpcError } = await supabase.rpc('get_user_academy_id');
      if (rpcAcademyId && !rpcError) {
        const { data: academyData } = await supabase
          .from('academies')
          .select('id, name, logo_url, slug, trial_ends_at, is_active')
          .eq('id', rpcAcademyId)
          .single();
        if (academyData) list.push(academyData);
      }

      if (list.length === 0) {
        const { data: staffData } = await supabase
          .from('staff')
          .select('academy_id, academies(id, name, logo_url, slug, trial_ends_at, is_active)')
          .eq('user_id', user.id);
        if (staffData && staffData.length > 0) {
          list = staffData.map(s => s.academies).filter(Boolean);
        }
      }

      if (list.length === 0) {
        const { data: ownedAcademies } = await supabase
          .from('academies')
          .select('id, name, logo_url, slug, trial_ends_at, is_active')
          .eq('owner_id', user.id);
        if (ownedAcademies && ownedAcademies.length > 0) {
          list = ownedAcademies;
        }
      }

      setAcademiesList(list);

      if (list.length > 0) {
        const exists = list.some(a => a.id === currentAcademyId);
        if (!currentAcademyId || !exists) {
          if (typeof onSwitchAcademy === 'function') {
            onSwitchAcademy(list[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Error loading academies:", err);
    }
  }, [currentAcademyId, onSwitchAcademy]);

  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) loadAcademies();

    let channel = null;
    try {
      if (typeof supabase?.channel === 'function') {
        channel = supabase
          .channel('sidebar-academy-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'academies' }, () => {
            if (isMounted) loadAcademies();
          })
          .subscribe();
      }
    } catch (err) {
      console.error("Realtime subscription error:", err);
    }

    return () => {
      isMounted = false;
      if (channel && supabase && typeof supabase.removeChannel === 'function') {
        supabase.removeChannel(channel);
      }
    };
  }, [loadAcademies]);

  const currentAcademy = useMemo(() => {
    return academiesList.find(a => a.id === currentAcademyId) || academy || academiesList[0];
  }, [academiesList, currentAcademyId, academy]);

  const rawAcademyName = getText(currentAcademy?.name);
  const currentAcademyName = typeof rawAcademyName === 'string' && rawAcademyName.trim() !== '' 
    ? rawAcademyName.trim() 
    : (isRtl ? 'أكاديمية بدون اسم' : 'Unnamed Academy');

  const rawLogo = currentAcademy?.logo_url || academy?.logo_url;
  const academyLogo = typeof rawLogo === 'string' && rawLogo ? `${rawLogo}?v=${currentAcademy?.updated_at || Date.now()}` : null;

  const academySlug = typeof currentAcademy?.slug === 'string' ? currentAcademy?.slug : (typeof academy?.slug === 'string' ? academy?.slug : '');
  
  const calculateEffectiveDaysLeft = useCallback(() => {
    if (!currentAcademy) return trialDaysLeft ?? 0;
    if (currentAcademy.is_active && !currentAcademy.trial_ends_at) return Infinity;

    if (currentAcademy.trial_ends_at) {
      const endDate = new Date(currentAcademy.trial_ends_at);
      if (isNaN(endDate.getTime())) return trialDaysLeft ?? 0;

      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 3650) return Infinity;
      return diffDays > 0 ? diffDays : 0;
    }

    return trialDaysLeft ?? 0;
  }, [currentAcademy, trialDaysLeft]);

  const effectiveDaysLeft = calculateEffectiveDaysLeft();

  const statusBadge = useMemo(() => {
    if (currentAcademy) {
      if (currentAcademy.is_active === false) {
        return {
          text: isRtl ? 'قيد التفعيل' : 'Pending',
          style: { background: C.error.bg, color: C.error.light, border: `1px solid ${C.error.border}` }
        };
      }
      if (effectiveDaysLeft === Infinity) {
        return {
          text: isRtl ? 'حساب دائم ∞' : 'Lifetime ∞',
          style: { background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.35)' }
        };
      }
      if (effectiveDaysLeft > 14) {
        return {
          text: isRtl ? 'اشتراك نشط' : 'Active Plan',
          style: { background: C.brandEmerald.bgGlow, color: C.brandEmerald.light, border: `1px solid ${C.brandEmerald.border}` }
        };
      }
      if (effectiveDaysLeft > 0) {
        return {
          text: isRtl ? 'فترة تجريبية' : 'Free Trial',
          style: { background: 'rgba(245, 158, 11, 0.15)', color: C.primary.light, border: '1px solid rgba(245, 158, 11, 0.3)' }
        };
      }
      return {
        text: isRtl ? 'منتهي الصلاحية' : 'Expired',
        style: { background: C.error.bg, color: C.error.light, border: `1px solid ${C.error.border}` }
      };
    }
    return {
      text: isRtl ? 'اشتراك نشط' : 'Active Plan',
      style: { background: C.brandEmerald.bgGlow, color: C.brandEmerald.light, border: `1px solid ${C.brandEmerald.border}` }
    };
  }, [currentAcademy, effectiveDaysLeft, isRtl]);

  const normalizeArabic = useCallback((text) => {
    const str = getText(text);
    if (!str) return '';
    return str
      .replace(/[\u064B-\u0652]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase();
  }, [getText]);

  const filteredMenuSections = useMemo(() => {
    return menuSections.map(section => {
      const filteredItems = (section.items || []).filter(item =>
        normalizeArabic(item.label).includes(normalizeArabic(searchQuery.trim()))
      );
      return { ...section, items: filteredItems };
    }).filter(section => section.items.length > 0);
  }, [menuSections, searchQuery, normalizeArabic]);

  const sidebarStyles = {
    position: isMobile ? 'fixed' : 'sticky',
    top: 0,
    bottom: 0,
    height: '100dvh',
    ...(isRtl ? { right: 0, left: 'auto' } : { left: 0, right: 'auto' }),
    width: isMobile ? '82vw' : '280px',
    maxWidth: '320px',
    backgroundColor: C.dark.surfaceCard || '#0f172a',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderLeft: isRtl ? `1px solid ${C.dark.border}` : 'none',
    borderRight: isRtl ? 'none' : `1px solid ${C.dark.border}`,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transform: isMobile 
      ? (sidebarOpen 
          ? 'translateX(0)' 
          : (isRtl ? 'translateX(100%)' : 'translateX(-100%)'))
      : 'none',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: isMobile && sidebarOpen ? (isRtl ? '-10px 0 30px rgba(0,0,0,0.5)' : '10px 0 30px rgba(0,0,0,0.5)') : 'none',
    boxSizing: 'border-box'
  };

  return (
    <>
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          onTouchMove={(e) => e.preventDefault()}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}

      <aside style={sidebarStyles} dir={isRtl ? 'rtl' : 'ltr'}>
        <div style={{ 
          padding: '14px 14px 10px 14px',
          borderBottom: `1px solid ${C.dark.border}`,
          flexShrink: 0
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              {academyLogo ? (
                <img 
                  src={academyLogo} 
                  alt={currentAcademyName} 
                  loading="eager"
                  decoding="sync"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    border: `1px solid ${C.dark.border}`,
                    flexShrink: 0
                  }}
                />
              ) : (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <SmartHalaqaProLogo size={36} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '0.92rem', 
                  fontWeight: '700', 
                  color: C.text.title, 
                  lineHeight: '1.2',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {currentAcademyName}
                </h2>
                <span style={{ 
                  fontSize: '0.65rem', 
                  color: C.text.muted, 
                  fontWeight: '500',
                  direction: 'ltr',
                  textAlign: isRtl ? 'right' : 'left',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {academySlug ? `/${academySlug}` : (isRtl ? 'إدارة المقارئ والأكاديميات' : 'Quranic Academy Platform')}
                </span>
              </div>
            </div>

            {isMobile && (
              <button 
                type="button"
                onClick={() => setSidebarOpen(false)}
                style={{ 
                  background: 'rgba(255,255,255,0.06)', 
                  border: `1px solid ${C.dark.border}`, 
                  borderRadius: '8px',
                  color: C.text.muted, 
                  cursor: 'pointer', 
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div 
          style={{ 
            padding: '12px', 
            flex: 1, 
            overflowY: 'auto', 
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorY: 'contain'
          }}
        >
          <AcademySelector
            academiesList={academiesList}
            currentAcademyId={currentAcademyId}
            currentAcademyName={currentAcademyName}
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
            dropdownRef={dropdownRef}
            statusBadge={statusBadge}
            onSwitchAcademy={onSwitchAcademy}
            getText={getText}
            isRtl={isRtl}
          />

          <SidebarWidget
            academyTime={academyTime}
            hijri={hijri}
            setActiveTab={handleSelectTab}
            setShowEarlyUpgrade={setShowEarlyUpgrade}
            isMobile={isMobile}
            setSidebarOpen={setSidebarOpen}
            isRtl={isRtl}
            effectiveDaysLeft={effectiveDaysLeft}
            t={safeT}
          />

          <SidebarSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isRtl={isRtl}
          />

          <SidebarMenu
            filteredMenuSections={filteredMenuSections}
            openSectionId={openSectionId}
            toggleSection={toggleSection}
            searchQuery={searchQuery}
            activeTab={activeTab}
            setActiveTab={handleSelectTab}
            isMobile={isMobile}
            setSidebarOpen={setSidebarOpen}
            getText={getText}
            isRtl={isRtl}
          />
        </div>

        <div style={{ 
          padding: '10px 12px',
          paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
          borderTop: `1px solid ${C.dark.border}`,
          flexShrink: 0,
          backgroundColor: C.dark.surfaceCard || '#0f172a'
        }}>
          <SidebarFooter isRtl={isRtl} />
        </div>
      </aside>
    </>
  );
}
