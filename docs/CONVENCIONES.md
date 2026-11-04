# Convenciones

> Última actualización: 2026-11-03 · Origen: `NonTaggedStuff/docs/conventions.md` (2026-10-19)

## Idioma

- Documentación, README, bitácora, mensajes al usuario y textos de UI: **español (es-MX)**.
- Código e identificadores (variables, funciones, tablas y columnas de la BD): **inglés**.
- Mensajes de error que ve el cliente o el equipo de BUNKER: español, con la voz de BUNKER.

## Nombres

| Qué | Formato | Ejemplo |
|---|---|---|
| Docs del proyecto | `MAYUSCULAS.md` | `docs/CONTEXTO.md`, `docs/ROADMAP.md` |
| ADR | `NNNN-titulo-kebab.md` | `docs/decisions/0001-stack-sveltekit-supabase.md` |
| Rutas, carpetas y archivos de código | `kebab-case` | `src/routes/eventos/[id]/`, `capacity.ts` |
| Tablas y columnas | `snake_case`, tablas en plural | `reservations.party_size` |
| Migraciones | Drizzle: `NNNN_slug.sql` más su entrada en `meta/_journal.json` | `supabase/migrations/0000_reservas_con_cupo.sql` |
| Ramas | `feature/<nombre-kebab>` | `feature/reserva-con-cupo` |

Las fechas de los docs van siempre en ISO `AAAA-MM-DD`.

## Estructura mínima

```
Hackaton2/
  AGENTS.md      ← manual operativo: resumen, stack, comandos, reglas, ESTADO ACTUAL + bitácora
  CLAUDE.md      ← puente (@AGENTS.md)
  PRODUCT.md     ← contexto de producto para impeccable (lo crea /impeccable init)
  DESIGN.md      ← sistema visual para impeccable (lo crea /impeccable init)
  README.md      ← portada corta: qué es y cómo arrancarlo
  docs/
    CONTEXTO.md  ← problema, usuarios, restricciones, decisión de arquitectura, modelo,
                   preguntas abiertas, glosario
    ROADMAP.md   ← fases con bloques de tiempo, casillas, gates y "hecho cuando"
    decisions/   ← ADRs del proyecto
    referencias/ ← notas y archivos originales de Fernando (fuente de verdad)
  supabase/      ← migraciones de la BD
  src/ ...       ← app de SvelteKit
```

⚠️ Si `referencias/` llega a traer **datos personales reales** (clientes de BUNKER), el repo debe ser **privado**, y
eso se anota en `AGENTS.md`.

## Encabezado de los docs

Todo doc vivo empieza con:

```
> Última actualización: AAAA-MM-DD · Estado: <resumen de una línea con marcas ✅ ⬅️ 🔴 ⏸️>
```

Un doc obsoleto **no se borra**; su encabezado cambia a:

```
> ⚠️ DESACTUALIZADO — ver <doc que lo reemplaza>
```

## Marcas de estado

Las mismas en todos los docs:

| Marca | Significa |
|---|---|
| ✅ | Hecho y verificado |
| ⬅️ | En curso |
| 🔴 | Gate o bloqueante: se pregunta antes de seguir |
| 🟡 | Duda o pendiente menor que no bloquea |
| 🟢 | Gate cerrado / sin gates |
| ⏸️ | Diferido (no cancelado) |
| ⚠️ | Caveat o trampa conocida |
| 🐛 | Bug encontrado (anotar dónde y cómo se arregló) |

## Git

- El proyecto tendrá su propio repo (pendiente: `git init` en la Fase 0). Ramas: `main` ← `development` ←
  `feature/<nombre>`.
- **Conventional Commits, con la descripción en español**:
  `feat(reservas): apartar lugares sin pasar del cupo` ·
  `fix(panel): la reserva pagada ya cambia de estado` · `docs: …` · `chore: …` · `refactor: …`.
  El scope es el módulo (`reservas`, `eventos`, `panel`, `bd`…); la descripción dice el *qué* desde el punto de
  vista del usuario.
- Haz un commit por parte entregada. Nunca `push`, `force` ni reescritura del historial sin confirmación.

## Secretos y archivos ignorados

- Los secretos van solo en `.env` (ignorado). Commitea `.env.example` con valores falsos.
- Las variables se declaran en `src/env.ts` (SvelteKit 3). **La `service_role` key de Supabase se queda solo en el
  servidor**: se declara sin `public` y se lee de `$app/env/private`. La llave publicable sí es pública: la seguridad
  la dan las políticas de RLS.
- Los temporales van en `tmp/` o `scratch/` (los ignora `.gitignore`).
- `.impeccable/hook.cache.json` es caché local de la skill y no se versiona.
- Nunca pegues tokens, contraseñas ni datos personales en docs o en la bitácora.

## Dinero, fechas y teléfonos

- **Dinero en centavos** (enteros) y en MXN: `cover_cents = 15000` se muestra como `$150.00 MXN`. Nada de `float`.
- El total de una reserva es `personas × cover`; se calcula en el servidor, no en el navegador.
- **Fechas en `timestamptz`**; se muestran en `America/Mexico_City` con formato es-MX ("sáb 8 nov, 20:00").
- **Teléfonos en E.164** (`+525512345678`); se normalizan antes de guardar o buscar a un cliente.

## Datos personales y de prueba

- Los datos de prueba llevan el prefijo `SMOKE` (en el nombre del cliente o del evento) y se borran al terminar.
- Los datos reales de clientes de BUNKER no entran al repo, ni en fixtures ni en capturas.
- Si la app guarda datos personales, enlaza un aviso de privacidad (en el PoC, un texto de ejemplo marcado como tal).

## Dependencias

- Prefiere la librería estándar y las herramientas que ya están instaladas.
- Toda dependencia nueva se justifica en una línea en `AGENTS.md § 2`.
- Las versiones se fijan con lockfile.
