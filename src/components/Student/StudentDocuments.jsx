import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, Upload, FileText, Search, Trash2, Eye, HardDrive, Calendar, Loader2, AlertTriangle, X, Download, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DocumentUploadModal from './DocumentUploadModal';
import CustomSelect from '@/components/UI/CustomSelect';

export const StudentDocuments = ({ studentId, academyId, onBack }) => {
  const { t, i18n } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // حالات المعاينة الحية المدمجة (Preview Modal)
  const [previewDoc, setPreviewDoc] = useState(null);

  // حالات إدارة نافذة وتأكيد الحذف
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [deleteDocPath, setDeleteDocPath] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const showSuccess = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

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

  const handleDeleteConfirm = async () => {
    if (!deleteDocId) return;
    setIsDeleting(true);

    try {
      if (deleteDocPath) {
        const decodedPath = decodeURIComponent(deleteDocPath);
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([decodedPath]);

        if (storageError) {
          console.warn('Storage delete warning:', storageError.message);
        }
      }

      const { error: dbError } = await supabase
        .from('student_documents')
        .delete()
        .eq('id', deleteDocId);

      if (dbError) throw dbError;

      setDocuments((prev) => prev.filter((doc) => doc.id !== deleteDocId));
      setDeleteDocId(null);
      setDeleteDocPath(null);
      showSuccess(t('documents.delete_success', 'تم حذف المستند بنجاح'));
    } catch (err) {
      console.error('Delete Error:', err);
      alert(t('common.error', 'حدث خطأ أثناء الحذف: ') + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadDocument = async ({ file, documentType, notes }) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let currentAcademyId = academyId;
      if (!currentAcademyId) {
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('academy_id')
          .eq('id', studentId)
          .single();
          
        if (studentError) throw studentError;
        currentAcademyId = studentData?.academy_id;
      }

      const singleInstanceTypes = ['id_card', 'passport', 'birth_certificate'];
      const isSingleInstance = singleInstanceTypes.includes(documentType);

      if (isSingleInstance) {
        const existingDoc = documents.find((doc) => doc.document_type === documentType);
        if (existingDoc) {
          if (existingDoc.file_url && existingDoc.file_url.includes('/documents/')) {
            const oldPath = decodeURIComponent(existingDoc.file_url.split('/documents/')[1]);
            await supabase.storage.from('documents').remove([oldPath]);
          }
          await supabase.from('student_documents').delete().eq('id', existingDoc.id);
        }
      }

      const fileExt = file.name.split('.').pop();
      const uniqueId = crypto.randomUUID();
      const filePath = `students/${studentId}/${Date.now()}_${uniqueId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const { data, error: dbError } = await supabase
        .from('student_documents')
        .insert([{
          academy_id: currentAcademyId,
          student_id: studentId,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          document_type: documentType,
          uploaded_by: user?.id || null,
          notes: notes || null,
          uploaded_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      setDocuments((prev) => {
        const filtered = isSingleInstance 
          ? prev.filter((doc) => doc.document_type !== documentType)
          : prev;
        return [data, ...filtered];
      });

      setIsUploadModalOpen(false);
      showSuccess(t('documents.upload_success', 'تم رفع المستند بنجاح!'));

    } catch (err) {
      console.error('Upload Error:', err);
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    const matchesSearch = doc.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const filterOptions = [
    { value: 'all', label: t('documents.filter_all', 'جميع المستندات') },
    { value: 'id_card', label: t('documents.types.id_card', 'بطاقة الهوية') },
    { value: 'passport', label: t('documents.types.passport', 'جواز السفر') },
    { value: 'birth_certificate', label: t('documents.types.birth_certificate', 'شهادة الميلاد') },
    { value: 'parent_consent', label: t('documents.types.parent_consent', 'موافقة ولي الأمر') },
    { value: 'medical_report', label: t('documents.types.medical_report', 'تقرير طبي') },
    { value: 'payment_receipt', label: t('documents.types.payment_receipt', 'إيصال دفع') },
    { value: 'certificate', label: t('documents.types.certificate', 'شهادة') },
    { value: 'other', label: t('documents.types.other', 'أخرى') },
  ];

  const isImage = (mime, url) => {
    if (mime?.startsWith('image/')) return true;
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
  };

  const isPdf = (mime, url) => {
    if (mime === 'application/pdf') return true;
    return /\.pdf$/i.test(url);
  };

  return (
    <div className="space-y-4 text-appText-main relative" dir={i18n.dir()}>
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 start-5 z-[999999] flex items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-xl animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{successToast}</span>
        </div>
      )}

      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-card p-4 rounded-2xl border border-appBorder-card">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 bg-dark-input hover:bg-appBorder-input/50 text-appText-sub hover:text-appText-main rounded-xl transition-colors flex items-center gap-2 text-sm font-medium shrink-0"
            >
              <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
            </button>
          )}

          <div>
            <h2 className="text-base font-bold text-appText-main flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <span>{t('documents.title', 'مستندات الطالب')}</span>
            </h2>
            <p className="text-xs text-appText-sub mt-0.5">
              {t('documents.subtitle', 'إدارة الوثائق الثبوتية والملفات المرفقة')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-primary hover:bg-primary-hover text-appText-main font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary-glow shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>{t('documents.upload_btn', 'رفع مستند جديد')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-dark-card/50 p-3 sm:p-4 rounded-xl border border-appBorder-card relative z-10">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-appText-muted absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.searchPlaceholder', 'بحث في الملفات...')}
            className="w-full bg-dark-input border border-appBorder-input rounded-xl ps-9 pe-4 py-2 text-sm text-appText-main placeholder-appText-muted focus:outline-none focus:border-appBorder-hover transition-colors"
          />
        </div>

        <div className="w-full sm:w-64 relative z-20">
          <CustomSelect
            value={filterType}
            onChange={(val) => setFilterType(val)}
            options={filterOptions}
            placeholder={t('documents.filter_all', 'جميع المستندات')}
          />
        </div>
      </div>

      {/* Documents Grid / States */}
      {loading ? (
        <div className="text-center py-8 text-xs text-appText-sub">{t('common.loading', 'جاري التحميل...')}</div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-dark-card rounded-2xl border border-appBorder-card space-y-3 p-4">
          <FileText className="w-12 h-12 text-appText-muted mx-auto" />
          <p className="text-appText-sub text-sm">{t('documents.no_documents', 'لا توجد مستندات مرفوعة لهذا الطالب حتى الآن.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc.id}
              className="bg-dark-card border border-appBorder-card hover:border-appBorder-hover rounded-xl p-4 flex items-start justify-between gap-3 transition-all"
            >
              <div className="space-y-1.5 overflow-hidden flex-1">
                <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-primary/10 text-primary border border-primary/20">
                  {t(`documents.types.${doc.document_type}`, doc.document_type)}
                </span>
                <h4 className="font-medium text-sm text-appText-main truncate" title={doc.file_name}>
                  {doc.file_name || t('documents.unnamed_doc', 'مستند بدون اسم')}
                </h4>
                {doc.notes && (
                  <p className="text-xs text-appText-sub line-clamp-2">{doc.notes}</p>
                )}
                
                <div className="flex items-center gap-3 text-[11px] text-appText-muted pt-1">
                  <span className="flex items-center gap-1" dir="ltr">
                    <Calendar className="w-3 h-3" />
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </span>
                  {doc.file_size && (
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {formatFileSize(doc.file_size)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(doc)}
                  className="p-2 text-appText-sub hover:text-primary hover:bg-dark-input rounded-lg transition-colors cursor-pointer"
                  title={t('common.view', 'عرض')}
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setDeleteDocId(doc.id);
                    let storagePath = null;
                    if (doc.file_url && doc.file_url.includes('/documents/')) {
                      storagePath = doc.file_url.split('/documents/')[1];
                    }
                    setDeleteDocPath(storagePath);
                  }}
                  className="p-2 text-appText-sub hover:text-rose-400 hover:bg-dark-input rounded-lg transition-colors cursor-pointer"
                  title={t('common.delete', 'حذف')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadDocument}
        isLoading={uploading}
      />

      {/* Embedded Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/90">
          <div className="bg-dark-card border border-appBorder-card rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-appBorder-card bg-dark-card">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <h3 className="text-sm font-bold text-appText-main truncate">
                  {previewDoc.file_name}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewDoc.file_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-appText-sub hover:text-appText-main bg-dark-input hover:bg-appBorder-input/50 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('common.download', 'تحميل')}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-appText-sub hover:text-appText-main bg-dark-input hover:bg-appBorder-input/50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-black/40 p-2 sm:p-4 overflow-auto flex items-center justify-center">
              {isImage(previewDoc.mime_type, previewDoc.file_url) ? (
                <img
                  src={previewDoc.file_url}
                  alt={previewDoc.file_name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              ) : isPdf(previewDoc.mime_type, previewDoc.file_url) ? (
                <iframe
                  src={previewDoc.file_url}
                  title={previewDoc.file_name}
                  className="w-full h-full rounded-lg border-0"
                />
              ) : (
                <div className="text-center space-y-4 p-6">
                  <FileText className="w-16 h-16 text-appText-muted mx-auto" />
                  <p className="text-sm text-appText-sub">
                    {t('documents.cannot_preview', 'لا يمكن معاينة هذا النوع من الملفات مباشرة.')}
                  </p>
                  <a
                    href={previewDoc.file_url}
                    download
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-appText-main font-bold rounded-xl text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('common.download_file', 'تحميل الملف')}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteDocId && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80">
          <div className="bg-dark-card border border-appBorder-card rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-appText-main">
                {t('documents.delete_title', 'حذف المستند')}
              </h3>
              <p className="text-xs text-appText-sub leading-relaxed">
                {t('documents.delete_confirm_text', 'هل أنت متأكد من حذف هذا المستند نهائياً؟ لن تتمكن من استعادته مرة أخرى.')}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setDeleteDocId(null);
                  setDeleteDocPath(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl border border-appBorder-card text-xs font-semibold text-appText-sub hover:bg-dark-input transition-all cursor-pointer"
              >
                {t('common.cancel', 'إلغاء')}
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('common.delete', 'حذف')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDocuments;
