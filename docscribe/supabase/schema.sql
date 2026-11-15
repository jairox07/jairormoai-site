-- DocScribe — esquema Supabase
-- Ejecutar en SQL Editor (o como migración). Idempotente donde es posible.

-- ─────────────────────────────────────────────
-- 1. Tabla users (perfil + cuota freemium)
-- ─────────────────────────────────────────────
create table if not exists public.users (
  id               uuid primary key references auth.users (id) on delete cascade,
  email            text not null,
  tier             text not null default 'free' check (tier in ('free', 'pro')),
  consultas_usadas integer not null default 0 check (consultas_usadas >= 0),
  -- Mes al que corresponde el contador (YYYY-MM). Se reinicia al cambiar de mes.
  periodo          text not null default to_char(now() at time zone 'utc', 'YYYY-MM'),
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 2. Tabla consultas
-- ─────────────────────────────────────────────
create table if not exists public.consultas (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users (id) on delete cascade,
  fecha             timestamptz not null default now(),
  transcripcion_raw text not null,
  nota_soap_final   jsonb not null   -- { subjetivo: [], objetivo: [], analisis: [], plan: [] }
);

create index if not exists consultas_user_fecha_idx on public.consultas (user_id, fecha desc);

-- ─────────────────────────────────────────────
-- 3. RLS
-- ─────────────────────────────────────────────
alter table public.users     enable row level security;
alter table public.consultas enable row level security;

-- users: solo lectura de su propio perfil. Sin UPDATE desde el cliente
-- (evita que el usuario se cambie a 'pro' o reinicie su contador).
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select to authenticated
  using (id = (select auth.uid()));

-- consultas: el usuario solo ve / borra las suyas.
-- Los INSERT pasan por la función registrar_consulta() (security definer).
drop policy if exists "consultas_select_own" on public.consultas;
create policy "consultas_select_own" on public.consultas
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "consultas_delete_own" on public.consultas;
create policy "consultas_delete_own" on public.consultas
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- Realtime: el dashboard escucha INSERT en consultas (RLS aplica: solo llegan las propias)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'consultas'
  ) then
    alter publication supabase_realtime add table public.consultas;
  end if;
end $$;

-- ─────────────────────────────────────────────
-- 4. Crear perfil automáticamente al registrarse
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- 5. Registrar consulta de forma atómica (cuota + insert + contador)
-- ─────────────────────────────────────────────
create or replace function public.registrar_consulta(
  p_transcripcion text,
  p_nota          jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_tier    text;
  v_usadas  integer;
  v_periodo text;
  v_actual  text := to_char(now() at time zone 'utc', 'YYYY-MM');
  v_id      uuid;
begin
  if v_uid is null then
    raise exception 'NO_AUTENTICADO';
  end if;

  select tier, consultas_usadas, periodo
    into v_tier, v_usadas, v_periodo
    from public.users
   where id = v_uid
   for update;

  if not found then
    raise exception 'PERFIL_NO_ENCONTRADO';
  end if;

  -- Reinicio mensual
  if v_periodo <> v_actual then
    v_usadas := 0;
  end if;

  if v_tier = 'free' and v_usadas >= 20 then
    raise exception 'LIMITE_ALCANZADO';
  end if;

  insert into public.consultas (user_id, transcripcion_raw, nota_soap_final)
  values (v_uid, p_transcripcion, p_nota)
  returning id into v_id;

  update public.users
     set consultas_usadas = v_usadas + 1,
         periodo          = v_actual
   where id = v_uid;

  return v_id;
end;
$$;

revoke all on function public.registrar_consulta(text, jsonb) from public, anon;
grant execute on function public.registrar_consulta(text, jsonb) to authenticated;
