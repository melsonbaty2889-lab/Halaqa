import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function LivePreview({ isRtl, title, templateTitle, currentAcademyDisplayName, previewText }) {
  return (
    <div className="w-full max-w-[320px] p-4 rounded-3xl shadow-2xl flex flex-col items-center bg-[var(--surface-card,rgba(15,23,42,0.85))] border border-[var(--border-card,rgba(255,255,255,0.08))] border-t-4 border-t-[var(--primary,#E07A00)] backdrop-blur-md">
      <div className="w-12 h-1 bg-[var(--border-input,#1B2738)] rounded-full mb-4" />
      <div className="text-[11px] font-bold text-[var(--text-main,#FFFFFF)] mb-3 flex items-center gap-1.5">
        <MessageSquare size={13} className="text-[var(--emerald-text,#10B981)]" />
        <span>{isRtl ? 'معاينة الرسالة لدى ولي الأمر' : 'Parent Screen Preview'}</span>
      </div>

      <div className="w-full bg-[var(--surface-input,#0A101D)] border border-[var(--border-input,#1B2738)] rounded-2xl p-3.5 min-h-[280px] flex flex-col justify-between shadow-inner">
        <div>
          <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-[var(--border-input,#1B2738)]">
            <div className="w-7 h-7 rounded-full bg-[var(--emerald-text,#10B981)]/10 text-[var(--emerald-text,#10B981)] flex items-center justify-center text-[11px] font-bold border border-[var(--emerald-text,#10B981)]/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
              {currentAcademyDisplayName.charAt(0)}
            </div>
            <div className="flex-1 truncate">
              <div className="text-[11px] font-bold text-[var(--text-main,#FFFFFF)] truncate">
                {title || templateTitle || currentAcademyDisplayName}
              </div>
              <div className="text-[9px] text-[var(--text-sub,#94A3B8)]">{isRtl ? 'الآن • رسالة مباشرة' : 'Now • Direct Message'}</div>
            </div>
          </div>

          <div className="text-[11px] text-[var(--text-main,#FFFFFF)] whitespace-pre-wrap leading-relaxed">
            {previewText}
          </div>
        </div>

        <div className="mt-4 pt-2 border-t border-[var(--border-input,#1B2738)] flex items-center justify-between text-[9px] text-[var(--text-sub,#94A3B8)]">
          <span>{currentAcademyDisplayName}</span>
          <span className="text-[var(--emerald-text,#10B981)] font-bold tracking-wider">Encrypted</span>
        </div>
      </div>
    </div>
  );
}
