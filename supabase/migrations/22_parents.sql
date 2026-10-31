-- =========================================================================
-- MIGRATION: Complete Enterprise `parents` Table & Policies
-- =========================================================================

-- 1. Create Table
CREATE TABLE IF NOT EXISTS public.parents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  profile_id uuid NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
  email text null,
  country_code character(2) null,
  preferred_language character varying(10) NULL DEFAULT 'ar'::character varying,
  metadata jsonb NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NULL,
  CONSTRAINT parents_pkey PRIMARY KEY (id),
  CONSTRAINT parents_academy_phone_unique UNIQUE (academy_id, phone),
  CONSTRAINT fk_parents_academy FOREIGN KEY (academy_id) REFERENCES academies (id) ON DELETE CASCADE,
  CONSTRAINT fk_parents_profile FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- 2. Performance & Unique Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_parents_unique_phone_per_academy 
ON public.parents USING btree (academy_id, phone) 
WHERE ((phone IS NOT NULL) AND (phone <> ''::text));

CREATE INDEX IF NOT EXISTS idx_parents_academy_id 
ON public.parents USING btree (academy_id);

CREATE INDEX IF NOT EXISTS idx_parents_profile_id 
ON public.parents USING btree (profile_id);

-- 3. Triggers (Updated At & Audit Logs)
DROP TRIGGER IF EXISTS set_updated_at ON public.parents;
CREATE TRIGGER set_updated_at 
BEFORE UPDATE ON public.parents 
FOR EACH ROW 
EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS audit_parents_trigger ON public.parents;
CREATE TRIGGER audit_parents_trigger 
AFTER INSERT OR DELETE OR UPDATE ON public.parents 
FOR EACH ROW 
EXECUTE FUNCTION log_table_activity();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Super Admin Policy
DROP POLICY IF EXISTS "parents_super_admin_policy" ON public.parents;
CREATE POLICY "parents_super_admin_policy"
ON public.parents FOR ALL
TO authenticated
USING (public.is_super_admin());

-- Academy Admin Policy
DROP POLICY IF EXISTS "parents_academy_admin_policy" ON public.parents;
CREATE POLICY "parents_academy_admin_policy"
ON public.parents FOR ALL
TO authenticated
USING (academy_id = public.get_auth_academy_id() AND public.has_role('academy_admin'));

-- Teacher Select Policy (With is_active check & halaqa relation)
DROP POLICY IF EXISTS "parents_teacher_select_policy" ON public.parents;
CREATE POLICY "parents_teacher_select_policy"
ON public.parents FOR SELECT
TO authenticated
USING (
    is_active = true 
    AND public.has_role('teacher')
    AND EXISTS (
        SELECT 1 
        FROM public.students s
        JOIN public.halaqas h ON s.halaqa_id = h.id
        WHERE s.parent_id = public.parents.id
          AND h.teacher_id = auth.uid()
          AND h.academy_id = public.get_auth_academy_id()
    )
);

-- Parent Self Policy
DROP POLICY IF EXISTS "parents_parent_self_policy" ON public.parents;
CREATE POLICY "parents_parent_self_policy"
ON public.parents FOR ALL
TO authenticated
USING (profile_id = auth.uid());
