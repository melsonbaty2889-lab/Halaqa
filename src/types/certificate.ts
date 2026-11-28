/* src/types/certificate.ts */

import type { Tables, InsertTables, UpdateTables } from './database.types';

export type CertificateRow = Tables<'certificates'>;
export type CertificateInsert = InsertTables<'certificates'>;
export type CertificateUpdate = UpdateTables<'certificates'>;

export type Certificate = CertificateRow;
