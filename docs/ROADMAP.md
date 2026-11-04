# Roadmap: Reto BUNKER

> Última actualización: 2026-11-03 · Fases **0 ✅** · **1 ⬅️** · Tiempo total: **60 min** · 🟢 G1, G2 y G3 cerrados

Cada fase es un bloque que se puede commitear, tiene un **bloque de tiempo** y un criterio de salida ("hecho
cuando"). La Fase 1 se entrega **por partes**: el agente se detiene después del esquema y `reservar()` para un
checkpoint corto con Fernando (`WORKFLOW.md § Modo hackatón`).

Marcas: ✅ hecha · ⬅️ en curso · 🔴 gate abierto · 🟢 gate cerrado · ⏸️ diferida

El orden de las fases 1 y 2 y la sección "Si sobra tiempo" los confirmó Fernando con G3 (2026-11-03).

## Fase 0: Fundación (min 0–10) ✅

- [x] 🟢 G2 y G3 confirmados con Fernando (2026-11-03, `CONTEXTO.md § 5`)
- [x] `git init` y `.gitignore` (rama `main`; las de feature se abren al empezar la Fase 1)
- [x] Scaffold con `npx sv create` (SvelteKit 3 + TypeScript) y `@sveltejs/adapter-vercel`
- [x] Cliente de Supabase (`src/lib/supabase.ts`) y `.env.example` con valores falsos. La BD es el proyecto de
  Supabase de un compañero (Fernando, 2026-11-03), no uno nuevo
- [x] `.env` con la URL y la llave publicable de esa BD (lo llenó Fernando) y prueba de conexión (2026-11-03)
- [x] `/impeccable init` corto → `PRODUCT.md`. `DESIGN.md` se genera con `/impeccable document` después del primer
  `craft` (modo hackatón: así sale de tokens reales y no de una semilla)
- [x] `AGENTS.md § 2`, `§ 4` y `§ 5` con las versiones y los comandos reales
- [x] Primer commit

**Hecho cuando:** `npm run dev` levanta, `npm run check` sale sin errores y la app conecta con Supabase.

## Fase 1: Reserva de eventos con cupo (min 10–40) ⬅️

### Parte 1: esquema y `reservar()` (min 10–25)

- [ ] Migración en `supabase/migrations/` con `events`, `customers` y `reservations` (`CONTEXTO.md § 4.1`) y RLS
  prendido con sus políticas
- [ ] Función `reservar()` que aparta lugares en una transacción y rechaza si no caben
- [ ] Un evento de ejemplo (cover y cupo de 35)
- [ ] Form action de SvelteKit que llama a `reservar()`

**Hecho cuando:** el smoke da `N/N PASS`: reservar baja los lugares que quedan, pasarse del cupo da error con los
lugares que quedan, y dos reservas al mismo tiempo no pasan de 35. Los datos `SMOKE` se borran. → **Checkpoint con
Fernando.**

### Parte 2: UI de la reserva (min 25–40)

- [ ] `/impeccable craft` de la lista de eventos con "quedan N de 35" y "agotado"
- [ ] Formulario: nombre, WhatsApp y número de personas, con el error de cupo en la voz de BUNKER
- [ ] Confirmación con el resumen, el total del cover (personas × cover) y el link de pago según G2
- [ ] Aviso de privacidad de ejemplo, marcado como tal

**Hecho cuando:** en el navegador, en vista móvil (375 × 812), se reserva de punta a punta, los lugares bajan y un
evento lleno se ve como agotado. Ningún error en la consola.

## Fase 2: Panel del equipo (min 40–50)

- [ ] Acceso con Supabase Auth (una cuenta de prueba)
- [ ] Reservas por evento, con los lugares ocupados y los que quedan
- [ ] Botón de marcar pagada

**Hecho cuando:** una reserva hecha en la Fase 1 aparece en el panel, marcarla pagada cambia su estado y un visitante
sin sesión no puede ver el panel ni leer clientes (probado por HTTP).

## Fase 3: Demo (min 50–60)

- [ ] Deploy a Vercel (**con el OK de Fernando**) con las variables de entorno
- [ ] Smoke contra la URL desplegada; borrar los datos `SMOKE`
- [ ] Guion de la demo en tres pasos: el cliente reserva, el evento se llena, el equipo marca pagada
- [ ] Bitácora de `AGENTS.md § 8` y estas casillas al día

**Hecho cuando:** la demo corre en la URL pública desde un celular y el guion se ensayó una vez.

## Si sobra tiempo

Lo primero que se recorta si no alcanza (`WORKFLOW.md § Modo hackatón`):

- [ ] FAQ: "¿dónde estamos?" y "¿cómo reservo?", con el tono de BUNKER (la ubicación real depende de `CONTEXTO.md § 5`)
- [ ] Exportar la base de clientes a CSV desde el panel
- [ ] `/impeccable critique` de la pantalla de reserva

## ⏸️ Diferido (fuera del PoC)

- Menú de cervezas y Excel en línea para proveedores (falta saber quién lo usa, `CONTEXTO.md § 5`)
- Integración con Soft Restaurant (menú de comidas)
- Mensajes automáticos por WhatsApp (confirmación y recordatorio)
- Pago real del cover con la fintech de BUNKER
- Migración de datos desde Riservi

**Recortado (no se hace):** mapa de mesas o elección de un lugar específico (Fernando, 2026-11-03).

## Cómo deben proceder los próximos agentes

1. Lee `AGENTS.md` completo (reglas y §8 estado actual) y este roadmap.
2. Revisa los gates de la fase que vas a tocar. Si hay un 🔴 abierto, esa parte no se empieza.
3. Trabaja la fase en orden y cuida su bloque de tiempo. Al terminar, actualiza las casillas de aquí, la bitácora de
   `AGENTS.md §8` (qué se hizo, archivos, decisiones, verificación) y el doc que corresponda si tocaste el modelo o la
   arquitectura.
4. Si tienes una duda funcional, anótala en `CONTEXTO.md` § Preguntas abiertas; no inventes requisitos.
