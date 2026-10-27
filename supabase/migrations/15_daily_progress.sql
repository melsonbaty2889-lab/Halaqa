-- ==============================================================================
-- 1. إنشاء جدول المتابعة اليومية وإنجاز الطلاب (daily_progress)
-- ==============================================================================
create table if not exists public.daily_progress (
  id uuid not null default gen_random_uuid (),
  academy_id uuid not null,
  student_id uuid not null,
  teacher_id uuid null,
  halaqa_id uuid null,
  date date not null default CURRENT_DATE,
  hifz_from_ayah integer null,
  hifz_to_ayah integer null,
  review_from_ayah integer null,
  review_to_ayah integer null,
  grade text null,
  mistakes_count integer not null default 0,
  notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  hifz_surah_id integer null,
  review_surah_id integer null,
  riwayah text null default 'hafs_an_asem'::text,
  system_type text null default 'ayah'::text,
  looh_notes text null,
  ai_feedback_score numeric(5, 2) null,
  
  constraint daily_progress_pkey primary key (id),
  constraint unique_student_progress_date unique (student_id, halaqa_id, date),
  constraint daily_progress_review_surah_id_fkey foreign key (review_surah_id) references public.surahs (id),
  constraint daily_progress_hifz_surah_id_fkey foreign key (hifz_surah_id) references public.surahs (id),
  constraint daily_progress_academy_fkey foreign key (academy_id) references public.academies (id) on delete cascade,
  constraint daily_progress_halaqa_id_fkey foreign key (halaqa_id) references public.halaqas (id) on delete set null,
  constraint daily_progress_student_id_fkey foreign key (student_id) references public.students (id) on delete cascade,
  constraint daily_progress_teacher_id_fkey foreign key (teacher_id) references public.teachers (id) on delete set null,
  constraint daily_progress_grade_check check (
    grade = any (
      array[
        'ممتاز'::text,
        'جيد جدا'::text,
        'جيد'::text,
        'مقبول'::text,
        'ضعيف'::text
      ]
    )
  )
) TABLESPACE pg_default;

-- ==============================================================================
-- 2. الفهارس لتحسين أداء الاستعلامات والتقارير (Indexes)
-- ==============================================================================
create index if not exists idx_daily_progress_student on public.daily_progress using btree (academy_id, student_id, date) TABLESPACE pg_default;
create index if not exists idx_daily_progress_student_id on public.daily_progress using btree (student_id) TABLESPACE pg_default;
create index if not exists idx_daily_progress_teacher_id on public.daily_progress using btree (teacher_id) TABLESPACE pg_default;
create index if not exists idx_daily_progress_halaqa_id on public.daily_progress using btree (halaqa_id) TABLESPACE pg_default;
create index if not exists idx_daily_progress_student_date on public.daily_progress using btree (student_id, date) TABLESPACE pg_default;
create index if not exists idx_daily_progress_hifz_surah_id on public.daily_progress using btree (hifz_surah_id) TABLESPACE pg_default;
create index if not exists idx_daily_progress_review_surah_id on public.daily_progress using btree (review_surah_id) TABLESPACE pg_default;
create index if not exists idx_daily_progress_academy_date on public.daily_progress using btree (academy_id, date) TABLESPACE pg_default;

-- ==============================================================================
-- 3. المشغلات (Triggers)
-- ==============================================================================
drop trigger if exists set_updated_at on public.daily_progress;
create trigger set_updated_at 
  before update on public.daily_progress 
  for each row 
  execute function handle_updated_at ();

drop trigger if exists trg_update_progress on public.daily_progress;
create trigger trg_update_progress 
  after insert or update on public.daily_progress 
  for each row 
  execute function sync_student_progress ();

-- ==============================================================================
-- 4. أمان الصفوف وسياسات الحماية (Secure RLS Policies)
-- ==============================================================================
alter table public.daily_progress enable row level security;

-- (أ) سياسة الحذف (متاحة للمشرفين فقط)
drop policy if exists "daily_progress_delete_policy" on public.daily_progress;
create policy "daily_progress_delete_policy"
  on public.daily_progress
  for delete
  to authenticated
  using (
    is_super_admin() 
    or (
      academy_id is not null 
      and academy_id = get_auth_academy_id() 
      and exists (
        select 1 from public.profiles 
        where profiles.id = auth.uid() 
          and profiles.role = any (array['super_admin'::text, 'admin'::text, 'manager'::text])
      )
    )
  );

-- (ب) سياسة الإدراج (للمشرفين والمعلمين لطلاب حلقاتهم)
drop policy if exists "daily_progress_insert_policy" on public.daily_progress;
create policy "daily_progress_insert_policy"
  on public.daily_progress
  for insert
  to authenticated
  with check (
    is_super_admin() 
    or (
      academy_id is not null 
      and academy_id = get_auth_academy_id() 
      and (
        exists (
          select 1 from public.profiles 
          where profiles.id = auth.uid() 
            and profiles.role = any (array['super_admin'::text, 'admin'::text, 'manager'::text])
        )
        or exists (
          select 1 from public.profiles p
          join public.students s on s.id = daily_progress.student_id
          join public.halaqas h on h.id = s.halaqa_id
          where p.id = auth.uid() 
            and p.role = 'teacher'::text 
            and h.teacher_id = p.id
        )
      )
    )
  );

-- (ج) سياسة العرض والقراءة (للإدارة، المعلمين، الطلاب، وأولياء الأمور)
drop policy if exists "daily_progress_select_policy" on public.daily_progress;
create policy "daily_progress_select_policy"
  on public.daily_progress
  for select
  to authenticated
  using (
    is_super_admin() 
    or (
      academy_id is not null 
      and academy_id = get_auth_academy_id() 
      and (
        exists (
          select 1 from public.profiles 
          where profiles.id = auth.uid() 
            and profiles.role = any (array['super_admin'::text, 'admin'::text, 'manager'::text])
        )
        or exists (
          select 1 from public.profiles p
          join public.students s on s.id = daily_progress.student_id
          join public.halaqas h on h.id = s.halaqa_id
          where p.id = auth.uid() 
            and p.role = 'teacher'::text 
            and h.teacher_id = p.id
        )
        or student_id in (
          select students.id from public.students where students.user_id = auth.uid()
        )
        or student_id in (
          select students.id from public.students 
          where students.parent_id in (
            select parents.id from public.parents 
            where parents.profile_id = auth.uid()
          ) or students.parent_id = auth.uid()
        )
      )
    )
  );

-- (د) سياسة التحديث (للمشرفين والمعلمين)
drop policy if exists "daily_progress_update_policy" on public.daily_progress;
create policy "daily_progress_update_policy"
  on public.daily_progress
  for update
  to authenticated
  using (
    is_super_admin() 
    or (
      academy_id is not null 
      and academy_id = get_auth_academy_id() 
      and (
        exists (
          select 1 from public.profiles 
          where profiles.id = auth.uid() 
            and profiles.role = any (array['super_admin'::text, 'admin'::text, 'manager'::text])
        )
        or exists (
          select 1 from public.profiles p
          join public.students s on s.id = daily_progress.student_id
          join public.halaqas h on h.id = s.halaqa_id
          where p.id = auth.uid() 
            and p.role = 'teacher'::text 
            and h.teacher_id = p.id
        )
      )
    )
  )
  with check (
    is_super_admin() 
    or (
      academy_id is not null 
      and academy_id = get_auth_academy_id() 
      and (
        exists (
          select 1 from public.profiles 
          where profiles.id = auth.uid() 
            and profiles.role = any (array['super_admin'::text, 'admin'::text, 'manager'::text])
        )
        or exists (
          select 1 from public.profiles p
          join public.students s on s.id = daily_progress.student_id
          join public.halaqas h on h.id = s.halaqa_id
          where p.id = auth.uid() 
            and p.role = 'teacher'::text 
            and h.teacher_id = p.id
        )
      )
    )
  );
