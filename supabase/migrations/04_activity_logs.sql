-- ==============================================================================
-- 04_activity_logs.sql - النسخة النهائية الشاملة لجدول سجلات النشاط
-- ==============================================================================

Create table public.activity_logs (
  id uuid not null default gen_random_uuid (),
  academy_id uuid not null,
  user_id uuid null,
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  details jsonb not null default '{}'::jsonb,
  ip_address text null,
  user_agent text null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint activity_logs_pkey primary key (id),
  constraint activity_logs_academy_id_fkey foreign KEY (academy_id) references academies (id) on delete CASCADE,
  constraint activity_logs_user_id_fkey foreign KEY (user_id) references profiles (id) on delete set null
) TABLESPACE pg_default;

-- الفهارس
create index IF not exists idx_activity_logs_academy_id on public.activity_logs using btree (academy_id) TABLESPACE pg_default;
create index IF not exists idx_activity_logs_user_id on public.activity_logs using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_activity_logs_academy_time on public.activity_logs using btree (academy_id, created_at desc) TABLESPACE pg_default;

-- تفعيل الـ RLS وسياسات الأمان
alter table public.activity_logs enable row level security;

create policy activity_logs_insert_policy on public.activity_logs for INSERT to authenticated with check (
  (is_super_admin() OR ((academy_id IS NOT NULL) AND (academy_id = get_auth_academy_id())))
);

create policy activity_logs_select_policy on public.activity_logs for SELECT to authenticated using (
  (is_super_admin() OR ((academy_id IS NOT NULL) AND (academy_id = get_auth_academy_id())))
);
