import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  Upload, 
  FileText, 
  Filter, 
  Search, 
  ExternalLink, 
  Trash2, 
  Eye 
} from 'lucide-react';
import DocumentUploadModal from './DocumentUploadModal';

export const StudentDocuments = ({ student, onBack, documents = [], onDeleteDocument, onUploadDocument }) => {
  const { t, i18n } = useTranslation();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // تصفية المستندات
  const filteredDocuments = documents.filter((doc) => {
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    const matchesSearch = doc.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 text-white" dir={i18n.dir()}>
      
      {/* 1. Header & Unified Breadcrumb Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] p-5 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
            title={t('common.back', 'رجوع')}
          >
            <ArrowRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180" />
            <span>{t('students_module.back_to_list', 'قائمة الطلاب')}</span>
          </button>

          <div className="h-6 w-px bg-gray-700 hidden sm:block" />

          <div>
            <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>{t('documents.title', 'مستندات الطالب')}:</span>
              <span className="text-amber-400">{student?.full_name}</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {t('documents.subtitle', 'إدارة الوثائق الثبوتية والملفات المرفقة')}
            </p>
          </div>
        </div>

        {/* Upload Trigger Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-500/10"
        >
          <Upload className="w-4 h-4" />
          <span>{t('documents.upload_btn', 'رفع مستند جديد')}</span>
        </button>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1f2937]/50 p-4 rounded-xl border border-gray-800">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.searchPlaceholder', 'بحث في الملفات...')}
            className="w-full bg-[#111827] border border-gray-700 rounded-xl ps-9 pe-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto bg-[#111827] border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 transition-colors"
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

      {/* 3. Documents Table / Cards */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-[#111827] rounded-2xl border border-gray-800 space-y-3">
          <FileText className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-gray-400 text-sm">{t('documents.no_documents', 'لا توجد مستندات مرفوعة لهذا الطالب حتى الآن.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc.id}
              className="bg-[#111827] border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex items-start justify-between gap-3 transition-all"
            >
              <div className="space-y-1 overflow-hidden">
                <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {t(`documents.types.${doc.document_type}`, doc.document_type)}
                </span>
                <h4 className="font-medium text-sm text-gray-200 truncate" title={doc.file_name}>
                  {doc.file_name || 'مستند بدون اسم'}
                </h4>
                {doc.notes && (
                  <p className="text-xs text-gray-400 line-clamp-2">{doc.notes}</p>
                )}
                <p className="text-[11px] text-gray-500" dir="ltr">
                  {new Date(doc.uploaded_at).toLocaleDateString()}
                </p>
              </div>

              {/* Document Action Icons */}
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-lg transition-colors"
                  title={t('common.view', 'معاينة')}
                >
                  <Eye className="w-4 h-4" />
                </a>
                {onDeleteDocument && (
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                    title={t('common.delete', 'حذف')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={async (data) => {
          if (onUploadDocument) {
            await onUploadDocument(data);
          }
          setIsUploadModalOpen(false);
        }}
      />
    </div>
  );
};

export default StudentDocuments;
