import React from 'react';
import { RefreshCw, CheckCircle2, Hourglass } from 'lucide-react';

export const HalaqaStatusBadge = ({ isLive, isFinished, t }) => {
  const statusClass = isLive 
    ? 'bg-semantic-dangerBg border-semantic-danger/30 text-semantic-danger' 
    : isFinished 
    ? 'bg-semantic-successBg border-semantic-successBorder text-semantic-success' 
    : 'bg-semantic-actionPrimary/10 border-semantic-actionPrimary/30 text-semantic-actionPrimary';

  const statusLabel = isLive 
    ? t('dashboard.status.live', 'مباشر') 
    : isFinished 
    ? t('dashboard.status.finished', 'مكتملة') 
    : t('dashboard.status.scheduled', 'مجدولة');
    
  const StatusIcon = isLive ? RefreshCw : isFinished ? CheckCircle2 : Hourglass;

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold inline-flex items-center gap-1 shrink-0 ${statusClass}`}>
      <StatusIcon size={10} className={isLive ? 'animate-spin' : ''} />
      <span>{statusLabel}</span>
    </span>
  );
};
