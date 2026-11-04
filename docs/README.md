# Documentación del Reto BUNKER

> Última actualización: 2026-11-03

Índice de todo lo que un agente (o una persona) necesita para trabajar aquí.

| Documento | Para qué |
|---|---|
| [`../AGENTS.md`](../AGENTS.md) | El manual operativo: reglas, stack, comandos y **estado actual con su bitácora**. Se lee primero, siempre. |
| [`CONVENCIONES-AGENTE.md`](CONVENCIONES-AGENTE.md) | Los acuerdos humano ↔ agente: la firma `Fernando 😊`, gates, entregas por partes, smoke tests y el modo hackatón. |
| [`WORKFLOW.md`](WORKFLOW.md) | El workflow de 7 pasos en detalle, con su "hecho cuando", y la sección **Modo hackatón**. |
| [`CONVENCIONES.md`](CONVENCIONES.md) | Nombres, estructura, encabezados, git, idioma, secretos, marcas de estado, dinero, fechas y datos personales. |
| [`CONTEXTO.md`](CONTEXTO.md) | El problema, los usuarios, las restricciones, la decisión de arquitectura, el modelo de datos propuesto, las **preguntas abiertas** y el glosario. |
| [`ROADMAP.md`](ROADMAP.md) | Las fases con bloques de tiempo, casillas, gates y "hecho cuando". |
| [`decisions/`](decisions/) | Las decisiones del proyecto en formato ADR (`0000-plantilla.md` es la plantilla). |
| [`referencias/`](referencias/) | Las notas originales de la presentación del reto: la fuente de verdad. |
| `../PRODUCT.md` · `../DESIGN.md` | El contexto de producto (existe desde el 2026-11-03) y el sistema visual (se genera con `/impeccable document` después del primer `craft`). |

## Orden de lectura para un agente nuevo

1. `AGENTS.md`, completo, con el §8 Estado actual.
2. `docs/CONVENCIONES-AGENTE.md`
3. `docs/WORKFLOW.md`, incluido el modo hackatón.
4. `docs/CONTEXTO.md` (sobre todo § 5 Preguntas abiertas) y `docs/ROADMAP.md`.
5. Si la tarea toca UI: `PRODUCT.md`, `DESIGN.md` y `AGENTS.md § 7.2`.

## Origen

Esta base se armó el 2026-11-03 con la plantilla de proyectos del workspace `NonTaggedStuff`
(`docs/templates/` y sus reglas globales), igual que `360WebVirtualViewer`. Como el proyecto vive fuera de ese
workspace, las reglas generales se copiaron aquí:

| Aquí | Viene de `NonTaggedStuff/` |
|---|---|
| `AGENTS.md § 0` y `§ 7.1` | `AGENTS.md § 1` y `§ 4` |
| `docs/CONVENCIONES-AGENTE.md` | `docs/convenciones-agente.md`, más el modo hackatón |
| `docs/WORKFLOW.md` | `docs/workflow.md` (sin quick tasks ni `scripts/new.sh`), más el modo hackatón |
| `docs/CONVENCIONES.md` | `docs/conventions.md` y las marcas de `AGENTS.md § 5` |
| `docs/CONTEXTO.md`, `docs/ROADMAP.md`, `docs/decisions/0000-plantilla.md` | `docs/templates/` |

La bitácora de este proyecto vive al final de `AGENTS.md § 8`; no hay un `log.md` aparte.
