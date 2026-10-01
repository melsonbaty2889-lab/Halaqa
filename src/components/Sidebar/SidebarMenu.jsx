// src/components/Sidebar/SidebarMenu.jsx
import React, { useMemo, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { colors as C } from '@/theme/colors';

export default function SidebarMenu({
  filteredMenuSections = [],
  openSectionId,
  toggleSection,
  searchQuery = '',
  activeTab,
  setActiveTab,
  isMobile,
  setSidebarOpen,
  t,
  getText: propGetText,
  isRtl = true
}) {
  // 🟢 دالة استخراج النص مع تعيين العربية دائماً كلغة افتراضية أساسية
  const getText = useCallback((val) => {
    if (typeof propGetText === 'function') {
      const res = propGetText(val);
      if (res) return res;
    }
    if (val === null || val === undefined) return '';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      // الاعتماد على اللغة العربية ar أولاً وبشكل صريح
      const extracted = val.ar || val.en || val.fr || val.tr || val.ur || val.id;
      if (extracted && typeof extracted !== 'object') return String(extracted);
      
      const firstVal = Object.values(val).find(v => v && typeof v !== 'object');
      if (firstVal) return String(firstVal);
    }
    return '';
  }, [propGetText]);

  // 🟢 دالة ترجمة تعتمد العربية دائماً كـ Fallback
  const safeT = useCallback((key, fallback) => {
    const defaultArText = typeof fallback === 'object' ? getText(fallback) : (fallback || key);

    if (typeof t === 'function' && typeof key === 'string' && key.trim() !== '') {
      try {
        const res = t(key, { returnObjects: true, defaultValue: defaultArText });
        
        if (res && typeof res === 'object') {
          const valFromObj = getText(res);
          if (valFromObj) return valFromObj;
        }
        
        if (typeof res === 'string' && res !== key && !res.includes('returned an object')) {
          return res;
        }
      } catch (e) {
        console.warn(`Translation error for key: ${key}`, e);
      }
    }
    
    return defaultArText;
  }, [t, getText]);

  // 🟢 استخراج المفتاح الأساسي للتبويب النشط لمعالجة المسارات الفرعية
  const currentActiveKey = useMemo(() => {
    if (!activeTab || typeof activeTab !== 'string') return '';
    return activeTab.split('/')[0].trim();
  }, [activeTab]);

  return (
    <nav className="flex flex-col gap-1.5 w-full flex-1" dir={isRtl ? 'rtl' : 'ltr'}>
      {filteredMenuSections && filteredMenuSections.length > 0 ? (
        filteredMenuSections.map((section) => {
          const isExpanded = searchQuery.trim().length > 0 || openSectionId === section.id;
          
          // استخراج عنوان القسم باللغة العربية كـ Fallback
          const rawTitle = typeof section.title === 'string' ? section.title : getText(section.title);
          const sectionTitle = safeT(rawTitle, rawTitle);

          return (
            <div key={section.id} className="mb-1 w-full">
              {/* زر عنوان القسم الرئيسي */}
              <button
                type="button"
                onClick={() => toggleSection && toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border-0 text-[12.5px] font-bold cursor-pointer transition-all duration-200 select-none ${
                  isExpanded
                    ? 'bg-semantic-successBg/40 text-semantic-success border-b border-semantic-successBorder/30'
                    : 'bg-transparent text-semantic-textSecondary hover:text-semantic-textPrimary hover:bg-white/5'
                }`}
              >
                <span className="tracking-wide text-start leading-relaxed py-0.5 inline-block truncate">
                  {sectionTitle}
                </span>
                {isExpanded ? (
                  <ChevronUp size={15} className="text-semantic-success shrink-0" />
                ) : (
                  <ChevronDown size={15} className="text-semantic-textMuted shrink-0" />
                )}
              </button>

              {/* عناصر القائمة الجانبية التابعة للقسم */}
              {isExpanded && (
                <div 
                  className="flex flex-col gap-1 mt-1.5"
                  style={{
                    paddingRight: isRtl ? '8px' : '0px',
                    paddingLeft: isRtl ? '0px' : '8px'
                  }}
                >
                  {section.items && section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentActiveKey === item.id;
                    
                    // استخراج مسمى العنصر باللغة العربية كـ Fallback
                    const rawLabel = typeof item.label === 'string' ? item.label : getText(item.label);
                    const itemLabel = safeT(rawLabel, rawLabel);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (setActiveTab) setActiveTab(item.id);
                          if (isMobile && typeof setSidebarOpen === 'function') {
                            setSidebarOpen(false);
                          }
                        }}
                        style={
                          isActive
                            ? {
                                background: `linear-gradient(135deg, ${C.primary?.btnStart || '#E67E00'} 0%, ${C.primary?.btnEnd || '#D97706'} 100%)`,
                                color: C.appText?.main || '#FFFFFF',
                                boxShadow: `0 4px 14px ${C.primary?.glow || 'rgba(224, 122, 0, 0.35)'}`,
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                              }
                            : {}
                        }
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs text-start cursor-pointer active:scale-[0.98] select-none ${
                          isActive
                            ? 'font-bold'
                            : 'bg-transparent text-semantic-textSecondary hover:bg-white/5 hover:text-semantic-textPrimary font-medium'
                        }`}
                      >
                        {Icon && (
                          <Icon
                            size={17}
                            className={`shrink-0 transition-colors duration-200 ${
                              isActive ? 'text-white' : 'text-semantic-textSecondary'
                            }`}
                          />
                        )}
                        <span className="text-[13px] leading-relaxed py-0.5 inline-block truncate">
                          {itemLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      ) : (
        /* واجهة عدم وجود نتائج عند البحث */
        <div className="text-center py-4 px-3 text-semantic-textSecondary text-xs bg-semantic-surfaceInput/60 rounded-xl border border-semantic-borderCard">
          <span className="leading-relaxed py-0.5 inline-block">
            {safeT('common.no_search_results', 'لا توجد نتائج تطابق بحثك')}
          </span>
        </div>
      )}
    </nav>
  );
}
