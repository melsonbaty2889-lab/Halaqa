create table public.academy_teachers (
  id uuid not null default gen_random_uuid (),
  academy_id uuid not null,
  teacher_id uuid not null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint academy_teachers_pkey primary key (id),
  constraint unique_academy_teacher unique (academy_id, teacher_id),
  constraint academy_teachers_academy_fkey foreign KEY (academy_id) references academies (id) on delete CASCADE,
  constraint academy_teachers_teacher_id_fkey foreign KEY (teacher_id) references teachers (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_academy_teachers_composite on public.academy_teachers using btree (academy_id, teacher_id) TABLESPACE pg_default;

create index IF not exists idx_academy_teachers_teacher_id on public.academy_teachers using btree (teacher_id) TABLESPACE pg_default;

create index IF not exists idx_academy_teachers_created on public.academy_teachers using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_academy_teachers_updated_at on public.academy_teachers using btree (updated_at desc) TABLESPACE pg_default;

create trigger set_updated_at BEFORE
update on academy_teachers for EACH row
execute FUNCTION handle_updated_at ();
