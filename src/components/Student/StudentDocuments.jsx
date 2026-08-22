import React, { useState } from 'react';
import { 
  FileText, Upload, Trash2, Download, ExternalLink, 
  Plus, CheckCircle2, AlertCircle, File 
} from 'lucide-react';

const StudentDocuments = ({ studentId, documents = [], onUploadDocument, onDeleteDocument }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [docName, setDocName] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('حجم الملف يجب ألا يتجاوز 5 ميجابايت');
        setFile(null);
        return;
      }
      setError('');
      setFile(selectedFile);
      if (!docName) {
        setDocName(selectedFile.name.split('.')[0]);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !docName.trim()) {
      setError('يرجى تحديد الملف وإدخال اسم المستند');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', docName);
      formData.append('student_id', studentId);

      await onUploadDocument(formData);
      setDocName('');
      setFile(null);
      setError('');
    } catch (err) {
      setError('حدث خطأ أثناء رفع المستند، حاول مرة أخرى');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* نموذج رفع مستند جديد */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 backdrop-blur-sm">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-primary-400" />
          رفع مستند جديد للطالب
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">اسم المستند *</label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="مثال: شهادة الميلاد / الهوية الوطنية"
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">الملف *</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                className="w-full text-xs text-slate-400 file:mr-0 file:ml-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-slate-700 file:text-slate-200 hover:file:bg-slate-600 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer"
              />
            </div>
          </div>

          {error && (
            <p className="text-rose-400 text-xs flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading || !file}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-medium transition-all shadow-md shadow-primary-600/20 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {isUploading ? 'جاري الرفع...' : 'رفع المستند'}
            </button>
          </div>
        </form>
      </div>

      {/* قائمة المستندات المرفوعة */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 backdrop-blur-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-400" />
          المستندات المحفوظة ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-700/60 rounded-xl">
            <File className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
            <p className="text-xs">لا توجد مستندات مرفوعة لهذا الطالب حتى الآن</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-slate-800 rounded-lg text-primary-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-slate-200 truncate">{doc.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(doc.created_at || Date.now()).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="عرض/تحميل"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {onDeleteDocument && (
                    <button
                      type="button"
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDocuments;
