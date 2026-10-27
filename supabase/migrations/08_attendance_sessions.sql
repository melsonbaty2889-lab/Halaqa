-- ==============================================================================
-- 1. إنشاء جدول جلسات الحضور (attendance_sessions)
-- ==============================================================================
create table if not exists public.attendance_sessions (
  id uuid not null default gen_random_uuid (),
  academy_id uuid not null,
  halaqa_id uuid not null,
  session_date timestamp with time zone not null default CURRENT_DATE,
  session_notes text null,
  created_at timestamp with time zone null default now(),
  created_in_timezone character varying(100) null default 'Africa/Cairo'::character varying,
  teacher_id uuid null,
  updated_at timestamp with time zone null default now(),
  session_type text null default 'standard'::text,
  
  constraint attendance_sessions_pkey primary key (id),
  constraint attendance_sessions_academy_id_fkey foreign key (academy_id) references public.academies (id) on delete cascade,
  constraint attendance_sessions_halaqa_id_fkey foreign key (halaqa_id) references public.halaqas (id) on delete cascade,
  constraint attendance_sessions_teacher_id_fkey foreign key (teacher_id) references public.teachers (id) on delete set null
) TABLESPACE pg_default;

-- ==============================================================================
-- 2. الفهارس لتحسين أداء الاستعلامات (Indexes)
-- ==============================================================================
create index if not exists idx_attendance_sessions_teacher_id on public.attendance_sessions using btree (teacher_id) TABLESPACE pg_default;
create index if not exists idx_attendance_sessions_academy_id on public.attendance_sessions using btree (academy_id) TABLESPACE pg_default;
create index if not exists idx_attendance_sessions_halaqa_id on public.attendance_sessions using btree (halaqa_id) TABLESPACE pg_default;

-- ==============================================================================
-- 3. المشغلات (Triggers)
-- ==============================================================================
drop trigger if exists set_attendance_sessions_updated_at on public.attendance_sessions;
create trigger set_attendance_sessions_updated_at 
  before update on public.attendance_sessions 
  for each row 
  execute function handle_updated_at ();

-- ==============================================================================
-- 4. أمان الصفوف وسياسات الحماية (RLS & Policies)
-- ==============================================================================
alter table public.attendance_sessions enable row level security;

-- (أ) سياسة إدخال الجلسات (للكادر المعتمد لنفس اليوم فقط أو السوبر أدمن)
drop policy if exists "staff_insert_attendance_sessions" on public.attendance_sessions;
create policy "staff_insert_attendance_sessions"
  on public.attendance_sessions
  for insert
  to authenticated
  with check (
    is_super_admin() 
    or (
      (academy_id = get_auth_academy_id()) 
      and (
        (teacher_id in (select teachers.id from public.teachers where teachers.user_id = auth.uid()))
        or (halaqa_id in (select halaqas.id from public.halaqas where halaqas.teacher_id in (select teachers.id from public.teachers where teachers.user_id = auth.uid())))
      ) 
      and ((session_date)::date = CURRENT_DATE)
    )
  );

-- (ب) سياسة تحديث الجلسات (للكادر المعتمد لنفس اليوم فقط أو السوبر أدمن)
drop policy if exists "staff_update_attendance_sessions" on public.attendance_sessions;
create policy "staff_update_attendance_sessions"
  on public.attendance_sessions
  for update
  to authenticated
  using (
    is_super_admin() 
    or (
      (academy_id = get_auth_academy_id()) 
      and (
        (teacher_id in (select teachers.id from public.teachers where teachers.user_id = auth.uid()))
        or (halaqa_id in (select halaqas.id from public.halaqas where halaqas.teacher_id in (select teachers.id from public.teachers where teachers.user_id = auth.uid())))
      ) 
      and ((session_date)::date = CURRENT_DATE)
    )
  )
  with check (
    is_super_admin() 
    or (
      (academy_id = get_auth_academy_id()) 
      and (
        (teacher_id in (select teachers.id from public.teachers where teachers.user_id = auth.uid()))
        or (halaqa_id in (select halaqas.id from public.halaqas where halaqas.teacher_id in (select teachers.id from public.teachers where teachers.user_id = auth.uid())))
      ) 
      and ((session_date)::date = CURRENT_DATE)
    )
  );

-- (ج) سياسة عرض الجلسات للكادر والمشرفين
drop policy if exists "staff_view_attendance_sessions" on public.attendance_sessions;
create policy "staff_view_attendance_sessions"
  on public.attendance_sessions
  for select
  to authenticated
  using (
    is_super_admin() 
    or (
      (academy_id = get_auth_academy_id()) 
      and (
        (teacher_id in (select teachers.id from public.teachers where teachers.user_id = auth.uid()))
        or (halaqa_id in (select halaqas.id from public.halaqas where halaqas.teacher_id in (select teachers.id from public.teachers where teachers.user_id = auth.uid())))
      )
    )
  );
