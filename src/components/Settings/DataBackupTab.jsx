import React from 'react';
import { Download, Upload, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DataBackupTab({ formData = {}, setFormData, importInputRef, showToast }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl' || i18n.language === 'ar';

  const handleExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `settings_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      if (showToast) {
        showToast(
          t('backup.exportSuccess', isRtl ? 'تم تصدير النسخة الاحتياطية بنجاح' : 'Backup exported successfully'),
          'success'
        );
      }
    } catch (err) {
      if (showToast) {
        showToast(
          t('backup.exportError', isRtl ? 'حدث خطأ أثناء تصدير البيانات' : 'Error exporting configuration data'),
          'error'
        );
      }
    }
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
          if (showToast) {
            showToast(
              t('backup.importSuccess', isRtl ? 'تم استيراد البيانات بنجاح' : 'Configuration imported successfully'),
              'success'
            );
          }
        }
      } catch (err) {
        if (showToast) {
          showToast(
            t('backup.importError', isRtl ? 'ملف النسخة الاحتياطية غير صالحة' : 'Invalid backup JSON file'),
            'error'
          );
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-5 text-start w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-semantic-surfaceCard border border-semantic-borderCard rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 !overflow-visible w-full">
        <div className="flex items-center gap-2 text-semantic-actionPrimary pb-2 border-b border-semantic-borderInput">
          <Database size={18} />
          <h3 className="text-xs font-bold text-semantic-textPrimary">
            {t('backup.title', isRtl ? 'النسخ الاحتياطي واستعادة البيانات' : 'Data Backup & Export')}
          </h3>
        </div>

        <p className="text-xs text-semantic-textSecondary leading-relaxed">
          {t('backup.description', isRtl 
            ? 'تصدير إعدادات المنظومة لحفظها احتياطياً أو استيرادها في أكاديمية أخرى بنقرة واحدة.' 
            : 'Export system settings for backup or import them into another academy in one click.')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleExport}
            className="bg-semantic-surfaceInput hover:bg-semantic-surfaceInput/80 text-semantic-textSecondary hover:text-semantic-textPrimary border border-semantic-borderInput text-xs py-2.5 px-4 flex items-center justify-center gap-2 w-full cursor-pointer rounded-xl font-bold transition-all"
          >
            <Download size={15} />
            <span>{t('backup.exportBtn', isRtl ? 'تصدير الإعدادات (JSON)' : 'Export Configuration (.json)')}</span>
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
            className="bg-semantic-surfaceInput hover:bg-semantic-surfaceInput/80 text-semantic-textSecondary hover:text-semantic-textPrimary border border-semantic-borderInput text-xs py-2.5 px-4 flex items-center justify-center gap-2 w-full cursor-pointer rounded-xl font-bold transition-all"
          >
            <Upload size={15} />
            <span>{t('backup.importBtn', isRtl ? 'استيراد الإعدادات (JSON)' : 'Import Configuration (.json)')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
