# 0001 — Stack: SvelteKit + Supabase en Vercel

- **Fecha:** 2026-11-03
- **Estado:** aceptada (G1, la confirmó Fernando al crear el proyecto)

## Contexto

Hay **1 hora** para una demo funcional de reservas de eventos con cupo para BUNKER. Hace falta una UI pública para el
celular, lógica de servidor que garantice el cupo de 35 personas, una base de datos de clientes y un panel con acceso
para el equipo. Cualquier pieza extra que haya que levantar o desplegar se come el tiempo de la demo.

Fernando eligió primero Next.js + Supabase y luego pidió "que el stack sea Next y Svelte". Next.js y Svelte son dos
frameworks de frontend distintos; se le preguntó cómo combinarlos y eligió SvelteKit + Supabase.

## Opciones consideradas

1. **SvelteKit + Supabase en Vercel**: Svelte para la UI y SvelteKit para el servidor (form actions), en una sola app.
   Supabase da Postgres, RLS y Auth. Contra: la seguridad depende de escribir bien las políticas de RLS.
2. **Next.js + Supabase**: equivalente en piezas, pero Fernando prefirió Svelte.
3. **Next.js (solo API) + Svelte con Vite (UI)**: dos apps que levantar, conectar (CORS, URLs) y desplegar. No cabe en
   una hora.
4. **Sitio estático + Google Sheets**: rápido, pero el cupo sería frágil con dos reservas al mismo tiempo y no habría
   una base de clientes de verdad.

## Decisión

Se usa **SvelteKit + TypeScript con Supabase (Postgres y Auth), desplegado en Vercel** con
`@sveltejs/adapter-vercel`. **Next.js no se usa.** El cupo se garantiza en Postgres con una función `reservar()` que
revisa y aparta los lugares en una sola transacción.

## Consecuencias

- Una sola app y un solo deploy; el acceso del equipo ya viene con Supabase Auth.
- Las llaves privadas de Supabase viven solo en el servidor (`$app/env/private` en SvelteKit 3); la llave publicable es pública y
  RLS es obligatorio en todas las tablas (`AGENTS.md § 7.4`).
- Crear el proyecto de Supabase y el de Vercel son pasos externos que se confirman con Fernando.
- Las versiones se fijan con el lockfile al hacer el scaffold (Fase 0).
