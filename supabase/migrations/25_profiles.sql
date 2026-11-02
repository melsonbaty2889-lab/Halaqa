create table public.profiles (
  id uuid not null,
  full_name text null,
  phone text null,
  avatar_url text null,
  gender text null,
  preferred_language text null default 'ar'::text,
  is_activated boolean null default false,
  role text null default 'student'::text,
  created_at timestamp with time zone null default now(),
  last_login_at timestamp with time zone null,
  is_online boolean not null default false,
  timezone text null default 'UTC'::text,
  is_deleted boolean not null default false,
  email text null,
  country_code character(2) null,
  updated_at timestamp with time zone null default now(),
  metadata jsonb null default '{}'::jsonb,
  academy_id uuid null,
  constraint profiles_pkey primary key (id),
  constraint profiles_academy_id_fkey foreign KEY (academy_id) references academies (id) on delete set null,
  constraint fk_profiles_auth_users foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_role_check check (
    (
      role = any (
        array[
          'super_admin'::text,
          'admin'::text,
          'manager'::text,
          'teacher'::text,
          'student'::text,
          'parent'::text
        ]
      )
    )
  ),
  constraint profiles_gender_check check (
    (
      gender = any (array['male'::text, 'female'::text])
    )
  ),
  constraint profiles_email_check check (
    (
      email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$'::text
    )
  ),
  constraint profiles_phone_check check (
    (
      (phone is null)
      or (phone ~ '^\+?[0-9\s\-\(\)]{7,20}$'::text)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_profiles_is_online on public.profiles using btree (is_online) TABLESPACE pg_default
where
  (is_online = true);

create index IF not exists idx_profiles_last_login on public.profiles using btree (last_login_at desc nulls last) TABLESPACE pg_default;

create index IF not exists idx_profiles_academy_id on public.profiles using btree (academy_id) TABLESPACE pg_default;

create index IF not exists idx_profiles_role_academy on public.profiles using btree (role, academy_id) TABLESPACE pg_default;

create index IF not exists idx_profiles_user_academy_role on public.profiles using btree (id, academy_id, role) TABLESPACE pg_default;

create index IF not exists idx_profiles_email on public.profiles using btree (email) TABLESPACE pg_default
where
  (email is not null);

create index IF not exists idx_profiles_academy_active on public.profiles using btree (academy_id, role) TABLESPACE pg_default
where
  (is_deleted = false);

create index IF not exists idx_profiles_metadata_gin on public.profiles using gin (metadata) TABLESPACE pg_default;

create trigger audit_profiles_trigger
after INSERT
or DELETE
or
update on profiles for EACH row
execute FUNCTION log_table_activity ();

create trigger on_parent_self_registration
after INSERT on profiles for EACH row when (new.role = 'parent'::text)
execute FUNCTION handle_parent_multi_student_registration ();

create trigger protect_profile_updates_trigger BEFORE
update on profiles for EACH row
execute FUNCTION protect_profile_updates ();

create trigger set_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION handle_updated_at ();
