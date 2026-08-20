import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileUp, Download, Trash2, FileCheck, Eye, FileText, Image as ImageIcon } from 'lucide-react';
import colors from '@/theme/colors';

export default function StudentDocuments({ 
  documents = [], 
  onUpload, 
  onDelete, 
  onView,
  dir = 'rtl' // إمكانية التبديل بين rtl و ltr
}) {
  // يمكنك استخدام useTranslation() للترجمة التلقائية
  const { t } = useTranslation?.() || { t: (key) => key };

  // دالة لاختيار الأيقونة بحسب نوع الملف
  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('image')) return <ImageIcon className="w-4 h-4 text-emerald-400" />;
    return <FileText className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div 
      dir={dir}
      style={{ backgroundColor: colors.surface || '#0F172A' }}
      className="w-full border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-[#FBBF24]" />
          <h3 className="text-white font-bold text-base">
            {t('studentDocuments') || 'مستندات ومرفقات الطالب'}
          </h3>
        </div>
        
        {onUpload && (
          <button 
            type="button"
            onClick={onUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FBBF24] text-[#0F172A] text-xs font-bold hover:bg-[#FBBF24]/95 transition-colors"
          >
            <FileUp className="w-4 h-4" />
            <span>{t('uploadDocument') || 'رفع مستند جديد'}</span>
          </button>
        )}
      </div>

      {/* Documents List */}
      <div className="flex flex-col gap-2.5">
        {documents.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            {t('noDocuments') || 'لا توجد مستندات مرفقة لهذا الطالب'}
          </div>
        ) : (
          documents.map((doc) => (
            <div 
              key={doc.id} 
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  {getFileIcon(doc.file_type)}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">{doc.title || doc.file_name}</span>
                  <span className="text-[11px] text-slate-400">
                    {doc.file_size ? `${doc.file_size}` : ''} 
                    {doc.created_at && ` • ${new Date(doc.created_at).toLocaleDateString()}`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                {onView && (
                  <button 
                    type="button"
                    onClick={() => onView(doc)}
                    className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
                    title={t('preview') || 'معاينة'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                
                {doc.file_url && (
                  <a 
                    href={doc.file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white/5 text-emerald-400 hover:bg-white/10 transition-colors"
                    title={t('download') || 'تحميل'}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}

                {onDelete && (
                  <button 
                    type="button"
                    onClick={() => onDelete(doc.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    title={t('delete') || 'حذف'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
