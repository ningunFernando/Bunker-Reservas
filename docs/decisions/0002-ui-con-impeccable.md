# 0002 — La UI se diseña con la skill impeccable

- **Fecha:** 2026-11-03
- **Estado:** aceptada (la pidió Fernando al crear el proyecto)

## Contexto

BUNKER pidió que reservar un evento sea fácil, **con un tono cercano y sin perder el misterio del lugar**. Eso es
sobre todo un problema de diseño y de voz, y en una hora no hay tiempo de iterar a ojo. Sin un proceso común, cada
agente diseña a su criterio y la UI termina genérica, justo lo contrario de un lugar con misterio.

## Opciones consideradas

1. **Skill `impeccable`:** un proceso fijo (`init` → `shape` → `craft` → `critique` / `audit` → `polish`) con
   contexto de producto y sistema visual en `PRODUCT.md` y `DESIGN.md`. Contra: el flujo completo no cabe en una hora,
   y los agentes que no tienen la skill no lo pueden seguir.
2. **Cada agente diseña a su criterio:** sin costo de proceso, pero sin consistencia ni voz de marca.
3. **Solo una librería de componentes**, sin proceso de diseño: da piezas consistentes, no el tono que piden.

## Decisión

Se usa **`impeccable`** para toda la UI, en **modo hackatón** (`AGENTS.md § 7.2`):

- `/impeccable init` corto en la Fase 0, con las respuestas de Fernando, para crear `PRODUCT.md` y `DESIGN.md`.
- `craft` directo para cada pantalla; `shape` solo si la pantalla no está clara.
- `critique`, `audit` y `polish` solo si sobra tiempo al final.
- Register `brand` para lo que ve el cliente y `product` para `/panel`.

## Consecuencias

- `PRODUCT.md` y `DESIGN.md` se vuelven la fuente de verdad de diseño, por debajo de las referencias de Fernando en
  `docs/referencias/`.
- Saltarse `critique` y `audit` deja deuda de diseño posible; lo que no se revisó se anota en `AGENTS.md § 8`.
- Los agentes sin la skill respetan esos dos archivos y avisan a Fernando antes de diseñar UI nueva.
