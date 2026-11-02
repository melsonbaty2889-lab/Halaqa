create table public.saas_referrals (
  id uuid not null default gen_random_uuid (),
  referrer_academy_id uuid not null,
  referral_code_used character varying(50) not null,
  referred_email character varying(255) null,
  referred_academy_id uuid null,
  status character varying(50) null default 'pending'::character varying,
  reward_details text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  reward_amount numeric(10, 2) null,
  reward_type character varying(30) null default 'credit'::character varying,
  rewarded_at timestamp with time zone null,
  metadata jsonb null default '{}'::jsonb,
  reward_duration_months integer null default 1,
  constraint saas_referrals_pkey primary key (id),
  constraint saas_referrals_referred_academy_id_key unique (referred_academy_id),
  constraint saas_referrals_referrer_academy_id_fkey foreign KEY (referrer_academy_id) references academies (id) on delete CASCADE,
  constraint saas_referrals_referred_academy_id_fkey foreign KEY (referred_academy_id) references academies (id) on delete set null,
  constraint check_no_self_referral check ((referrer_academy_id <> referred_academy_id)),
  constraint saas_referrals_status_check check (
    (
      (status)::text = any (
        (
          array[
            'pending'::character varying,
            'registered'::character varying,
            'subscribed'::character varying,
            'rewarded'::character varying,
            'cancelled'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint check_reward_amount_valid check (
    (
      (
        (
          (reward_type)::text = any (
            (
              array[
                'credit'::character varying,
                'discount'::character varying
              ]
            )::text[]
          )
        )
        and (reward_amount is not null)
        and (reward_amount > (0)::numeric)
      )
      or ((reward_type)::text = 'free_month'::text)
    )
  ),
  constraint check_rewarded_at_status check (
    (
      (
        ((status)::text = 'rewarded'::text)
        and (rewarded_at is not null)
      )
      or ((status)::text <> 'rewarded'::text)
    )
  ),
  constraint saas_referrals_reward_type_check check (
    (
      (reward_type)::text = any (
        array[
          ('credit'::character varying)::text,
          ('free_month'::character varying)::text,
          ('discount'::character varying)::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_saas_referrals_code on public.saas_referrals using btree (referral_code_used) TABLESPACE pg_default;

create index IF not exists idx_saas_referrals_email on public.saas_referrals using btree (referred_email) TABLESPACE pg_default;

create index IF not exists idx_saas_referrals_status on public.saas_referrals using btree (status) TABLESPACE pg_default;

create index IF not exists idx_saas_referrals_referrer_academy_id on public.saas_referrals using btree (referrer_academy_id) TABLESPACE pg_default;

create index IF not exists idx_saas_referrals_active_pending on public.saas_referrals using btree (referrer_academy_id, status) TABLESPACE pg_default
where
  (
    (status)::text <> all (
      (
        array[
          'rewarded'::character varying,
          'cancelled'::character varying
        ]
      )::text[]
    )
  );

create trigger audit_saas_referrals_trigger
after INSERT
or DELETE
or
update on saas_referrals for EACH row
execute FUNCTION log_table_activity ();

create trigger set_saas_referrals_updated_at BEFORE
update on saas_referrals for EACH row
execute FUNCTION handle_updated_at ();
