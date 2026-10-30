-- ==============================================================================
-- Migration File: 21_notifications.sql
-- مطابقة 100% لواقع جدول الإشعارات في قاعدة البيانات
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    academy_id uuid,
    user_id uuid,
    title jsonb NOT NULL,
    message jsonb,
    is_read boolean DEFAULT false,
    notification_type text,
    created_at timestamp with time zone DEFAULT now(),
    action_url text,
    entity_type character varying(50),
    entity_id uuid,
    read_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_archived boolean NOT NULL DEFAULT false,
    priority character varying(20) DEFAULT 'normal'::character varying,
    CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- الفهارس والأمان
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_academy_id ON public.notifications USING btree (academy_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications USING btree (is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Realtime
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END $$;
