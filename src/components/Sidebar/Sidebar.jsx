import React, { useState, useEffect, useRef } from "react";
import { formatHijriDate } from '@/utils/dateUtils';
import { supabase } from '@/lib/supabase';
import { getMenuSections } from '@/constants/sidebarMenu';
import SmartHalaqaProLogo from '@/components/UI/SmartHalaqaProLogo.jsx';
import { X } from "lucide-react";

import AcademySelector from './AcademySelector';
import SidebarWidget from './SidebarWidget';
import SidebarSearch from './SidebarSearch';
import SidebarMenu from './SidebarMenu';
import SidebarFooter from './SidebarFooter';

export default function Sidebar({
  currentAcademyId,
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
  userRole = 'admin' // 1. استلام صلاحية المستخدم من المكون الأب
  }) {
  const [academiesList, setAcademiesList] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const menuSections = getMenuSections(isRtl);
  const [openSectionId, setOpenSectionId] = useState(null);

  const getText = (val) => {
    if (!val) return '';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return isRtl ? (val.ar || val.en || '') : (val.en || val.ar || '');
    }
    return '';
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
    const activeSection = menuSections.find(sec => sec.items.some(item => item.id === activeTab));
    if (activeSection) {
      setOpenSectionId(activeSection.id);
    } else {
      setOpenSectionId('ops');
    }
  }, [activeTab]);

  const toggleSection = (sectionId) => {
    setOpenSectionId(prev => (prev === sectionId ? null : sectionId));
  };

  const currentLocale = isRtl ? 'ar' : 'en';
  const hijri = formatHijriDate(new Date(), currentLocale);

  const loadAcademies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let list = [];

      const { data: rpcAcademyId, error: rpcError } = await supabase.rpc('get_user_academy_id');
      if (rpcAcademyId && !rpcError) {
        const { data: academyData } = await supabase
          .from('academies')
          .select('id, name, trial_ends_at, is_active')
          .eq('id', rpcAcademyId)
          .single();
        if (academyData) list.push(academyData);
      }

      if (list.length === 0) {
        const { data: staffData } = await supabase
          .from('staff')
          .select('academy_id, academies(id, name, trial_ends_at, is_active)')
          .eq('user_id', user.id);
        if (staffData && staffData.length > 0) {
          list = staffData.map(s => s.academies).filter(Boolean);
        }
      }

      if (list.length === 0) {
        const { data: ownedAcademies } = await supabase
          .from('academies')
          .select('id, name, trial_ends_at, is_active')
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
      console.error("Error loading user academies:", err);
    }
  };

  useEffect(() => {
    loadAcademies();
    const channel = supabase
      .channel('sidebar-academy-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'academies' }, () => {
        loadAcademies();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentAcademyId]);

  const currentAcademy = academiesList.find(a => a.id === currentAcademyId) || academiesList[0];
  const currentAcademyName = getText(currentAcademy?.name) || (isRtl ? 'الأكاديمية الرئيسية' : 'Primary Academy');

  const calculateEffectiveDaysLeft = () => {
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
  };

  const effectiveDaysLeft = calculateEffectiveDaysLeft();

  const getStatusBadge = () => {
    if (currentAcademy) {
      if (currentAcademy.is_active === false) {
        return {
          text: isRtl ? 'قيد التفعيل' : 'Pending',
          style: { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }
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
          style: { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }
        };
      }
      if (effectiveDaysLeft > 0) {
        return {
          text: isRtl ? 'فترة تجريبية' : 'Free Trial',
          style: { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }
        };
      }
      return {
        text: isRtl ? 'منتهي الصلاحية' : 'Expired',
        style: { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }
      };
    }
    return {
      text: isRtl ? 'اشتراك نشط' : 'Active Plan',
      style: { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }
    };
  };

  const statusBadge = getStatusBadge();

  const normalizeArabic = (text) => {
    const str = getText(text);
    if (!str) return '';
    return str
      .replace(/[\u064B-\u0652]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .toLowerCase();
  };

  const filteredMenuSections = menuSections.map(section => {
    const filteredItems = section.items.filter(item =>
      normalizeArabic(item.label).includes(normalizeArabic(searchQuery.trim()))
    );
    return { ...section, items: filteredItems };
  }).filter(section => section.items.length > 0);

  const sidebarStyles = {
    position: isMobile ? 'fixed' : 'relative',
    top: 0,
    bottom: 0,
    [isRtl ? 'right' : 'left']: 0,
    width: isMobile ? 'min(300px, 84vw)' : '280px',
    backgroundColor: '#0b1320',
    borderLeft: isRtl && !isMobile ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
    borderRight: !isRtl && !isMobile ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    transform: isMobile && !sidebarOpen 
      ? (isRtl ? 'translateX(100%)' : 'translateX(-100%)') 
      : 'translateX(0)',
    transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isMobile && sidebarOpen ? '0 0 35px rgba(0,0,0,0.85)' : 'none',
    boxSizing: 'border-box',
    userSelect: 'none'
  };

  return (
    <>
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 999
          }}
        />
      )}

      <aside style={sidebarStyles} dir={isRtl ? 'rtl' : 'ltr'}>
        <div style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '12px', 
            paddingBottom: '10px', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <SmartHalaqaProLogo size={36} />
              <div>
                <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', lineHeight: '1.2' }}>
                  {isRtl ? 'الحلقة الذكية' : 'Smart Halaqa'}
                </h2>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '500' }}>
                  {isRtl ? 'إدارة المقارئ والأكاديميات' : 'Quranic Academy Platform'}
                </span>
              </div>
            </div>

            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            )}
          </div>

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
            setActiveTab={setActiveTab}
            setShowEarlyUpgrade={setShowEarlyUpgrade}
            isMobile={isMobile}
            setSidebarOpen={setSidebarOpen}
            isRtl={isRtl}
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
            setActiveTab={setActiveTab}
            isMobile={isMobile}
            setSidebarOpen={setSidebarOpen}
            getText={getText}
            isRtl={isRtl}
          />

        </div>

        <SidebarFooter isRtl={isRtl} />
      </aside>
    </>
  );
}
