import React from 'react';
import { Database, Download, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DataBackupTab({ formData = {}, setFormData, importInputRef, showToast }) {
  const { t } = useTranslation();

  const handleExport = () => {
    const exportSlug = formData?.slug && formData.slug !== '-' ? formData.slug : 'academy';
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `settings-${exportSlug}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (showToast) showToast(t('backup.exportSuccess', 'تم تصدير الإعدادات بنجاح'));
  };

  const handleImport = (e) => {
    const fileReader = new FileReader();
    if (e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (setFormData) {
            setFormData((prev) => ({ 
              ...prev, 
              ...parsed,
              weekend_days: Array.isArray(parsed.weekend_days) ? parsed.weekend_days : ['friday', 'saturday']
            }));
          }
          if (showToast) showToast(t('backup.importSuccess', 'تم استيراد الإعدادات بنجاح، اضغط حفظ لتأكيدها'));
        } catch (err) {
          if (showToast) showToast(t('backup.importError', 'ملف JSON غير صالح'), 'error');
        }
      };
    }
  };

  return (
    <div className="space-y-4 text-start">
      <h2 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
        <Database size={16} /> {t('backup.title', 'النسخ الاحتياطي واستعادة البيانات')}
      </h2>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
        {t('backup.description', 'تصدير إعدادات المنظومة لحفظها احتياطياً أو استيرادها في أكاديمية أخرى بنقرة واحدة.')}
      </p>
      <div className="flex gap-3 flex-wrap pt-2">
        <button 
          type="button" 
          onClick={handleExport} 
          className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
        >
          <Download size={15} /> 
          <span>{t('backup.exportBtn', 'تصدير الإعدادات (JSON)')}</span>
        </button>
        <input ref={importInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <button 
          type="button" 
          onClick={() => importInputRef?.current?.click()} 
          className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
        >
          <Upload size={15} /> 
          <span>{t('backup.importBtn', 'استيراد إعدادات (JSON)')}</span>
        </button>
      </div>
    </div>
  );
}
