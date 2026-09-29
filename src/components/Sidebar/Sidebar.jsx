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
  const currentDir = i18n.dir ? i18n.dir(currentLang) : (['ar', 'ur'].includes(currentLang) ? 'rtl' : 'ltr');

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
      const extracted = val[currentLang] || (isRtl ? (val.ar || val.en) : (val.en || val.ar));
      if (extracted && typeof extracted !== 'object') return String(extracted);
      
      const firstVal = Object.values(val)[0];
      if (firstVal && typeof firstVal !== 'object') return String(firstVal);
      return '';
    }
    return '';
  }, [currentLang, isRtl]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (slug) {
      navigate(`/${slug}/${tabId}`);
    }
    if (isMobile && typeof setSidebarOpen === 'function') {
      setSidebarOpen(false);
    }
  };

  const handleSwitch = (academyId) => {
    const selected = academiesList.find(a => a.id === academyId);
    if (selected) {
      setAcademy(selected);
    }
    if (typeof onSwitchAcademy === 'function') {
      onSwitchAcademy(academyId);
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

  const hijri = useMemo(() => formatHijriDate(new Date(), currentLang), [currentLang]);

  const currentAcademy = useMemo(() => {
    return academiesList.find(a => a.id === currentAcademyId) || propAcademy || contextAcademy || academiesList[0];
  }, [academiesList, currentAcademyId, propAcademy, contextAcademy]);

  const rawAcademyName = getText(currentAcademy?.name);
  const currentAcademyName = typeof rawAcademyName === 'string' && rawAcademyName.trim() !== '' 
    ? rawAcademyName.trim() 
    : safeT('sidebar.unnamedAcademy', 'أكاديمية بدون اسم');

  const rawLogo = currentAcademy?.logo_url || propAcademy?.logo_url;
  const academyLogo = typeof rawLogo === 'string' && rawLogo ? `${rawLogo}?v=${currentAcademy?.updated_at || Date.now()}` : null;

  // ✅ دالة احتساب الأيام المتبقية بدقة متوافقة مع DB
  const calculateEffectiveDaysLeft = useCallback(() => {
    if (!currentAcademy) return trialDaysLeft ?? 0;

    const targetExpiryDate = currentAcademy.saas_subscription?.expires_at || currentAcademy.trial_ends_at;

    if (targetExpiryDate) {
      const endDate = new Date(targetExpiryDate);
      if (isNaN(endDate.getTime())) return trialDaysLeft ?? 0;

      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return Math.max(0, diffDays);
    }

    return trialDaysLeft ?? 0;
  }, [currentAcademy, trialDaysLeft]);

  const effectiveDaysLeft = calculateEffectiveDaysLeft();

  // ✅ الشارة المطابقة لحالات الاشتراكات المعتمدة في النظام
  const statusBadge = useMemo(() => {
    if (currentAcademy) {
      if (currentAcademy.is_active === false) {
        return {
          text: safeT('status.pending', 'قيد التفعيل'),
          style: { background: C.status?.pendingBg, color: C.status?.pendingText, border: `1px solid ${C.status?.pendingBorder}` }
        };
      }
      
      const subStatus = currentAcademy.saas_subscription?.status;
      const isTrial = subStatus === 'trial' || (!currentAcademy.saas_subscription && effectiveDaysLeft > 0);

      if (isTrial && effectiveDaysLeft > 0) {
        return {
          text: safeT('status.trial', 'فترة تجريبية'),
          style: { background: C.status?.trialBg, color: C.status?.trialText, border: `1px solid ${C.status?.trialBorder}` }
        };
      }

      if (effectiveDaysLeft > 0) {
        return {
          text: safeT('status.active', 'اشتراك نشط'),
          style: { background: C.status?.activeBg, color: C.status?.activeText, border: `1px solid ${C.status?.activeBorder}` }
        };
      }

      return {
        text: safeT('status.expired', 'منتهي الصلاحية'),
        style: { background: C.status?.expiredBg, color: C.status?.expiredText, border: `1px solid ${C.status?.expiredBorder}` }
      };
    }

    return {
      text: safeT('status.active', 'اشتراك نشط'),
      style: { background: C.status?.activeBg, color: C.status?.activeText, border: `1px solid ${C.status?.activeBorder}` }
    };
  }, [currentAcademy, effectiveDaysLeft, safeT]);

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
    insetInlineStart: 0,
    width: isMobile ? '100%' : '280px',
    maxWidth: isMobile ? '100vw' : '280px',
    backgroundColor: C.dark?.card,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderInlineEnd: `1px solid ${C.dark?.cardBorder}`,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transform: isMobile 
      ? (sidebarOpen 
          ? 'translateX(0)' 
          : (currentDir === 'rtl' ? 'translateX(100%)' : 'translateX(-100%)'))
      : 'none',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: isMobile && sidebarOpen ? C.shadows?.sidebarOverlay : 'none',
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
            backgroundColor: C.dark?.overlay,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}

      <aside style={sidebarStyles} dir={currentDir}>
        <div style={{ 
          padding: '12px 14px',
          borderBottom: `1px solid ${C.dark?.cardBorder}`,
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
              onOpenCreateAcademy={onOpenCreateAcademy}
              onClose={isMobile ? () => setSidebarOpen(false) : undefined}
              getText={getText}
            />
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
          <SidebarWidget
            academyTime={academyTime}
            hijri={hijri}
            setActiveTab={handleSelectTab}
            setShowEarlyUpgrade={setShowEarlyUpgrade}
            isMobile={isMobile}
            setSidebarOpen={setSidebarOpen}
            isRtl={currentDir === 'rtl'}
            effectiveDaysLeft={effectiveDaysLeft}
            t={safeT}
          />

          <SidebarSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isRtl={currentDir === 'rtl'}
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
            isRtl={currentDir === 'rtl'}
          />
        </div>

        <div style={{ 
          padding: '10px 12px',
          paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
          borderTop: `1px solid ${C.dark?.cardBorder}`,
          flexShrink: 0,
          backgroundColor: C.dark?.card
        }}>
          <SidebarFooter isRtl={currentDir === 'rtl'} t={safeT} />
        </div>
      </aside>
    </>
  );
}
