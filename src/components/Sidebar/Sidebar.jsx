// src/components/Sidebar/Sidebar.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatHijriDate } from '@/utils/dateUtils';
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

  const { academy: contextAcademy, academiesList, setAcademy } = useAcademy();
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

  const handleSelectTab = useCallback((tabId) => {
    if (typeof setActiveTab === 'function') {
      setActiveTab(tabId);
    }
    if (slug) {
      navigate(`/${slug}/${tabId}`);
    } else {
      navigate(`/${tabId}`);
    }
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

  useEffect(() => {
    if (!activeTab || !menuSections.length) return;

    const targetSection = menuSections.find(sec => 
      sec.items?.some(item => item.id === activeTab)
    );

    if (targetSection) {
      setOpenSectionId(prev => {
        if (prev === targetSection.id) return prev;
        return prev ?? targetSection.id;
      });
    }
  }, [activeTab, menuSections]);

  const toggleSection = useCallback((sectionId) => {
    setOpenSectionId(prev => (prev === sectionId ? null : sectionId));
  }, []);

  const hijri = useMemo(() => formatHijriDate(new Date(), currentLang), [currentLang]);

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

  //  تحديد شارات الحالة الموحدة بالاعتماد على التوكنز
  const statusBadge = useMemo(() => {
    if (!currentAcademy) return null;

    if (currentAcademy.is_active === false) {
      return {
        text: safeT('sidebar.badgeBlocked', 'معطل'),
        style: {
          background: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }
      };
    }

    const subStatus = currentAcademy.saas_subscription?.status;
    const planDuration = currentAcademy.saas_subscription?.plan_duration || 'monthly';

    if (subStatus === 'active') {
      const isYearly = planDuration === 'yearly';
      const label = isYearly 
        ? safeT('sidebar.badgeYearly', 'اشتراك سنوي')
        : safeT('sidebar.badgeMonthly', 'اشتراك شهري');

      return {
        text: label,
        style: {
          background: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          border: '1px solid var(--color-success-border)'
        }
      };
    }

    const isTrial = subStatus === 'trial' || subStatus === 'trialing' || (!currentAcademy.saas_subscription && effectiveDaysLeft > 0);
    if (isTrial && effectiveDaysLeft > 0) {
      return {
        text: safeT('sidebar.badgeTrial', 'تجريبي'),
        style: {
          background: 'rgba(59, 130, 246, 0.15)',
          color: '#60a5fa',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }
      };
    }

    return {
      text: safeT('sidebar.badgeExpired', 'منتهي'),
      style: {
        background: 'rgba(245, 158, 11, 0.15)',
        color: '#fbbf24',
        border: '1px solid rgba(245, 158, 11, 0.3)'
      }
    };
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
    width: isMobile ? '100%' : '17.5rem',
    maxWidth: isMobile ? '100vw' : '17.5rem',
    backgroundColor: 'var(--color-surface-card)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderInlineEnd: '1px solid var(--color-border-card)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transform: isMobile 
      ? (sidebarOpen 
          ? 'translateX(0)' 
          : (isRtlMode ? 'translateX(100%)' : 'translateX(-100%)'))
      : 'none',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: isMobile && sidebarOpen ? 'var(--shadow-main)' : 'none',
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
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}

      <aside style={sidebarStyles} dir={currentDir}>
        <div style={{ 
          padding: isMobile ? '0.5rem 0.625rem' : '0.75rem 0.875rem',
          borderBottom: '1px solid var(--color-border-card)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
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
              onOpenCreateAcademy={onOpenCreateAcademy}
              onClose={isMobile ? () => setSidebarOpen(false) : undefined}
              getText={getText}
            />
          </div>
        </div>

        <div 
          style={{ 
            padding: isMobile ? '0.5rem' : '0.75rem', 
            flex: 1, 
            overflowY: 'auto', 
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorY: 'contain'
          }}
        >
          <SidebarWidget
            academyTime={academyTime}
            setActiveTab={setActiveTab}
            setShowEarlyUpgrade={setShowEarlyUpgrade}
            isMobile={isMobile}
            setSidebarOpen={setSidebarOpen}
            isRtl={isRtl}
            effectiveDaysLeft={effectiveDaysLeft}
            preferredCalendar={currentAcademy?.calendar_type}
            t={t}
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
          padding: isMobile ? '0.5rem 0.625rem' : '0.625rem 0.75rem',
          paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom, 0px))',
          borderTop: '1px solid var(--color-border-card)',
          flexShrink: 0,
          backgroundColor: 'var(--color-surface-card)'
        }}>
          <SidebarFooter isRtl={isRtlMode} t={safeT} />
        </div>
      </aside>
    </>
  );
}
