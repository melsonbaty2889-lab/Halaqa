import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FolderOpen, 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  Search, 
  Plus, 
  Loader2, 
  File, 
  UserCheck, 
  Building2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import DocumentUploadModal from './DocumentUploadModal';

const DOCUMENT_TYPES = [
  { value: 'id_card', labelAr: 'بطاقة الهوية', labelEn: 'ID Card' },
  { value: 'passport', labelAr: 'جواز السفر', labelEn: 'Passport' },
  { value: 'birth_certificate', labelAr: 'شهادة الميلاد', labelEn: 'Birth Certificate' },
  { value: 'parent_consent', labelAr: 'موافقة ولي الأمر', labelEn: 'Parent Consent' },
  { value: 'medical_report', labelAr: 'تقرير طبي', labelEn: 'Medical Report' },
  { value: 'payment_receipt', labelAr: 'إيصال دفع', labelEn: 'Payment Receipt' },
  { value: 'certificate', labelAr: 'شهادة', labelEn: 'Certificate' },
  { value: 'other', labelAr: 'أخرى', labelEn: 'Other' }
];

export default function StudentDocuments({ academyId, studentId, students = [], isRtl = true }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('student_docs');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [studentDocs, setStudentDocs] = useState([]);
  const [generalFiles, setGeneralFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(studentId || '');
  const [docType, setDocType] = useState('id_card');
  const [docNotes, setDocNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (studentId) {
      setSelectedStudentId(studentId);
    }
  }, [studentId]);

  const fetchData = useCallback(async () => {
    if (!academyId && !studentId) return;
    setLoading(true);
    try {
      if (activeTab === 'student_docs' || studentId) {
        let query = supabase.from('student_documents').select('*, students (id, name)');
        
        if (studentId) {
          query = query.eq('student_id', studentId);
        } else if (academyId) {
          query = query.eq('academy_id', academyId);
        }

        const { data, error } = await query.order('uploaded_at', { ascending: false });
        if (error) throw error;
        setStudentDocs(data || []);
      } else {
        const { data, error } = await supabase
          .from('files')
          .select('*')
          .eq('academy_id', academyId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGeneralFiles(data || []);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, [academyId, studentId, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const targetStudentId = studentId || selectedStudentId;
    if (!selectedFile) return;

    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${academyId || 'students'}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const bucketName = (activeTab === 'student_docs' || studentId) ? 'student-documents' : 'academy-files';

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      if (activeTab === 'student_docs' || studentId) {
        if (!targetStudentId) throw new Error('Student required');

        const { error: dbError } = await supabase
          .from('student_documents')
          .insert({
            academy_id: academyId,
            student_id: targetStudentId,
            file_url: publicUrl,
            file_name: selectedFile.name,
            file_size: selectedFile.size,
            mime_type: selectedFile.type,
            document_type: docType,
            uploaded_by: userId,
            notes: docNotes
          });

        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from('files')
          .insert({
            academy_id: academyId,
            file_url: publicUrl,
            file_name: selectedFile.name,
            file_size: selectedFile.size,
            created_by: userId
          });

        if (dbError) throw dbError;
      }

      setShowUploadModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Upload Error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('common.confirm_delete', 'هل أنت تأكد من إزالة هذا المستند؟'))) return;

    try {
      const table = (activeTab === 'student_docs' || studentId) ? 'student_documents' : 'files';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    if (!studentId) setSelectedStudentId('');
    setDocNotes('');
    setDocType('id_card');
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredStudentDocs = studentDocs.filter(doc => {
    const matchesSearch = doc.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.students?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.document_type === selectedType;
    return matchesSearch && matchesType;
  });

  const filteredGeneralFiles = generalFiles.filter(file => 
    file.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* رأس المكون */}
      <div className="card-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary" />
            <span>{studentId ? 'مستندات الطالب' : t('documents.title', 'المستندات والملفات')}</span>
          </h2>
          <p className="text-sm text-appText-sub mt-1">
            {studentId ? 'جميع الوثائق والملفات المرفوعة الخاصة بهذا الطالب' : t('documents.subtitle', 'إدارة الوثائق الرسمية للطلاب وملفات الأكاديمية')}
          </p>
        </div>

        <button onClick={() => setShowUploadModal(true)} className="btn-primary w-fit">
          <Plus className="w-4 h-4" />
          <span>{t('documents.upload_btn', 'رفع مستند جديد')}</span>
        </button>
      </div>

      {/* عناصر التحكم والتصفية */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {!studentId && (
          <div className="flex gap-2 p-1 bg-dark-input rounded-xl border border-appBorder-input">
            <button
              onClick={() => setActiveTab('student_docs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'student_docs'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-appText-sub hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{t('documents.tab_students', 'مستندات الطلاب')}</span>
            </button>

            <button
              onClick={() => setActiveTab('general_files')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'general_files'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-appText-sub hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t('documents.tab_academy', 'ملفات الأكاديمية العامة')}</span>
            </button>
          </div>
        )}

        <div className="flex flex-1 md:max-w-md gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute top-3 right-3 text-appText-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('documents.search_placeholder', 'البحث في الملفات...')}
              className="app-input pl-10 pr-10"
            />
          </div>

          {(activeTab === 'student_docs' || studentId) && (
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="app-input max-w-[160px]"
            >
              <option value="all">{t('documents.type_all', 'جميع الأنواع')}</option>
              {DOCUMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {isRtl ? type.labelAr : type.labelEn}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* منطقة عرض الملفات */}
      {loading ? (
        <div className="p-12 text-center text-appText-sub flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span>{t('common.loading', 'جاري جلب الملفات...')}</span>
        </div>
      ) : (activeTab === 'student_docs' || studentId) ? (
        filteredStudentDocs.length === 0 ? (
          <div className="p-12 text-center bg-dark-card/50 rounded-2xl border border-dashed border-appBorder-card text-appText-sub">
            <FileText className="w-12 h-12 mx-auto mb-3 text-appText-muted" />
            <p>{t('documents.no_student_docs', 'لا توجد مستندات مرفوعة للطلب حالياً')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudentDocs.map((doc) => (
              <div key={doc.id} className="card-surface p-4 flex flex-col justify-between hover:border-appBorder-hover transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-2.5 bg-brandEmerald-bg border border-brandEmerald-border text-brandEmerald rounded-xl">
                      <File className="w-5 h-5" />
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-dark-input text-appText-sub rounded-lg border border-appBorder-input">
                      {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.[isRtl ? 'labelAr' : 'labelEn'] || doc.document_type}
                    </span>
                  </div>

                  <h4 className="font-semibold text-white text-sm line-clamp-1 mb-1" title={doc.file_name}>
                    {doc.file_name || 'مستند بدون عنوان'}
                  </h4>

                  {!studentId && (
                    <p className="text-xs text-primary font-medium mb-2">
                      👤 {doc.students?.name || 'طالب غير محدد'}
                    </p>
                  )}

                  {doc.notes && (
                    <p className="text-xs text-appText-sub bg-dark-input/60 p-2 rounded-lg mb-3 line-clamp-2">
                      {doc.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-appBorder-card text-xs text-appText-sub mt-2">
                  <span>{formatBytes(doc.file_size)}</span>

                  <div className="flex items-center gap-2">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-dark-input text-appText-sub hover:text-primary rounded-lg transition-colors"
                      title={t('common.download', 'تحميل')}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 hover:bg-rose-500/10 text-appText-sub hover:text-rose-400 rounded-lg transition-colors"
                      title={t('common.delete', 'حذف')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredGeneralFiles.length === 0 ? (
          <div className="p-12 text-center bg-dark-card/50 rounded-2xl border border-dashed border-appBorder-card text-appText-sub">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-appText-muted" />
            <p>{t('documents.no_general_files', 'لا توجد ملفات عامة بالأكاديمية')}</p>
          </div>
        ) : (
          <div className="card-surface p-0 overflow-hidden">
            <table className="w-full text-sm text-appText-sub text-right">
              <thead className="bg-dark-input text-appText-sub text-xs uppercase border-b border-appBorder-input">
                <tr>
                  <th className="p-4">{t('documents.file_name', 'اسم الملف')}</th>
                  <th className="p-4">{t('documents.file_size', 'الحجم')}</th>
                  <th className="p-4">{t('documents.date', 'تاريخ الرفع')}</th>
                  <th className="p-4 text-center">{t('common.actions', 'الإجراءات')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-appBorder-card">
                {filteredGeneralFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-dark-input/40 transition-colors">
                    <td className="p-4 font-medium text-white flex items-center gap-3">
                      <File className="w-4 h-4 text-primary" />
                      <span>{file.file_name}</span>
                    </td>
                    <td className="p-4 text-appText-sub">{formatBytes(file.file_size)}</td>
                    <td className="p-4 text-appText-sub">
                      {new Date(file.created_at).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-dark-input text-appText-sub hover:text-primary rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-1.5 hover:bg-rose-500/10 text-appText-sub hover:text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* نافذة رفع ملف جديد */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-surface max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              <span>{t('documents.modal_title', 'رفع ملف جديد')}</span>
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              {!studentId && activeTab === 'student_docs' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-appText-sub mb-1">
                      {t('documents.select_student', 'اختر الطالب')} *
                    </label>
                    <select
                      required
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="app-input"
                    >
                      <option value="">{t('documents.choose_student', '-- اختر طالب --')}</option>
                      {students.map((st) => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-appText-sub mb-1">
                      {t('documents.doc_type', 'نوع المستند')} *
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="app-input"
                    >
                      {DOCUMENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {isRtl ? type.labelAr : type.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-appText-sub mb-1">
                  {t('documents.choose_file', 'الملف')} *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-sm text-appText-sub file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-appText-sub mb-1">
                  {t('documents.notes', 'ملاحظات')}
                </label>
                <textarea
                  rows={2}
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  className="app-input"
                  placeholder={t('documents.notes_placeholder', 'تفاصيل أو ملاحظات إضافية...')}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-appBorder-card">
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); resetForm(); }}
                  className="btn-secondary w-auto"
                >
                  {t('common.cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary w-auto"
                >
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{t('common.upload', 'رفع')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
