import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, Upload, FileText, Filter, Search, Trash2, Eye 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DocumentUploadModal from './DocumentUploadModal';

export const StudentDocuments = ({ studentId, studentName, onBack }) => {
  const { t, i18n } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocuments = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_documents')
        .select('*')
        .eq('student_id', studentId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [studentId]);

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm(t('documents.confirm_delete', 'هل أنت تأكد من حذف هذا المستند؟'))) return;
    try {
      const { error } = await supabase.from('student_documents').delete().eq('id', docId);
      if (error) throw error;
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUploadDocument = async ({ file, documentType, notes }) => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${studentId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('student_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('student_files')
        .getPublicUrl(filePath);

      const { data, error: dbError } = await supabase
        .from('student_documents')
        .insert([{
          student_id: studentId,
          file_name: file.name,
          file_url: publicUrl,
          document_type: documentType,
          notes: notes,
          uploaded_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (dbError) throw dbError;
      setDocuments((prev) => [data, ...prev]);
    } catch (err) {
      console.error('Upload Error:', err);
      alert(err.message);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    const matchesSearch = doc.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 text-white" dir={i18n.dir()}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
              <span>{t('students_module.back_to_list', 'قائمة الطلاب')}</span>
            </button>
          )}

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>{t('documents.title', 'مستندات الطالب')}</span>
              {studentName && <span className="text-amber-400">({studentName})</span>}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('documents.subtitle', 'إدارة الوثائق الثبوتية والملفات المرفقة')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-500/10"
        >
          <Upload className="w-4 h-4" />
          <span>{t('documents.upload_btn', 'رفع مستند جديد')}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.searchPlaceholder', 'بحث في الملفات...')}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl ps-9 pe-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="all">{t('documents.filter_all', 'جميع المستندات')}</option>
            <option value="id_card">{t('documents.types.id_card', 'بطاقة الهوية')}</option>
            <option value="passport">{t('documents.types.passport', 'جواز السفر')}</option>
            <option value="birth_certificate">{t('documents.types.birth_certificate', 'شهادة الميلاد')}</option>
            <option value="parent_consent">{t('documents.types.parent_consent', 'موافقة ولي الأمر')}</option>
            <option value="medical_report">{t('documents.types.medical_report', 'تقرير طبي')}</option>
            <option value="payment_receipt">{t('documents.types.payment_receipt', 'إيصال دفع')}</option>
            <option value="certificate">{t('documents.types.certificate', 'شهادة')}</option>
            <option value="other">{t('documents.types.other', 'أخرى')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-slate-400">{t('common.loading', 'جاري التحميل...')}</div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm">{t('documents.no_documents', 'لا توجد مستندات مرفوعة لهذا الطالب حتى الآن.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-start justify-between gap-3 transition-all"
            >
              <div className="space-y-1 overflow-hidden">
                <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {t(`documents.types.${doc.document_type}`, doc.document_type)}
                </span>
                <h4 className="font-medium text-sm text-slate-200 truncate" title={doc.file_name}>
                  {doc.file_name || 'مستند بدون اسم'}
                </h4>
                {doc.notes && (
                  <p className="text-xs text-slate-400 line-clamp-2">{doc.notes}</p>
                )}
                <p className="text-[11px] text-slate-500" dir="ltr">
                  {new Date(doc.uploaded_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadDocument}
      />
    </div>
  );
};

export default StudentDocuments;
