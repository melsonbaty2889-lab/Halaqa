// src/components/Sidebar/Sidebar.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAcademy } from '@/context/AcademyContext';
import { getMenuSections } from '@/constants/sidebarMenu';
import { colors as C } from '@/theme/colors';

import AcademySelector from './AcademySelector';
import SidebarWidget from './SidebarWidget';
import SidebarSearch from './SidebarSearch';
import SidebarMenu from './SidebarMenu';
import SidebarFooter from './SidebarFooter';

export default function Sidebar({
  currentAcademyId,
  academy: propAcademy,
  onSwitchAcademy,
  onOpenCreateAcademy,
  canCreateAcademy = false,
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
  const navigate = useNavigate();
  const { slug } = useParams();

  const { academy: contextAcademy, academiesList = [], setAcademy } = useAcademy();
  const { i18n } = useTranslation();
  
  const currentLang = i18n.language || (isRtl ? 'ar' : 'en');
  const isRtlMode = i18n.dir ? i18n.dir(currentLang) === 'rtl' : ['ar', 'ur'].includes(currentLang);
  const currentDir = isRtlMode ? 'rtl' : 'ltr';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const safeT = useCallback((key, fallback) => {
    if (typeof t === 'function') {
      return t(key, { defaultValue: fallback || key });
    }
    return fallback || key;
  }, [t]);

  const menuSections = useMemo(() => {
    return getMenuSections(safeT, userRole);
  }, [safeT, userRole]);

  const [openSectionId, setOpenSectionId] = useState(null);

  const getText = useCallback((val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      const extracted = val[currentLang] || (isRtlMode ? (val.ar || val.en) : (val.en || val.ar)) || val.fr || val.tr || val.ur || val.id;
      if (extracted && typeof extracted !== 'object') return String(extracted);
      
      const firstVal = Object.values(val).find(v => v && typeof v !== 'object');
      if (firstVal) return String(firstVal);
      return '';
    }
    return '';
  }, [currentLang, isRtlMode]);

  // 🟢 اختيار التبويب مع ضمان التوافق التام مع React Router وإغلاق القائمة في الهواتف
  const handleSelectTab = useCallback((tabId) => {
    if (typeof setActiveTab === 'function') {
      setActiveTab(tabId);
    }
    
    // التوجيه المعياري الموحد لصفحات التطبيق
    const targetPath = slug ? `/${slug}/${tabId}` : `/${tabId}`;
    navigate(targetPath);

    if (isMobile && typeof setSidebarOpen === 'function') {
      setSidebarOpen(false);
    }
  }, [setActiveTab, slug, navigate, isMobile, setSidebarOpen]);

  const handleSwitch = useCallback((academyId) => {
    const selected = academiesList.find(a => a.id === academyId);
    if (selected && typeof setAcademy === 'function') {
      setAcademy(selected);
    }
    if (typeof onSwitchAcademy === 'function') {
      onSwitchAcademy(academyId);
    }
    if (isMobile && typeof setSidebarOpen === 'function') {
      setSidebarOpen(false);
    }
  }, [academiesList, setAcademy, onSwitchAcademy, isMobile, setSidebarOpen]);

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
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isMobile, sidebarOpen]);

  // 🟢 تزامن الأكورديون مع التبويب النشط
  useEffect(() => {
    if (!activeTab || !menuSections.length) return;

    const targetSection = menuSections.find(sec => 
      sec.items?.some(item => item.id === activeTab)
    );

    if (targetSection) {
      setOpenSectionId(targetSection.id);
    }
  }, [activeTab, menuSections]);

  const toggleSection = useCallback((sectionId) => {
    setOpenSectionId(prev => (prev === sectionId ? null : sectionId));
  }, []);

  const currentAcademy = useMemo(() => {
    return academiesList.find(a => a.id === currentAcademyId) || propAcademy || contextAcademy || academiesList[0] || null;
  }, [academiesList, currentAcademyId, propAcademy, contextAcademy]);

  const rawAcademyName = getText(currentAcademy?.name);
  const currentAcademyName = typeof rawAcademyName === 'string' && rawAcademyName.trim() !== '' 
    ? rawAcademyName.trim() 
    : safeT('sidebar.unnamedAcademy', 'أكاديمية بدون اسم');

  const academyLogo = useMemo(() => {
    const rawLogo = currentAcademy?.logo_url || propAcademy?.logo_url;
    if (typeof rawLogo !== 'string' || !rawLogo.trim()) return null;

    const version = currentAcademy?.updated_at || propAcademy?.updated_at;
    if (!version) return rawLogo;

    try {
      if (rawLogo.startsWith('http://') || rawLogo.startsWith('https://')) {
        const url = new URL(rawLogo);
        url.searchParams.set('v', String(version));
        return url.toString();
      }
      const separator = rawLogo.includes('?') ? '&' : '?';
      return `${rawLogo}${separator}v=${encodeURIComponent(version)}`;
    } catch {
      return rawLogo;
    }
  }, [currentAcademy?.logo_url, currentAcademy?.updated_at, propAcademy?.logo_url, propAcademy?.updated_at]);

  const effectiveDaysLeft = useMemo(() => {
    if (!currentAcademy) return trialDaysLeft ?? 0;

    const targetExpiryDate = currentAcademy.saas_subscription?.expires_at || currentAcademy.trial_ends_at;

    if (targetExpiryDate) {
      const endDate = new Date(targetExpiryDate);
      if (isNaN(endDate.getTime())) return trialDaysLeft ?? 0;

      const diffTime = endDate.getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    }

    return trialDaysLeft ?? 0;
  }, [currentAcademy, trialDaysLeft]);

  const statusBadge = useMemo(() => {
    const getBadgeStyle = (type) => ({
      background: C.status?.[`${type}Bg`] || 'rgba(255,255,255,0.05)',
      color: C.status?.[`${type}Text`] || '#ffffff',
      border: `1px solid ${C.status?.[`${type}Border`] || 'transparent'}`
    });

    if (!currentAcademy) return null;

    if (currentAcademy.is_active === false) {
      return { text: safeT('status.pending', 'قيد التفعيل'), style: getBadgeStyle('pending') };
    }

    const subStatus = currentAcademy.saas_subscription?.status;

    if (subStatus === 'canceled' || subStatus === 'expired') {
      return { text: safeT('status.expired', 'منتهي الصلاحية'), style: getBadgeStyle('expired') };
    }

    const isTrial = subStatus === 'trial' || (!currentAcademy.saas_subscription && effectiveDaysLeft > 0);
    if (isTrial && effectiveDaysLeft > 0) {
      return { text: safeT('status.trial', 'فترة تجريبية'), style: getBadgeStyle('trial') };
    }

    if (subStatus === 'active' && effectiveDaysLeft > 0) {
      return { text: safeT('status.active', 'اشتراك نشط'), style: getBadgeStyle('active') };
    }

    return { text: safeT('status.expired', 'منتهي الصلاحية'), style: getBadgeStyle('expired') };
  }, [currentAcademy, effectiveDaysLeft, safeT]);

  const normalizeArabic = useCallback((str) => {
    if (!str) return '';
    return String(str)
      .replace(/[\u064B-\u0652]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase();
  }, []);

  const filteredMenuSections = useMemo(() => {
    const query = normalizeArabic(searchQuery.trim());
    if (!query) return menuSections;

    return menuSections.map(section => {
      const filteredItems = (section.items || []).filter(item => {
        const labelText = getText(item.label);
        return normalizeArabic(labelText).includes(query);
      });
      return { ...section, items: filteredItems };
    }).filter(section => section.items.length > 0);
  }, [menuSections, searchQuery, normalizeArabic, getText]);

  const sidebarStyles = {
    position: isMobile ? 'fixed' : 'sticky',
    top: 0,
    bottom: 0,
    height: '100dvh',
    insetInlineStart: 0,
    width: isMobile ? '100%' : '280px',
    maxWidth: isMobile ? '100vw' : '280px',
    backgroundColor: C.dark?.card || 'var(--surface-card)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderInlineEnd: `1px solid ${C.dark?.cardBorder || C.appBorder?.card || 'transparent'}`,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transform: isMobile 
      ? (sidebarOpen 
          ? 'translateX(0)' 
          : (isRtlMode ? 'translateX(100%)' : 'translateX(-100%)'))
      : 'none',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: isMobile && sidebarOpen ? (C.shadows?.sidebarOverlay || '0 10px 25px -5px rgba(0, 0, 0, 0.5)') : 'none',
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
            backgroundColor: C.dark?.overlay || 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}

      <aside style={sidebarStyles} dir={currentDir}>
        <div style={{ 
          padding: isMobile ? '8px 10px' : '12px 14px',
          borderBottom: `1px solid ${C.dark?.cardBorder || C.appBorder?.card || 'transparent'}`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <AcademySelector
              academiesList={academiesList}
              currentAcademy={currentAcademy}
              currentAcademyId={currentAcademyId || currentAcademy?.id}
              currentAcademyName={currentAcademyName}
              academyLogo={academyLogo}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              dropdownRef={dropdownRef}
              statusBadge={statusBadge}
              onSwitchAcademy={handleSwitch}
              onOpenCreateAcademy={canCreateAcademy ? onOpenCreateAcademy : null}
              onClose={isMobile ? () => setSidebarOpen(false) : undefined}
              getText={getText}
            />
          </div>
        </div>

        <div 
          style={{ 
            padding: isMobile ? '8px' : '12px', 
            flex: 1, 
            overflowY: 'auto', 
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorY: 'contain'
          }}
        >
          <SidebarWidget
            academyTime={academyTime}
            setActiveTab={handleSelectTab}
            setShowEarlyUpgrade={setShowEarlyUpgrade}
            isMobile={isMobile}
            setSidebarOpen={setSidebarOpen}
            isRtl={isRtlMode}
            effectiveDaysLeft={effectiveDaysLeft}
            preferredCalendar={currentAcademy?.calendar_type}
            t={safeT}
          />

          <SidebarSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isRtl={isRtlMode}
            t={safeT}
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
            isRtl={isRtlMode}
          />
        </div>

        <div style={{ 
          padding: isMobile ? '8px 10px' : '10px 12px',
          paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
          borderTop: `1px solid ${C.dark?.cardBorder || C.appBorder?.card || 'transparent'}`,
          flexShrink: 0,
          backgroundColor: C.dark?.card || 'var(--surface-card)'
        }}>
          <SidebarFooter isRtl={isRtlMode} t={safeT} />
        </div>
      </aside>
    </>
  );
}
