-- ==============================================================================
-- Migration File: 19_notification_logs.sql
-- مطابقة 100% لواقع جدول سجلات الإشعارات والأرشيف في قاعدة البيانات
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notification_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL,
    recipient_user_id uuid,
    channel_used character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'sent'::character varying,
    sent_text text NOT NULL,
    error_message text,
    created_at timestamp with time zone DEFAULT now(),
    template_id uuid,
    provider_message_id text,
    provider character varying(50),
    delivered_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    rendered_content text,
    template_data jsonb DEFAULT '{}'::jsonb,
    error_code character varying(50),
    retry_count integer NOT NULL DEFAULT 0,
    priority character varying(20) NOT NULL DEFAULT 'normal'::character varying,
    message_cost numeric DEFAULT 0.0000,
    read_at timestamp with time zone,
    locale_code character varying(10) DEFAULT 'ar'::character varying,
    idempotency_key text,
    student_id uuid,
    CONSTRAINT notification_logs_pkey PRIMARY KEY (id)
);

-- الفهارس الـ 7
CREATE INDEX IF NOT EXISTS idx_notification_logs_academy_id ON public.notification_logs USING btree (academy_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient_user_id ON public.notification_logs USING btree (recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_template_id ON public.notification_logs USING btree (template_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs USING btree (status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_idempotency_key ON public.notification_logs USING btree (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_notification_logs_student_id ON public.notification_logs USING btree (student_id);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view logs" ON public.notification_logs;
CREATE POLICY "Admins can view logs" ON public.notification_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "System can insert logs" ON public.notification_logs;
CREATE POLICY "System can insert logs" ON public.notification_logs FOR INSERT TO authenticated WITH CHECK (true);

-- جدول الأرشيف والدالة
CREATE TABLE IF NOT EXISTS public.notification_logs_archive (
    LIKE public.notification_logs INCLUDING ALL
);

ALTER TABLE public.notification_logs_archive ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.archive_old_notification_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.notification_logs_archive
    SELECT * FROM public.notification_logs
    WHERE created_at < (NOW() - INTERVAL '1 year');

    DELETE FROM public.notification_logs
    WHERE created_at < (NOW() - INTERVAL '1 year');
END;
$$;
