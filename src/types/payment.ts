/* src/types/payment.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type PaymentRow = Tables<'payments'>;
export type PaymentInsert = InsertTables<'payments'>;
export type PaymentUpdate = UpdateTables<'payments'>;

export type PaymentPlanRow = Tables<'payment_plans'>;
export type PaymentPlanInsert = InsertTables<'payment_plans'>;
export type PaymentPlanUpdate = UpdateTables<'payment_plans'>;

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded';

export interface Payment extends Omit<PaymentRow, 'status' | 'metadata'> {
  status: PaymentStatus | string;
  metadata?: Json | null;
}

export interface PaymentPlan extends Omit<PaymentPlanRow, 'name' | 'metadata'> {
  name: Json;
  metadata?: Json | null;
}
