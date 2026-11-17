# Reto BUNKER: reservas de eventos

> Creado: 2026-11-03 · Estado: ⬅️ Fase 0 · Hackatón para pymes, 1 hora para una demo funcional

Un sistema para que BUNKER, un bar escondido de cerveza artesanal, reciba reservas para sus eventos con cupo
(35 lugares) y empiece a tener una base de datos de sus clientes.

- **Agentes y desarrolladores:** el manual operativo está en [`AGENTS.md`](AGENTS.md).
- **Contexto y decisiones:** [`docs/CONTEXTO.md`](docs/CONTEXTO.md).
- **Fases y avance:** [`docs/ROADMAP.md`](docs/ROADMAP.md).
- **Repositorio:** [ningunFernando/Bunker-Reservas](https://github.com/ningunFernando/Bunker-Reservas) (público).

## Arrancar

```bash
git clone https://github.com/ningunFernando/Bunker-Reservas.git && cd Bunker-Reservas
npm install
cp .env.example .env   # y pon la URL y la llave publicable de Supabase
npm run dev
```

El resto de los comandos está en `AGENTS.md § 5`.

| | Dirección (en local) |
|---|---|
| **Pública** (los clientes reservan) | http://localhost:5173/ |
| **Privada** (panel del equipo) | http://localhost:5173/panel/entrar · cuenta de prueba en tu `.env` (`STAFF_TEST_EMAIL` / `STAFF_TEST_PASSWORD`) |

## Guion de la demo

1. **El cliente reserva.** En la página pública abre "Noche de cata", escribe nombre, Instagram y WhatsApp, elige
   cuántos van y aparta: ve cuántos lugares quedan, el total del cover y el botón de pago (de ejemplo).
2. **El cupo se respeta.** Pide más lugares de los que quedan: BUNKER le dice cuántos sí caben. Cuando se llena, el
   evento sale con el sello "LLENO".
3. **El equipo cobra.** En el panel, el equipo ve la reserva con su Instagram y su WhatsApp y la marca como pagada.

Las reservas de la demo son reales en la BD: al terminar, bórralas (o úsalas con nombres que empiecen con `SMOKE` y
corre `npm run smoke`, que limpia todo lo `SMOKE`).
