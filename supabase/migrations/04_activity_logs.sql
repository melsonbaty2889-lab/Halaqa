-- ==============================================================================
-- 1. إنشاء جدول سجلات النشاط (activity_logs)
-- ==============================================================================
create table if not exists public.activity_logs (
  id uuid not null default gen_random_uuid (),
  academy_id uuid null,
  user_id uuid null,
  action text not null,
  entity_type text null,
  entity_id uuid null,
  ip_address inet null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  metadata jsonb not null default '{}'::jsonb,
  
  constraint activity_logs_pkey primary key (id),
  constraint activity_logs_academy_id_fkey foreign key (academy_id) references public.academies (id) on delete set null,
  constraint activity_logs_user_id_fkey foreign key (user_id) references public.profiles (id) on delete set null
) TABLESPACE pg_default;

-- ==============================================================================
-- 2. الفهارس لتحسين أداء الاستعلامات (Indexes)
-- ==============================================================================
create index if not exists idx_activity_logs_academy_time on public.activity_logs using btree (academy_id, created_at desc) TABLESPACE pg_default;
create index if not exists idx_activity_logs_academy_id on public.activity_logs using btree (academy_id) TABLESPACE pg_default;
create index if not exists idx_activity_logs_user_id on public.activity_logs using btree (user_id) TABLESPACE pg_default;

-- ==============================================================================
-- 3. المشغلات (Triggers لمنع التلاعب بالسجلات)
-- ==============================================================================
drop trigger if exists trg_prevent_logs_tampering on public.activity_logs;
create trigger trg_prevent_logs_tampering 
  before delete or update on public.activity_logs 
  for each row 
  execute function prevent_activity_logs_tampering ();

-- ==============================================================================
-- 4. أمان الصفوف وسياسات الحماية (RLS & Policies)
-- ==============================================================================
alter table public.activity_logs enable row level security;

-- (أ) سياسة الإدراج (Insert)
drop policy if exists "activity_logs_insert_policy" on public.activity_logs;
create policy "activity_logs_insert_policy"
  on public.activity_logs
  for insert
  to authenticated
  with check (
    is_super_admin() 
    or ((academy_id is not null) and (academy_id = get_auth_academy_id()))
  );

-- (ب) سياسة القراءة والعرض (Select)
drop policy if exists "activity_logs_select_policy" on public.activity_logs;
create policy "activity_logs_select_policy"
  on public.activity_logs
  for select
  to authenticated
  using (
    is_super_admin() 
    or ((academy_id is not null) and (academy_id = get_auth_academy_id()))
  );
