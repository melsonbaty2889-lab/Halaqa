-- ==============================================================================
-- 1. إنشاء جدول سجلات التسميع الذكي (ai_recitation_logs)
-- ==============================================================================
create table if not exists public.ai_recitation_logs (
  id uuid not null default extensions.uuid_generate_v4 (),
  academy_id uuid null,
  student_id uuid null,
  surah_id integer null,
  audio_url text null,
  ai_transcript text null,
  mistakes_detected jsonb null default '[]'::jsonb,
  accuracy_score numeric(5, 2) null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  status character varying(50) null default 'pending_review'::character varying,
  teacher_notes text null,
  confidence_score numeric(3, 2) null,
  reviewed_by uuid null,
  reviewed_at timestamp with time zone null,
  
  constraint ai_recitation_logs_pkey primary key (id),
  constraint ai_recitation_logs_academy_id_fkey foreign key (academy_id) references public.academies (id) on delete set null,
  constraint ai_recitation_logs_reviewed_by_fkey foreign key (reviewed_by) references public.profiles (id) on delete set null,
  constraint ai_recitation_logs_student_id_fkey foreign key (student_id) references public.students (id) on delete set null,
  constraint ai_recitation_logs_status_check check (
    (status)::text = any (
      array[
        ('pending_review'::character varying)::text,
        ('approved_by_teacher'::character varying)::text,
        ('rejected'::character varying)::text,
        ('needs_re_recording'::character varying)::text
      ]
    )
  )
) TABLESPACE pg_default;

-- ==============================================================================
-- 2. الفهارس لتحسين الأداء (Indexes)
-- ==============================================================================
create index if not exists idx_ai_recitation_logs_created_at on public.ai_recitation_logs using btree (created_at desc) TABLESPACE pg_default;
create index if not exists idx_ai_recitation_logs_academy_id on public.ai_recitation_logs using btree (academy_id) TABLESPACE pg_default;
create index if not exists idx_ai_recitation_logs_student_id on public.ai_recitation_logs using btree (student_id) TABLESPACE pg_default;
create index if not exists idx_ai_recitation_logs_status on public.ai_recitation_logs using btree (status) TABLESPACE pg_default;

-- ==============================================================================
-- 3. أمان الصفوف وسياسات الحماية (RLS & Policies)
-- ==============================================================================
alter table public.ai_recitation_logs enable row level security;

-- (أ) سياسة إدارة كادر الأكاديمية والسوبر أدمن
drop policy if exists "academy_staff_manage_recitation_logs" on public.ai_recitation_logs;
create policy "academy_staff_manage_recitation_logs"
  on public.ai_recitation_logs
  for all
  to authenticated
  using (
    (academy_id in (select t.academy_id from public.teachers t where t.user_id = auth.uid()))
    or is_super_admin()
  )
  with check (
    (academy_id in (select t.academy_id from public.teachers t where t.user_id = auth.uid()))
    or is_super_admin()
  );

-- (ب) سياسة ولي الأمر (عرض تقارير الأبناء)
drop policy if exists "parents_view_children_recitation_logs" on public.ai_recitation_logs;
create policy "parents_view_children_recitation_logs"
  on public.ai_recitation_logs
  for select
  to authenticated
  using (
    student_id in (
      select sg.student_id
      from public.student_guardians sg
      join public.parents p on p.id = sg.parent_id
      where p.profile_id = auth.uid()
        and sg.can_view_reports = true
    )
  );

-- (ج) سياسة الطالب (عرض سجلاته الشخصية)
drop policy if exists "students_view_own_recitation_logs" on public.ai_recitation_logs;
create policy "students_view_own_recitation_logs"
  on public.ai_recitation_logs
  for select
  to authenticated
  using (
    student_id in (
      select s.id 
      from public.students s 
      where s.user_id = auth.uid()
    )
  );

-- (د) سياسة المعلم (إدارة طلاب حلقاته النشطة فقط)
drop policy if exists "teachers_manage_own_students_recitation_logs" on public.ai_recitation_logs;
create policy "teachers_manage_own_students_recitation_logs"
  on public.ai_recitation_logs
  for all
  to authenticated
  using (
    student_id in (
      select sh.student_id
      from public.student_halaqas sh
      join public.halaqas h on h.id = sh.halaqa_id
      join public.teachers t on t.id = h.teacher_id
      where t.user_id = auth.uid()
        and sh.status = 'active'
    )
  )
  with check (
    student_id in (
      select sh.student_id
      from public.student_halaqas sh
      join public.halaqas h on h.id = sh.halaqa_id
      join public.teachers t on t.id = h.teacher_id
      where t.user_id = auth.uid()
        and sh.status = 'active'
    )
  );
