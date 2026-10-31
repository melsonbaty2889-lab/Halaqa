-- ==============================================================================
-- Migration File: Create Notification Logs Table with Constraints, Indexes & RLS
-- File Name: 20261031000001_create_notification_logs.sql
-- ==============================================================================

-- 1. إنشاء الهيكل الأساسي للجدول والحقول
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academy_id UUID NOT NULL,
    recipient_user_id UUID NOT NULL,
    student_id UUID,
    template_id UUID,
    channel VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    locale_code VARCHAR(10) NOT NULL DEFAULT 'ar',
    metadata JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. إنشاء الفهارس (Indexes) لتسريع الأداء والاستعلامات
CREATE INDEX IF NOT EXISTS idx_notification_logs_academy_id 
    ON public.notification_logs(academy_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient 
    ON public.notification_logs(recipient_user_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_status 
    ON public.notification_logs(status);

CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at 
    ON public.notification_logs(created_at DESC);

-- 3. تفعيل أمان مستوى الصفوف (Row Level Security - RLS)
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- 4. إضافة سياسات الأمان والعزل (RLS Policies)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notification_logs' 
          AND policyname = 'Authenticated users can access notification logs'
    ) THEN
        CREATE POLICY "Authenticated users can access notification logs"
            ON public.notification_logs
            FOR ALL
            TO authenticated
            USING (auth.role() = 'authenticated');
    END IF;
END $$;
