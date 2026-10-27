-- ==============================================================================
-- 01_academies.sql - النسخة النهائية الشاملة لجدول الأكاديميات
-- ==============================================================================

Create table public.academies (
  id uuid not null default extensions.uuid_generate_v4 (),
  name jsonb not null,
  slug text not null,
  currency text null default 'EGP'::text,
  timezone text null default 'Africa/Cairo'::text,
  language_code text null default 'ar'::text,
  is_active boolean null default true,
  owner_id uuid null,
  logo_url text null,
  weekend_days text[] null default array['friday'::text, 'saturday'::text],
  calendar_type text null default 'gregorian'::text,
  custom_domain text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  my_referral_code character varying(50) null,
  contact_email text null,
  contact_phone text null,
  website text null,
  country_code character(2) null,
  brand_color text null default '#D97706'::text,
  learning_type character varying(20) null default 'online'::character varying,
  default_qiraat character varying(50) null default 'hafs_an_asem'::character varying,
  teaching_methodology character varying(50) null default 'mashreqi'::character varying,
  tagline text null,
  description text null,
  allow_self_registration boolean null default true,
  require_approval boolean null default true,
  max_students_per_group integer null default 25,
  blocked_reason text null,
  mistake_weight numeric null default 1.0,
  deleted_at timestamp with time zone null,
  constraint academies_pkey primary key (id),
  constraint academies_slug_key unique (slug),
  constraint academies_custom_domain_key unique (custom_domain),
  constraint academies_my_referral_code_key unique (my_referral_code),
  constraint academies_owner_id_fkey foreign KEY (owner_id) references profiles (id) on delete set null,
  constraint academies_language_code_check check (
    (
      language_code = any (
        array[
          'ar'::text,
          'en'::text,
          'fr'::text,
          'tr'::text,
          'ur'::text,
          'id'::text
        ]
      )
    )
  ),
  constraint academies_slug_lowercase_check check (
    (
      (slug = lower(slug))
      and (slug ~ '^[a-z0-9-]+$'::text)
    )
  ),
  constraint academies_brand_color_check check (
    (
      (brand_color is null)
      or (
        brand_color ~* '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$'::text
      )
    )
  ),
  constraint academies_weekend_days_check check (
    (
      weekend_days <@ array[
        'Saturday'::text,
        'Sunday'::text,
        'Monday'::text,
        'Tuesday'::text,
        'Wednesday'::text,
        'Thursday'::text,
        'Friday'::text,
        'saturday'::text,
        'sunday'::text,
        'monday'::text,
        'tuesday'::text,
        'wednesday'::text,
        'thursday'::text,
        'friday'::text
      ]
    )
  ),
  constraint academies_calendar_type_check check (
    (
      calendar_type = any (array['gregorian'::text, 'hijri'::text])
    )
  ),
  constraint academies_country_code_check check (
    (
      (country_code is null)
      or (
        (country_code)::text = upper((country_code)::text)
      )
    )
  ),
  constraint academies_currency_check check (
    (
      (currency = upper(currency))
      and (length(currency) = 3)
    )
  ),
  constraint academies_default_qiraat_check check (
    (
      (default_qiraat)::text = any (
        array[
          'hafs_an_asem'::text,
          'warsh_an_nafi'::text,
          'qaloon_an_nafi'::text,
          'al_duri_an_abu_amr'::text,
          'shuba_an_asem'::text,
          'al_bazzi_an_ibn_kathir'::text,
          'qunbul_an_ibn_kathir'::text,
          'al_susi_an_abu_amr'::text,
          'hisham_an_ibn_amir'::text,
          'ibn_dhakwan_an_ibn_amir'::text,
          'khalaf_an_hamzah'::text,
          'khallad_an_hamzah'::text,
          'al_layth_an_al_kisai'::text,
          'al_duri_an_al_kisai'::text,
          'isa_an_abu_jafar'::text,
          'sulayman_an_abu_jafar'::text,
          'ruwaysh_an_yaqub'::text,
          'rooh_an_yaqub'::text,
          'ishaq_an_khalaf'::text,
          'idrees_an_khalaf'::text,
          'other'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- الفهارس
create index IF not exists idx_academies_owner_id on public.academies using btree (owner_id) TABLESPACE pg_default;
create index IF not exists idx_academies_is_active on public.academies using btree (is_active) TABLESPACE pg_default;
create index IF not exists idx_academies_created_at on public.academies using btree (created_at desc) TABLESPACE pg_default;

-- التريجرز
create trigger ensure_valid_academy_slug BEFORE INSERT or update on academies for EACH row execute FUNCTION handle_academy_slug ();
create trigger set_updated_at BEFORE update on academies for EACH row execute FUNCTION handle_updated_at ();
create trigger tr_on_academy_created_add_subscription after INSERT on academies for EACH row execute FUNCTION handle_new_academy_subscription ();
create trigger tr_protect_academy_activation BEFORE update on academies for EACH row execute FUNCTION protect_academy_activation ();
create trigger trg_generate_referral_code BEFORE INSERT on academies for EACH row execute FUNCTION generate_academy_referral_code ();
create trigger trigger_seed_academy_badges after INSERT on academies for EACH row execute FUNCTION seed_academy_badges ();

-- تفعيل الـ RLS والسياسات الأمنية
alter table public.academies enable row level security;

create policy academies_insert_policy on public.academies for INSERT to authenticated with check (
  (owner_id = auth.uid()) OR (EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'super_admin'::text))))
);

create policy academies_select_policy on public.academies for SELECT to authenticated using (
  (is_active = true) OR (owner_id = auth.uid()) OR (id = get_auth_academy_id()) OR (EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'super_admin'::text))))
);

create policy academies_update_policy on public.academies for UPDATE to authenticated using (
  (owner_id = auth.uid()) OR (EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'super_admin'::text))))
) with check (
  (owner_id = auth.uid()) OR (EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'super_admin'::text))))
);
