/* src/types/enrollment.ts */

import type { Tables, InsertTables, UpdateTables } from './database.types';

export type StudentHalaqaRow = Tables<'student_halaqas'>;
export type StudentHalaqaInsert = InsertTables<'student_halaqas'>;
export type StudentHalaqaUpdate = UpdateTables<'student_halaqas'>;

export type StudentGuardianRow = Tables<'student_guardians'>;
export type StudentGuardianInsert = InsertTables<'student_guardians'>;
export type StudentGuardianUpdate = UpdateTables<'student_guardians'>;

export type StudentHalaqa = StudentHalaqaRow;
export type StudentGuardian = StudentGuardianRow;
