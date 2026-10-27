-- ==============================================================================
-- 1. إنشاء جدول دعوات المشرفين (admin_invitations)
-- ==============================================================================
create table if not exists public.admin_invitations (
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

-- ==============================================================================
-- 2. الفهارس لتحسين أداء البحث (Indexes)
-- ==============================================================================
create index if not exists idx_admin_invitations_email on public.admin_invitations using btree (email) TABLESPACE pg_default;
create index if not exists idx_admin_invitations_token_hash on public.admin_invitations using btree (token_hash) TABLESPACE pg_default;

-- ==============================================================================
-- 3. أمان الصفوف وسياسات الحماية (RLS & Policies)
-- ==============================================================================
alter table public.admin_invitations enable row level security;

-- سياسة المشرف العام (Super Admin): تحكم كامل وصلاحيات مطلقة للأدوار والإدارة
drop policy if exists "admin_invitations_super_admin_policy" on public.admin_invitations;
create policy "admin_invitations_super_admin_policy"
  on public.admin_invitations
  for all
  to authenticated
  using (is_super_admin())
  with check (is_super_admin());
