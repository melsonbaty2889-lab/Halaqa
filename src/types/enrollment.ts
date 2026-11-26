/* src/types/enrollment.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type StudentHalaqaRow = Tables<'student_halaqas'>;
export type StudentHalaqaInsert = InsertTables<'student_halaqas'>;
export type StudentHalaqaUpdate = UpdateTables<'student_halaqas'>;

export type StudentGuardianRow = Tables<'student_guardians'>;
export type StudentGuardianInsert = InsertTables<'student_guardians'>;
export type StudentGuardianUpdate = UpdateTables<'student_guardians'>;

export type AcademyTeacherRow = Tables<'academy_teachers'>;
export type AcademyTeacherInsert = InsertTables<'academy_teachers'>;
export type AcademyTeacherUpdate = UpdateTables<'academy_teachers'>;

export interface StudentHalaqa extends Omit<StudentHalaqaRow, 'metadata'> {
  metadata: Json;
}

export interface StudentGuardian extends Omit<StudentGuardianRow, 'metadata'> {
  metadata: Json;
}

export interface AcademyTeacher extends AcademyTeacherRow {}
