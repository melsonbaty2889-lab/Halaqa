import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { colors as C } from '@/theme/colors'; // استيراد الألوان الموحدة

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
    <nav style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      flex: 1
    }}>
      {filteredMenuSections.length > 0 ? (
        filteredMenuSections.map((section) => {
          const isExpanded = searchQuery.trim().length > 0 || openSectionId === section.id;

          return (
            <div key={section.id} style={{ marginBottom: '4px' }}>
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  background: isExpanded ? C.dark.card : 'transparent',
                  borderRadius: '6px',
                  border: 'none',
                  color: isExpanded ? C.brandEmerald.light : C.text.muted,
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{getText(section.title)}</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {isExpanded && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  marginTop: '3px',
                  paddingRight: isRtl ? '6px' : 0,
                  paddingLeft: !isRtl ? '6px' : 0
                }}>
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
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: isActive 
                            ? C.brandEmerald.bgGlow 
                            : 'transparent',
                          borderRight: isActive && isRtl ? `3px solid ${C.primary.DEFAULT}` : 'none',
                          borderLeft: isActive && !isRtl ? `3px solid ${C.primary.DEFAULT}` : 'none',
                          color: isActive ? C.primary.light : C.text.body,
                          fontWeight: isActive ? '700' : 'normal',
                          cursor: 'pointer',
                          textAlign: isRtl ? 'right' : 'left',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon style={{ color: isActive ? C.primary.DEFAULT : C.text.placeholder }} size={16} />
                        <span style={{ fontSize: '0.8rem' }}>{getText(item.label)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '12px 8px',
          color: C.text.placeholder,
          fontSize: '0.75rem',
          background: C.dark.card,
          borderRadius: '6px',
          border: `1px solid ${C.dark.border}`
        }}>
          {isRtl ? 'لا توجد نتائج تطابق بحثك' : 'No matching results'}
        </div>
      )}
    </nav>
  );
}
