// src/hooks/useStudentDocuments.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useStudentDocuments = ({ studentId, academyId, t }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

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

  const handleDelete = async (docId, docPath) => {
    if (!docId) return;
    setIsDeleting(true);

    try {
      if (docPath) {
        const decodedPath = decodeURIComponent(docPath);
        await supabase.storage.from('documents').remove([decodedPath]);
      }

      const { error: dbError } = await supabase
        .from('student_documents')
        .delete()
        .eq('id', docId);

      if (dbError) throw dbError;

      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      showSuccess(t('documents.delete_success', 'تم حذف المستند بنجاح'));
      return { success: true };
    } catch (err) {
      console.error('Delete Error:', err);
      alert(t('common.error', 'حدث خطأ أثناء الحذف: ') + err.message);
      return { success: false };
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpload = async ({ file, documentType, notes }) => {
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

      showSuccess(t('documents.upload_success', 'تم رفع المستند بنجاح!'));
      return { success: true };
    } catch (err) {
      console.error('Upload Error:', err);
      alert(err.message);
      return { success: false };
    } finally {
      setUploading(false);
    }
  };

  return {
    documents,
    loading,
    uploading,
    isDeleting,
    successToast,
    handleDelete,
    handleUpload,
  };
};
