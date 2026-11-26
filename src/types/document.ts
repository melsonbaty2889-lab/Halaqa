/* src/types/document.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type FileRecordRow = Tables<'files'>;
export type FileRecordInsert = InsertTables<'files'>;
export type FileRecordUpdate = UpdateTables<'files'>;

export type AcademyDocumentRow = Tables<'academy_documents'>;
export type AcademyDocumentInsert = InsertTables<'academy_documents'>;
export type AcademyDocumentUpdate = UpdateTables<'academy_documents'>;

export type StudentDocumentRow = Tables<'student_documents'>;
export type StudentDocumentInsert = InsertTables<'student_documents'>;
export type StudentDocumentUpdate = UpdateTables<'student_documents'>;

export type TeacherDocumentRow = Tables<'teacher_documents'>;
export type TeacherDocumentInsert = InsertTables<'teacher_documents'>;
export type TeacherDocumentUpdate = UpdateTables<'teacher_documents'>;

export interface FileRecord extends FileRecordRow {}

export interface AcademyDocument extends Omit<AcademyDocumentRow, 'metadata'> {
  metadata: Json;
}

export interface StudentDocument extends Omit<StudentDocumentRow, 'metadata'> {
  metadata: Json;
}

export interface TeacherDocument extends Omit<TeacherDocumentRow, 'metadata'> {
  metadata: Json;
}
