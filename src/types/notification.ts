/* src/types/notification.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type NotificationRow = Tables<'notifications'>;
export type NotificationInsert = InsertTables<'notifications'>;
export type NotificationUpdate = UpdateTables<'notifications'>;

export type NotificationLogRow = Tables<'notification_logs'>;
export type NotificationLogInsert = InsertTables<'notification_logs'>;
export type NotificationLogUpdate = UpdateTables<'notification_logs'>;

export type NotificationTemplateRow = Tables<'notification_templates'>;
export type NotificationTemplateInsert = InsertTables<'notification_templates'>;
export type NotificationTemplateUpdate = UpdateTables<'notification_templates'>;

export interface Notification
  extends Omit<NotificationRow, 'title' | 'message' | 'metadata'> {
  title: Json;
  message?: Json | null;
  metadata?: Json | null;
}

export interface NotificationLog
  extends Omit<NotificationLogRow, 'metadata' | 'template_data'> {
  metadata?: Json | null;
  template_data?: Json | null;
}

export interface NotificationTemplate
  extends Omit<NotificationTemplateRow, 'available_variables'> {
  available_variables?: Json | null;
}
