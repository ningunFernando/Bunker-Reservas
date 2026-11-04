# Reto BUNKER: manual operativo para agentes y desarrolladores

> **Idioma obligatorio: español (es-MX).** Docs, UI, mensajes y commits descriptivos.
>
> Última actualización: 2026-11-03 · Estado: **Fase 0 ✅** · **Fase 1 ⬅️** · Hackatón: **1 hora** para una demo funcional (PoC)
> 🔴 **Gates abiertos:** ninguno
> 🟢 **Cerrados:** G1 stack (SvelteKit + Supabase en Vercel) · G2 cobro del cover simulado en el PoC · G3 alcance y
> orden del PoC
> **Recortes de alcance:** sin mapa de mesas ni elección de un lugar específico (2026-11-03). Fuera del PoC (⏸️,
> G3, 2026-11-03): menú de cervezas y Excel en línea, Soft Restaurant, WhatsApp automático, pago real con la fintech
> y migración desde Riservi.
> El detalle vive en §7.3, §8 y `docs/ROADMAP.md`.

Este proyecto es **autocontenido**: sus reglas generales salen de la plantilla de proyectos de `NonTaggedStuff`
(2026-11-03) y están copiadas en `docs/` para que la carpeta funcione sola. Si la plantilla cambia allá, aquí **no**
se actualiza sola.

## 0. Antes de empezar (obligatorio)

1. Lee este archivo completo, incluido el **§8 Estado actual** y su bitácora.
2. Lee [`docs/CONVENCIONES-AGENTE.md`](docs/CONVENCIONES-AGENTE.md): la firma de terminado, los gates y el modo
   hackatón.
3. Lee [`docs/WORKFLOW.md`](docs/WORKFLOW.md): los 7 pasos y la sección **Modo hackatón**.
4. Lee [`docs/CONTEXTO.md`](docs/CONTEXTO.md) y [`docs/ROADMAP.md`](docs/ROADMAP.md).
5. Antes de tocar UI, lee `PRODUCT.md` y `DESIGN.md` en la raíz (los crea `/impeccable init` en la Fase 0, ver §7.2).
6. Si la **primera tarea de §8** sigue pendiente (confirmar G2 y G3 con Fernando), empieza por ahí.

⏱️ **El reloj manda.** Cada fase tiene un bloque de tiempo en el ROADMAP. Si una fase se pasa, se avisa a Fernando y
se propone qué recortar; no se recorta en silencio.

El índice completo está en [`docs/README.md`](docs/README.md).

---

## 1. Resumen del proyecto

Un sistema para que **BUNKER**, un bar escondido de cerveza artesanal, reciba **reservas para sus eventos** sin
depender de Riservi y empiece a tener una **base de datos de sus clientes**. Es el reto de un hackatón para pymes; la
meta es una demo funcional (proof of concept) en **1 hora**.

- **El lugar:** cupo para 35 personas; abre de martes a domingo "de 4 a 12" (🟡 confirmar el horario exacto); lo
  atiende un equipo de dos personas; no se ve desde la calle.
- **El público:** jóvenes de 20 a 30 años, parejas y citas; les gusta la cerveza artesanal.
- **Hoy:** reservan con Riservi, que los obliga a usar Mercado Pago. El cover de los eventos se cobra por persona con
  un link de pago por WhatsApp. Tienen su propia fintech. No guardan datos de sus clientes. El menú de comidas vive en
  Soft Restaurant; no hay menú de cervezas porque el stock cambia todos los días.
- **Lo que pidieron:** que reservar un evento sea fácil, con un tono cercano y sin perder el misterio del lugar, y
  responder las preguntas frecuentes ("¿dónde están?", "¿cómo reservo?").

**Foco de la demo (Fernando, 2026-11-03): reservar eventos con cupo.** El cliente dice cuántas personas van, ve
cuántos de los 35 lugares quedan y el cupo nunca se pasa. No hay mapa de mesas.

Las notas originales de la presentación están en
[`docs/referencias/2026-11-03-presentacion-reto-bunker.md`](docs/referencias/2026-11-03-presentacion-reto-bunker.md)
y son la fuente de verdad.

⚠️ Las especificaciones finas no existen. **No inventes requisitos:** lo que Fernando no ha definido está en
`docs/CONTEXTO.md § 5 Preguntas abiertas`.

## 2. Stack tecnológico

| Capa | Tecnología | Estado |
|---|---|---|
| App (UI y servidor) | SvelteKit + TypeScript | 🟢 G1, 2026-11-03, ADR 0001 |
| Base de datos | Supabase (Postgres) con RLS | 🟢 G1 |
| Acceso del equipo | Supabase Auth (correo y contraseña) | 🟢 G1 |
| Despliegue | Vercel con `@sveltejs/adapter-vercel` | 🟢 G1 (desplegar se confirma con Fernando) |
| Diseño de UI | Skill `impeccable` | 🟢 ADR 0002 |
| Calidad | `svelte-check` (tipos) y smoke del camino feliz | 🟢 Fase 0, 2026-11-03 |
| Migraciones | Drizzle Kit, solo para correr el SQL de `supabase/migrations/` | 🟢 2026-11-03, lo pidió Fernando |

Versiones fijadas en `package-lock.json` (2026-11-03): SvelteKit 3.1.1, Svelte 5.57.3, Vite 8.3.5, TypeScript 6.0.3,
`@sveltejs/adapter-vercel` 7.0.2 y `@supabase/supabase-js` 2.118.0 (exacta). Node 24.

Dependencias y para qué sirve cada una:

- `@sveltejs/kit`, `svelte`, `@sveltejs/vite-plugin-svelte`, `vite` y `typescript`: la app (G1); las puso `npx sv create`.
- `svelte-check`: el typecheck de TypeScript dentro de los componentes.
- `@sveltejs/adapter-vercel`: el build para Vercel.
- `@supabase/supabase-js`: el cliente de Supabase (`src/lib/supabase.ts`).
- `drizzle-kit`, `drizzle-orm` y `pg` (desarrollo, versiones exactas 0.31.11, 0.45.4 y 8.23.1): corren las migraciones
  con `npm run db:migrate`; `pg` también lo usa la verificación por SQL. La app no usa Drizzle para consultar.

**Por qué este stack:** una sola app con UI y servidor (SvelteKit) es lo más rápido de levantar en una hora, y
Supabase da la base de datos y el acceso del equipo sin montar un servidor propio. Fernando pidió "Next y Svelte"; se
aclaró que SvelteKit hace lo que haría Next en una sola app, así que **Next.js no se usa** (ADR 0001). Las
alternativas descartadas están en `CONTEXTO.md § 4`.

## 3. Arquitectura

Las rutas son una **propuesta**; se confirman al construir la Fase 1.

```
 Cliente (celular)                              Equipo BUNKER (2 personas)
       │                                                  │
       ▼                                                  ▼
┌──────────────────── App SvelteKit (Vercel) ───────────────────────┐
│ /                eventos con los lugares que quedan ("12 de 35")  │
│ /eventos/[id]    formulario: nombre, WhatsApp, número de personas │
│ /reserva/[id]    confirmación, total del cover y link de pago (G2)│
│ /panel           reservas por evento · marcar pagada (Auth)       │
└───────────────────────────────┬───────────────────────────────────┘
                                │ form actions (+page.server.ts), solo en el servidor
                                ▼
┌──────────────────────────── Supabase ─────────────────────────────┐
│ events · customers · reservations · staff   (RLS en todas)        │
│ reserve_spots(): aparta lugares en una sola transacción           │
│ events_with_availability(): lugares que quedan, sin ver reservas  │
└───────────────────────────────────────────────────────────────────┘
```

**Principios:**

- **El cupo se decide en la base de datos, no en el navegador.** La función `reserve_spots()` revisa los lugares que
  quedan y aparta los nuevos en la misma transacción; así dos reservas al mismo tiempo no pasan de 35.
- **Las llaves privadas de Supabase solo viven en el servidor** (`$app/env/private`, form actions y
  `hooks.server.ts`).
- **Una reserva crea o reutiliza un cliente** (por su WhatsApp): de ahí sale la base de clientes que hoy no existe.
- **El texto que ve el cliente lleva la voz de BUNKER:** cercano y con misterio (`PRODUCT.md`, cuando exista).

## 4. Estructura de carpetas

Lo que ya existe va sin marca; lo que todavía no, se marca **(pendiente)**.

```
Hackaton2/
├── AGENTS.md                  ← este archivo
├── CLAUDE.md                  ← puente para Claude Code (@AGENTS.md)
├── README.md                  ← portada: qué es y cómo arrancarlo
├── PRODUCT.md                 ← contexto de producto para impeccable (2026-11-03)
├── DESIGN.md                  (pendiente: /impeccable document después del primer craft, Fase 1)
├── .gitignore · .npmrc · .env.example (valores falsos; el .env real no se versiona)
├── package.json               ← scripts y dependencias (versiones en package-lock.json)
├── vite.config.ts             ← config de SvelteKit 3 y adapter de Vercel (no hay svelte.config.js)
├── drizzle.config.ts          ← Drizzle Kit: corre las migraciones de supabase/migrations/
├── tsconfig.json
├── docs/
│   ├── README.md              ← índice y orden de lectura
│   ├── CONVENCIONES-AGENTE.md ← acuerdos con Fernando (firma, gates, modo hackatón)
│   ├── WORKFLOW.md            ← workflow de 7 pasos y modo hackatón
│   ├── CONVENCIONES.md        ← nombres, git, idioma, secretos, dinero, fechas y datos personales
│   ├── CONTEXTO.md            ← problema, usuarios, restricciones, arquitectura, modelo, preguntas abiertas
│   ├── ROADMAP.md             ← fases con bloques de tiempo, casillas, gates y "hecho cuando"
│   ├── decisions/             ← ADRs del proyecto
│   └── referencias/           ← notas originales de la presentación del reto (fuente de verdad)
├── supabase/migrations/       ← el esquema de la BD, fuente de verdad (SQL + meta/_journal.json de Drizzle)
├── scripts/smoke.mjs          ← smoke del cupo (npm run smoke)
├── static/                    ← archivos públicos (robots.txt)
└── src/
    ├── env.ts                 ← declaración de las variables de entorno (SvelteKit 3)
    ├── app.html · app.d.ts
    ├── lib/supabase.ts        ← cliente de Supabase con la llave publicable
    ├── lib/events.ts          ← eventos con los lugares que quedan
    ├── lib/phone.ts           ← normaliza teléfonos a E.164
    └── routes/
        ├── +page.svelte       ← por ahora, la bienvenida del scaffold
        └── eventos/[id]/      ← carga del evento y form action que llama a reserve_spots() (página provisional)
```

## 5. Comandos de desarrollo

Requisitos: Node 24 y un `.env` con los datos de Supabase (copia `.env.example`): la URL y la llave publicable para la
app, `DIRECT_URL` (o `DATABASE_URL`, el Session pooler) para las migraciones y `SUPABASE_SECRET_KEY` para el smoke.

```bash
npm install        # instalar
npm run dev        # ejecutar en http://localhost:5173
npm run check      # svelte-check (tipos)
npm run build      # compilar para Vercel
npm run db:migrate # aplica las migraciones pendientes de supabase/migrations/ (Drizzle)
npm run smoke      # smoke del cupo contra la BD: N/N PASS; limpia sus datos SMOKE
npm run smoke -- --app http://localhost:5173   # además prueba la form action con la app corriendo
```

La BD es un proyecto de Supabase de un compañero del equipo, que **no está en la cuenta de Fernando**: el MCP de
Supabase no llega a ella. Las migraciones se aplican con `npm run db:migrate`, no pegándolas en el SQL Editor.

## 6. Convenciones

El detalle está en [`docs/CONVENCIONES.md`](docs/CONVENCIONES.md).

1. Conventional Commits en español; un commit por parte entregada.
2. Los secretos se quedan solo en `.env` o en el servidor; `.env.example` lleva valores falsos.
3. **El esquema de la BD vive en `supabase/migrations/`** y se aplica con `npm run db:migrate`. Una migración nueva es
   un `NNNN_slug.sql` (con `--> statement-breakpoint` entre sentencias) más su entrada en `meta/_journal.json`; las
   aplicadas no se editan. Si cambia el esquema, se actualiza `CONTEXTO.md § 4.1` en el mismo cambio.
4. **Dinero en centavos** (enteros, MXN); se muestra como `$150.00 MXN`.
5. **Fechas en `timestamptz`**; se muestran en la zona `America/Mexico_City`.
6. **Teléfonos en formato E.164** (`+52…`).
7. Los datos de prueba llevan el prefijo `SMOKE` y se borran al terminar; los datos reales de clientes no entran al
   repo.

## 7. Reglas para agentes

### 7.1 Generales (vienen de la plantilla)

**Especificaciones y decisiones**
- **No inventes especificaciones.** Una duda funcional va a `docs/CONTEXTO.md § 5` y se le pregunta a Fernando.
- **Los 🔴 gates se respetan:** pregunta antes, no asumas. Un gate abierto bloquea esa parte, no todo.
- **Las referencias mandan:** las notas de Fernando en `docs/referencias/` le ganan a tu intuición y a cualquier
  skill.
- **Los recortes de alcance son explícitos:** lo que se decidió **no** hacer queda escrito en el encabezado de este
  archivo y en §7.3, para que nadie lo reimplemente.

**Alcance**
- No hagas refactors, "mejoras" ni agregues dependencias que nadie pidió. Propónlas al final.
- Si encuentras un bug fuera de alcance, anótalo en §8 y no lo arregles en el mismo cambio.

**Pide confirmación antes de**
- Borrar o sobrescribir archivos que no creaste en esta tarea.
- `git push`, publicar, desplegar o cualquier cosa visible fuera de esta máquina.
- **Crear recursos externos** (el proyecto de Supabase, el proyecto de Vercel): pueden costar.
- Instalar dependencias globales o cambiar la configuración del sistema.
- Tocar datos reales (clientes de BUNKER, cuentas de pago).

**Nunca**
- Commitees secretos.
- Dejes scripts de smoke con credenciales de prueba ni datos de prueba sin limpiar.
- Inventes resultados. Si algo no se pudo probar, dilo y no firmes.
- Borres docs obsoletos: márcalos con `⚠️ DESACTUALIZADO — ver X`.
- Dejes archivos basura (temporales, logs, dumps) fuera de una carpeta ignorada.

**Calidad y comunicación**
- Imita el estilo del código que ya existe. Prefiere lo simple y legible sobre lo ingenioso.
- El proyecto debe poder ejecutarse siguiendo solo su README o este archivo.
- Al terminar di **qué cambió · cómo se verificó · qué falta**, y firma `Fernando 😊` solo si terminaste de verdad.

### 7.2 UI con la skill `impeccable` (obligatorio, en modo hackatón)

Toda la UI se diseña y construye con la skill **`impeccable`** (`/impeccable`). Decisión en
[`docs/decisions/0002-ui-con-impeccable.md`](docs/decisions/0002-ui-con-impeccable.md). Con una hora, el flujo se
recorta:

1. **Fase 0:** `/impeccable init` corto para crear `PRODUCT.md` y `DESIGN.md`. Las respuestas de producto y marca
   **las da Fernando**. Si no hay marca, se parte de las notas del reto (tono cercano, misterio, cerveza artesanal,
   público de 20 a 30 años) y se dice en el reporte.
2. **Pantalla nueva:** `/impeccable craft <pantalla>` directo; `shape` solo si la pantalla no está clara.
3. **`critique`, `audit` y `polish` solo si sobra tiempo** al final. Lo que encuentren queda como deuda en §8.
4. **Register:** `brand` para lo que ve el cliente (eventos, reserva y confirmación); `product` para `/panel`.
5. **Se diseña primero para el celular:** es el default razonable, porque hoy el link de reserva llega por
   WhatsApp. Se prueba en una vista de 375 × 812.
6. **Prioridad:** referencias de Fernando > `PRODUCT.md` / `DESIGN.md` > reglas de la skill > tu intuición.
7. **Si tu agente no tiene la skill** (Codex, Cursor, etc.): respeta `PRODUCT.md` y `DESIGN.md` y **avisa a Fernando
   antes de diseñar UI nueva**; no la improvises.

### 7.3 Propias del proyecto

1. **Lo que NO se implementa hoy:**
   - **Mapa de mesas o elección de un lugar específico** (Fernando, 2026-11-03): el cupo se cuenta por evento.
   - Fuera del PoC (⏸️, G3, 2026-11-03): el menú de cervezas y el Excel en línea para proveedores, la integración
     con Soft Restaurant, los mensajes automáticos por WhatsApp, el pago real con la fintech y la migración de datos
     desde Riservi.
   - **El cobro del cover es simulado** (G2, 2026-11-03): la reserva queda en `pendiente_pago`, la confirmación
     muestra un link de pago de ejemplo y el equipo la marca como pagada en el panel.
2. **Antes de dar una fase por hecha** (modo hackatón):
   - smoke del camino feliz: reservar, ver que bajan los lugares que quedan, **intentar pasarse del cupo y ver el
     rechazo**;
   - prueba en el navegador en vista móvil (375 × 812) de los flujos que tocó la fase;
   - si la fase toca el panel: la reserva aparece y marcarla pagada cambia su estado;
   - los datos `SMOKE` se borran al final y se comprueba que no quedó nada.
3. **Mantén los docs sincronizados:** si cambia el stack, la arquitectura o el esquema, actualiza este archivo y el
   doc de `docs/` que corresponda en el mismo cambio.

### 7.4 ⚠️ Trampas conocidas del dominio

Vienen de la experiencia con el stack; se confirman al construir.

- **RLS de Supabase:** las tablas que se crean con SQL no traen RLS prendido, y la `anon key` es pública (va al
  navegador). Prende RLS en `events`, `customers` y `reservations` y escribe sus políticas en la misma migración.
- **Variables de entorno en SvelteKit 3** (confirmado en sus tipos, 2026-11-03): ya no existe `$env/static/*`, y el
  prefijo `PUBLIC_` ya no es lo que hace pública una variable. Cada variable se declara en `src/env.ts` con
  `defineEnvVars`. Las que llevan `public: true` se importan de `$app/env/public` y **llegan al navegador**; las demás,
  de `$app/env/private`, que es solo del servidor. Aquí los nombres conservan el `PUBLIC_` (`PUBLIC_SUPABASE_URL`,
  `PUBLIC_SUPABASE_PUBLISHABLE_KEY`) porque así venía el `.env` del equipo, y sirve de recordatorio. La `service_role`
  key, si llega a hacer falta, va sin `public` y sin el prefijo. Una variable sin `schema` tiene que existir, aunque
  esté vacía.
- **SvelteKit 3 no trae `svelte.config.js`:** la config (incluido el adapter) vive en `vite.config.ts`. El alias de
  `src/lib` es `#lib`, no `$lib`.
- **Carrera en el cupo:** si el cupo se revisa en el cliente o en dos pasos (leer y luego insertar), dos reservas al
  mismo tiempo pueden pasar de 35. Se revisa y se aparta en una sola función de la BD, con bloqueo del evento.
- **Zona horaria:** Vercel corre en UTC. Guarda `timestamptz` y formatea en `America/Mexico_City`; un evento "a las
  8" mal formateado sale a las 2 de la mañana.
- **Teléfonos:** el mismo cliente puede escribir `55 1234 5678`, `5512345678` o `+52 55…`. Normaliza a E.164 antes de
  buscarlo, o la base de clientes se duplica.
- **Datos personales:** guardar nombre y WhatsApp obliga a un aviso de privacidad (LFPDPPP). En el PoC basta con un
  enlace y un texto de ejemplo, marcado como tal.
- **Recursos externos:** crear el proyecto de Supabase o desplegar a Vercel es visible fuera de esta máquina y puede
  costar; se confirma con Fernando antes.

- **Imports de `#lib` con extensión:** el alias de SvelteKit 3 es un `imports` de Node (`"#lib/*": "./src/lib/*"`), que
  no agrega extensiones. Se importa `#lib/phone.js` (aunque el archivo sea `.ts`); `#lib/phone` no lo encuentra
  `svelte-check`.
- **Drizzle parte el SQL por `--> statement-breakpoint`:** sin los separadores manda todo el archivo como una sola
  consulta. Van entre cada sentencia de nivel superior, nunca dentro de un bloque `$$ … $$`.
- **El SQL pegado en el SQL Editor no llegó a la BD** (2026-11-03): la API seguía sin la tabla. No se averiguó por qué;
  desde entonces se migra con `npm run db:migrate`, que reporta el error exacto. Después de migrar se manda
  `notify pgrst, 'reload schema'` para que la API vea los cambios al momento.
- **Conexión a la BD:** se usa el Session pooler (`aws-…pooler.supabase.com:5432`, usuario `postgres.<ref>`). La
  conexión directa (`db.<ref>.supabase.co`) es solo IPv6 en el plan gratis.
- **`at time zone` y `pg`:** `starts_at at time zone 'America/Mexico_City'` regresa un `timestamp` sin zona, y `pg` lo
  lee como hora local de la máquina. Para mostrar fechas, formatea el `timestamptz` en la app.

<!-- Agrega aquí las ⚠️ trampas nuevas que vayas descubriendo (las que ahorran horas). -->

## 8. Estado actual

### Resumen (al 2026-11-03)

| | |
|---|---|
| **Fases completas** | ✅ Fase 0 (2026-11-03) |
| **Siguiente** | ⏸️ Checkpoint con Fernando; luego, la Fase 1 parte 2 (UI de la reserva con `/impeccable craft`) |
| **Gates** | 🟢 G1 stack · 🟢 G2 cobro simulado · 🟢 G3 alcance y orden del PoC |
| **Deuda conocida** | — |

### ✅ Primera tarea del primer chat en el proyecto (terminada el 2026-11-03)

1. ✅ Fernando aceptó las propuestas de 🟢 G2 y 🟢 G3. Las 🟡 de `docs/CONTEXTO.md § 5` siguen abiertas y no bloquean.
2. ✅ Respuestas cerradas en `CONTEXTO.md § 5`, este archivo y el ROADMAP.
3. ✅ Fase 0 terminada (`docs/ROADMAP.md`).

La bitácora cronológica de abajo conserva el detalle y los caveats de cada fase. **Se agrega al final y no se
reescribe.** Cada entrada lleva: las decisiones confirmadas con Fernando, lo que se hizo, cómo se verificó
(`N/N PASS`), los 🐛 bugs encontrados por la verificación y los ⚠️ caveats.

### 2026-11-03: proyecto creado

- **Decisiones confirmadas con Fernando:**
  - 🟢 G1: SvelteKit + Supabase en Vercel. Pidió "Next y Svelte"; se aclaró que SvelteKit cubre lo de Next en una
    sola app (ADR 0001).
  - UI con la skill `impeccable` (ADR 0002).
  - 1 hora para una demo funcional.
  - El foco es reservar eventos con cupo, sin mapa de mesas.
- **Qué se hizo:** la base de docs y este `AGENTS.md`, armados con la plantilla de proyectos de `NonTaggedStuff` y
  adaptados para que la carpeta funcione sola. Las notas de la presentación quedaron textuales en
  `docs/referencias/`. G2 y G3 quedan con propuesta.
- **Verificación:** se revisaron los enlaces internos entre docs, que no queden marcadores de plantilla ni rutas del
  workspace, y que la referencia sea textual. No hay código que ejecutar.
- **⚠️ Caveats:** la carpeta todavía no es un repo git; no hay scaffold, `PRODUCT.md`, `DESIGN.md` ni
  `.env.example` (son de la Fase 0).

### 2026-11-03: Fase 0 (G2 y G3, scaffold, `PRODUCT.md`)

- **Decisiones confirmadas con Fernando:**
  - 🟢 G2: el cobro es simulado. 🟢 G3: el alcance y el orden propuestos.
  - La BD es el proyecto de Supabase de un compañero del equipo, no uno nuevo en la cuenta de Fernando.
  - Para `/impeccable init`: personalidad "relajado, curioso, de barrio"; evitar la plataforma de reservas genérica,
    el antro con neón y la landing de startup; WCAG AA.
- **Decisiones técnicas (defaults razonables, sin gate):**
  - Rama `main` por ahora.
  - El scaffold se generó en un directorio aparte y se copió aquí, para no tocar los docs.
  - Register `brand` en `PRODUCT.md`, porque la superficie principal es la del cliente.
  - `DESIGN.md` se pospone hasta después del primer `craft` (`/impeccable document` sobre tokens reales).
  - `.impeccable/live/config.json` no se configuró: se configura solo la primera vez que se use `/impeccable live`.
- **Qué se hizo:**
  - SvelteKit 3 + TypeScript con el adapter de Vercel; `lang="es-MX"`.
  - `src/env.ts`, `src/lib/supabase.ts` y `.env.example`.
  - `PRODUCT.md`.
  - G2 y G3 cerrados en los docs.
- **Verificación:**
  - `npm run check` sin errores (0 errores, 0 avisos).
  - `npm run dev` con variables de ejemplo responde 200 en `/` con `lang="es-MX"`.
  - Sin probar: la conexión con la BD, porque falta el `.env`.
- **🐛 Encontrados y arreglados:** la trampa de las llaves en §7.4 hablaba de `$env/static/private` y del prefijo
  `PUBLIC_`, que ya no existen en SvelteKit 3. Se corrigió aquí, en `CONVENCIONES.md` y en el ADR 0001.
- **⚠️ Caveats:**
  - El MCP de Supabase no llega a la BD del compañero, así que las migraciones se corren en su SQL Editor.
  - Crear un proyecto nuevo de Supabase quedó bloqueado por permisos y ya no hace falta.
  - Docker está apagado, así que no hay Supabase local.

### 2026-11-03: Fase 0 cerrada (conexión con la BD)

- **Decisiones confirmadas con Fernando:** el `.env` con los datos de la BD del compañero ya está listo.
- **Qué se hizo:** el `.env` usaba `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Se ajustaron
  `src/env.ts`, `src/lib/supabase.ts` y `.env.example` a esos nombres, sin tocar el `.env`. También se actualizó la
  trampa de §7.4.
- **Verificación:**
  - `auth/v1/health` responde 200 con la llave.
  - Un `select` a `events` responde `PGRST205` (la tabla no existe): la API acepta la llave y el esquema llega en la
    Fase 1.
  - `npm run check` sin errores, y `npm run dev` con el `.env` real responde 200 en `/` sin errores en el log.
  - `.env` ignorado por git.
- **⚠️ Caveats:** la prueba se hizo con un script de Node que lee el `.env`, no desde una página de la app, porque
  todavía ninguna ruta usa Supabase. La primera ruta que lo use es la de la Fase 1.

### 2026-11-03: Fase 1, parte 1 (esquema, `reserve_spots()` y form action)

- **Decisiones confirmadas con Fernando:**
  - Las migraciones se aplican con **Drizzle** (lo pidió él), con la cadena del Session pooler en `DIRECT_URL`.
  - La secret key del proyecto va en el `.env`, solo para el smoke.
- **Decisiones técnicas (sin gate):**
  - Drizzle Kit solo corre SQL; la app sigue con `supabase-js` y no hay un esquema de Drizzle en TypeScript.
  - Se agregó la tabla `staff`: sin ella, cualquier cuenta de Supabase Auth podría leer los clientes.
  - Funciones `security definer` para el público (`events_with_availability()` y `reserve_spots()`); clientes y
    reservas, solo con RLS del equipo.
  - `reserve_spots()` bloquea la fila del evento (`for update`), así dos reservas al mismo tiempo se forman en fila.
  - Un cliente se reconoce por su WhatsApp normalizado a E.164 y no se le cambia el nombre.
  - El evento de ejemplo ("Noche de cata", sábado 7 de noviembre a las 20:00, $150 MXN, 35 lugares) es inventado
    para la demo y está marcado como tal.
- **Qué se hizo:**
  - `supabase/migrations/0000_reservas_con_cupo.sql` con su journal, `drizzle.config.ts` y `npm run db:migrate`.
  - `src/lib/events.ts`, `src/lib/phone.ts` y la form action en `src/routes/eventos/[id]/`, con una página provisional.
  - `scripts/smoke.mjs` y `npm run smoke`.
  - En los docs, `reservar()` pasó a llamarse `reserve_spots()`.
- **Verificación:**
  - Consultado en la BD: 4 tablas con RLS, 3 funciones `security definer`, 6 políticas, el evento de ejemplo y 1
    migración registrada por Drizzle.
  - `npm run smoke -- --app` con **14/14 PASS**: cupo, rechazo con los lugares que quedan, 10 reservas al mismo tiempo
    (3 entran, 7 se rechazan), RLS de lectura e inserción, cliente reutilizado, form action con 409 y 200, y
    limpieza.
  - Después del smoke, la BD quedó con 1 evento, 0 clientes y 0 reservas.
  - Normalización de teléfonos: 7/7 casos. `npm run check` sin errores; la página del evento responde 200 y la de un
    evento inexistente, 404.
- **🐛 Encontrados y arreglados:**
  - El SQL pegado en el SQL Editor no llegó a la BD; se migró con Drizzle.
  - Los imports `#lib/x` sin extensión no resolvían en `svelte-check`.
  - El smoke gastaba el último lugar antes de probar la form action y daba un falso FAIL; se reordenó.
- **⚠️ Caveats:**
  - La página de `/eventos/[id]` es provisional (sin diseño) y no se probó en el navegador; eso llega con la parte 2.
  - Las respuestas de error todavía son códigos (`no_capacity`, `invalid_phone`), sin la voz de BUNKER.
  - Falta crear la cuenta del equipo en `staff` (Fase 2).
