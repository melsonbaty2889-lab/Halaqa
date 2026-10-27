-- ==============================================================================
-- 1. إنشاء جدول الشهادات والإجازات (certificates)
-- ==============================================================================
create table if not exists public.certificates (
  id uuid not null default gen_random_uuid (),
  student_id uuid not null,
  curriculum_id uuid not null,
  verification_code text not null,
  issued_at timestamp with time zone null default now(),
  pdf_url text null,
  issued_by uuid null,
  metadata jsonb null default '{}'::jsonb,
  certificate_type text null default 'ijazah'::text,
  qr_hash text null,
  verified_url text null,
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  
  constraint certificates_pkey primary key (id),
  constraint certificates_verification_code_key unique (verification_code),
  constraint certificates_qr_hash_key unique (qr_hash),
  constraint certificates_student_id_curriculum_id_key unique (student_id, curriculum_id),
  constraint certificates_curriculum_id_fkey foreign key (curriculum_id) references public.curricula (id) on delete cascade,
  constraint certificates_student_id_fkey foreign key (student_id) references public.students (id) on delete cascade,
  constraint certificates_issued_by_fkey foreign key (issued_by) references public.profiles (id) on delete set null,
  constraint certificates_type_check check (
    certificate_type = any (
      array[
        'ijazah'::text,
        'shahadah'::text,
        'course_completion'::text,
        'appreciation'::text,
        'achievement'::text,
        'participation'::text
      ]
    )
  )
) TABLESPACE pg_default;

-- ==============================================================================
-- 2. الفهارس لتحسين أداء الاستعلامات والتحقق (Indexes)
-- ==============================================================================
create index if not exists idx_certificates_student_id on public.certificates using btree (student_id) TABLESPACE pg_default;
create index if not exists idx_certificates_curriculum_id on public.certificates using btree (curriculum_id) TABLESPACE pg_default;
create index if not exists idx_certificates_issued_by on public.certificates using btree (issued_by) TABLESPACE pg_default;
create index if not exists idx_certificates_verification_code on public.certificates using btree (verification_code) TABLESPACE pg_default;
create index if not exists idx_certificates_qr_hash on public.certificates using btree (qr_hash) TABLESPACE pg_default;

-- ==============================================================================
-- 3. المشغلات (Triggers)
-- ==============================================================================
drop trigger if exists set_certificates_updated_at on public.certificates;
create trigger set_certificates_updated_at 
  before update on public.certificates 
  for each row 
  execute function handle_updated_at ();

-- ==============================================================================
-- 4. أمان الصفوف وسياسات الحماية (RLS & Policies المحدثة والآمنة)
-- ==============================================================================
alter table public.certificates enable row level security;

-- (أ) سياسة التحقق العام للجمهور (للتحقق من صحة الشهادات عبر الكود)
drop policy if exists "certificates_public_verify_policy" on public.certificates;
create policy "certificates_public_verify_policy"
  on public.certificates
  for select
  to public
  using (verification_code is not null);

-- (ب) سياسة الإدارة والوصول الشامل للمستخدمين المصرح لهم (مديرين، معلمين، أولياء أمور، طلاب)
drop policy if exists "certificates_comprehensive_policy" on public.certificates;
create policy "certificates_comprehensive_policy"
  on public.certificates
  for all
  to authenticated
  using (
    is_super_admin() 
    or (exists (select 1 from public.curricula c join public.profiles p on p.academy_id = c.academy_id where c.id = certificates.curriculum_id and p.id = auth.uid()))
    or (exists (select 1 from public.students s join public.halaqas h on h.id = s.halaqa_id where s.id = certificates.student_id and h.teacher_id = auth.uid()))
    or (student_id in (select s.id from public.students s join public.parents pr on pr.id = s.parent_id join public.profiles p on p.id = pr.profile_id where p.id = auth.uid()))
    or (student_id in (select students.id from public.students where students.user_id = auth.uid()))
  )
  with check (
    is_super_admin() 
    or (exists (select 1 from public.curricula c join public.profiles p on p.academy_id = c.academy_id where c.id = certificates.curriculum_id and p.id = auth.uid()))
    or (exists (select 1 from public.students s join public.halaqas h on h.id = s.halaqa_id where s.id = certificates.student_id and h.teacher_id = auth.uid()))
    or (student_id in (select s.id from public.students s join public.parents pr on pr.id = s.parent_id join public.profiles p on p.id = pr.profile_id where p.id = auth.uid()))
    or (student_id in (select students.id from public.students where students.user_id = auth.uid()))
  );
