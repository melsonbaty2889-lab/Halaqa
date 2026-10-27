-- ==============================================================================
-- 06_ai_recitation_logs.sql - النسخة النهائية الشاملة لجدول سجلات التسميع بالذكاء الاصطناعي
-- ==============================================================================

Create table public.ai_recitation_logs (
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
  constraint ai_recitation_logs_academy_id_fkey foreign KEY (academy_id) references academies (id) on delete set null,
  constraint ai_recitation_logs_reviewed_by_fkey foreign KEY (reviewed_by) references profiles (id) on delete set null,
  constraint ai_recitation_logs_student_id_fkey foreign KEY (student_id) references students (id) on delete set null,
  constraint ai_recitation_logs_status_check check (
    (
      (status)::text = any (
        array[
          ('pending_review'::character varying)::text,
          ('approved_by_teacher'::character varying)::text,
          ('rejected'::character varying)::text,
          ('needs_re_recording'::character varying)::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- الفهارس
create index IF not exists idx_ai_recitation_logs_created_at on public.ai_recitation_logs using btree (created_at desc) TABLESPACE pg_default;
create index IF not exists idx_ai_recitation_logs_academy_id on public.ai_recitation_logs using btree (academy_id) TABLESPACE pg_default;
create index IF not exists idx_ai_recitation_logs_student_id on public.ai_recitation_logs using btree (student_id) TABLESPACE pg_default;
create index IF not exists idx_ai_recitation_logs_status on public.ai_recitation_logs using btree (status) TABLESPACE pg_default;

-- تفعيل الـ RLS وسياسات الأمان المتقدمة
alter table public.ai_recitation_logs enable row level security;

create policy academy_staff_manage_recitation_logs on public.ai_recitation_logs for ALL to authenticated using (
  ((academy_id IN ( SELECT t.academy_id FROM teachers t WHERE (t.user_id = auth.uid()))) OR is_super_admin())
) with check (
  ((academy_id IN ( SELECT t.academy_id FROM teachers t WHERE (t.user_id = auth.uid()))) OR is_super_admin())
);

create policy parents_view_children_recitation_logs on public.ai_recitation_logs for SELECT to authenticated using (
  (student_id IN ( SELECT sg.student_id FROM (student_guardians sg JOIN parents p ON ((p.id = sg.parent_id))) WHERE ((p.profile_id = auth.uid()) AND (sg.can_view_reports = true))))
);

create policy students_view_own_recitation_logs on public.ai_recitation_logs for SELECT to authenticated using (
  (student_id IN ( SELECT s.id FROM students s WHERE (s.user_id = auth.uid())))
);

create policy teachers_manage_own_students_recitation_logs on public.ai_recitation_logs for ALL to authenticated using (
  (student_id IN ( SELECT sh.student_id FROM ((student_halaqas sh JOIN halaqas h ON ((h.id = sh.halaqa_id))) JOIN teachers t ON ((t.id = h.teacher_id))) WHERE ((t.user_id = auth.uid()) AND (sh.status = 'active'::text))))
) with check (
  (student_id IN ( SELECT sh.student_id FROM ((student_halaqas sh JOIN halaqas h ON ((h.id = sh.halaqa_id))) JOIN teachers t ON ((t.id = h.teacher_id))) WHERE ((t.user_id = auth.uid()) AND (sh.status = 'active'::text))))
);
