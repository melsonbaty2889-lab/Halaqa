import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// ── Types & Interfaces ──────────────────────────────────────────

export interface StudentDocument {
  id: string;
  academy_id?: string | null;
  student_id: string;
  file_name: string;
  file_url: string;
  file_size?: number | null;
  mime_type?: string | null;
  document_type: string;
  uploaded_by?: string | null;
  notes?: string | null;
  uploaded_at: string;
}

export type TranslateFunction = (key: string, fallback?: string) => string;

export interface UseStudentDocumentsProps {
  studentId?: string | null;
  academyId?: string | null;
  t?: TranslateFunction;
}

export interface UploadPayload {
  file: File;
  documentType: string;
  notes?: string;
}

export interface OperationResult {
  success: boolean;
  error?: string;
}

// ── Main Hook ───────────────────────────────────────────────────

export const useStudentDocuments = ({
  studentId,
  academyId,
  t,
}: UseStudentDocumentsProps = {}) => {
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string>('');

  const isMounted = useRef<boolean>(true);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const isValidStudentId = Boolean(
    studentId &&
    studentId !== 'undefined' &&
    typeof studentId === 'string' &&
    studentId.trim() !== ''
  );

  const translate = useCallback(
    (key: string, fallback: string) => (t ? t(key, fallback) : fallback),
    [t]
  );

  const showSuccess = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (isMounted.current) setSuccessToast(msg);
    toastTimerRef.current = setTimeout(() => {
      if (isMounted.current) setSuccessToast('');
    }, 4000);
  }, []);

  const fetchDocuments = useCallback(async () => {
    if (!isValidStudentId) {
      if (isMounted.current) {
        setDocuments([]);
        setLoading(false);
      }
      return;
    }

    if (isMounted.current) setLoading(true);

    try {
      const { data, error } = await supabase
        .from('student_documents')
        .select('*')
        .eq('student_id', studentId!)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      if (isMounted.current) {
        setDocuments((data as StudentDocument[]) || []);
      }
    } catch (err: any) {
      console.warn('Error fetching documents:', err?.message || err);
      if (isMounted.current) {
        setDocuments([]);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [studentId, isValidStudentId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (
    docId: string,
    docPath?: string
  ): Promise<OperationResult> => {
    if (!docId) return { success: false, error: 'Document ID is missing' };
    if (isMounted.current) setIsDeleting(true);

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

      if (isMounted.current) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      }

      showSuccess(
        translate('documents.delete_success', 'تم حذف المستند بنجاح')
      );
      return { success: true };
    } catch (err: any) {
      console.warn('Delete Error:', err?.message || err);
      return {
        success: false,
        error: translate('common.error', 'حدث خطأ أثناء الحذف: ') + (err?.message || ''),
      };
    } finally {
      if (isMounted.current) setIsDeleting(false);
    }
  };

  const handleUpload = async ({
    file,
    documentType,
    notes,
  }: UploadPayload): Promise<OperationResult> => {
    if (!isValidStudentId) {
      return { success: false, error: 'Student ID is missing or invalid' };
    }

    if (isMounted.current) setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let currentAcademyId = academyId;
      if (!currentAcademyId) {
        const { data: studentData } = await supabase
          .from('students')
          .select('academy_id')
          .eq('id', studentId!)
          .maybeSingle();

        currentAcademyId = studentData?.academy_id || null;
      }

      const singleInstanceTypes = ['id_card', 'passport', 'birth_certificate'];
      const isSingleInstance = singleInstanceTypes.includes(documentType);

      if (isSingleInstance) {
        const existingDoc = documents.find(
          (doc) => doc.document_type === documentType
        );
        if (existingDoc) {
          if (
            existingDoc.file_url &&
            existingDoc.file_url.includes('/documents/')
          ) {
            const oldPath = decodeURIComponent(
              existingDoc.file_url.split('/documents/')[1]
            );
            await supabase.storage.from('documents').remove([oldPath]);
          }
          await supabase
            .from('student_documents')
            .delete()
            .eq('id', existingDoc.id);
        }
      }

      const fileExt = file.name.split('.').pop();
      const uniqueId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 9);

      const filePath = `students/${studentId}/${Date.now()}_${uniqueId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(filePath);

      const { data, error: dbError } = await supabase
        .from('student_documents')
        .insert([
          {
            academy_id: currentAcademyId,
            student_id: studentId!,
            file_name: file.name,
            file_url: publicUrl,
            file_size: file.size,
            mime_type: file.type,
            document_type: documentType,
            uploaded_by: user?.id || null,
            notes: notes || null,
            uploaded_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      if (isMounted.current) {
        setDocuments((prev) => {
          const filtered = isSingleInstance
            ? prev.filter((doc) => doc.document_type !== documentType)
            : prev;
          return [data as StudentDocument, ...filtered];
        });
      }

      showSuccess(
        translate('documents.upload_success', 'تم رفع المستند بنجاح!')
      );
      return { success: true };
    } catch (err: any) {
      console.warn('Upload Error:', err?.message || err);
      return {
        success: false,
        error: err?.message || 'حدث خطأ أثناء رفع المستند',
      };
    } finally {
      if (isMounted.current) setUploading(false);
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
    refetchDocuments: fetchDocuments,
  };
};

export default useStudentDocuments;
