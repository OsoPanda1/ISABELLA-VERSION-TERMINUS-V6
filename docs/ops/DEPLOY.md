---
state: draft
date: 2026-10-27
---
# Despliegue — Isabella TERMINUS V6

Guía operativa verificada contra el repo el 2026-10-27. Lo que no se pudo probar sin infraestructura real está marcado **[NO PROBADO]**.

## 0. Antes de cualquier despliegue
1. `pnpm install --frozen-lockfile && pnpm typecheck && pnpm test && pnpm build` en CI limpio (el build ejecuta ui-smoke, runtime-smoke y security-suite).
2. `pnpm deploy:readiness path/al/.env.production` — falla (exit 1) si falta `BOOKPI_INTEGRITY_SECRET`, la base de datos, tokens admin válidos, etc. Nunca imprime valores.
3. Migraciones: `scripts/migrate.sh migrate` aplica `scripts/schema.sql` + `infra/db/migrations/001..005` (BookPI, RLS comercial, idempotencia de webhooks, `commerce_subscriptions`). `docker-compose.yml` las aplica solo en el primer arranque de Postgres. Supabase (Atlas/IKES): `supabase/migrations/*` por el flujo de migraciones del proyecto.

## 1. Camino A — contenedor (compose / k8s)
- El workflow `Deploy Production Ω` (tras CI verde, gate de evidencia y aprobación del entorno `production`) publica `ghcr.io/<owner>/isabella-terminus-v6:<sha>` y `:production`.
- Compose: crear `.env` con `DATABASE_URL` (no va en el compose) y `secrets/db_password.txt`; `docker compose up -d`. **[NO PROBADO en Docker real]**
- k8s: `k8s/deployment.yaml` debe apuntar al digest/tag publicado (`kustomize edit set image`); hoy el test lo marca `BLOCKED_ENVIRONMENT` hasta fijar un digest real. Secretos con SealedSecrets (plantilla en `k8s/sealed-secret-example.yaml`).
- Salud: liveness `/health`, readiness `/api/v1/health`, profunda (admin) `/api/v1/healthz`, `/api/v1/readyz`.

## 2. Camino B — Vercel
- Secretos del entorno `production` en GitHub: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. Sin ellos el job lo declara en el resumen y no despliega.
- Variables de la app en el proyecto Vercel (mismas que `.env.example`). En serverless `ISABELLA_API_KEY_STORE=memory` y `ISABELLA_FEDERATION_STORE=memory` pierden estado en cada cold start: usar Postgres para producción real.
- El job corre `pnpm run smoke:production` contra la URL desplegada y falla si algún check falla.

## 3. Verificación post-despliegue
`SMOKE_BASE_URL=https://host pnpm run smoke:production` · `GET /api/v1/readyz` (503 = dependencia degradada, no ocultarlo).

## 4. Rollback
Contenedor: redeploy del tag `<sha>` anterior (las imágenes por SHA no se sobrescriben). Vercel: `vercel rollback`. Base de datos: las migraciones son aditivas (`IF NOT EXISTS`); el rollback de datos es manual con backup (`scripts/backup.sh`, `scripts/rollback.sh`).

## 5. Bloqueos que ningún cambio de código resuelve
Ejecutar CI real sobre el SHA candidato; secretos reales; base Postgres con TLS; probar `readyz` en verde; E2E con proveedor de inferencia autorizado; latencia p50/p95 medida; Stripe en modo test de punta a punta; prueba de backup/restore y rollback en el entorno destino.
