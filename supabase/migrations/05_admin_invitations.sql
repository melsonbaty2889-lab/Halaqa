-- ==============================================================================
-- 05_admin_invitations.sql - النسخة النهائية الشاملة لجدول دعوات المشرفين
-- ==============================================================================

Create table public.admin_invitations (
  id uuid not null default gen_random_uuid (),
  email character varying(255) not null,
  token_hash text not null,
  is_used boolean null default false,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  role text not null default 'super_admin'::text,
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint admin_invitations_pkey primary key (id),
  constraint admin_invitations_email_key unique (email)
) TABLESPACE pg_default;

-- الفهارس
create index IF not exists idx_admin_invitations_email on public.admin_invitations using btree (email) TABLESPACE pg_default;
create index IF not exists idx_admin_invitations_token_hash on public.admin_invitations using btree (token_hash) TABLESPACE pg_default;

-- التريجر للتتبع الزمني
create trigger set_admin_invitations_updated_at BEFORE update on admin_invitations for EACH row execute FUNCTION handle_updated_at ();

-- تفعيل الـ RLS وسياسة الأمان
alter table public.admin_invitations enable row level security;

create policy admin_invitations_super_admin_policy on public.admin_invitations for ALL to authenticated using (
  is_super_admin()
) with check (
  is_super_admin()
);
