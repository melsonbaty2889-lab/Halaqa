/* src/types/academy.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type AcademyRow = Tables<'academies'>;
export type AcademyInsert = InsertTables<'academies'>;
export type AcademyUpdate = UpdateTables<'academies'>;

export interface Academy extends Omit<AcademyRow, 'name'> {
  name: Json;
}
