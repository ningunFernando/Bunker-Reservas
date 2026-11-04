-- BUNKER · el cliente deja su Instagram además de su WhatsApp (Fernando, 2026-11-03).
-- El WhatsApp sigue siendo la llave del cliente; el Instagram se guarda normalizado (sin @, en minúsculas).

alter table public.customers
  add column instagram text check (instagram ~ '^[a-z0-9._]{1,30}$');
--> statement-breakpoint

-- La firma cambia (un parámetro más): se quita la versión de 4 parámetros.
drop function public.reserve_spots(uuid, text, text, integer);
--> statement-breakpoint

create or replace function public.reserve_spots(
  p_event_id   uuid,
  p_name       text,
  p_phone      text,
  p_instagram  text,
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

  -- Crea o reutiliza al cliente por su WhatsApp. No le cambia el nombre; el Instagram solo se
  -- llena si no tenía (así nadie le sobrescribe el suyo a otro cliente).
  insert into public.customers (name, phone, instagram)
  values (trim(p_name), p_phone, p_instagram)
  on conflict (phone) do update set instagram = coalesce(public.customers.instagram, excluded.instagram)
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

revoke all on function public.reserve_spots(uuid, text, text, text, integer) from public;
--> statement-breakpoint
grant execute on function public.reserve_spots(uuid, text, text, text, integer) to anon, authenticated;
--> statement-breakpoint
notify pgrst, 'reload schema';
