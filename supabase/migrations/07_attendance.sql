-- ==============================================================================
-- 07_attendance.sql - النسخة النهائية الشاملة لجدول الحضور والغياب
-- ==============================================================================

Create table public.attendance (
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
  constraint attendance_session_id_fkey foreign KEY (session_id) references attendance_sessions (id) on delete CASCADE,
  constraint attendance_student_id_fkey foreign KEY (student_id) references students (id) on delete CASCADE,
  constraint attendance_teacher_id_fkey foreign KEY (teacher_id) references teachers (id) on delete set null,
  constraint attendance_academy_fkey foreign KEY (academy_id) references academies (id) on delete CASCADE,
  constraint attendance_halaqa_id_fkey foreign KEY (halaqa_id) references halaqas (id) on delete CASCADE,
  constraint attendance_status_check check (
    (
      status = any (
        array[
          'present'::text,
          'absent'::text,
          'late'::text,
          'excused'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- الفهارس
create index IF not exists idx_attendance_date on public.attendance using btree (academy_id, date) TABLESPACE pg_default;
create index IF not exists idx_attendance_student_id on public.attendance using btree (student_id) TABLESPACE pg_default;
create index IF not exists idx_attendance_halaqa_id on public.attendance using btree (halaqa_id) TABLESPACE pg_default;
create index IF not exists idx_attendance_teacher_id on public.attendance using btree (teacher_id) TABLESPACE pg_default;
create index IF not exists idx_attendance_session_id on public.attendance using btree (session_id) TABLESPACE pg_default;
create index IF not exists idx_attendance_student_date on public.attendance using btree (academy_id, student_id, date) TABLESPACE pg_default;

-- التريجرز
create trigger audit_attendance_trigger after INSERT or DELETE or update on attendance for EACH row execute FUNCTION log_table_activity ();
create trigger set_updated_at BEFORE update on attendance for EACH row execute FUNCTION handle_updated_at ();
create trigger trigger_update_student_streak after INSERT or update on attendance for EACH row execute FUNCTION update_student_streak_on_attendance ();

-- تفعيل الـ RLS وسياسات الأمان
alter table public.attendance enable row level security;

create policy staff_insert_attendance on public.attendance for INSERT to authenticated with check (
  (is_super_admin() OR ((academy_id = get_auth_academy_id()) AND ((teacher_id IN ( SELECT teachers.id FROM teachers WHERE (teachers.user_id = auth.uid()))) OR (halaqa_id IN ( SELECT halaqas.id FROM halaqas WHERE (halaqas.teacher_id IN ( SELECT teachers.id FROM teachers WHERE (teachers.user_id = auth.uid())))))) AND (date = CURRENT_DATE)))
);

create policy staff_update_attendance on public.attendance for UPDATE to authenticated using (
  (is_super_admin() OR ((academy_id = get_auth_academy_id()) AND ((teacher_id IN ( SELECT teachers.id FROM teachers WHERE (teachers.user_id = auth.uid()))) OR (halaqa_id IN ( SELECT halaqas.id FROM halaqas WHERE (halaqas.teacher_id IN ( SELECT teachers.id FROM teachers WHERE (teachers.user_id = auth.uid())))))) AND (date = CURRENT_DATE)))
) with check (
  (is_super_admin() OR ((academy_id = get_auth_academy_id()) AND ((teacher_id IN ( SELECT teachers.id FROM teachers WHERE (teachers.user_id = auth.uid()))) OR (halaqa_id IN ( SELECT halaqas.id FROM halaqas WHERE (halaqas.teacher_id IN ( SELECT teachers.id FROM teachers WHERE (teachers.user_id = auth.uid())))))) AND (date = CURRENT_DATE)))
);

create policy staff_view_attendance on public.attendance for SELECT to authenticated using (
  (is_super_admin() OR ((academy_id = get_auth_academy_id()) AND ((teacher_id IN ( SELECT teachers.id FROM teachers WHERE (teachers.user_id = auth.uid()))) OR (halaqa_id IN ( SELECT halaqas.id FROM halaqas WHERE (halaqas.teacher_id IN ( SELECT teachers.id FROM teachers WHERE (teachers.user_id = auth.uid()))))))))
);

create policy students_view_own_attendance on public.attendance for SELECT to authenticated using (
  (student_id IN ( SELECT students.id FROM students WHERE (students.user_id = auth.uid())))
);
