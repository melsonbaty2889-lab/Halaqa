// src/components/Sidebar/SidebarMenu.jsx
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { colors as C } from '@/theme/colors';

export default function SidebarMenu({
  filteredMenuSections,
  openSectionId,
  toggleSection,
  searchQuery,
  activeTab,
  setActiveTab,
  isMobile,
  setSidebarOpen,
  getText,
  isRtl
}) {
  return (
    <nav className="flex flex-col gap-1.5 w-full flex-1">
      {filteredMenuSections && filteredMenuSections.length > 0 ? (
        filteredMenuSections.map((section) => {
          const isExpanded = searchQuery.trim().length > 0 || openSectionId === section.id;

          return (
            <div key={section.id} className="mb-1 w-full">
              {/* رأس القسم الرئيسي */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border-0 text-[12.5px] font-bold cursor-pointer transition-all duration-200 ${
                  isExpanded
                    ? 'bg-emerald-500/10 text-emerald-400 border-b border-emerald-500/20'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span className="tracking-wide">{getText(section.title)}</span>
                {isExpanded ? (
                  <ChevronUp size={15} className="text-emerald-400 shrink-0" />
                ) : (
                  <ChevronDown size={15} className="text-slate-500 shrink-0" />
                )}
              </button>

              {/* عناصر القائمة الفرعية */}
              {isExpanded && (
                <div className="flex flex-col gap-1 mt-1.5 rtl:pr-2 ltr:pl-2">
                  {section.items && section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          if (isMobile) setSidebarOpen(false);
                        }}
                        style={
                          isActive
                            ? {
                                background: 'linear-gradient(180deg, #E67E00 0%, #D97706 100%)',
                                color: '#FFFFFF',
                                boxShadow: '0 4px 15px rgba(224, 122, 0, 0.35)',
                                border: '1px solid rgba(255, 255, 255, 0.15)'
                              }
                            : {}
                        }
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs text-start ${
                          isActive
                            ? 'font-bold'
                            : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 font-medium'
                        }`}
                      >
                        {Icon && (
                          <Icon
                            size={17}
                            className={`shrink-0 transition-colors duration-200 ${
                              isActive ? 'text-white' : 'text-slate-400'
                            }`}
                          />
                        )}
                        <span className="text-[13px] leading-none">{getText(item.label)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-center py-4 px-3 text-slate-400 text-xs bg-slate-900/60 rounded-xl border border-white/5">
          {isRtl ? 'لا توجد نتائج تطابق بحثك' : 'No matching results'}
        </div>
      )}
    </nav>
  );
}
