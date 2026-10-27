create table public.ai_recitation_logs (
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

create index IF not exists idx_ai_recitation_logs_created_at on public.ai_recitation_logs using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_ai_recitation_logs_academy_id on public.ai_recitation_logs using btree (academy_id) TABLESPACE pg_default;

create index IF not exists idx_ai_recitation_logs_student_id on public.ai_recitation_logs using btree (student_id) TABLESPACE pg_default;

create index IF not exists idx_ai_recitation_logs_status on public.ai_recitation_logs using btree (status) TABLESPACE pg_default;
