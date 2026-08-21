import React from 'react';
import { User, Clock, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HalaqaCard({ 
  halaqa, 
  viewMode, 
  getLocalizedText, 
  onNavigateToAttendance, 
  onToggleArchiveHalaqa 
}) {
  const { t } = useTranslation();

  return (
    <div style={{
      padding: '16px',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: '#0c1520',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', margin: 0 }}>
            {getLocalizedText(halaqa.name)}
          </h4>
          <span style={{
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.68rem',
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#22c55e',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            fontWeight: '700'
          }}>
            {t('activeSession', 'جلسة نشطة')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '8px' }}>
          <User size={14} style={{ color: '#C9A84C' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getLocalizedText(halaqa.teacher_name || halaqa.teacher, t('unassigned', 'بانتظار تعيين معتمد'))}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
          <Clock size={13} style={{ color: '#64748B' }} />
          <span>{halaqa.start_time || '16:00'} - {halaqa.end_time || '17:15'}</span>
          <span style={{ fontSize: '0.68rem', background: 'rgba(21, 35, 50, 0.92)', padding: '2px 6px', borderRadius: '6px', color: '#94a3b8' }}>
            {halaqa.timezone || 'UTC'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
        <button 
          onClick={() => onNavigateToAttendance?.(halaqa.id)} 
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #C9A84C 0%, #A58230 100%)',
            color: '#0c1520',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Video size={14} />
          {t('goToAttendance', 'الانضمام للجلسة المباشرة')}
        </button>

        <button 
          onClick={() => onToggleArchiveHalaqa?.(halaqa.id, halaqa.is_archived)} 
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent',
            color: '#94a3b8',
            fontSize: '0.78rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          {viewMode === 'active' ? t('archive', 'أرشفة') : t('activate', 'تنشيط')}
        </button>
      </div>
    </div>
  );
}
