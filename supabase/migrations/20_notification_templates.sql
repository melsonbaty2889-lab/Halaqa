-- ==============================================================================
-- Migration File: 20_notification_templates.sql
-- مطابقة 100% لواقع جدول قوالب الإشعارات في قاعدة البيانات
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notification_templates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    academy_id uuid NOT NULL,
    trigger_event character varying(100) NOT NULL,
    locale_code character varying(10) DEFAULT 'ar'::character varying,
    title character varying(255),
    template_body text NOT NULL,
    channels ARRAY DEFAULT ARRAY['whatsapp'::text],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    template_name character varying(255),
    description text,
    available_variables jsonb DEFAULT '[]'::jsonb,
    CONSTRAINT notification_templates_pkey PRIMARY KEY (id)
);

-- الفهارس والأمان
CREATE INDEX IF NOT EXISTS idx_notification_templates_academy_id ON public.notification_templates USING btree (academy_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_trigger_event ON public.notification_templates USING btree (trigger_event);
CREATE INDEX IF NOT EXISTS idx_notification_templates_is_active ON public.notification_templates USING btree (is_active);

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view templates" ON public.notification_templates;
CREATE POLICY "Authenticated users can view templates" ON public.notification_templates FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage templates" ON public.notification_templates;
CREATE POLICY "Admins can manage templates" ON public.notification_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
