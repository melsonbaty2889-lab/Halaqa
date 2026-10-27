-- ==============================================================================
-- 1. إنشاء جدول الشارات والأوسمة (badges)
-- ==============================================================================
create table if not exists public.badges (
  id uuid not null default gen_random_uuid (),
  academy_id uuid not null,
  icon_url text null,
  points_rewarded integer null default 0,
  is_active boolean not null default true,
  titles jsonb not null default '{}'::jsonb,
  descriptions jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  
  constraint badges_pkey primary key (id),
  constraint badges_academy_id_fkey foreign key (academy_id) references public.academies (id) on delete cascade
) TABLESPACE pg_default;

-- ==============================================================================
-- 2. الفهارس لتحسين أداء الاستعلامات (Indexes)
-- ==============================================================================
create index if not exists idx_badges_academy_id on public.badges using btree (academy_id) TABLESPACE pg_default;
create index if not exists idx_badges_is_active on public.badges using btree (is_active) TABLESPACE pg_default;

-- ==============================================================================
-- 3. المشغلات (Triggers)
-- ==============================================================================
drop trigger if exists set_updated_at on public.badges;
create trigger set_updated_at 
  before update on public.badges 
  for each row 
  execute function handle_updated_at ();

-- ==============================================================================
-- 4. أمان الصفوف وسياسات الحماية (RLS & Policies الموحدة والمحدثة)
-- ==============================================================================
alter table public.badges enable row level security;

-- (أ) سياسة العرض والقراءة (SELECT)
drop policy if exists "badges_select_policy" on public.badges;
create policy "badges_select_policy"
  on public.badges
  for select
  to authenticated
  using (
    is_super_admin() 
    or (academy_id = get_auth_academy_id())
  );

-- (ب) سياسة الإدراج (INSERT)
drop policy if exists "badges_insert_policy" on public.badges;
create policy "badges_insert_policy"
  on public.badges
  for insert
  to authenticated
  with check (
    is_super_admin() 
    or (academy_id = get_auth_academy_id())
  );

-- (ج) سياسة التحديث (UPDATE)
drop policy if exists "badges_update_policy" on public.badges;
create policy "badges_update_policy"
  on public.badges
  for update
  to authenticated
  using (
    is_super_admin() 
    or (academy_id = get_auth_academy_id())
  )
  with check (
    is_super_admin() 
    or (academy_id = get_auth_academy_id())
  );

-- (د) سياسة الحذف (DELETE)
drop policy if exists "badges_delete_policy" on public.badges;
create policy "badges_delete_policy"
  on public.badges
  for delete
  to authenticated
  using (
    is_super_admin() 
    or (academy_id = get_auth_academy_id())
  );
