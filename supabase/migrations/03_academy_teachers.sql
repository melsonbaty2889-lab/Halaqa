-- ==============================================================================
-- 1. إنشاء جدول ارتباط المعلمين بالأكاديميات (academy_teachers)
-- ==============================================================================
create table if not exists public.academy_teachers (
  id uuid not null default gen_random_uuid (),
  academy_id uuid not null,
  teacher_id uuid not null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  
  constraint academy_teachers_pkey primary key (id),
  constraint unique_academy_teacher unique (academy_id, teacher_id),
  constraint academy_teachers_academy_fkey foreign key (academy_id) references public.academies (id) on delete cascade,
  constraint academy_teachers_teacher_id_fkey foreign key (teacher_id) references public.teachers (id) on delete cascade
) TABLESPACE pg_default;

-- ==============================================================================
-- 2. الفهارس لتحسين الأداء (Indexes)
-- ==============================================================================
create index if not exists idx_academy_teachers_composite on public.academy_teachers using btree (academy_id, teacher_id) TABLESPACE pg_default;
create index if not exists idx_academy_teachers_teacher_id on public.academy_teachers using btree (teacher_id) TABLESPACE pg_default;
create index if not exists idx_academy_teachers_created on public.academy_teachers using btree (created_at desc) TABLESPACE pg_default;
create index if not exists idx_academy_teachers_updated_at on public.academy_teachers using btree (updated_at desc) TABLESPACE pg_default;

-- ==============================================================================
-- 3. المشغلات (Triggers)
-- ==============================================================================
drop trigger if exists set_updated_at on public.academy_teachers;
create trigger set_updated_at before update on public.academy_teachers for each row execute function handle_updated_at ();

-- ==============================================================================
-- 4. أمان الصفوف وسياسات الحماية (RLS & Policies)
-- ==============================================================================
alter table public.academy_teachers enable row level security;

-- (أ) سياسة التعديل والإدارة (Modify/All): للمالك أو السوبر أدمن فقط
drop policy if exists "academy_teachers_modify_policy" on public.academy_teachers;
create policy "academy_teachers_modify_policy"
  on public.academy_teachers
  for all
  to authenticated
  using (
    is_super_admin() 
    or (exists (select 1 from public.academies a where a.id = academy_teachers.academy_id and a.owner_id = auth.uid()))
  )
  with check (
    is_super_admin() 
    or (exists (select 1 from public.academies a where a.id = academy_teachers.academy_id and a.owner_id = auth.uid()))
  );

-- (ب) سياسة القراءة والعرض (Select): بناءً على عزل الأكاديمية أو السوبر أدمن
drop policy if exists "academy_teachers_select_policy" on public.academy_teachers;
create policy "academy_teachers_select_policy"
  on public.academy_teachers
  for select
  to authenticated
  using (
    is_super_admin() 
    or ((academy_id is not null) and (academy_id = get_auth_academy_id()))
  );
