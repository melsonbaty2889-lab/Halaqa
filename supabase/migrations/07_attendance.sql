-- ==============================================================================
-- 1. إنشاء جدول الحضور والتقييمات (attendance)
-- ==============================================================================
create table if not exists public.attendance (
  id uuid not null default gen_random_uuid (),
  academy_id uuid not null,
  halaqa_id uuid not null,
  student_id uuid not null,
  teacher_id uuid null,
  date date not null default CURRENT_DATE,
  status text not null,
  retention_assignment text null,
  new_memorization text null,
  session_grade numeric null,
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  quarter_index integer null default 1,
  juz integer null default 1,
  quarter_in_hizb integer null default 1,
  lesson_activity text null,
  session_id uuid null,
  
  constraint attendance_pkey primary key (id),
  constraint unique_student_halaqa_date unique (student_id, halaqa_id, date),
  constraint attendance_session_id_fkey foreign key (session_id) references public.attendance_sessions (id) on delete cascade,
  constraint attendance_student_id_fkey foreign key (student_id) references public.students (id) on delete cascade,
  constraint attendance_teacher_id_fkey foreign key (teacher_id) references public.teachers (id) on delete set null,
  constraint attendance_academy_fkey foreign key (academy_id) references public.academies (id) on delete cascade,
  constraint attendance_halaqa_id_fkey foreign key (halaqa_id) references public.halaqas (id) on delete cascade,
  constraint attendance_status_check check (
    status = any (
      array[
        'present'::text,
        'absent'::text,
        'late'::text,
        'excused'::text
      ]
    )
  )
) TABLESPACE pg_default;

-- ==============================================================================
-- 2. الفهارس لتحسين أداء الاستعلامات والتقارير (Indexes)
-- ==============================================================================
create index if not exists idx_attendance_date on public.attendance using btree (academy_id, date) TABLESPACE pg_default;
create index if not exists idx_attendance_student_id on public.attendance using btree (student_id) TABLESPACE pg_default;
create index if not exists idx_attendance_halaqa_id on public.attendance using btree (halaqa_id) TABLESPACE pg_default;
create index if not exists idx_attendance_teacher_id on public.attendance using btree (teacher_id) TABLESPACE pg_default;
create index if not exists idx_attendance_session_id on public.attendance using btree (session_id) TABLESPACE pg_default;
create index if not exists idx_attendance_student_date on public.attendance using btree (academy_id, student_id, date) TABLESPACE pg_default;

-- ==============================================================================
-- 3. المشغلات (Triggers)
-- ==============================================================================
drop trigger if exists audit_attendance_trigger on public.attendance;
create trigger audit_attendance_trigger
  after insert or delete or update on public.attendance
  for each row
  execute function log_table_activity ();

drop trigger if exists set_updated_at on public.attendance;
create trigger set_updated_at
  before update on public.attendance
  for each row
  execute function handle_updated_at ();

drop trigger if exists trigger_update_student_streak on public.attendance;
create trigger trigger_update_student_streak
  after insert or update on public.attendance
  for each row
  execute function update_student_streak_on_attendance ();

-- ==============================================================================
-- 4. أمان الصفوف وسياسات الحماية (RLS & Policies)
-- ==============================================================================
alter table public.attendance enable row level security;

-- (أ) سياسة إدخال الحضور (للكادر المعتمد لنفس اليوم فقط أو السوبر أدمن)
drop policy if exists "staff_insert_attendance" on public.attendance;
create policy "staff_insert_attendance"
  on public.attendance
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
      and (date = CURRENT_DATE)
    )
  );

-- (ب) سياسة تحديث الحضور (للكادر المعتمد لنفس اليوم فقط أو السوبر أدمن)
drop policy if exists "staff_update_attendance" on public.attendance;
create policy "staff_update_attendance"
  on public.attendance
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
      and (date = CURRENT_DATE)
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
      and (date = CURRENT_DATE)
    )
  );

-- (ج) سياسة عرض الحضور للكادر والمشرفين
drop policy if exists "staff_view_attendance" on public.attendance;
create policy "staff_view_attendance"
  on public.attendance
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

-- (د) سياسة عرض الطالب لسجلات حضوره الشخصية
drop policy if exists "students_view_own_attendance" on public.attendance;
create policy "students_view_own_attendance"
  on public.attendance
  for select
  to authenticated
  using (
    student_id in (select students.id from public.students where students.user_id = auth.uid())
  );
