-- ==============================================================================
-- 1. إنشاء جدول سجلات المراجعة والتغييرات (audit_logs)
-- ==============================================================================
create table if not exists public.audit_logs (
  id uuid not null default gen_random_uuid (),
  academy_id uuid null,
  table_name text not null,
  record_id uuid not null,
  old_data jsonb null,
  new_data jsonb null,
  operation text not null,
  changed_by uuid null,
  created_at timestamp with time zone null default now(),
  ip_address inet null,
  
  constraint audit_logs_pkey primary key (id),
  constraint audit_logs_academy_id_fkey foreign key (academy_id) references public.academies (id) on delete set null,
  constraint audit_logs_changed_by_fkey foreign key (changed_by) references public.profiles (id) on delete set null,
  constraint audit_logs_operation_check check (
    operation = any (
      array[
        'INSERT'::text,
        'UPDATE'::text,
        'DELETE'::text
      ]
    )
  )
) TABLESPACE pg_default;

-- ==============================================================================
-- 2. الفهارس لتحسين أداء الاستعلامات والبحث (Indexes)
-- ==============================================================================
create index if not exists idx_audit_logs_record_id on public.audit_logs using btree (record_id) TABLESPACE pg_default;
create index if not exists idx_audit_logs_table_name on public.audit_logs using btree (table_name) TABLESPACE pg_default;
create index if not exists idx_audit_logs_academy_created on public.audit_logs using btree (academy_id, created_at desc) TABLESPACE pg_default;
create index if not exists idx_audit_logs_changed_by on public.audit_logs using btree (changed_by) TABLESPACE pg_default;

-- ==============================================================================
-- 3. المشغلات لمنع التلاعب والتعديل على السجلات (Triggers)
-- ==============================================================================
drop trigger if exists trg_prevent_audit_logs_tampering on public.audit_logs;
create trigger trg_prevent_audit_logs_tampering 
  before delete or update on public.audit_logs 
  for each row 
  execute function prevent_audit_logs_tampering ();

-- ==============================================================================
-- 4. أمان الصفوف وسياسات الحماية (RLS & Policies)
-- ==============================================================================
alter table public.audit_logs enable row level security;

-- (أ) سياسة الإدراج (Insert) للمستخدمين المصرح لهم
drop policy if exists "audit_logs_insert_policy" on public.audit_logs;
create policy "audit_logs_insert_policy"
  on public.audit_logs
  for insert
  to authenticated
  with check (
    (select auth.uid()) is not null
  );

-- (ب) سياسة القراءة والعرض (Select) مع عزل الأكاديميات وصلاحيات السوبر أدمن
drop policy if exists "audit_logs_select_policy" on public.audit_logs;
create policy "audit_logs_select_policy"
  on public.audit_logs
  for select
  to authenticated
  using (
    ((select auth.uid()) is not null) 
    and (
      (academy_id = get_auth_academy_id()) 
      or is_super_admin()
    )
  );
