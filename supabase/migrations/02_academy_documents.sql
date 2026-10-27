-- ==============================================================================
-- 02_academy_documents.sql - النسخة النهائية الشاملة لجدول مستندات الأكاديمية
-- ==============================================================================

Create table public.academy_documents (
  id uuid not null default gen_random_uuid (),
  academy_id uuid not null,
  file_url text not null,
  file_name text null,
  file_size bigint null,
  mime_type character varying(100) null,
  document_type text not null,
  uploaded_by uuid null,
  uploaded_at timestamp with time zone null default timezone ('utc'::text, now()),
  notes text null,
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamp with time zone null,
  status text not null default 'pending'::text,
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint academy_documents_pkey primary key (id),
  constraint academy_documents_academy_id_fkey foreign KEY (academy_id) references academies (id) on delete CASCADE,
  constraint academy_documents_uploaded_by_fkey foreign KEY (uploaded_by) references profiles (id) on delete set null,
  constraint academy_documents_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'approved'::text,
          'rejected'::text
        ]
      )
    )
  ),
  constraint academy_documents_type_check check (
    (
      document_type = any (
        array[
          'commercial_reg'::text,
          'tax_card'::text,
          'license'::text,
          'id_card'::text,
          'passport'::text,
          'contract'::text,
          'logo'::text,
          'other'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- الفهارس
create index IF not exists idx_academy_documents_academy on public.academy_documents using btree (academy_id) TABLESPACE pg_default;
create index IF not exists idx_academy_documents_uploaded_by on public.academy_documents using btree (uploaded_by) TABLESPACE pg_default;
create index IF not exists idx_academy_documents_expires_at on public.academy_documents using btree (expires_at) TABLESPACE pg_default;
create index IF not exists idx_academy_documents_status on public.academy_documents using btree (status) TABLESPACE pg_default;
create index IF not exists idx_academy_documents_updated_at on public.academy_documents using btree (updated_at desc) TABLESPACE pg_default;

-- التريجر
create trigger set_updated_at BEFORE update on academy_documents for EACH row execute FUNCTION handle_updated_at ();

-- تفعيل الـ RLS وسياسة العزل
alter table public.academy_documents enable row level security;

create policy academy_documents_academy_isolation_policy on public.academy_documents for ALL to authenticated using (
  (is_super_admin() OR ((academy_id IS NOT NULL) AND (academy_id = get_auth_academy_id())))
) with check (
  (is_super_admin() OR ((academy_id IS NOT NULL) AND (academy_id = get_auth_academy_id())))
);
