#!/bin/sh
# Despliega la demo de BUNKER en Vercel (Fase 3). Uso:
#   sh scripts/deploy-vercel.sh
# Requisitos: haber entrado con `npx vercel@65.11.0 login` y tener el .env con las variables públicas.
#
# A Vercel solo suben PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_PUBLISHABLE_KEY. La secret key, la cadena de la BD y la
# cuenta de prueba no salen de esta máquina: el .env no se sube (.vercelignore) y aquí no se leen.
# Es repetible: si el proyecto o las variables ya existen, los reutiliza.
set -eu
cd "$(dirname "$0")/.."

VERCEL="npx --yes vercel@65.11.0"
SCOPE="kuchen-dev-ops"
PROJECT="bunker-reservas"
VARS="PUBLIC_SUPABASE_URL PUBLIC_SUPABASE_PUBLISHABLE_KEY"

# 0. Que existan las variables públicas en el .env (no se imprimen).
for NAME in $VARS; do
	node -e "process.loadEnvFile('.env'); if (!process.env['$NAME']) { console.error('Falta $NAME en .env'); process.exit(1) }"
done

# 1. Proyecto en el equipo KuchenDevOps y enlace de esta carpeta (.vercel/ no se versiona).
echo "1/3 · Proyecto $PROJECT"
$VERCEL project add "$PROJECT" --scope "$SCOPE" >/dev/null 2>&1 || echo "    ya existía, se reutiliza"
$VERCEL link --yes --project "$PROJECT" --scope "$SCOPE"

# 2. Variables públicas en producción: se leen del .env y se pasan por stdin, sin mostrarlas.
echo "2/3 · Variables públicas en producción"
for NAME in $VARS; do
	$VERCEL env rm "$NAME" production --yes --scope "$SCOPE" >/dev/null 2>&1 || true
	node -e "process.loadEnvFile('.env'); process.stdout.write(process.env['$NAME'])" |
		$VERCEL env add "$NAME" production --scope "$SCOPE"
done

# 3. Despliegue a producción: Vercel instala y compila por su cuenta (adapter-vercel).
echo "3/3 · Despliegue a producción"
$VERCEL deploy --prod --yes --scope "$SCOPE"
