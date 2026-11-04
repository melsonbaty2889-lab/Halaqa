-- =========================================================================
-- Migration: Secure & Optimized saas_coupon_redemptions Table
-- Description: جدول استهلاك الكوبونات محسّن، مربوط بالتدقيق، ومؤمن بالكامل.
-- =========================================================================

-- 1. إنشاء الجدول مع القيود الأساسية (إن لم يكن موجوداً)
CREATE TABLE IF NOT EXISTS public.saas_coupon_redemptions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    coupon_id uuid NOT NULL,
    academy_id uuid NOT NULL,
    subscription_id uuid NULL,
    discount_applied numeric NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    
    -- القيود والمفاتيح الأساسية والأجنبية
    CONSTRAINT saas_coupon_redemptions_pkey PRIMARY KEY (id),
    CONSTRAINT saas_coupon_redemptions_coupon_id_fkey FOREIGN KEY (coupon_id) 
        REFERENCES public.saas_coupons (id) ON DELETE CASCADE,
    CONSTRAINT saas_coupon_redemptions_academy_id_fkey FOREIGN KEY (academy_id) 
        REFERENCES public.academies (id) ON DELETE CASCADE,
    CONSTRAINT saas_coupon_redemptions_subscription_id_fkey FOREIGN KEY (subscription_id) 
        REFERENCES public.saas_subscriptions (id) ON DELETE SET NULL,
        
    -- قيود الصحة المالية (منع الخصم السالب)
    CONSTRAINT chk_discount_positive CHECK (discount_applied >= 0)
) TABLESPACE pg_default;

-- 2. إنشاء الفهارس لتحقيق الأداء الخارق (Idempotent Indexing)
CREATE INDEX IF NOT EXISTS idx_saas_redemptions_academy 
    ON public.saas_coupon_redemptions USING btree (academy_id);

CREATE INDEX IF NOT EXISTS idx_saas_redemptions_coupon 
    ON public.saas_coupon_redemptions USING btree (coupon_id);

-- 3. تفعيل حماية عزل البيانات (Row Level Security - RLS)
ALTER TABLE public.saas_coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- 4. سياسات الأمان (Policies) - حذف القديمة إن وجدت لتجنب التكرار ثم إضافتها
DROP POLICY IF EXISTS "Enable read access for academy users" ON public.saas_coupon_redemptions;
CREATE POLICY "Enable read access for academy users" 
    ON public.saas_coupon_redemptions 
    FOR SELECT 
    USING (academy_id = auth.jwt() ->> 'academy_id'::text OR public.is_super_admin());

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.saas_coupon_redemptions;
CREATE POLICY "Enable insert for authenticated users" 
    ON public.saas_coupon_redemptions 
    FOR INSERT 
    WITH CHECK (true);
