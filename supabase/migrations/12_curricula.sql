-- ==============================================================================
-- 1. إنشاء جدول المناهج والبرامج التعليمية (curricula)
-- ==============================================================================
create table if not exists public.curricula (
  id uuid not null default gen_random_uuid (),
  academy_id uuid not null,
  description jsonb null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  category character varying(100) null default 'quran'::character varying,
  code character varying(50) null,
  title jsonb not null default '{}'::jsonb,
  
  constraint curricula_pkey primary key (id),
  constraint curricula_academy_code_key unique (academy_id, code),
  constraint curricula_academy_id_fkey foreign key (academy_id) references public.academies (id) on delete cascade,
  constraint curricula_category_check check (
    (category)::text = any (
      array[
        'quran'::text,
        'tajweed'::text,
        'tafsir'::text,
        'aqeedah'::text,
        'fiqh'::text,
        'usul_fiqh'::text,
        'hadith'::text,
        'seerah'::text,
        'arabic'::text,
        'general'::text,
        'other'::text
      ]
    )
  )
) TABLESPACE pg_default;

-- ==============================================================================
-- 2. الفهارس لتحسين أداء الاستعلامات (Indexes)
-- ==============================================================================
create index if not exists idx_curricula_academy_active on public.curricula using btree (academy_id, is_active) TABLESPACE pg_default;
create index if not exists idx_curricula_category on public.curricula using btree (category) TABLESPACE pg_default;
create index if not exists idx_curricula_academy_id on public.curricula using btree (academy_id) TABLESPACE pg_default;

-- ==============================================================================
-- 3. المشغلات (Triggers)
-- ==============================================================================
drop trigger if exists set_curricula_updated_at on public.curricula;
create trigger set_curricula_updated_at 
  before update on public.curricula 
  for each row 
  execute function handle_updated_at ();

-- ==============================================================================
-- 4. أمان الصفوف وسياسات الحماية (RLS & Policies)
-- ==============================================================================
alter table public.curricula enable row level security;

drop policy if exists "curricula_academy_isolation_policy" on public.curricula;
create policy "curricula_academy_isolation_policy"
  on public.curricula
  for all
  to authenticated
  using (
    is_super_admin() 
    or ((academy_id is not null) and (academy_id = get_auth_academy_id()))
  )
  with check (
    is_super_admin() 
    or ((academy_id is not null) and (academy_id = get_auth_academy_id()))
  );
