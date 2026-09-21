// src/components/Student/StudentDocuments.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, ArrowLeft, Upload, FileText, Search, Trash2, Eye, HardDrive, Calendar, 
  Loader2, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentPreviewModal from './DocumentPreviewModal';
import Select from '@/components/UI/Select';
import { useStudentDocuments } from '@/hooks/useStudentDocuments';

const StudentDocuments = ({ studentId, academyId, onBack }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n?.dir ? i18n.dir() === 'rtl' : true;
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const {
    documents,
    loading,
    uploading,
    isDeleting,
    successToast,
    handleDelete,
    handleUpload,
  } = useStudentDocuments({ studentId, academyId, t });

  // حالات المعاينة والتكبير
  const [previewDoc, setPreviewDoc] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);

  // حالات الحذف
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [deleteDocPath, setDeleteDocPath] = useState(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // تثبيت سكرول الشاشة عند فتح أية نافذة منعاً للتنقل غير المرغوب
  useEffect(() => {
    const isModalActive = previewDoc || deleteDocId || isUploadModalOpen;
    if (isModalActive) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [previewDoc, deleteDocId, isUploadModalOpen]);

  const confirmDelete = async () => {
    const res = await handleDelete(deleteDocId, deleteDocPath);
    if (res?.success) {
      setDeleteDocId(null);
      setDeleteDocPath(null);
    }
  };

  const onUploadSubmit = async (uploadData) => {
    const res = await handleUpload(uploadData);
    if (res?.success) {
      setIsUploadModalOpen(false);
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

  return (
    <div className="space-y-4 text-semantic-textPrimary relative" dir={i18n?.dir ? i18n.dir() : 'rtl'}>
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 start-5 z-[999999] flex items-center gap-2 bg-semantic-success text-white px-4 py-3 rounded-xl shadow-xl animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{successToast}</span>
        </div>
      )}

      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-semantic-surfaceCard p-4 rounded-2xl border border-semantic-borderCard shadow-md">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 bg-semantic-surfaceInput hover:bg-semantic-borderInput/50 text-semantic-textSecondary hover:text-semantic-textPrimary rounded-xl transition-colors flex items-center gap-2 text-sm font-medium shrink-0 border border-semantic-borderCard active:scale-95"
            >
              <BackIcon className="w-5 h-5" />
            </button>
          )}

          <div>
            <h2 className="text-base font-bold text-semantic-textPrimary flex items-center gap-2">
              <FileText className="w-5 h-5 text-semantic-actionPrimary shrink-0" />
              <span>{t('documents.title', 'مستندات الطالب')}</span>
            </h2>
            <p className="text-xs text-semantic-textSecondary mt-0.5">
              {t('documents.subtitle', 'إدارة الوثائق الثبوتية والملفات المرفقة')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-semantic-actionPrimary text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md active:scale-95 shrink-0 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>{t('documents.upload_btn', 'رفع مستند جديد')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-semantic-surfaceCard/60 p-3 sm:p-4 rounded-2xl border border-semantic-borderCard relative z-10 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-semantic-textSecondary absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.searchPlaceholder', 'بحث في الملفات...')}
            className="w-full bg-semantic-surfaceInput border border-semantic-borderInput rounded-xl ps-9 pe-4 py-2 text-sm text-semantic-textPrimary placeholder-semantic-textSecondary focus:outline-none focus:border-semantic-actionPrimary transition-colors"
          />
        </div>

        <div className="w-full sm:w-64 relative z-20">
          <Select
            value={filterType}
            onChange={(val) => setFilterType(val)}
            options={filterOptions}
            placeholder={t('documents.filter_all', 'جميع المستندات')}
          />
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="text-center py-8 text-xs text-semantic-textSecondary">{t('common.loading', 'جاري التحميل...')}</div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-semantic-surfaceCard rounded-2xl border border-semantic-borderCard space-y-3 p-4">
          <FileText className="w-12 h-12 text-semantic-textSecondary mx-auto" />
          <p className="text-semantic-textSecondary text-sm">{t('documents.no_documents', 'لا توجد مستندات مرفوعة لهذا الطالب حتى الآن.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc.id}
              className="bg-semantic-surfaceCard border border-semantic-borderCard hover:border-semantic-actionPrimary/40 rounded-xl p-4 flex items-start justify-between gap-3 transition-all shadow-sm"
            >
              <div className="space-y-1.5 overflow-hidden flex-1">
                <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-semantic-actionPrimary/10 text-semantic-actionPrimary border border-semantic-actionPrimary/20">
                  {t(`documents.types.${doc.document_type}`, doc.document_type)}
                </span>
                <h4 className="font-medium text-sm text-semantic-textPrimary truncate" title={doc.file_name}>
                  {doc.file_name || t('documents.unnamed_doc', 'مستند بدون اسم')}
                </h4>
                {doc.notes && (
                  <p className="text-xs text-semantic-textSecondary line-clamp-2">{doc.notes}</p>
                )}
                
                <div className="flex items-center gap-3 text-[11px] text-semantic-textSecondary pt-1">
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
                  onClick={() => {
                    setZoomScale(1);
                    setPreviewDoc(doc);
                  }}
                  className="p-2 text-semantic-textSecondary hover:text-semantic-actionPrimary hover:bg-semantic-surfaceInput rounded-lg transition-colors cursor-pointer"
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
                  className="p-2 text-semantic-textSecondary hover:text-semantic-error hover:bg-semantic-surfaceInput rounded-lg transition-colors cursor-pointer"
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
        onUpload={onUploadSubmit}
        isLoading={uploading}
      />

      {/* Preview Modal */}
      <DocumentPreviewModal
        previewDoc={previewDoc}
        onClose={() => setPreviewDoc(null)}
        zoomScale={zoomScale}
        setZoomScale={setZoomScale}
        t={t}
      />

      {/* Delete Modal */}
      {deleteDocId && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 overscroll-contain">
          <div className="bg-semantic-surfaceCard border border-semantic-borderCard rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-semantic-error/10 text-semantic-error flex items-center justify-center mx-auto border border-semantic-error/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-semantic-textPrimary">
                {t('documents.delete_title', 'حذف المستند')}
              </h3>
              <p className="text-xs text-semantic-textSecondary leading-relaxed">
                {t('documents.delete_confirm_text', 'هل أنت متأكد من حذف هذا المستند نهائياً؟')}
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
                className="flex-1 py-2 px-3 rounded-xl border border-semantic-borderCard text-xs font-semibold text-semantic-textSecondary hover:bg-semantic-surfaceInput transition-all cursor-pointer"
              >
                {t('common.cancel', 'إلغاء')}
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 py-2 px-3 rounded-xl bg-semantic-error hover:bg-semantic-error/90 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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
