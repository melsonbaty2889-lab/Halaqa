/* src/types/certificate.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type CertificateRow = Tables<'certificates'>;
export type CertificateInsert = InsertTables<'certificates'>;
export type CertificateUpdate = UpdateTables<'certificates'>;

export interface Certificate extends Omit<CertificateRow, 'metadata'> {
  metadata?: Json | null;
}
