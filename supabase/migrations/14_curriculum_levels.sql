-- ==============================================================================
-- 1. إنشاء جدول مستويات المنهج (curriculum_levels) - النسخة المحسنة والمنظفة
-- ==============================================================================
create table if not exists public.curriculum_levels (
  id uuid not null default gen_random_uuid (),
  curriculum_id uuid not null,
  order_index integer not null default 1,
  passing_score integer not null default 70,
  title jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  
  constraint curriculum_levels_pkey primary key (id),
  constraint curriculum_levels_curriculum_order_key unique (curriculum_id, order_index),
  constraint curriculum_levels_curriculum_id_fkey foreign key (curriculum_id) references public.curricula (id) on delete cascade,
  constraint curriculum_levels_passing_score_check check (
    (passing_score >= 0) and (passing_score <= 100)
  )
) TABLESPACE pg_default;

-- ==============================================================================
-- 2. الفهارس (Indexes) - تم تنظيف الفهارس المكررة
-- ==============================================================================
create index if not exists idx_curriculum_levels_curriculum on public.curriculum_levels using btree (curriculum_id) TABLESPACE pg_default;

-- ==============================================================================
-- 3. المشغلات (Triggers)
-- ==============================================================================
drop trigger if exists set_curriculum_levels_updated_at on public.curriculum_levels;
create trigger set_curriculum_levels_updated_at 
  before update on public.curriculum_levels 
  for each row 
  execute function handle_updated_at ();

-- ==============================================================================
-- 4. أمان الصفوف وسياسات الحماية (Secure RLS Policies)
-- ==============================================================================
alter table public.curriculum_levels enable row level security;

drop policy if exists "curriculum_levels_unified_policy" on public.curriculum_levels;
drop policy if exists "curriculum_levels_academy_isolation_policy" on public.curriculum_levels;

create policy "curriculum_levels_academy_isolation_policy"
  on public.curriculum_levels
  for all
  to authenticated
  using (
    is_super_admin() 
    or exists (
      select 1 
      from public.curricula c 
      where c.id = curriculum_levels.curriculum_id 
        and c.academy_id = get_auth_academy_id()
    )
  )
  with check (
    is_super_admin() 
    or exists (
      select 1 
      from public.curricula c 
      where c.id = curriculum_levels.curriculum_id 
        and c.academy_id = get_auth_academy_id()
    )
  );
