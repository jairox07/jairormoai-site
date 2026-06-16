-- Paso 1: Agregar columna free_until a courses
alter table public.courses
  add column if not exists free_until timestamptz;

-- Paso 2: Insertar curso "Claude Code para PyMEs"
-- free_until = 24 horas desde que ejecutes este SQL
insert into public.courses (slug, title, description, price_cents, stripe_price_id, published, thumbnail_url, free_until)
values (
  'claude-code-pymes',
  'Claude Code para PyMEs y Emprendedores: Crea tu primera app sin saber programar',
  'La guía más completa en español para que dueños de PyME y emprendedores construyan sus propias aplicaciones — de cero a producción. 12 módulos, 0 experiencia requerida.',
  19700,
  '',
  true,
  '/images/courses/claude-code-pymes.jpg',
  now() + interval '24 hours'
);

-- Verificar
select slug, title, price_cents, free_until, published from courses order by created_at desc limit 5;
