create table public.activity_logs (
  id uuid not null default gen_random_uuid (),
  academy_id uuid null,
  user_id uuid null,
  action text not null,
  entity_type text null,
  entity_id uuid null,
  ip_address inet null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  metadata jsonb not null default '{}'::jsonb,
  constraint activity_logs_pkey primary key (id),
  constraint activity_logs_academy_id_fkey foreign KEY (academy_id) references academies (id) on delete set null,
  constraint activity_logs_user_id_fkey foreign KEY (user_id) references profiles (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_activity_logs_academy_time on public.activity_logs using btree (academy_id, created_at desc) TABLESPACE pg_default;

create index IF not exists idx_activity_logs_academy_id on public.activity_logs using btree (academy_id) TABLESPACE pg_default;

create index IF not exists idx_activity_logs_user_id on public.activity_logs using btree (user_id) TABLESPACE pg_default;

create trigger trg_prevent_logs_tampering BEFORE DELETE
or
update on activity_logs for EACH row
execute FUNCTION prevent_activity_logs_tampering ();
