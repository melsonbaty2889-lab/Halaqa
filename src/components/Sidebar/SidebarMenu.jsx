import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
                    ? 'bg-emerald-950/40 text-emerald-400 border-b border-emerald-500/20 shadow-sm'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
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
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-0 cursor-pointer transition-all duration-200 text-xs text-start ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 font-bold rtl:border-r-[3.5px] ltr:border-l-[3.5px] border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                            : 'bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-emerald-300 font-medium'
                        }`}
                      >
                        {Icon && (
                          <Icon
                            size={17}
                            className={`shrink-0 transition-colors duration-200 ${
                              isActive ? 'text-amber-400' : 'text-slate-400'
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
        <div className="text-center py-4 px-3 text-slate-400 text-xs bg-slate-900/80 rounded-lg border border-slate-800">
          {isRtl ? 'لا توجد نتائج تطابق بحثك' : 'No matching results'}
        </div>
      )}
    </nav>
  );
}
