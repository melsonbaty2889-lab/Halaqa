import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Check } from 'lucide-react';
import C from '@/theme/colors';

export default function SelectModal({
  isOpen,
  onClose,
  title,
  options = [],
  selectedValue,
  onSelect
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [searchQuery, setSearchQuery] = useState('');

  // تصفية الخيارات بناءً على البحث
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    
    return options.filter((opt) => {
      const labelMatch = opt.label?.toLowerCase().includes(query);
      const subLabelMatch = opt.subLabel?.toLowerCase().includes(query);
      const valueMatch = opt.value?.toLowerCase().includes(query);
      return labelMatch || subLabelMatch || valueMatch;
    });
  }, [options, searchQuery]);

  if (!isOpen) return null;

  const handleSelect = (value) => {
    onSelect(value);
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border"
        style={{
          backgroundColor: C?.dark?.surface || '#0D1526',
          borderColor: C?.dark?.border || '#1B2738'
        }}
      >
        
        {/* الهيدر */}
        <div 
          className="flex items-center justify-between p-3.5 border-b"
          style={{
            backgroundColor: C?.dark?.bg || '#0A101D',
            borderColor: C?.dark?.border || '#1B2738'
          }}
        >
          <h3 
            className="text-sm font-bold m-0"
            style={{ color: C?.text?.primary || '#FFFFFF' }}
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            title={t('common.close', 'إغلاق')}
            aria-label={t('common.close', 'إغلاق')}
            className="p-1 rounded-lg transition min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            style={{ color: C?.text?.secondary || '#94A3B8' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* حقل البحث (يظهر إذا كان عدد الخيارات أكثر من 5) */}
        {options.length > 5 && (
          <div 
            className="p-3 border-b"
            style={{ borderColor: C?.dark?.border || '#1B2738' }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder={t('common.search_placeholder', 'بحث...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className={`w-full py-2 border rounded-xl text-xs outline-none transition ${
                  isRtl ? 'ps-9 pe-3' : 'pe-9 ps-3'
                }`}
                style={{
                  backgroundColor: C?.dark?.bg || '#0A101D',
                  borderColor: C?.dark?.border || '#1B2738',
                  color: C?.text?.primary || '#FFFFFF'
                }}
              />
              <Search 
                size={14} 
                className={`absolute top-2.5 ${isRtl ? 'start-3' : 'end-3'}`} 
                style={{ color: C?.text?.secondary || '#94A3B8' }}
              />
            </div>
          </div>
        )}

        {/* قائمة الخيارات */}
        <div className="overflow-y-auto p-2 space-y-1">
          {filteredOptions.length === 0 ? (
            <div 
              className="p-6 text-center text-xs"
              style={{ color: C?.text?.secondary || '#94A3B8' }}
            >
              {t('common.no_results', 'لا توجد نتائج مطابقة')}
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selectedValue === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  title={option.label}
                  aria-label={option.label}
                  className="w-full flex items-center justify-between p-2.5 min-h-[44px] rounded-xl text-xs transition text-start cursor-pointer border border-transparent"
                  style={{
                    backgroundColor: isSelected 
                      ? (C?.primary?.bg || 'rgba(224, 122, 0, 0.15)') 
                      : 'transparent',
                    color: isSelected 
                      ? (C?.primary?.DEFAULT || '#E07A00') 
                      : (C?.text?.primary || '#FFFFFF'),
                    fontWeight: isSelected ? '700' : '500'
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span>{option.label}</span>
                    {option.subLabel && (
                      <span 
                        className="text-[10px] font-normal text-start"
                        style={{ color: C?.text?.secondary || '#94A3B8' }}
                      >
                        {option.subLabel}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <Check 
                      size={15} 
                      className="shrink-0 ms-2" 
                      style={{ color: C?.primary?.DEFAULT || '#E07A00' }}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
