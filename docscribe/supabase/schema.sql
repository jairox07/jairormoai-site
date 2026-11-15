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

-- ═════════════════════════════════════════════
-- 7. Administración (MVP)
--    Idempotente: se puede ejecutar sobre una base que ya tenga las secciones 1-6.
-- ═════════════════════════════════════════════
alter table public.users add column if not exists is_admin boolean not null default false;
alter table public.users add column if not exists activo boolean not null default true;

-- Configuración global (sin secretos: las API keys viven en variables de entorno)
create table if not exists public.app_config (
  clave      text primary key check (clave in ('stt_provider','llm_provider','ollama_model','correo_pdf','nueva_consulta','limite_free')),
  valor      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.app_config enable row level security;
drop policy if exists "config_select" on public.app_config;
create policy "config_select" on public.app_config for select to authenticated using (true);

insert into public.app_config (clave, valor) values
  ('stt_provider',   '"auto"'),
  ('llm_provider',   '"auto"'),
  ('ollama_model',   '"qwen2.5:7b"'),
  ('correo_pdf',     'true'),
  ('nueva_consulta', 'true'),
  ('limite_free',    '20')
on conflict (clave) do nothing;

-- ¿El usuario actual es admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select u.is_admin from public.users u where u.id = (select auth.uid())), false);
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Lista de usuarios con conteo de consultas (NUNCA expone el contenido clínico)
create or replace function public.admin_listar_usuarios()
returns table (
  id uuid, email text, tier text, consultas_usadas integer, periodo text,
  is_admin boolean, activo boolean, created_at timestamptz, total_consultas bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'NO_AUTORIZADO'; end if;
  return query
    select u.id, u.email, u.tier, u.consultas_usadas, u.periodo, u.is_admin, u.activo, u.created_at,
           (select count(*) from public.consultas c where c.user_id = u.id)
      from public.users u
     order by u.created_at desc;
end;
$$;
revoke all on function public.admin_listar_usuarios() from public, anon;
grant execute on function public.admin_listar_usuarios() to authenticated;

-- Cambiar plan, suspender, dar/quitar admin o reiniciar el contador del mes
create or replace function public.admin_actualizar_usuario(
  p_id uuid,
  p_tier text default null,
  p_activo boolean default null,
  p_is_admin boolean default null,
  p_reiniciar_contador boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'NO_AUTORIZADO'; end if;
  if p_tier is not null and p_tier not in ('free','pro') then raise exception 'TIER_INVALIDO'; end if;
  -- evita que el admin se deje fuera a sí mismo
  if p_id = (select auth.uid()) and (p_is_admin = false or p_activo = false) then
    raise exception 'NO_PUEDES_QUITARTE_ACCESO';
  end if;

  update public.users
     set tier             = coalesce(p_tier, tier),
         activo           = coalesce(p_activo, activo),
         is_admin         = coalesce(p_is_admin, is_admin),
         consultas_usadas = case when p_reiniciar_contador then 0 else consultas_usadas end,
         periodo          = case when p_reiniciar_contador then to_char(now() at time zone 'utc', 'YYYY-MM') else periodo end
   where id = p_id;
  if not found then raise exception 'USUARIO_NO_ENCONTRADO'; end if;
end;
$$;
revoke all on function public.admin_actualizar_usuario(uuid, text, boolean, boolean, boolean) from public, anon;
grant execute on function public.admin_actualizar_usuario(uuid, text, boolean, boolean, boolean) to authenticated;

-- Guardar un valor de configuración (validado por clave)
create or replace function public.admin_guardar_config(p_clave text, p_valor jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_txt text := p_valor #>> '{}';
begin
  if not public.is_admin() then raise exception 'NO_AUTORIZADO'; end if;

  if p_clave in ('stt_provider','llm_provider','ollama_model') and jsonb_typeof(p_valor) <> 'string' then
    raise exception 'VALOR_INVALIDO';
  end if;
  if p_clave in ('correo_pdf','nueva_consulta') and jsonb_typeof(p_valor) <> 'boolean' then
    raise exception 'VALOR_INVALIDO';
  end if;
  if p_clave = 'stt_provider' and v_txt not in ('auto','openai','local','mock') then raise exception 'VALOR_INVALIDO'; end if;
  if p_clave = 'llm_provider' and v_txt not in ('auto','gemini','openai','ollama','mock') then raise exception 'VALOR_INVALIDO'; end if;
  if p_clave = 'ollama_model' and v_txt !~ '^[A-Za-z0-9._:/-]{1,80}$' then raise exception 'VALOR_INVALIDO'; end if;
  if p_clave = 'limite_free' then
    if jsonb_typeof(p_valor) <> 'number' then raise exception 'VALOR_INVALIDO'; end if;
    if v_txt::numeric < 0 or v_txt::numeric > 100000 or v_txt::numeric <> trunc(v_txt::numeric) then
      raise exception 'VALOR_INVALIDO';
    end if;
  end if;

  update public.app_config set valor = p_valor, updated_at = now() where clave = p_clave;
  if not found then raise exception 'CLAVE_INVALIDA'; end if;
end;
$$;
revoke all on function public.admin_guardar_config(text, jsonb) from public, anon;
grant execute on function public.admin_guardar_config(text, jsonb) to authenticated;

-- registrar_consulta: respeta cuenta suspendida y el límite configurable
create or replace function public.registrar_consulta(p_transcripcion text, p_nota jsonb)
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
  v_activo  boolean;
  v_actual  text := to_char(now() at time zone 'utc', 'YYYY-MM');
  v_limite  integer;
  v_id      uuid;
begin
  if v_uid is null then raise exception 'NO_AUTENTICADO'; end if;

  select tier, consultas_usadas, periodo, activo
    into v_tier, v_usadas, v_periodo, v_activo
    from public.users where id = v_uid for update;
  if not found then raise exception 'PERFIL_NO_ENCONTRADO'; end if;
  if not v_activo then raise exception 'CUENTA_SUSPENDIDA'; end if;

  if v_periodo <> v_actual then v_usadas := 0; end if;

  select coalesce((select (valor #>> '{}')::integer from public.app_config where clave = 'limite_free'), 20)
    into v_limite;
  if v_tier = 'free' and v_usadas >= v_limite then raise exception 'LIMITE_ALCANZADO'; end if;

  insert into public.consultas (user_id, transcripcion_raw, nota_soap_final)
  values (v_uid, p_transcripcion, p_nota)
  returning id into v_id;

  update public.users set consultas_usadas = v_usadas + 1, periodo = v_actual where id = v_uid;
  return v_id;
end;
$$;
revoke all on function public.registrar_consulta(text, jsonb) from public, anon;
grant execute on function public.registrar_consulta(text, jsonb) to authenticated;

-- ═════════════════════════════════════════════
-- 8. Paciente y número de consulta (por doctor)
--    Reemplaza registrar_consulta() de las secciones 5 y 7 (misma lógica + paciente y número).
-- ═════════════════════════════════════════════
alter table public.consultas add column if not exists paciente_nombre text;
alter table public.consultas add column if not exists paciente_edad integer;
alter table public.consultas add column if not exists numero integer;
alter table public.consultas drop constraint if exists consultas_paciente_edad_check;
alter table public.consultas add constraint consultas_paciente_edad_check check (paciente_edad is null or paciente_edad between 0 and 130);
create unique index if not exists consultas_user_numero_uq on public.consultas (user_id, numero);

with n as (
  select id, row_number() over (partition by user_id order by fecha, id) as rn
    from public.consultas where numero is null
)
update public.consultas c set numero = n.rn from n where c.id = n.id;

drop function if exists public.registrar_consulta(text, jsonb);

create or replace function public.registrar_consulta(
  p_transcripcion text,
  p_nota jsonb,
  p_paciente text,
  p_edad integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_tier text;
  v_usadas integer;
  v_periodo text;
  v_activo boolean;
  v_actual text := to_char(now() at time zone 'utc', 'YYYY-MM');
  v_limite integer;
  v_nombre text := btrim(coalesce(p_paciente, ''));
  v_numero integer;
  v_id uuid;
begin
  if v_uid is null then raise exception 'NO_AUTENTICADO'; end if;
  if char_length(v_nombre) < 2 or char_length(v_nombre) > 120 then raise exception 'PACIENTE_INVALIDO'; end if;
  if p_edad is not null and (p_edad < 0 or p_edad > 130) then raise exception 'EDAD_INVALIDA'; end if;

  select tier, consultas_usadas, periodo, activo into v_tier, v_usadas, v_periodo, v_activo
    from public.users where id = v_uid for update;
  if not found then raise exception 'PERFIL_NO_ENCONTRADO'; end if;
  if not v_activo then raise exception 'CUENTA_SUSPENDIDA'; end if;
  if v_periodo <> v_actual then v_usadas := 0; end if;

  select coalesce((select (valor #>> '{}')::integer from public.app_config where clave = 'limite_free'), 20) into v_limite;
  if v_tier = 'free' and v_usadas >= v_limite then raise exception 'LIMITE_ALCANZADO'; end if;

  -- el bloqueo de la fila de users (for update) serializa los inserts de un mismo doctor
  select coalesce(max(numero), 0) + 1 into v_numero from public.consultas where user_id = v_uid;

  insert into public.consultas (user_id, transcripcion_raw, nota_soap_final, paciente_nombre, paciente_edad, numero)
  values (v_uid, p_transcripcion, p_nota, v_nombre, p_edad, v_numero)
  returning id into v_id;

  update public.users set consultas_usadas = v_usadas + 1, periodo = v_actual where id = v_uid;
  return jsonb_build_object('id', v_id, 'numero', v_numero);
end;
$$;

revoke all on function public.registrar_consulta(text, jsonb, text, integer) from public, anon;
grant execute on function public.registrar_consulta(text, jsonb, text, integer) to authenticated;

-- Primer admin (ejecutar a mano una vez, con tu correo):
--   update public.users set is_admin = true where email = 'tu@correo.com';
