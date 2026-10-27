-- ==============================================================================
-- 1. إنشاء جدول الأكاديميات (academies)
-- ==============================================================================
create table if not exists public.academies (
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
  constraint academies_owner_id_fkey foreign key (owner_id) references public.profiles (id) on delete set null,
  
  constraint academies_language_code_check check (
    language_code = any (
      array['ar'::text, 'en'::text, 'fr'::text, 'tr'::text, 'ur'::text, 'id'::text]
    )
  ),
  constraint academies_slug_lowercase_check check (
    (slug = lower(slug)) and (slug ~ '^[a-z0-9-]+$'::text)
  ),
  constraint academies_brand_color_check check (
    (brand_color is null) or (brand_color ~* '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$'::text)
  ),
  constraint academies_weekend_days_check check (
    weekend_days <@ array[
      'Saturday'::text, 'Sunday'::text, 'Monday'::text, 'Tuesday'::text, 'Wednesday'::text, 'Thursday'::text, 'Friday'::text,
      'saturday'::text, 'sunday'::text, 'monday'::text, 'tuesday'::text, 'wednesday'::text, 'thursday'::text, 'friday'::text
    ]
  ),
  constraint academies_calendar_type_check check (
    calendar_type = any (array['gregorian'::text, 'hijri'::text])
  ),
  constraint academies_country_code_check check (
    (country_code is null) or ((country_code)::text = upper((country_code)::text))
  ),
  constraint academies_currency_check check (
    (currency = upper(currency)) and (length(currency) = 3)
  ),
  constraint academies_default_qiraat_check check (
    (default_qiraat)::text = any (
      array[
        'hafs_an_asem'::text, 'warsh_an_nafi'::text, 'qaloon_an_nafi'::text, 'al_duri_an_abu_amr'::text,
        'shuba_an_asem'::text, 'al_bazzi_an_ibn_kathir'::text, 'qunbul_an_ibn_kathir'::text, 'al_susi_an_abu_amr'::text,
        'hisham_an_ibn_amir'::text, 'ibn_dhakwan_an_ibn_amir'::text, 'khalaf_an_hamzah'::text, 'khallad_an_hamzah'::text,
        'al_layth_an_al_kisai'::text, 'al_duri_an_al_kisai'::text, 'isa_an_abu_jafar'::text, 'sulayman_an_abu_jafar'::text,
        'ruwaysh_an_yaqub'::text, 'rooh_an_yaqub'::text, 'ishaq_an_khalaf'::text, 'idrees_an_khalaf'::text, 'other'::text
      ]
    )
  )
) TABLESPACE pg_default;

-- ==============================================================================
-- 2. الفهارس (Indexes)
-- ==============================================================================
create index if not exists idx_academies_owner_id on public.academies using btree (owner_id) TABLESPACE pg_default;
create index if not exists idx_academies_is_active on public.academies using btree (is_active) TABLESPACE pg_default;
create index if not exists idx_academies_created_at on public.academies using btree (created_at desc) TABLESPACE pg_default;

-- ==============================================================================
-- 3. الدوال والمشغلات (Triggers)
-- ==============================================================================
-- (تأكد من وجود الدوال الفنية التابعة لها مسبقاً في الداتابيز)
drop trigger if exists ensure_valid_academy_slug on academies;
create trigger ensure_valid_academy_slug before insert or update on academies for each row execute function handle_academy_slug();

drop trigger if exists set_updated_at on academies;
create trigger set_updated_at before update on academies for each row execute function handle_updated_at();

drop trigger if exists tr_on_academy_created_add_subscription on academies;
create trigger tr_on_academy_created_add_subscription after insert on academies for each row execute function handle_new_academy_subscription();

drop trigger if exists tr_protect_academy_activation on academies;
create trigger tr_protect_academy_activation before update on academies for each row execute function protect_academy_activation();

drop trigger if exists trg_generate_referral_code on academies;
create trigger trg_generate_referral_code before insert on academies for each row execute function generate_academy_referral_code();

drop trigger if exists trigger_seed_academy_badges on academies;
create trigger trigger_seed_academy_badges after insert on academies for each row execute function seed_academy_badges();

-- ==============================================================================
-- 4. أمان الصفوف وسياسات الحماية (RLS & Policies المطابقة لداتابيز عندك)
-- ==============================================================================
alter table public.academies enable row level security;

-- (أ) سياسة الإدراج (Insert)
drop policy if exists "academies_insert_policy" on public.academies;
create policy "academies_insert_policy"
  on public.academies
  for insert
  to authenticated
  with check (
    (owner_id = auth.uid()) 
    or (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'super_admin'))
  );

-- (ب) سياسة القراءة (Select)
drop policy if exists "academies_select_policy" on public.academies;
create policy "academies_select_policy"
  on public.academies
  for select
  to authenticated
  using (
    (is_active = true) 
    or (owner_id = auth.uid()) 
    or (id = get_auth_academy_id()) 
    or (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'super_admin'))
  );

-- (ج) سياسة التحديث (Update)
drop policy if exists "academies_update_policy" on public.academies;
create policy "academies_update_policy"
  on public.academies
  for update
  to authenticated
  using (
    (owner_id = auth.uid()) 
    or (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'super_admin'))
  )
  with check (
    (owner_id = auth.uid()) 
    or (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'super_admin'))
  );
