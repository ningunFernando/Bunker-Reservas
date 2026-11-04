# Workflow de agentes

> Última actualización: 2026-11-03 · Origen: `NonTaggedStuff/docs/workflow.md` (2026-10-19), sin quick tasks ni
> `scripts/new.sh`, más la sección "Modo hackatón"

Todo trabajo, por pequeño que sea, pasa por estos 7 pasos. En las tareas triviales algunos pasos
duran segundos, pero no se saltan. **En el hackatón, lee también la sección [Modo hackatón](#modo-hackatón).**

---

## 1. Entender

- Escribe el objetivo en **una línea**: *"Quiero X para que Y."*
- Ubica la fase del `ROADMAP.md` que vas a tocar y su **bloque de tiempo**.
- **Revisa los gates** (🔴) del ROADMAP y de `AGENTS.md`. Si la tarea toca un gate abierto, esa parte **no se
  empieza**: pregunta.
- **¿Preguntar o decidir?**
  - Pregunta si la respuesta cambia de forma importante lo que vas a construir y no se puede deducir.
  - Si es una **especificación funcional** (cómo debe comportarse el negocio), **no la inventes**:
    anótala en `CONTEXTO.md § 5 Preguntas abiertas` y pregunta.
  - Si es un detalle técnico con un default razonable, úsalo y menciónalo en el reporte final.
  - Junta todas las dudas en una sola pregunta; no interrumpas varias veces.

**Hecho cuando:** sabes qué entregar, qué gates aplican y cómo vas a saber que funciona.

## 2. Explorar

- Lee el `AGENTS.md`, el README y el ROADMAP, **incluido el estado actual** (`AGENTS.md § 8`).
- Busca si ya existe algo parecido en `src/` o `supabase/` (`ls`, `grep`). Reutiliza antes de crear.
- Revisa las últimas entradas de la bitácora (al final de `AGENTS.md § 8`): ahí están los ⚠️ caveats.
- Si hay **referencias** (las notas del reto, mockups o archivos de Fernando en `docs/referencias/`), léelas ahora.

**Hecho cuando:** conoces lo que existe, sus trampas, y no vas a duplicarlo.

## 3. Planificar

- Escribe una lista de pasos corta, en orden, cada uno verificable, con un **"hecho cuando"** explícito.
- **Fases grandes van por partes.** Si hay esquema, lógica del servidor y UI, la parte 1 es el esquema y la lógica;
  ahí te detienes para que Fernando revise. La parte 2 es la UI.
- Anota las **decisiones de diseño** (librería, estructura, formato) con su porqué: en el ROADMAP o la
  bitácora, o como ADR en `docs/decisions/` si cambian la arquitectura.
- Si el plan tiene más de ~5 pasos o toca varios archivos importantes, compártelo antes de ejecutar.

**Hecho cuando:** cualquier otro agente podría continuar leyendo tu plan.

## 4. Ejecutar

- Avanza un paso a la vez y verifica cada uno antes del siguiente.
- **Un commit por parte** (Conventional Commits, en español).
- Mantén el estilo existente. No metas cambios que no se pidieron.
- Si descubres algo fuera de alcance (un bug, una mejora), **anótalo** en `AGENTS.md § 8`; no lo arregles de paso.
- **Calibra contra la referencia:** si hay mockup, la UI se parece al mockup; si hay un dato de Fernando (cupo, cover),
  los números cuadran con él.

**Hecho cuando:** todos los pasos de la parte actual están implementados.

## 5. Verificar

**La regla: verificación E2E real, no solo typecheck.** Elige la verificación más fuerte que aplique:

| Tipo de entrega | Verificación mínima |
|---|---|
| Script / CLI | Ejecutarlo con un input real y revisar el output |
| Librería / lógica | Tests, o al menos una ejecución con un caso real conocido |
| API / backend | **Smoke test por HTTP** contra el dev server con datos de prueba |
| App web / UI | Levantarla y **probar en el navegador** los flujos que toca |
| Datos / dinero | Cuadrar contra la fuente con un caso real, **al centavo** (personas × cover) |
| Migración / config | **Consultar que el cambio ocurrió** (no confiar en el exit code) |
| Documento generado | Abrir el archivo y revisarlo |

**Reglas del smoke test:**
- Cuenta los casos y repórtalos como `N/N PASS`.
- **Limpia sus propios datos** (márcalos con el prefijo `SMOKE`) y comprueba que el sistema quedó
  igual que antes.
- **El script se borra al terminar** si trae credenciales de prueba.
- Si el smoke encuentra un bug, se arregla, se anota como 🐛 en la bitácora y se vuelve a correr completo.

**Verifica en caliente, no por lectura:** las herramientas a veces fallan en silencio (p. ej. una migración
que "se aplicó" pero no hizo nada, o una política de RLS que deja leer todo). Mira el efecto real.

Si algo **no** se pudo verificar, dilo explícitamente. Nunca reportes "debería funcionar" como si fuera
"funciona".

**Hecho cuando:** viste el resultado funcionando (output, `N/N PASS`, navegador).

## 6. Documentar

- Actualiza `AGENTS.md § 8` (estado actual): estado, cómo ejecutar, pendientes.
- Marca las casillas del `ROADMAP.md` y actualiza su encabezado (`Última actualización` y las marcas de fase).
- En la **bitácora** (al final de `AGENTS.md § 8`) anota las decisiones confirmadas con Fernando,
  qué se verificó y cómo, los 🐛 encontrados y los ⚠️ caveats aprendidos. No hay un `log` aparte.
- Si cambió el stack, la arquitectura o el esquema, actualiza el doc correspondiente **en el mismo cambio**.
- Los docs que quedaron viejos se marcan `⚠️ DESACTUALIZADO — ver X`; no se borran.

**Hecho cuando:** alguien sin contexto puede retomar el trabajo leyendo solo los docs.

## 7. Reportar

Mensaje final al usuario con tres bloques, en este orden:

1. **Qué cambió:** los archivos y carpetas clave, con enlaces.
2. **Cómo se verificó:** el comando, `N/N PASS`, la prueba en navegador o la evidencia.
3. **Qué falta / riesgos:** pendientes, supuestos, gates abiertos, lo que no se verificó.

Corto, sin repetir el plan entero. **Última línea: `Fernando 😊`**, solo si el trabajo reportado está
terminado y verificado (ver `CONVENCIONES-AGENTE.md § 1`).

---

## Modo hackatón

Acordado el 2026-11-03 (`CONVENCIONES-AGENTE.md § 4`). Hay **1 hora** para una demo funcional; los 7 pasos no se
saltan, pero se hacen en minutos.

- **El reloj manda.** Cada fase tiene un bloque de tiempo en el `ROADMAP.md`. Si una fase se pasa más de 5 minutos,
  avisa a Fernando y propón qué recortar; no recortes en silencio.
- **Una sola ronda de preguntas** por fase, con un default propuesto para cada una.
- **Checkpoints en vez de revisiones largas:** al terminar la parte 1 de la Fase 1 (esquema y `reserve_spots()`), te
  detienes, muestras el smoke y esperas el "sigue" de Fernando.
- **Verificación mínima:** el smoke del camino feliz (reservar, ver que bajan los lugares e intentar pasarse del
  cupo) más una prueba en el navegador en vista móvil (375 × 812). Lo que no se verificó se dice.
- **`impeccable` en corto:** `init` corto en la Fase 0 y `craft` directo por pantalla; `critique` solo si sobra
  tiempo (`AGENTS.md § 7.2`).
- **La bitácora no se salta:** de 3 a 5 líneas al cerrar cada fase.
- **Lo primero que se recorta** si no alcanza el tiempo es lo de "Si sobra tiempo" en el ROADMAP; el núcleo (reservar
  con cupo) no se recorta.

## Trabajo con varios agentes

- Un agente trabaja en una sola área a la vez. Dos agentes no editan los mismos archivos en paralelo.
- Antes de tocar un área, revisa en la bitácora de `AGENTS.md § 8` si otro agente la dejó "en progreso".
- Si dejas algo a medias, márcalo como `en progreso` en la bitácora con el siguiente paso explícito, y **no firmes**.
