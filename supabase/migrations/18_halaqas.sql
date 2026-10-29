-- ==============================================================================
-- 1. إنشاء جدول الحلقات (public.halaqas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.halaqas (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL,
  teacher_id UUID NULL,
  description JSONB NULL,
  days_of_week TEXT[] NULL,
  start_time TIME WITHOUT TIME ZONE NOT NULL,
  end_time TIME WITHOUT TIME ZONE NOT NULL,
  max_students INTEGER NULL DEFAULT 10,
  meeting_url TEXT NULL,
  status TEXT NULL DEFAULT 'active'::TEXT,
  target_audience TEXT NULL DEFAULT 'all'::TEXT,
  teaching_type TEXT NULL DEFAULT 'online'::TEXT,
  educational_track TEXT NULL DEFAULT 'hifz'::TEXT,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  code CHARACTER VARYING(30) NULL,
  language_code CHARACTER VARYING(10) NULL DEFAULT 'ar'::CHARACTER VARYING,
  curriculum_id UUID NULL,
  min_students INTEGER NULL DEFAULT 1,
  meeting_platform CHARACTER VARYING(30) NULL,
  name JSONB NOT NULL DEFAULT '{}'::JSONB,

  -- القيود الأساسية (Primary & Foreign Keys)
  CONSTRAINT halaqas_pkey PRIMARY KEY (id),
  CONSTRAINT halaqas_academy_code_unique UNIQUE (academy_id, code),
  CONSTRAINT halaqas_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers (id) ON DELETE SET NULL,
  CONSTRAINT halaqas_academy_fkey FOREIGN KEY (academy_id) REFERENCES public.academies (id) ON DELETE CASCADE,
  CONSTRAINT halaqas_curriculum_fkey FOREIGN KEY (curriculum_id) REFERENCES public.curricula (id) ON DELETE SET NULL,

  -- القيود وشروط الصحة (Check Constraints)
  CONSTRAINT halaqas_status_check CHECK (status = ANY (ARRAY['active'::TEXT, 'paused'::TEXT])),
  CONSTRAINT halaqas_target_audience_check CHECK (target_audience = ANY (ARRAY['all'::TEXT, 'kids'::TEXT, 'males'::TEXT, 'females'::TEXT])),
  CONSTRAINT halaqas_teaching_type_check CHECK (teaching_type = ANY (ARRAY['online'::TEXT, 'offline'::TEXT])),
  CONSTRAINT halaqas_time_check CHECK (start_time < end_time),
  CONSTRAINT halaqas_max_students_check CHECK (max_students > 0),
  CONSTRAINT halaqas_min_max_students_check CHECK ((min_students <= max_students) AND (min_students > 0))
);

-- ==============================================================================
-- 2. إنشاء الفهارس لتسريع الاستعلامات (Performance Indexes)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_halaqas_academy_id ON public.halaqas USING btree (academy_id);
CREATE INDEX IF NOT EXISTS idx_halaqas_teacher_id ON public.halaqas USING btree (teacher_id);
CREATE INDEX IF NOT EXISTS idx_halaqas_is_archived ON public.halaqas USING btree (is_archived);
CREATE INDEX IF NOT EXISTS idx_halaqas_curriculum ON public.halaqas USING btree (curriculum_id);
CREATE INDEX IF NOT EXISTS idx_halaqas_active_lookup ON public.halaqas USING btree (academy_id, status, is_archived);

-- ==============================================================================
-- 3. تفعيل الأتمتة والتريجرات (Triggers & Automation)
-- ==============================================================================
-- 3.1 تريجر تحديث التوقيت تلقائياً
DROP TRIGGER IF EXISTS set_updated_at ON public.halaqas;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.halaqas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3.2 تريجر تسجيل الأحداث والتدقيق
DROP TRIGGER IF EXISTS trg_audit_halaqas ON public.halaqas;
CREATE TRIGGER trg_audit_halaqas
  AFTER INSERT OR UPDATE OR DELETE ON public.halaqas
  FOR EACH ROW
  EXECUTE FUNCTION public.process_audit_log();

-- ==============================================================================
-- 4. أمان البيانات وتفعيل Row Level Security (RLS)
-- ==============================================================================
ALTER TABLE public.halaqas ENABLE ROW LEVEL SECURITY;

-- تنظيف أي سياسات سابقة لتجنب التكرار
DROP POLICY IF EXISTS halaqas_admin_select_policy ON public.halaqas;
DROP POLICY IF EXISTS halaqas_admin_insert_policy ON public.halaqas;
DROP POLICY IF EXISTS halaqas_admin_update_policy ON public.halaqas;
DROP POLICY IF EXISTS halaqas_admin_delete_policy ON public.halaqas;
DROP POLICY IF EXISTS halaqas_teacher_select_policy ON public.halaqas;
DROP POLICY IF EXISTS halaqas_teacher_update_policy ON public.halaqas;
DROP POLICY IF EXISTS halaqas_student_select_policy ON public.halaqas;
DROP POLICY IF EXISTS halaqas_parent_select_policy ON public.halaqas;

-- 4.1 سياسات المدير / الأدمن (Admin / Manager)
CREATE POLICY halaqas_admin_select_policy ON public.halaqas
FOR SELECT TO authenticated
USING (
    is_super_admin() OR (
        academy_id = get_auth_academy_id() 
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    )
);

CREATE POLICY halaqas_admin_insert_policy ON public.halaqas
FOR INSERT TO authenticated
WITH CHECK (
    is_super_admin() OR (
        academy_id = get_auth_academy_id() 
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    )
);

CREATE POLICY halaqas_admin_update_policy ON public.halaqas
FOR UPDATE TO authenticated
USING (
    is_super_admin() OR (
        academy_id = get_auth_academy_id() 
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    )
)
WITH CHECK (
    is_super_admin() OR (
        academy_id = get_auth_academy_id() 
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    )
);

CREATE POLICY halaqas_admin_delete_policy ON public.halaqas
FOR DELETE TO authenticated
USING (
    is_super_admin() OR (
        academy_id = get_auth_academy_id() 
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    )
);

-- 4.2 سياسات المعلم (Teacher)
CREATE POLICY halaqas_teacher_select_policy ON public.halaqas
FOR SELECT TO authenticated
USING (
    academy_id = get_auth_academy_id() 
    AND EXISTS (
        SELECT 1 FROM public.teachers t
        WHERE t.id = halaqas.teacher_id
          AND (t.user_id = auth.uid() OR t.id = auth.uid())
    )
);

CREATE POLICY halaqas_teacher_update_policy ON public.halaqas
FOR UPDATE TO authenticated
USING (
    academy_id = get_auth_academy_id() 
    AND EXISTS (
        SELECT 1 FROM public.teachers t
        WHERE t.id = halaqas.teacher_id
          AND (t.user_id = auth.uid() OR t.id = auth.uid())
    )
)
WITH CHECK (
    academy_id = get_auth_academy_id() 
    AND EXISTS (
        SELECT 1 FROM public.teachers t
        WHERE t.id = halaqas.teacher_id
          AND (t.user_id = auth.uid() OR t.id = auth.uid())
    )
);

-- 4.3 سياسة الطالب (Student)
CREATE POLICY halaqas_student_select_policy ON public.halaqas
FOR SELECT TO authenticated
USING (
    academy_id = get_auth_academy_id() 
    AND EXISTS (
        SELECT 1 FROM public.student_halaqas sh
        WHERE sh.halaqa_id = halaqas.id
          AND sh.student_id = auth.uid()
          AND sh.status = 'active'
    )
);

-- 4.4 سياسة ولي الأمر (Parent)
CREATE POLICY halaqas_parent_select_policy ON public.halaqas
FOR SELECT TO authenticated
USING (
    academy_id = get_auth_academy_id() 
    AND EXISTS (
        SELECT 1 FROM public.student_halaqas sh
        WHERE sh.halaqa_id = halaqas.id
          AND sh.status = 'active'
          AND public.is_student_parent(sh.student_id, auth.uid()) = true
    )
);
