import React from 'react';
import { Download, Upload, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DataBackupTab({ formData = {}, setFormData, importInputRef, showToast }) {
  const { t } = useTranslation();

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `settings_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (showToast) showToast(t('backup.exportSuccess', 'تم تصدير النسخة الاحتياطية بنجاح'), 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        if (typeof setFormData === 'function') {
          setFormData(parsedData);
          if (showToast) showToast(t('backup.importSuccess', 'تم استيراد البيانات بنجاح'), 'success');
        }
      } catch (err) {
        if (showToast) showToast(t('backup.importError', 'ملف النسخة الاحتياطية غير صالحة'), 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 text-start">
      <div className="card-surface space-y-4 !overflow-visible">
        <div className="flex items-center gap-2 text-[var(--primary)] pb-2 border-b border-[var(--border-input)]">
          <Database size={18} />
          <h3 className="text-xs font-bold">
            {t('backup.title', 'النسخ الاحتياطي واستعادة البيانات')}
          </h3>
        </div>

        <p className="text-xs text-[var(--text-sub)] leading-relaxed">
          {t('backup.description', 'تصدير إعدادات المنظومة لحفظها احتياطياً أو استيرادها في أكاديمية أخرى بنقرة واحدة.')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleExport}
            className="btn-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2 w-full cursor-pointer"
          >
            <Download size={15} />
            <span>{t('backup.exportBtn', 'تصدير الإعدادات (JSON)')}</span>
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
            onClick={() => importInputRef?.current?.click()}
            className="btn-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2 w-full cursor-pointer"
          >
            <Upload size={15} />
            <span>{t('backup.importBtn', 'استيراد إعدادات (JSON)')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
