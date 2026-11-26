/* src/types/exam.ts */

import type { Tables, InsertTables, UpdateTables } from './database.types';

export type ExamRow = Tables<'exams'>;
export type ExamInsert = InsertTables<'exams'>;
export type ExamUpdate = UpdateTables<'exams'>;

export interface Exam extends ExamRow {}
