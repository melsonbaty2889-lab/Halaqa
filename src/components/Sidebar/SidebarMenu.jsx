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
    <nav className="flex flex-col gap-1 flex-1">
      {filteredMenuSections.length > 0 ? (
        filteredMenuSections.map((section) => {
          const isExpanded = searchQuery.trim().length > 0 || openSectionId === section.id;

          return (
            <div key={section.id} className="mb-1">
              {/* زر رئيس القسم */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md border-0 text-[12px] font-bold cursor-pointer transition-all ${
                  isExpanded 
                    ? 'bg-slate-900/80 text-cyan-400' 
                    : 'bg-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{getText(section.title)}</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {/* عناصر القسم عند الفتح */}
              {isExpanded && (
                <div className={`flex flex-col gap-0.5 mt-1 ${isRtl ? 'pr-2' : 'pl-2'}`}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          if (isMobile) setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md border-none cursor-pointer transition-all text-xs font-medium ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-400 font-bold border-r-4 border-amber-400 shadow-sm'
                            : 'bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white'
                        }`}
                        style={{
                          textAlign: isRtl ? 'right' : 'left'
                        }}
                      >
                        <Icon 
                          size={16} 
                          className={isActive ? 'text-amber-400' : 'text-slate-400'} 
                        />
                        <span className="text-[12.5px]">{getText(item.label)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-center py-3 px-2 text-slate-500 text-xs bg-slate-900 rounded-md border border-slate-800">
          {isRtl ? 'لا توجد نتائج تطابق بحثك' : 'No matching results'}
        </div>
      )}
    </nav>
  );
}
