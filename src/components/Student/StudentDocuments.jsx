/* src/components/Student/StudentDocuments.jsx */
import React from 'react';
import { FileUp, Download, Trash2, FileCheck, Eye } from 'lucide-react';
import colors from '@/theme/colors';

export default function StudentDocuments({ documents = [], onUpload, onDelete, onView }) {
  return (
    <div className={`w-full bg-[${colors.surface || '#0F172A'}] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-right rtl`}>
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-[#FBBF24]" />
          <h3 className="text-white font-bold text-base">مستندات ومرفقات الطالب</h3>
        </div>
        <button 
          type="button"
          onClick={onUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FBBF24] text-[#0F172A] text-xs font-bold hover:bg-[#FBBF24]/95 transition-colors"
        >
          <FileUp className="w-4 h-4" />
          <span>رفع مستند جديد</span>
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {documents.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            لا توجد مستندات مرفقة لهذا الطالب
          </div>
        ) : (
          documents.map((doc) => (
            <div 
              key={doc.id} 
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 text-emerald-400">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">{doc.title || doc.file_name}</span>
                  <span className="text-[11px] text-slate-400">حجم الملف: {doc.file_size || 'غير محدد'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {onView && (
                  <button 
                    type="button"
                    onClick={() => onView(doc)}
                    className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
                    title="معاينة"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <a 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 text-emerald-400 hover:bg-white/10 transition-colors"
                  title="تحميل"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button 
                  type="button"
                  onClick={() => onDelete(doc.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
