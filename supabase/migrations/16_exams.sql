-- ==========================================
-- ملف الـ Migration الشامل لجدول الامتحانات (Exams Schema Migration)
-- ==========================================

-- 1. إنشاء جدول الامتحانات الأساسي
CREATE TABLE IF NOT EXISTS public.exams (
  id uuid not null default gen_random_uuid (),
  academy_id uuid not null,
  student_id uuid not null,
  teacher_id uuid null,
  halaqa_id uuid null,
  exam_type text not null default 'monthly'::text,
  from_surah_id integer null,
  to_surah_id integer null,
  from_ayah integer null,
  to_ayah integer null,
  date date not null default CURRENT_DATE,
  mistakes integer null default 0,
  prompts integer null default 0,
  tajweed_grade text null,
  final_score numeric null default 0.00,
  max_score numeric null default 100.00,
  notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  curriculum_item_id uuid null,
  constraint exams_pkey primary key (id),
  constraint exams_curriculum_item_id_fkey foreign KEY (curriculum_item_id) references curriculum_items (id) on delete set null,
  constraint exams_from_surah_id_fkey foreign KEY (from_surah_id) references surahs (number) on delete RESTRICT,
  constraint exams_halaqa_fkey foreign KEY (halaqa_id) references halaqas (id) on delete set null,
  constraint exams_academy_fkey foreign KEY (academy_id) references academies (id) on delete CASCADE,
  constraint exams_teacher_fkey foreign KEY (teacher_id) references teachers (id) on delete set null,
  constraint exams_to_surah_id_fkey foreign KEY (to_surah_id) references surahs (number) on delete RESTRICT,
  constraint exams_student_id_fkey foreign KEY (student_id) references students (id) on delete CASCADE,
  constraint exams_final_score_check check (
    (
      (final_score >= (0)::numeric)
      and (final_score <= max_score)
    )
  ),
  constraint exams_type_check check (
    (
      exam_type = any (
        array[
          'weekly'::text,
          'monthly'::text,
          'quarterly'::text,
          'final'::text
        ]
      )
    )
  )
);

-- 2. إنشاء الفهارس لضمان الأداء الفائق
create index IF not exists idx_exams_student on public.exams using btree (academy_id, student_id);
create index IF not exists idx_exams_from_surah_id on public.exams using btree (from_surah_id);
create index IF not exists idx_exams_to_surah_id on public.exams using btree (to_surah_id);
create index IF not exists idx_exams_academy_id on public.exams using btree (academy_id);
create index IF not exists idx_exams_student_id on public.exams using btree (student_id);
create index IF not exists idx_exams_teacher_id on public.exams using btree (teacher_id);
create index IF not exists idx_exams_halaqa_id on public.exams using btree (halaqa_id);
create index IF not exists idx_exams_curriculum_item_id on public.exams using btree (curriculum_item_id);
create index IF not exists idx_exams_academy_date_desc on public.exams using btree (academy_id, date desc);

-- 3. تفعيل الـ Trigger للتحديث التلقائي لوقت التعديل
create trigger set_updated_at BEFORE
update on exams for EACH row
execute FUNCTION handle_updated_at ();

-- 4. دالة الإدخال والتعديل الآمنة (Atomic Upsert)
CREATE OR REPLACE FUNCTION public.upsert_exam_safely(
    p_exam_id UUID,
    p_academy_id UUID,
    p_student_id UUID,
    p_teacher_id UUID,
    p_halaqa_id UUID,
    p_exam_type TEXT,
    p_from_surah_id INT,
    p_to_surah_id INT,
    p_from_ayah INT,
    p_to_ayah INT,
    p_exam_date DATE,
    p_mistakes INT,
    p_prompts INT,
    p_tajweed_grade TEXT,
    p_final_score NUMERIC,
    p_max_score NUMERIC,
    p_notes TEXT,
    p_curriculum_item_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exam_id UUID;
BEGIN
    IF NOT is_super_admin() AND p_academy_id <> get_auth_academy_id() THEN
        RAISE EXCEPTION 'Access denied: Academy ID mismatch.';
    END IF;

    INSERT INTO public.exams (
        id, academy_id, student_id, teacher_id, halaqa_id, exam_type,
        from_surah_id, to_surah_id, from_ayah, to_ayah, date,
        mistakes, prompts, tajweed_grade, final_score, max_score,
        notes, curriculum_item_id, updated_at
    )
    VALUES (
        COALESCE(p_exam_id, gen_random_uuid()),
        p_academy_id, p_student_id, p_teacher_id, p_halaqa_id, p_exam_type,
        p_from_surah_id, p_to_surah_id, p_from_ayah, p_to_ayah, p_exam_date,
        COALESCE(p_mistakes, 0), COALESCE(p_prompts, 0), p_tajweed_grade, 
        COALESCE(p_final_score, 0.00), COALESCE(p_max_score, 100.00),
        p_notes, p_curriculum_item_id, NOW()
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        student_id = EXCLUDED.student_id,
        teacher_id = EXCLUDED.teacher_id,
        halaqa_id = EXCLUDED.halaqa_id,
        exam_type = EXCLUDED.exam_type,
        from_surah_id = EXCLUDED.from_surah_id,
        to_surah_id = EXCLUDED.to_surah_id,
        from_ayah = EXCLUDED.from_ayah,
        to_ayah = EXCLUDED.to_ayah,
        date = EXCLUDED.date,
        mistakes = EXCLUDED.mistakes,
        prompts = EXCLUDED.prompts,
        tajweed_grade = EXCLUDED.tajweed_grade,
        final_score = EXCLUDED.final_score,
        max_score = EXCLUDED.max_score,
        notes = EXCLUDED.notes,
        curriculum_item_id = EXCLUDED.curriculum_item_id,
        updated_at = NOW()
    RETURNING id INTO v_exam_id;

    RETURN v_exam_id;
END;
$$;

-- 5. إنشاء جدول العرض (Updatable View) لتفاصيل الامتحانات والسور
DROP VIEW IF EXISTS public.v_exam_details;
CREATE VIEW public.v_exam_details AS
SELECT 
    e.id AS exam_id,
    e.academy_id,
    e.student_id,
    e.teacher_id,
    e.halaqa_id,
    e.exam_type,
    e.from_surah_id,
    fs.name_ar AS from_surah_name_ar,
    fs.name_en AS from_surah_name_en,
    e.to_surah_id,
    ts.name_ar AS to_surah_name_ar,
    ts.name_en AS to_surah_name_en,
    e.from_ayah,
    e.to_ayah,
    e.date AS exam_date,
    e.mistakes,
    e.prompts,
    e.tajweed_grade,
    e.final_score,
    e.max_score,
    e.notes,
    e.created_at,
    e.updated_at
FROM public.exams e
LEFT JOIN public.surahs fs ON e.from_surah_id = fs.number
LEFT JOIN public.surahs ts ON e.to_surah_id = ts.number;

ALTER VIEW public.v_exam_details SET (security_invoker = true);

-- 6. تفعيل مراقبة الأداء (pg_stat_statements Function)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

CREATE OR REPLACE FUNCTION public.get_exams_performance_stats()
RETURNS TABLE (
    query_text TEXT,
    calls BIGINT,
    total_exec_time DOUBLE PRECISION,
    mean_exec_time DOUBLE PRECISION
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        query AS query_text,
        calls,
        total_exec_time,
        mean_exec_time
    FROM pg_stat_statements
    WHERE query ILIKE '%exams%'
    ORDER BY total_exec_time DESC
    LIMIT 10;
$$;

-- 7. دالة اختبار سلامة الجدول والشيم (Automated Testing)
CREATE OR REPLACE FUNCTION public.test_exams_schema_integrity()
RETURNS TABLE (
    test_name TEXT,
    status TEXT,
    details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_constraints_count INT;
    v_indexes_count INT;
BEGIN
    SELECT COUNT(*) INTO v_constraints_count
    FROM information_schema.table_constraints
    WHERE table_schema = 'public' 
      AND table_name = 'exams' 
      AND constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'CHECK');

    IF v_constraints_count >= 7 THEN
        RETURN QUERY SELECT 'Constraints Check'::TEXT, 'PASS'::TEXT, ('Found ' || v_constraints_count || ' valid constraints.')::TEXT;
    ELSE
        RETURN QUERY SELECT 'Constraints Check'::TEXT, 'FAIL'::TEXT, ('Expected at least 7 constraints, found ' || v_constraints_count)::TEXT;
    END IF;

    SELECT COUNT(*) INTO v_indexes_count
    FROM pg_indexes
    WHERE schemaname = 'public' 
      AND tablename = 'exams';

    IF v_indexes_count >= 8 THEN
        RETURN QUERY SELECT 'Indexes Check'::TEXT, 'PASS'::TEXT, ('Found ' || v_indexes_count || ' performance indexes.')::TEXT;
    ELSE
        RETURN QUERY SELECT 'Indexes Check'::TEXT, 'FAIL'::TEXT, ('Expected at least 8 indexes, found ' || v_indexes_count)::TEXT;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename = 'exams' 
          AND rowsecurity = true
    ) THEN
        RETURN QUERY SELECT 'RLS Status Check'::TEXT, 'PASS'::TEXT, 'Row Level Security is properly enabled on exams.'::TEXT;
    ELSE
        RETURN QUERY SELECT 'RLS Status Check'::TEXT, 'FAIL'::TEXT, 'Row Level Security is NOT enabled.'::TEXT;
    END IF;
END;
$$;

-- 8. التكامل غير المتزامن وأحداث Realtime (Async Events)
ALTER TABLE public.exams REPLICA IDENTITY FULL;

CREATE OR REPLACE FUNCTION public.notify_exam_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM pg_notify(
        'exam_events',
        json_build_object(
            'action', TG_OP,
            'exam_id', COALESCE(NEW.id, OLD.id),
            'academy_id', COALESCE(NEW.academy_id, OLD.academy_id),
            'student_id', COALESCE(NEW.student_id, OLD.student_id),
            'timestamp', NOW()
        )::text
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_exams_realtime_event ON public.exams;
CREATE TRIGGER tr_exams_realtime_event
    AFTER INSERT OR UPDATE ON public.exams
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_exam_event();
