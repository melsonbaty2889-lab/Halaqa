-- ============================================================================
-- Migration File: 17_files.sql
-- Description: Complete schema, constraints, indexes, and RLS policies for public.files
-- Module: Storage & Media Management
-- ============================================================================
​-- 1. Table Creation
​CREATE TABLE IF NOT EXISTS public.files (
id uuid NOT NULL DEFAULT gen_random_uuid(),
academy_id uuid NOT NULL,
file_url text NOT NULL,
file_name text NOT NULL,
file_size bigint NOT NULL DEFAULT 0,
created_by uuid NULL,
created_at timestamp with time zone NOT NULL DEFAULT now(),
mime_type text NOT NULL DEFAULT 'application/octet-stream'::text,
bucket_name text NOT NULL DEFAULT 'general'::text,
​-- Primary Key Constraint
CONSTRAINT files_pkey PRIMARY KEY (id),
​-- Foreign Key Constraints (Tenant Isolation & User Lifecycle)
CONSTRAINT files_academy_id_fkey FOREIGN KEY (academy_id)
REFERENCES public.academies (id) ON DELETE CASCADE,
CONSTRAINT files_created_by_fkey FOREIGN KEY (created_by)
REFERENCES public.profiles (id) ON DELETE SET NULL,
​-- Data Integrity Constraints
CONSTRAINT files_file_name_not_empty CHECK (length(trim(both FROM file_name)) > 0),
CONSTRAINT files_file_size_check CHECK (file_size IS NULL OR file_size >= 0),
CONSTRAINT files_file_url_not_empty CHECK (length(trim(both FROM file_url)) > 0)
) TABLESPACE pg_default;
​-- 2. Performance & Query Optimization Indexes
​CREATE INDEX IF NOT EXISTS idx_files_created_by
ON public.files USING btree (created_by) TABLESPACE pg_default;
​CREATE INDEX IF NOT EXISTS idx_files_academy_id
ON public.files USING btree (academy_id) TABLESPACE pg_default;
​CREATE INDEX IF NOT EXISTS idx_files_mime_type
ON public.files USING btree (academy_id, mime_type) TABLESPACE pg_default;
​CREATE INDEX IF NOT EXISTS idx_files_file_name
ON public.files USING btree (file_name) TABLESPACE pg_default;
​-- 3. Row Level Security (RLS) Configuration
​ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
​-- Clean existing policies if re-applying
DROP POLICY IF EXISTS files_select_policy ON public.files;
DROP POLICY IF EXISTS files_insert_policy ON public.files;
DROP POLICY IF EXISTS files_update_policy ON public.files;
DROP POLICY IF EXISTS files_delete_policy ON public.files;
​-- Policy: Select (View) Access
CREATE POLICY files_select_policy ON public.files
FOR SELECT
USING (
EXISTS (
SELECT 1 FROM public.profiles
WHERE id = auth.uid() AND role = 'super_admin'
)
OR academy_id = (
SELECT academy_id FROM public.profiles
WHERE id = auth.uid()
)
);
​-- Policy: Insert (Upload) Access
CREATE POLICY files_insert_policy ON public.files
FOR INSERT
WITH CHECK (
EXISTS (
SELECT 1 FROM public.profiles
WHERE id = auth.uid() AND role = 'super_admin'
)
OR (
academy_id = (
SELECT academy_id FROM public.profiles
WHERE id = auth.uid()
)
AND (created_by = auth.uid() OR created_by IS NULL)
)
);
​-- Policy: Update Access
CREATE POLICY files_update_policy ON public.files
FOR UPDATE
USING (
EXISTS (
SELECT 1 FROM public.profiles
WHERE id = auth.uid() AND role = 'super_admin'
)
OR (
academy_id = (
SELECT academy_id FROM public.profiles
WHERE id = auth.uid()
)
AND (
(SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager')
OR created_by = auth.uid()
)
)
);
​-- Policy: Delete Access
CREATE POLICY files_delete_policy ON public.files
FOR DELETE
USING (
EXISTS (
SELECT 1 FROM public.profiles
WHERE id = auth.uid() AND role = 'super_admin'
)
OR (
academy_id = (
SELECT academy_id FROM public.profiles
WHERE id = auth.uid()
)
AND (
(SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'manager')
OR created_by = auth.uid()
)
)
);
