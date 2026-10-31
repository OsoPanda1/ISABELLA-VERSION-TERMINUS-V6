# RFC-0005 — Persistencia e integridad

**Estado:** `draft | engine-generated`

## Requisitos
- Postgres durable para BookPI y suscripciones.
- `BOOKPI_INTEGRITY_SECRET` obligatorio y fuerte.
- Aplicar migraciones `supabase/migrations` y `infra/db/migrations`.
- Supabase Atlas/IKES requiere URL + service role + anon/publishable key.
- IKES fail-closed en lectura/escritura.
- BookPI Postgres append transaccional y actor-scoped.
- Ledger legacy sigue separado (no unificado aún).
- Sin DB, estado degradado explícito, no datos simulados.

## Estado observado de la base de producción (2026-10-31)

Medición local contra el `DATABASE_URL` de producción (Neon Postgres 18.6, base
`neondb`, pooler en `us-east-1`): `select 1` respondió en 953 ms. La conexión
usa `sslmode=require`; `pg` advierte que hoy lo trata como `verify-full` y que
esa semántica cambiará en la próxima versión mayor, por lo que la configuración
correcta a futuro es `sslmode=verify-full` explícito.

Migraciones aplicadas y verificadas en esa base:

| Migración | Tablas verificadas |
|---|---|
| `supabase/migrations/20261030000000_isabella_api_keys.sql` | `isabella_api_keys` |
| `supabase/migrations/20261030000001_isabella_federation.sql` | `federation_connectors`, `federation_inbox` |

Migraciones **no** aplicadas, con razón explícita:

- `supabase/migrations/20261017000000_atlas-store-core.sql` y
  `20261017000001_ikes-memory.sql`: hacen `grant ... to service_role`, un rol de
  Supabase que no existe en la base Neon de producción. Aplicarlas requiere
  decisión humana (adaptar el grant o mover el runtime a Supabase).
- `infra/db/migrations/*` (BookPI/comercio) e `ige-omega/migrations/*` no están
  aplicadas. BookPI sigue sin secreto de integridad, así que su ledger durable no
  puede sellarse ni verificarse todavía.

Pendiente de configuración para cerrar este RFC: `BOOKPI_INTEGRITY_SECRET`,
`GENESIS_ADMIN_API_TOKEN`, selector durable de API keys
(`ISABELLA_API_KEY_STORE=postgres`) y almacén durable de federación
(`ISABELLA_FEDERATION_STORE=postgres`).

Límites de la evidencia: que la base responda y las tablas existan **no**
demuestra durabilidad, backup/restore, comportamiento de RLS bajo el rol de
servicio, ni recuperación ante fallos. Nada de esto se declara `verified` ni
`production` sin aprobación humana nominal.

