-- =========================================================================
-- MIGRATION 01: Create Payment Plans Table & Associated Logic
-- Description: Establishes payment_plans table, indices, check constraints, and triggers.
-- =========================================================================
-- 1. Table Creation
CREATE TABLE IF NOT EXISTS public.payment_plans (
id uuid NOT NULL DEFAULT gen_random_uuid(),
academy_id uuid NOT NULL,
name jsonb NOT NULL,
price numeric(12, 2) NOT NULL DEFAULT 0,
currency text NOT NULL DEFAULT 'EGP'::text,
duration_days integer NOT NULL DEFAULT 30,
is_active boolean NOT NULL DEFAULT true,
created_at timestamp with time zone NULL DEFAULT now(),
updated_at timestamp with time zone NULL DEFAULT now(),
is_archived boolean NOT NULL DEFAULT false,
color character varying(20) NULL DEFAULT '#3B82F6'::character varying,
metadata jsonb NULL DEFAULT '{}'::jsonb,
CONSTRAINT payment_plans_pkey PRIMARY KEY (id),
CONSTRAINT payment_plans_academy_fkey FOREIGN KEY (academy_id) REFERENCES public.academies (id) ON DELETE CASCADE,
CONSTRAINT payment_plans_duration_days_check CHECK (duration_days > 0),
CONSTRAINT payment_plans_price_check CHECK (price >= 0)
) TABLESPACE pg_default;
-- 2. Indices
CREATE INDEX IF NOT EXISTS idx_payment_plans_is_archived
ON public.payment_plans USING btree (is_archived);
CREATE INDEX IF NOT EXISTS idx_payment_plans_active_lookup
ON public.payment_plans USING btree (academy_id, is_active, is_archived);
-- 3. Triggers
DROP TRIGGER IF EXISTS set_updated_at ON public.payment_plans;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.payment_plans
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS audit_payment_plans_trigger ON public.payment_plans;
CREATE TRIGGER audit_payment_plans_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.payment_plans
FOR EACH ROW
EXECUTE FUNCTION public.log_table_activity();
