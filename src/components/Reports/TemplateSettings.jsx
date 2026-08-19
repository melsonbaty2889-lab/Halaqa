// TemplateSettings.jsx (التصميم الجديد للمعاينة السريعة)
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Btn } from '@/components/UI/UI';

export default function TemplateSettings({ templateText, onNavigateToTemplates }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith('ar');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="p-3 bg-slate-900 border-slate-800 rounded-xl mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">
            {t('reports.template_preview', { defaultValue: isRtl ? 'قالب التقرير اليومي' : 'Daily Report Template' })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Btn 
            variant="outline" 
            onClick={onNavigateToTemplates} 
            className="py-1 px-2.5 text-[11px] border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center gap-1 rounded-lg"
          >
            <Settings2 size={12} />
            <span>{t('reports.edit_template', { defaultValue: isRtl ? 'إدارة القوالب' : 'Manage Templates' })}</span>
          </Btn>
          
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-2.5 p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed dir-auto">
          {templateText || (isRtl ? 'لم يتم تحديد قالب بعد.' : 'No template defined.')}
        </div>
      )}
    </Card>
  );
}
