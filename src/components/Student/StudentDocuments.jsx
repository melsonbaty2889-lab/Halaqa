// src/components/Student/StudentDocuments.jsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, Upload, FileText, Search, Trash2, Eye, HardDrive, Calendar, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DocumentUploadModal from './DocumentUploadModal';
import CustomSelect from '@/components/UI/CustomSelect';

export const StudentDocuments = ({ studentId, academyId, onBack }) => {
  const { t, i18n } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
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
    
    setDeletingId(docId);
    try {
      const { error } = await supabase.from('student_documents').delete().eq('id', docId);
      if (error) throw error;
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadDocument = async ({ file, documentType, notes }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. جلب academy_id من بيانات الطالب لو مش مبعوث في الـ props
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

      const fileExt = file.name.split('.').pop();
      const filePath = `students/${studentId}/${Date.now()}.${fileExt}`;

      // 2. الرفع للباكيت
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. رابط الملف
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 4. الحفظ بالجدول
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
      setDocuments((prev) => [data, ...prev]);
    } catch (err) {
      console.error('Upload Error:', err);
      alert(err.message);
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
    <div className="space-y-4 text-appText-main" dir={i18n.dir()}>
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
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-appText-sub hover:text-primary hover:bg-dark-input rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  disabled={deletingId === doc.id}
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="p-2 text-appText-sub hover:text-rose-400 hover:bg-dark-input rounded-lg transition-colors disabled:opacity-50"
                >
                  {deletingId === doc.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
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
      />
    </div>
  );
};

export default StudentDocuments;
