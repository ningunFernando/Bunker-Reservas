# Convenciones de colaboración humano ↔ agente

> Última actualización: 2026-11-03 · Origen: `NonTaggedStuff/docs/convenciones-agente.md` (2026-10-19)

Estos acuerdos aplican a **todo** el proyecto. Se pueden agregar acuerdos en la § 4, pero no quitar estos sin
decirlo.

## 1. Acuse de terminado: `Fernando 😊`

Al terminar cada componente o función importante, el agente **cierra su reporte con la firma
`Fernando 😊`**.

**Para qué sirve:** indica que el agente llegó al **final real** del trabajo que reporta (no lo dejó a
medias) y que leyó estas convenciones. **Si un reporte no trae la firma, Fernando da por hecho que
el trabajo quedó incompleto.**

- No se firma un reporte con trabajo a medias, verificación fallida o pasos saltados sin avisar.
- Un reporte intermedio (por ejemplo, la parte 1 de una entrega por partes) se firma solo si esa parte está
  terminada y verificada.

## 2. Acuerdos vigentes

- **Todo en español (es-MX).** Commits en **Conventional Commits** (ver `CONVENCIONES.md § Git`).
- **Los 🔴 gates se respetan:** si una decisión está marcada como gate (stack, cobro, alcance, datos del
  cliente), **se pregunta antes y no se asume**. Un gate abierto bloquea esa parte del trabajo, no el resto.
- **No se inventan especificaciones.** Una duda funcional va a `CONTEXTO.md § 5 Preguntas abiertas` y se le
  pregunta a Fernando.
- **Los docs obsoletos no se borran.** Se marcan en el encabezado con
  `⚠️ DESACTUALIZADO — ver X`.
- **Los docs se mantienen sincronizados:** si cambia el stack, la arquitectura o el esquema de la BD,
  se actualizan `AGENTS.md` y el doc que corresponda en el mismo cambio.

## 3. Acuerdos generales (vienen de condo-sync-2.0, vía NonTaggedStuff)

- **Entregas por partes en fases grandes.** Si una fase trae esquema, lógica del servidor y UI, el agente se
  detiene después del esquema y la lógica para que Fernando revise, y solo entonces sigue con la UI.
  **Cada parte lleva su commit.** En el hackatón, la revisión es un checkpoint corto (ver § 4).
- **Verificación E2E real, no solo typecheck.** Antes de dar una fase por hecha: un smoke test
  (HTTP, CLI o lo que aplique) contra el sistema corriendo con datos de prueba, más una prueba en el navegador de
  los flujos que toca. El script de smoke **se borra al terminar** si trae credenciales de prueba, y **limpia
  sus propios datos** (después se comprueba que todo quedó igual que antes).
- **El mockup manda sobre la intuición.** Si existe un mockup o un archivo de referencia, se calibra
  contra él antes de diseñar. Si es ambiguo, se pregunta en vez de elegir una lectura.
- **Fórmulas y reglas se leen de la fuente, no se infieren.** Si Fernando mandó un XLSX, PDF o documento, sale
  de ahí y se verifica con un caso real (al centavo, si hay dinero de por medio, como el cover).

## 4. Acuerdos agregados sobre la marcha

<!-- Formato: - **AAAA-MM-DD — Título.** Qué se acordó y por qué. -->

- **2026-11-03 — Base desde NonTaggedStuff.** El proyecto arranca con la plantilla y las reglas del workspace
  `NonTaggedStuff`, copiadas para que funcione solo (ver `README.md § Origen`).
- **2026-11-03 — UI con la skill `impeccable`.** Toda la UI se diseña y construye con `/impeccable`; el flujo está en
  `AGENTS.md § 7.2` y la decisión en `decisions/0002-ui-con-impeccable.md`.
- **2026-11-03 — Modo hackatón.** Hay 1 hora para una demo funcional, así que:
  - las entregas por partes se vuelven **checkpoints cortos**: el agente muestra el smoke y Fernando dice "sigue";
  - con `impeccable` basta un `init` corto y un `craft` directo; `critique` solo si sobra tiempo;
  - la verificación mínima es un **smoke del camino feliz** (incluido pasarse del cupo) más una **prueba en el
    navegador en vista móvil**; lo que no se verificó se dice;
  - la firma `Fernando 😊` no cambia: no se firma lo que quedó a medias.

  El detalle está en `WORKFLOW.md § Modo hackatón`.
