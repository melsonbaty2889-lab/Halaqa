// src/components/UI/ReportDateSelector.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Globe, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  HIJRI_MONTHS, 
  getHijriParts, 
  formatHijriDate, 
  getSavedHijriOffset, 
  setSavedHijriOffset 
} from '../../utils/dateUtils';

export default function ReportDateSelector({ selectedDate, setSelectedDate }) {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || 'ar';
  
  // فحص اتجاه اللغة للغات RTL (العربية والأوردو)
  const cleanLang = currentLang.toLowerCase().split('-')[0];
  const isRtl = ['ar', 'ur'].includes(cleanLang);

  const [useHijri, setUseHijri] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hijriOffset, setHijriOffsetState] = useState(getSavedHijriOffset());
  const dropdownRef = useRef(null);

  const dateObj = useMemo(() => {
    if (!selectedDate) return new Date();
    const [year, month, day] = selectedDate.split('-').map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
  }, [selectedDate]);

  const [viewDate, setViewDate] = useState(dateObj);

  useEffect(() => {
    setViewDate(dateObj);
  }, [selectedDate, dateObj]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOffsetChange = (newOffset) => {
    setHijriOffsetState(newOffset);
    setSavedHijriOffset(newOffset);
  };

  const formattedDisplayDate = useMemo(() => {
    if (!selectedDate) return '';
    try {
      if (useHijri) {
        return formatHijriDate(dateObj, currentLang, hijriOffset);
      }
      return new Intl.DateTimeFormat(currentLang, {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(dateObj);
    } catch (e) {
      return selectedDate;
    }
  }, [selectedDate, currentLang, useHijri, dateObj, hijriOffset]);

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const headerTitle = useMemo(() => {
    if (useHijri) {
      const { month, year } = getHijriParts(viewDate, hijriOffset);
      const monthsList = HIJRI_MONTHS[cleanLang] || HIJRI_MONTHS.en;
      const monthName = monthsList[month - 1];
      const suffix = isRtl ? 'هـ' : 'AH';
      return `${monthName} ${year} ${suffix}`;
    }
    return new Intl.DateTimeFormat(currentLang, { month: 'long', year: 'numeric' }).format(viewDate);
  }, [viewDate, useHijri, cleanLang, isRtl, currentLang, hijriOffset]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const weekDays = useMemo(() => {
    const days = [];
    const refDate = new Date(2026, 7, 2);
    for (let i = 0; i < 7; i++) {
      const d = new Date(refDate);
      d.setDate(refDate.getDate() + i);
      days.push(new Intl.DateTimeFormat(currentLang, { weekday: 'narrow' }).format(d));
    }
    return days;
  }, [currentLang]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', direction: isRtl ? 'rtl' : 'ltr' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '6px 10px', whiteSpace: 'nowrap' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: 0 }}
        >
          <CalendarIcon size={14} />
          <span style={{ color: '#f8fafc' }}>{selectedDate}</span>
        </button>

        <span style={{ color: '#475569' }}>|</span>

        <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700' }}>
          {formattedDisplayDate}
        </span>

        <button
          type="button"
          onClick={() => setUseHijri(!useHijri)}
          style={{
            background: useHijri ? 'rgba(56, 189, 248, 0.2)' : '#0f172a',
            color: useHijri ? '#38bdf8' : '#94a3b8',
            border: `1px solid ${useHijri ? '#38bdf8' : '#334155'}`,
            borderRadius: '6px',
            padding: '3px 8px',
            fontSize: '10px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Globe size={11} />
          {useHijri ? (isRtl ? 'هجري' : 'Hijri') : (isRtl ? 'ميلادي' : 'Gregorian')}
        </button>
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '110%', right: isRtl ? 0 : 'auto', left: isRtl ? 'auto' : 0, zIndex: 999, background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', width: '270px', direction: isRtl ? 'rtl' : 'ltr' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <button type="button" onClick={handlePrevMonth} style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
              {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc' }}>{headerTitle}</span>
            <button type="button" onClick={handleNextMonth} style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', borderRadius: '6px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
              {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', marginBottom: '6px' }}>
            {weekDays.map((d, i) => (
              <span key={i} style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>{d}</span>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = dateStr === selectedDate;
              
              const dayObj = new Date(currentYear, currentMonth, dayNum);
              const displayNum = useHijri ? getHijriParts(dayObj, hijriOffset).day : dayNum;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => { setSelectedDate(dateStr); setIsOpen(false); }}
                  style={{
                    background: isSelected ? '#38bdf8' : '#1e293b',
                    color: isSelected ? '#0f172a' : '#f8fafc',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 0',
                    fontSize: '11px',
                    fontWeight: isSelected ? '800' : '500',
                    cursor: 'pointer'
                  }}
                >
                  {displayNum}
                </button>
              );
            })}
          </div>

          {/* شريط ضبط الرؤية الشرعية عند تغير رؤية الهلال */}
          {useHijri && (
            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Settings2 size={11} /> {isRtl ? 'تعديل الرؤية:' : 'Sight Adjustment:'}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[-1, 0, 1].map((offset) => (
                  <button
                    key={offset}
                    type="button"
                    onClick={() => handleOffsetChange(offset)}
                    style={{
                      background: hijriOffset === offset ? '#38bdf8' : '#1e293b',
                      color: hijriOffset === offset ? '#0f172a' : '#94a3b8',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {offset > 0 ? `+${offset}` : offset}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{ width: '100%', marginTop: '10px', background: '#334155', border: 'none', color: '#f8fafc', borderRadius: '6px', padding: '5px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      )}
    </div>
  );
}
