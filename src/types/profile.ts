/* src/types/profile.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type ProfileRow = Tables<'profiles'>;
export type ProfileInsert = InsertTables<'profiles'>;
export type ProfileUpdate = UpdateTables<'profiles'>;

export interface Profile extends Omit<ProfileRow, 'metadata'> {
  metadata?: Json | null;
}
