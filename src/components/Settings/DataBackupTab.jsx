import React from 'react';
import { Database, Download, Upload } from 'lucide-react';

export default function DataBackupTab({ formData = {}, setFormData, importInputRef, showToast, isRtl }) {
  const handleExport = () => {
    const exportSlug = formData?.slug && formData.slug !== '-' ? formData.slug : 'academy';
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `settings-${exportSlug}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (showToast) showToast(isRtl ? 'تم تصدير الإعدادات بنجاح' : 'Settings exported successfully');
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
          if (showToast) showToast(isRtl ? 'تم استيراد الإعدادات بنجاح، اضغط حفظ لتأكيدها' : 'Settings imported successfully, click save to confirm');
        } catch (err) {
          if (showToast) showToast(isRtl ? 'ملف JSON غير صالح' : 'Invalid JSON file', 'error');
        }
      };
    }
  };

  return (
    <div className="space-y-4 text-start">
      <h2 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
        <Database size={16} /> {isRtl ? 'النسخ الاحتياطي واستعادة البيانات' : 'Backup & Restoration'}
      </h2>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
        {isRtl 
          ? 'تصدير إعدادات المنظومة لحفظها احتياطياً أو استيرادها في أكاديمية أخرى بنقرة واحدة.' 
          : 'Export platform configuration as a backup or restore it across organizations with a single click.'}
      </p>
      <div className="flex gap-3 flex-wrap pt-2">
        <button 
          type="button" 
          onClick={handleExport} 
          className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
        >
          <Download size={15} /> 
          <span>{isRtl ? 'تصدير الإعدادات (JSON)' : 'Export Settings (JSON)'}</span>
        </button>
        <input ref={importInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <button 
          type="button" 
          onClick={() => importInputRef?.current?.click()} 
          className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
        >
          <Upload size={15} /> 
          <span>{isRtl ? 'استيراد إعدادات (JSON)' : 'Import Settings (JSON)'}</span>
        </button>
      </div>
    </div>
  );
}
