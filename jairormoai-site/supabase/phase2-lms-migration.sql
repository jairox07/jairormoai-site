-- ============================================================
-- jairoromo.ai — Phase 2 LMS Migration
-- Run this in Supabase SQL Editor BEFORE deploying Phase 2
-- ============================================================

-- LMS: Courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  thumbnail_url text,
  price_cents integer not null default 0,
  stripe_price_id text not null default '',
  published boolean default false,
  created_at timestamptz default now()
);

-- LMS: Lessons
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses on delete cascade not null,
  title text not null,
  mux_asset_id text,
  mux_playback_id text,
  order_index integer not null,
  duration_seconds integer,
  downloadable_url text,
  created_at timestamptz default now()
);

-- LMS: Enrollments + progress
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  course_id uuid references public.courses on delete cascade not null,
  stripe_session_id text,
  progress jsonb default '{}',
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
);

-- RLS
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;

-- courses: public read (only published)
create policy "courses: public read"
  on public.courses for select using (published = true);

-- lessons: read only if enrolled in parent course
create policy "lessons: enrolled users read"
  on public.lessons for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.course_id = lessons.course_id
        and e.user_id = auth.uid()
    )
  );

-- enrollments: user reads own
create policy "enrollments: own read"
  on public.enrollments for select
  using (auth.uid() = user_id);

-- enrollments: user can update own progress
create policy "enrollments: own progress update"
  on public.enrollments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed 2 initial courses
-- IMPORTANT: Fill stripe_price_id after creating products in Stripe dashboard
-- Set published = true after adding price IDs
insert into public.courses (slug, title, description, price_cents, stripe_price_id, published)
values
  (
    'fundamentos-automatizacion-ia',
    'Fundamentos y Automatización con IA',
    'Aprende a implementar IA en flujos de trabajo reales desde cero. Automatizaciones, prompts avanzados, herramientas clave y casos de uso prácticos.',
    9700,
    '',
    false
  ),
  (
    'ia-avanzada-empresas',
    'IA Avanzada para Empresas: Implementación en Producción',
    'Arquitectura de sistemas RAG, agentes, fine-tuning y despliegue en producción. Para equipos que ya usaron IA y quieren escalar.',
    19700,
    '',
    false
  )
on conflict (slug) do nothing;
