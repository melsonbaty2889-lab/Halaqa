/* src/types/subscription.ts */

import type { Json, Tables, InsertTables, UpdateTables } from './database.types';

export type SaasSubscriptionRow = Tables<'saas_subscriptions'>;
export type SaasSubscriptionInsert = InsertTables<'saas_subscriptions'>;
export type SaasSubscriptionUpdate = UpdateTables<'saas_subscriptions'>;

export type SaasCouponRow = Tables<'saas_coupons'>;
export type SaasCouponInsert = InsertTables<'saas_coupons'>;
export type SaasCouponUpdate = UpdateTables<'saas_coupons'>;

export type SaasReferralRow = Tables<'saas_referrals'>;
export type SaasReferralInsert = InsertTables<'saas_referrals'>;
export type SaasReferralUpdate = UpdateTables<'saas_referrals'>;

export type AppSettingRow = Tables<'settings'>;
export type AppSettingInsert = InsertTables<'settings'>;
export type AppSettingUpdate = UpdateTables<'settings'>;

export interface SaasSubscription extends Omit<SaasSubscriptionRow, 'metadata'> {
  metadata: Json;
}

export interface SaasCoupon extends SaasCouponRow {}

export interface SaasReferral extends Omit<SaasReferralRow, 'metadata'> {
  metadata?: Json | null;
}

export interface AppSetting extends Omit<AppSettingRow, 'description' | 'metadata'> {
  description?: Json | null;
  metadata: Json;
}
