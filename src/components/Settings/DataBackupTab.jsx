import React from 'react';
import { Download, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DataBackupTab({ formData, setFormData, importInputRef, showToast }) {
  const { t } = useTranslation();

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `settings_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result);
        setFormData(importedData);
        if (showToast) showToast(t('settings.importSuccess', 'تم استيراد البيانات بنجاح'), 'success');
      } catch (err) {
        if (showToast) showToast(t('settings.importError', 'فشل في استيراد الملف'), 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-[var(--border-light)] bg-[var(--bg-surface)] space-y-4">
        <h3 className="text-xs font-bold text-[var(--primary)] border-b border-[var(--border-light)] pb-2">
          {t('settings.backupTitle', 'النسخ الاحتياطي واستعادة البيانات')}
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="btn-secondary text-xs px-4 py-2.5 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <Download size={16} />
            <span>{t('settings.exportData', 'تصدير الإعدادات (JSON)')}</span>
          </button>

          <input
            type="file"
            ref={importInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="btn-secondary text-xs px-4 py-2.5 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <Upload size={16} />
            <span>{t('settings.importData', 'استيراد إعدادات (JSON)')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
