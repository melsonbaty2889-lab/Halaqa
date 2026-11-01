-- =========================================================================
-- MIGRATION 02: Create Payments Table & Associated Logic
-- Description: Establishes payments table, indices, foreign keys, triggers, and financial security functions.
-- =========================================================================
​-- 1. Table Creation
CREATE TABLE IF NOT EXISTS public.payments (
id uuid NOT NULL DEFAULT gen_random_uuid(),
academy_id uuid NOT NULL,
student_id uuid NOT NULL,
plan_id uuid NULL,
amount numeric(12, 2) NOT NULL DEFAULT 0.00,
currency text NOT NULL DEFAULT 'EGP'::text,
period_start date NULL,
period_end date NULL,
due_date date NOT NULL DEFAULT CURRENT_DATE,
paid_at timestamp with time zone NULL,
status text NOT NULL DEFAULT 'pending'::text,
payment_method text NULL,
gateway_ref text NULL,
notes text NULL,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
invoice_number character varying NULL,
metadata jsonb NULL DEFAULT '{}'::jsonb,
created_by uuid NULL,
month text NULL,
receipt_url text NULL,
exchange_rate numeric(12, 6) NOT NULL DEFAULT 1.000000,
​CONSTRAINT payments_pkey PRIMARY KEY (id),
CONSTRAINT payments_academy_fkey FOREIGN KEY (academy_id) REFERENCES public.academies (id) ON DELETE CASCADE,
CONSTRAINT payments_plan_fkey FOREIGN KEY (plan_id) REFERENCES public.payment_plans (id) ON DELETE SET NULL,
CONSTRAINT check_payments_amount_positive CHECK (amount >= 0),
CONSTRAINT check_payments_exchange_rate_positive CHECK (exchange_rate > 0)
) TABLESPACE pg_default;
​-- 2. Indices
CREATE INDEX IF NOT EXISTS idx_payments_academy_status
ON public.payments USING btree (academy_id, status);
​CREATE INDEX IF NOT EXISTS idx_payments_student_id
ON public.payments USING btree (student_id);
​-- 3. Financial Immutability Function & Trigger Setup
CREATE OR REPLACE FUNCTION public.prevent_completed_payment_alteration()
RETURNS TRIGGER AS $$ BEGIN IF OLD.status = 'paid' AND (NEW.status != 'paid' OR NEW.amount != OLD.amount) THEN IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Cannot modify a completed/paid financial transaction to preserve accounting integrity.'; END IF; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
​-- 4. Triggers
DROP TRIGGER IF EXISTS set_updated_at ON public.payments;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
​DROP TRIGGER IF EXISTS audit_payments_trigger ON public.payments;
CREATE TRIGGER audit_payments_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.log_table_activity();
​DROP TRIGGER IF EXISTS trg_prevent_completed_payment_alteration ON public.payments;
CREATE TRIGGER trg_prevent_completed_payment_alteration
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.prevent_completed_payment_alteration();
​DROP TRIGGER IF EXISTS trg_sync_student_billing ON public.payments;
CREATE TRIGGER trg_sync_student_billing
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.sync_student_billing_status();
