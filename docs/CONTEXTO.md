# Contexto y decisiones: Reto BUNKER

> Última actualización: 2026-11-03 · Estado: 🟢 G1 stack · 🟢 G2 cobro simulado · 🟢 G3 alcance del PoC · sin gates abiertos

La fuente de verdad es [`referencias/2026-11-03-presentacion-reto-bunker.md`](referencias/2026-11-03-presentacion-reto-bunker.md):
las notas que Fernando sacó de la presentación del reto. Lo que no está ahí no se inventa; va a la § 5.

## 1. Problema

BUNKER es un bar escondido (no se ve desde la calle) de cerveza artesanal, con cupo para 35 personas. Abre de martes
a domingo "de 4 a 12" y lo atiende un equipo de dos personas. Organiza eventos y cobra un **cover por persona**.

Lo que duele hoy:

- **Reservar depende de Riservi**, que los obliga a usar Mercado Pago, aunque tienen su propia fintech.
- **El cover se cobra a mano**, con un link de pago que mandan por WhatsApp.
- **No tienen una base de datos de sus clientes.**
- **Las preguntas de siempre** ("¿dónde están?", "¿cómo reservo un evento?") se contestan una y otra vez, porque el
  lugar no se ve desde la calle.
- **No hay menú de cervezas**, porque el stock cambia todos los días; el de comidas vive en Soft Restaurant.

Lo que pidieron: que reservar un evento sea fácil, con un tono cercano y sin perder el misterio del lugar.
"Nice to have": un menú actualizado en un Excel que se conecte en línea y se actualice para los proveedores.

**Foco de la demo (Fernando, 2026-11-03):** reservar eventos con cupo.

## 2. Usuarios

| Usuario | Rol en el sistema | Qué hace |
|---|---|---|
| Cliente (20 a 30 años, parejas y citas) | Público, sin cuenta | Ve los eventos y los lugares que quedan, reserva para N personas y recibe la confirmación con el total del cover |
| Equipo de BUNKER (2 personas) | Staff, con cuenta (Supabase Auth) | Ve las reservas de cada evento y los lugares ocupados, marca una reserva como pagada |
| Proveedores | ⏸️ fuera del PoC | Lo del Excel del menú; quién lo usa está en la § 5 |

## 3. Restricciones

| Restricción | Implicación |
|---|---|
| Español es-MX | Todo el copy, la moneda (MXN) y las fechas |
| Cupo de 35 personas | El sistema nunca acepta más personas que el cupo de un evento, ni con dos reservas al mismo tiempo |
| Dos personas que además atienden el bar | El panel es mínimo: ver y marcar, sin configuración |
| Riservi obliga a usar Mercado Pago; tienen su propia fintech | El cobro no se ata a Mercado Pago (G2) |
| No hay base de clientes | Cada reserva crea o reutiliza un cliente, por su WhatsApp |
| El lugar es escondido y quieren conservar el misterio | Cómo se comunica la ubicación se decide con Fernando (§ 5) |
| El stock de cerveza cambia a diario | No hay menú fijo de cervezas en el PoC (⏸️) |
| El menú de comidas vive en Soft Restaurant | No se integra en el PoC (⏸️) |
| Se guardan datos personales | Aviso de privacidad (LFPDPPP); en el PoC, un texto de ejemplo |
| 1 hora de hackatón | Todo lo que no sea reservar con cupo se recorta primero |

## 4. Decisión de arquitectura (ADR ligero)

| Alternativa | Por qué se descartó |
|---|---|
| Next.js + Supabase | Fernando prefirió Svelte; SvelteKit cubre lo mismo (UI y servidor en una sola app) |
| Next.js (solo API) + Svelte con Vite (UI), en dos apps | Dos apps que levantar, conectar y desplegar no caben en una hora |
| Sitio estático + Google Sheets | El cupo sería frágil (dos reservas al mismo tiempo) y no habría una base de clientes de verdad |
| Seguir con Riservi y solo mejorar la comunicación | El reto es dejar de depender de Riservi y de Mercado Pago |

**Decisión:** SvelteKit + TypeScript, con Supabase (Postgres y Auth) y despliegue en Vercel. Fernando la confirmó el
2026-11-03 (🟢 G1, [`decisions/0001-stack-sveltekit-supabase.md`](decisions/0001-stack-sveltekit-supabase.md)).

**Consecuencias:** ✅ una sola app, un solo deploy, y la BD y el acceso del equipo ya resueltos · ✅ el cupo se
garantiza con una transacción en Postgres · ⚠️ crear el proyecto de Supabase y el de Vercel son pasos externos que
se confirman con Fernando · ⚠️ la seguridad depende de escribir bien las políticas de RLS (`AGENTS.md § 7.4`).

### 4.1 Modelo de datos (aplicado el 2026-11-03: `supabase/migrations/0000_reservas_con_cupo.sql`)

| Tabla | Campos | Notas |
|---|---|---|
| `events` | `id`, `title`, `description`, `starts_at` (`timestamptz`), `cover_cents`, `capacity` (35 por defecto) | Lo crea el equipo; en el PoC, un evento de ejemplo |
| `customers` | `id`, `name`, `phone` (E.164, único), `instagram` (sin @, minúsculas), `email` (opcional), `created_at` | La base de clientes que hoy no existe. Se reconoce al cliente por su WhatsApp; el Instagram se guarda si no tenía (migración 0001) |
| `reservations` | `id`, `event_id`, `customer_id`, `party_size`, `status` (`pendiente_pago`, `pagada` o `cancelada`), `created_at` | Las reservas canceladas no ocupan lugares |
| `staff` | `user_id` (cuenta de Supabase Auth), `created_at` | Solo estas cuentas ven clientes y reservas; sin ella, cualquiera que se registre en Supabase Auth podría leerlos |

- **Lugares que quedan** = `capacity` − suma de `party_size` de las reservas no canceladas del evento.
- **`reserve_spots(p_event_id, p_name, p_phone, p_instagram, p_party_size)`**: bloquea el evento, revisa los lugares que quedan, crea o
  reutiliza al cliente e inserta la reserva, todo en una transacción. Si no caben, regresa un error con los lugares
  que quedan.
- **`events_with_availability()`**: los eventos próximos con los lugares que quedan, para el público, sin exponer las
  reservas.
- **RLS:** el público solo lee los eventos y los lugares que quedan, y reserva a través de `reserve_spots()`. Solo el equipo
  lee clientes y reservas, y cambia su estado.

### 4.2 Flujo de reserva (propuesta)

1. El cliente abre la lista de eventos y ve "quedan N de 35" (o "agotado").
2. Elige un evento y escribe su nombre, su WhatsApp y cuántas personas van.
3. El servidor llama a `reserve_spots()`. Si no caben, le dice cuántos lugares quedan.
4. Confirmación: el resumen, el total del cover (personas × cover), el link de pago (G2) y cómo llegar (🟡 § 5).
5. El equipo ve la reserva en `/panel` y la marca como pagada.

## 5. Preguntas abiertas

<!--
Las dudas funcionales que NO se inventan. Una por casilla, con la marca 🔴 si bloquea una fase.
Al cerrarla: [x], fecha, la respuesta de Fernando y dónde aterrizó en código y docs.
-->

- [x] 🟢 **G2 Cobro del cover en el PoC** (2026-11-03, Fernando aceptó la propuesta): **simulado**. La reserva queda en
  `pendiente_pago`, se muestra un link de pago de ejemplo y el equipo la marca como pagada desde el panel. La
  integración real con la fintech queda ⏸️. Aterrizó en `AGENTS.md` (encabezado y § 8) y en el ROADMAP (Fase 1,
  parte 2).
- [x] 🟢 **G3 Alcance y orden del PoC** (2026-11-03, Fernando aceptó la propuesta): (1) eventos con los lugares que
  quedan, reserva para N personas sin pasar del cupo y "agotado"; (2) un panel mínimo con las reservas por evento y el
  botón de marcar pagada; (3) si sobra tiempo, el FAQ y exportar la base de clientes a CSV. Los recortes propuestos
  quedan confirmados. Aterrizó en `AGENTS.md § 7.3` y en el ROADMAP.
- [ ] 🟡 **Ubicación y misterio.** ¿Cuál es la dirección y cómo se encuentra la entrada? ¿Se revela solo después de
  reservar, para cuidar el misterio? Mientras no se sepa, el PoC usa un texto de ejemplo, marcado como tal.
- [ ] 🟡 **Horario.** ¿"De 4 a 12" es de 16:00 a 24:00? ¿Los eventos son dentro de ese horario?
- [ ] 🟡 **Reservas sin evento.** ¿También se reserva una mesa en un día normal, o solo eventos?
- [x] **Datos del cliente** (2026-11-03): nombre, **Instagram y WhatsApp**, los dos obligatorios. Aterrizó en la
  migración 0001, la form action y el formulario. Sigue abierto 🟡 si se pide correo o edad (el lugar vende alcohol).
- [ ] 🟡 **Reservas sin pagar.** ¿Caducan y liberan sus lugares? ¿Después de cuánto tiempo?
- [ ] 🟡 **Tamaño de una reserva.** ¿Hay un máximo de personas por reserva?
- [ ] 🟡 **El Excel del menú.** ¿Quién lo usa: los proveedores (para surtir), el equipo o los clientes (para ver qué
  cervezas hay hoy)?
- [ ] 🟡 **Marca.** ¿Hay logo, colores o fotos del lugar para `/impeccable init`?
- [ ] 🟡 **La fintech.** ¿Cuál es y si tiene una API o links de pago que se puedan generar? **La pasarela de pago la
  integra otro agente** (Fernando, 2026-11-03); esta pregunta se resuelve allá.
- [ ] 🟡 **Riservi.** ¿El sistema lo reemplaza o convive con él un tiempo?
- [x] **G1 Stack** (2026-11-03): SvelteKit + Supabase en Vercel. Fernando pidió "Next y Svelte"; se aclaró que
  SvelteKit cubre lo de Next en una sola app. Aterrizó en `AGENTS.md § 2` y el ADR 0001.
- [x] **Foco de la demo** (2026-11-03): reservar eventos con cupo; el cliente dice cuántas personas van y ve cuántos
  lugares quedan. Sin mapa de mesas. Aterrizó en `AGENTS.md § 1` y § 7.3.
- [x] **UI** (2026-11-03): con la skill `impeccable`. Aterrizó en `AGENTS.md § 7.2` y el ADR 0002.
- [x] **Tiempo** (2026-11-03): 1 hora para una demo funcional (PoC). Aterrizó en el ROADMAP y el modo hackatón.

## 6. Glosario

| Término | Significado |
|---|---|
| Cover | Lo que se cobra por persona para entrar a un evento |
| Evento | Una noche con programa propio en BUNKER, que se reserva y puede tener cover |
| Cupo | Cuántas personas caben en un evento; 35 por defecto |
| Lugares que quedan | Cupo menos las personas de las reservas no canceladas |
| Reserva | Un cliente aparta lugares para N personas en un evento |
| Riservi | La plataforma de reservas que usan hoy; los obliga a usar Mercado Pago |
| Soft Restaurant | El sistema de punto de venta donde vive su menú de comidas |
| PoC | Proof of concept: la demo funcional del hackatón |
