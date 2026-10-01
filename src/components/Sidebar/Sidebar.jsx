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
  
  // 🟢 تحديد اللغة والاتجاه بدقة مع دعم RTL/LTR
  const currentLang = i18n.language || (isRtl ? 'ar' : 'en');
  const isRtlMode = i18n.dir ? i18n.dir(currentLang) === 'rtl' : ['ar', 'ur'].includes(currentLang);
  const currentDir = isRtlMode ? 'rtl' : 'ltr';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // 🟢 دالة ترجمة آمنة
  const safeT = useCallback((key, fallback) => {
    if (typeof t === 'function') {
      return t(key, { defaultValue: fallback || key });
    }
    return fallback || key;
  }, [t]);

  // 🟢 جلب عناصر القائمة بناءً على الدور الصريح
  const menuSections = useMemo(() => {
    return getMenuSections(safeT, userRole);
  }, [safeT, userRole]);

  const [openSectionId, setOpenSectionId] = useState(null);

  // 🟢 دالة آمنة لاستخراج النصوص المتعددة اللغات (تغطي اللغات الست)
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

  // 🟢 إدارة خيارات التنقل والمسارات على الهاتف وسطق المكتب مع ضمان التوجيه الصحيح
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

  // 🟢 تبديل الأكاديمية دون كود تكراري
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

  // 🟢 إغلاق القائمة المنسدلة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🟢 ضبط قفل تمرير الصفحة على الهاتف دون التأثير على المودالات الأخرى
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isMobile, sidebarOpen]);

  // 🟢 مزامنة القسم المفتوح التلقائي مع التبويب النشط والحفاظ على اختيار المستخدم
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

  // 🟢 الأكاديمية الحالية
  const currentAcademy = useMemo(() => {
    return academiesList.find(a => a.id === currentAcademyId) || propAcademy || contextAcademy || academiesList[0] || null;
  }, [academiesList, currentAcademyId, propAcademy, contextAcademy]);

  const rawAcademyName = getText(currentAcademy?.name);
  const currentAcademyName = typeof rawAcademyName === 'string' && rawAcademyName.trim() !== '' 
    ? rawAcademyName.trim() 
    : safeT('sidebar.unnamedAcademy', 'أكاديمية بدون اسم');

  // 🟢 بناء رابط اللوجو بأمان كامل لمنع إعادة الـ Render ودعم الروابط النسبية والمطلقة
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

  // 🟢 حساب الأيام المتبقية بدقة معتمدة على التواريخ الصريحة
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

  // 🟢 الشارة وشروط حالة الاشتراك المعتمدة بدقة في المنظومة (بدون خطط دائمة)
  const statusBadge = useMemo(() => {
    const getBadgeStyle = (type) => ({
      background: C.status?.[`${type}Bg`] || 'rgba(255,255,255,0.05)',
      color: C.status?.[`${type}Text`] || '#ffffff',
      border: `1px solid ${C.status?.[`${type}Border`] || 'transparent'}`
    });

    if (!currentAcademy) return null;

    // 1. أكاديمية غير مفعلة
    if (currentAcademy.is_active === false) {
      return { text: safeT('status.pending', 'قيد التفعيل'), style: getBadgeStyle('pending') };
    }

    const subStatus = currentAcademy.saas_subscription?.status;

    // 2. اشتراك ملغى أو منتهي صريح
    if (subStatus === 'canceled' || subStatus === 'expired') {
      return { text: safeT('status.expired', 'منتهي الصلاحية'), style: getBadgeStyle('expired') };
    }

    // 3. فترة تجريبية
    const isTrial = subStatus === 'trial' || (!currentAcademy.saas_subscription && effectiveDaysLeft > 0);
    if (isTrial && effectiveDaysLeft > 0) {
      return { text: safeT('status.trial', 'فترة تجريبية'), style: getBadgeStyle('trial') };
    }

    // 4. اشتراك نشط بشرط وجود أيام متبقية
    if (subStatus === 'active' && effectiveDaysLeft > 0) {
      return { text: safeT('status.active', 'اشتراك نشط'), style: getBadgeStyle('active') };
    }

    // 5. في حال انتهاء التاريخ
    return { text: safeT('status.expired', 'منتهي الصلاحية'), style: getBadgeStyle('expired') };
  }, [currentAcademy, effectiveDaysLeft, safeT]);

  // 🟢 تنظيف ومعالجة الحروف العربية والبحث
  const normalizeArabic = useCallback((str) => {
    if (!str) return '';
    return String(str)
      .replace(/[\u064B-\u0652]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase();
  }, []);

  // 🟢 تصفية العناصر مع حماية تحويل الكائنات متعددة اللغات
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

  // 🟢 التنسيقات العامة للـ Sidebar
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
          padding: '12px 14px',
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
          padding: '10px 12px',
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
