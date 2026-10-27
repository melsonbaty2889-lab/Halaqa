create table public.admin_invitations (
  id uuid not null default gen_random_uuid (),
  email character varying(255) not null,
  token_hash text not null,
  is_used boolean null default false,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  role text not null default 'super_admin'::text,
  constraint admin_invitations_pkey primary key (id),
  constraint admin_invitations_email_key unique (email)
) TABLESPACE pg_default;

create index IF not exists idx_admin_invitations_email on public.admin_invitations using btree (email) TABLESPACE pg_default;

create index IF not exists idx_admin_invitations_token_hash on public.admin_invitations using btree (token_hash) TABLESPACE pg_default;
