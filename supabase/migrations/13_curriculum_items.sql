-- ==============================================================================
-- 1. إنشاء جدول عناصر المنهج (curriculum_items)
-- ==============================================================================
create table if not exists public.curriculum_items (
  id uuid not null default gen_random_uuid (),
  level_id uuid not null,
  title jsonb not null default '{}'::jsonb,
  item_type text not null default 'general'::text,
  reference_id uuid null,
  order_index integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  content_type character varying(50) not null default 'text'::character varying,
  surah_number integer null,
  from_ayah integer null,
  to_ayah integer null,
  book_name character varying(255) null,
  chapter_number integer null,
  from_page integer null,
  to_page integer null,
  estimated_duration integer null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  
  constraint curriculum_items_pkey primary key (id),
  constraint curriculum_items_level_order_key unique (level_id, order_index),
  constraint curriculum_items_level_id_fkey foreign key (level_id) references public.curriculum_levels (id) on delete cascade,
  constraint curriculum_items_content_type_check check (
    (content_type)::text = any (
      array[
        ('quran'::character varying)::text,
        ('tajweed'::character varying)::text,
        ('aqeedah'::character varying)::text,
        ('fiqh'::character varying)::text,
        ('hadith'::character varying)::text,
        ('seerah'::character varying)::text,
        ('arabic'::character varying)::text,
        ('other'::character varying)::text
      ]
    )
  ),
  constraint curriculum_items_item_type_check check (
    item_type = any (
      array[
        'lesson'::text,
        'memorization'::text,
        'review'::text,
        'exam'::text,
        'assignment'::text,
        'activity'::text
      ]
    )
  )
) TABLESPACE pg_default;

-- ==============================================================================
-- 2. الفهارس لتحسين أداء الاستعلامات (Indexes)
-- ==============================================================================
create index if not exists idx_curriculum_items_level on public.curriculum_items using btree (level_id) TABLESPACE pg_default;
create index if not exists idx_curriculum_items_order on public.curriculum_items using btree (level_id, order_index) TABLESPACE pg_default;
create index if not exists idx_curriculum_items_level_id on public.curriculum_items using btree (level_id) TABLESPACE pg_default;

-- ==============================================================================
-- 3. المشغلات (Triggers)
-- ==============================================================================
drop trigger if exists set_curriculum_items_updated_at on public.curriculum_items;
create trigger set_curriculum_items_updated_at 
  before update on public.curriculum_items 
  for each row 
  execute function handle_updated_at ();

-- ==============================================================================
-- 4. أمان الصفوف وسياسات الحماية (RLS & Secure Policies)
-- ==============================================================================
alter table public.curriculum_items enable row level security;

drop policy if exists "curriculum_items_unified_policy" on public.curriculum_items;
drop policy if exists "curriculum_items_academy_isolation_policy" on public.curriculum_items;

create policy "curriculum_items_academy_isolation_policy"
  on public.curriculum_items
  for all
  to authenticated
  using (
    is_super_admin() 
    or exists (
      select 1 
      from public.curriculum_levels cl
      join public.curricula c on c.id = cl.curriculum_id
      where cl.id = curriculum_items.level_id 
        and c.academy_id = get_auth_academy_id()
    )
  )
  with check (
    is_super_admin() 
    or exists (
      select 1 
      from public.curriculum_levels cl
      join public.curricula c on c.id = cl.curriculum_id
      where cl.id = curriculum_items.level_id 
        and c.academy_id = get_auth_academy_id()
    )
  );
