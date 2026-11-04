-- BUNKER · Fase 1, parte 1: reservas de eventos con cupo.
-- Se corre una vez en el SQL Editor del proyecto de Supabase (AGENTS.md § 5).
-- Modelo: docs/CONTEXTO.md § 4.1. Reglas: AGENTS.md § 7.4 (RLS, carrera en el cupo).

-- ─── Tablas ────────────────────────────────────────────────────────────────

create table public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (length(trim(title)) between 1 and 120),
  description text,
  starts_at   timestamptz not null,
  cover_cents integer not null default 0 check (cover_cents >= 0),
  capacity    integer not null default 35 check (capacity > 0),
  created_at  timestamptz not null default now()
);
--> statement-breakpoint

create table public.customers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(trim(name)) between 1 and 120),
  phone      text not null unique check (phone ~ '^\+[1-9][0-9]{7,14}$'), -- E.164
  email      text,
  created_at timestamptz not null default now()
);
--> statement-breakpoint

create type public.reservation_status as enum ('pendiente_pago', 'pagada', 'cancelada');
--> statement-breakpoint

create table public.reservations (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  party_size  integer not null check (party_size > 0),
  status      public.reservation_status not null default 'pendiente_pago',
  created_at  timestamptz not null default now()
);
--> statement-breakpoint

create index reservations_event_id_idx on public.reservations (event_id);
--> statement-breakpoint
create index reservations_customer_id_idx on public.reservations (customer_id);
--> statement-breakpoint

-- El equipo de BUNKER: solo estas cuentas de Supabase Auth ven clientes y reservas.
create table public.staff (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
--> statement-breakpoint

-- ─── RLS: prendido en todas las tablas ─────────────────────────────────────

alter table public.events       enable row level security;
--> statement-breakpoint
alter table public.customers    enable row level security;
--> statement-breakpoint
alter table public.reservations enable row level security;
--> statement-breakpoint
alter table public.staff        enable row level security;
--> statement-breakpoint

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;
--> statement-breakpoint

-- Eventos: cualquiera los lee; solo el equipo los crea o cambia.
create policy "eventos visibles para todos" on public.events
  for select to anon, authenticated using (true);
--> statement-breakpoint
create policy "el equipo administra eventos" on public.events
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
--> statement-breakpoint

-- Clientes y reservas: solo el equipo. El público reserva únicamente con reserve_spots().
create policy "el equipo ve clientes" on public.customers
  for select to authenticated using (public.is_staff());
--> statement-breakpoint
create policy "el equipo ve reservas" on public.reservations
  for select to authenticated using (public.is_staff());
--> statement-breakpoint
create policy "el equipo cambia el estado de las reservas" on public.reservations
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
--> statement-breakpoint

-- Staff: cada quien ve solo su propia fila (para saber si es del equipo).
create policy "cada quien ve su fila de staff" on public.staff
  for select to authenticated using (user_id = auth.uid());
--> statement-breakpoint

-- ─── Lugares que quedan (lectura pública sin exponer reservas) ─────────────

create or replace function public.events_with_availability()
returns table (
  id          uuid,
  title       text,
  description text,
  starts_at   timestamptz,
  cover_cents integer,
  capacity    integer,
  remaining   integer
)
language sql
stable
security definer
set search_path = public
as $$
  select e.id, e.title, e.description, e.starts_at, e.cover_cents, e.capacity,
         (e.capacity - coalesce((
            select sum(r.party_size) from public.reservations r
            where r.event_id = e.id and r.status <> 'cancelada'
          ), 0))::integer as remaining
  from public.events e
  where e.starts_at >= now() - interval '6 hours'
  order by e.starts_at;
$$;
--> statement-breakpoint

-- ─── Reservar sin pasar del cupo ───────────────────────────────────────────
-- Bloquea la fila del evento (FOR UPDATE), así dos reservas al mismo tiempo se
-- forman en fila y nunca pasan del cupo. Errores (message / detail):
--   invalid_party_size · event_not_found · event_past · no_capacity (detail = lugares que quedan)

create or replace function public.reserve_spots(
  p_event_id   uuid,
  p_name       text,
  p_phone      text,
  p_party_size integer
)
returns table (reservation_id uuid, remaining integer, total_cents integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event          public.events%rowtype;
  v_reserved       integer;
  v_customer_id    uuid;
  v_reservation_id uuid;
begin
  if p_party_size is null or p_party_size < 1 then
    raise exception using message = 'invalid_party_size';
  end if;

  select * into v_event from public.events where id = p_event_id for update;
  if not found then
    raise exception using message = 'event_not_found';
  end if;
  if v_event.starts_at < now() then
    raise exception using message = 'event_past';
  end if;

  select coalesce(sum(party_size), 0) into v_reserved
  from public.reservations
  where event_id = p_event_id and status <> 'cancelada';

  if v_reserved + p_party_size > v_event.capacity then
    raise exception using message = 'no_capacity', detail = (v_event.capacity - v_reserved)::text;
  end if;

  -- Crea o reutiliza al cliente por su WhatsApp; no cambia el nombre de uno que ya existe.
  insert into public.customers (name, phone)
  values (trim(p_name), p_phone)
  on conflict (phone) do update set phone = excluded.phone
  returning id into v_customer_id;

  insert into public.reservations (event_id, customer_id, party_size)
  values (p_event_id, v_customer_id, p_party_size)
  returning id into v_reservation_id;

  return query select v_reservation_id,
                      v_event.capacity - v_reserved - p_party_size,
                      p_party_size * v_event.cover_cents;
end;
$$;
--> statement-breakpoint

-- Las funciones security definer solo las ejecuta quien debe.
revoke all on function public.is_staff() from public;
--> statement-breakpoint
revoke all on function public.events_with_availability() from public;
--> statement-breakpoint
revoke all on function public.reserve_spots(uuid, text, text, integer) from public;
--> statement-breakpoint
grant execute on function public.is_staff() to authenticated;
--> statement-breakpoint
grant execute on function public.events_with_availability() to anon, authenticated;
--> statement-breakpoint
grant execute on function public.reserve_spots(uuid, text, text, integer) to anon, authenticated;
--> statement-breakpoint

-- ─── Evento de ejemplo para la demo ────────────────────────────────────────
-- Título, fecha y cover son de EJEMPLO (no los dio BUNKER); se cambian desde el panel o aquí.

insert into public.events (title, description, starts_at, cover_cents, capacity)
values (
  'Noche de cata',
  'Evento de ejemplo para la demo del hackatón.',
  '2026-11-07 20:00:00-06', -- sábado 7 de noviembre, 20:00 en la Ciudad de México
  15000,                    -- $150.00 MXN por persona
  35
);
