---
state: draft
date: 2026-10-24
---
# Respuesta a la auditoría externa (E1–E25 / A1–E25) — verificada contra el repo real

El autor de la auditoría solo vio archivos de configuración, no `src/`. Cada punto se comprobó contra `main`; **no se aplicó nada por fe**.
Leyenda: ✅ corregido aquí · ❌ no aplica (ya resuelto o incorrecto) · ⛔ bloqueado (necesita red/lockfile/decisión) · 📌 pendiente.

| # | Veredicto | Evidencia / acción |
|---|---|---|
| E1 secretos en compose | ✅ | `DATABASE_URL` con `:secret@` en `docker-compose.yml` → ahora `${DATABASE_URL:?…}` desde `.env` no versionado. Solo existe el servicio `app` (no `isabella-web`). Test `hardening-guards` lo impide. |
| E2 caddy/otel/vm sin límites | ✅ | `no-new-privileges`, `cap_drop: ALL` (caddy con `NET_BIND_SERVICE`), `read_only`, límites de memoria en caddy/otel/victoriametrics/crowdsec/app. Postgres/ollama sin `cap_drop`: no verificable sin Docker. |
| E3 `version: '3.8'` | ✅ | Eliminado. |
| E4 `.env.example` duplicado | ❌ | 0 claves duplicadas (comprobado). Se añade `scripts/check-env-example.mjs` (duplicados, secretos reales, variables sin documentar) + CI + test. |
| E5 no-console/PII | 📌 | Ya existe `src/security/secret-scanner.ts` (y tenía un bug real, ver abajo); falta enlazarlo a CI. |
| E6 tsconfig excluye capas | ✅/📌 | Se crea `tsconfig.layers.json` + `pnpm typecheck:layers` (CI advisory) y test que obliga a que toda exclusión esté cubierta. Quitar las exclusiones del typecheck principal queda 📌 hasta correr `typecheck:layers` con dependencias reales (en el sandbox solo se pudo con tipos de Node). |
| E7 tsconfig.build | 📌 | Emite solo desde `src/server.ts` (esbuild empaqueta); no hay consumidores externos de tipos. Sin acción. |
| E8 coverage | ✅ parcial | Config `coverage` v8 + `pnpm test:coverage`. ⛔ Falta `@vitest/coverage-v8` en devDependencies (no se puede tocar el lockfile sin red); umbrales sin fijar hasta medir línea base. |
| E9 rewrite catch-all | ❌ | El runtime Express sirve los estáticos; el catch-all a `/api` es por diseño. |
| E10 `api/index.js` | ❌ | Existe `api/index.js`. |
| E11 ESLint deprecated | ⛔ | `eslint@9.39.5` en lockfile; requiere regenerar lock con red. |
| E12 braintrust ARM | 📌 | Verificar en CI ARM; no reproducible aquí. |
| E13 `no-explicit-any` no aplica a capas | 📌 | `eslint.config.mjs` ignora las mismas rutas. Quitar `ignores` solo tras `typecheck:layers` verde (no se puede ejecutar ESLint aquí). |
| E14 RUNBOOK numeración | ❌ | Encabezados sin secciones duplicadas (comprobado). |
| E15 scripts/config referenciados | ❌ | Existen `scripts/{deploy,backup}.sh` y `config/{Caddyfile,crowdsec,otel-collector,postgresql,victoriametrics}.*`. |
| E16 `.sops.yaml` placeholders | ✅ | Son plantilla; `scripts/check-sops-placeholders.mjs` falla si hay un `*.enc.yaml` rastreado con placeholders. |
| E17 SOPS guide numeración | ❌ | Las "4." repetidas están dentro de comentarios del ejemplo. |
| E18/E24 README vs SECURITY | ❌ hoy | El README actual ya no dice "Production-Ready" ni "Quantum-Ready"; sí dice "100 % del alcance de código de esta rama… no equivale a producción". Aun así `docs/STATUS.md` (generado) lista qué capas están fuera del typecheck. |
| E19 metadata capability | 📌 | `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` único; decidir lista real de capabilities. |
| E20/E22 Prisma 8 rc vs client 7 | ⛔ | `prisma@8.0.0-rc.23` / `@prisma/client@^7.10.1` desalineados; solo se usa en `src/lib/**` (excluido). Alinear requiere regenerar lockfile. |
| E21 `next` solo en overrides | 📌 | No hay workspace `web/`; quitar el override o declarar dependencia. |
| E23 workspace `web` | ❌ | No existe `pnpm-workspace.yaml` ni `web/`. |
| E25 secreto de test fijo | ❌ | Es explícitamente de test (`NODE_ENV=test`); cambiarlo rompería firmas deterministas. |

## Bugs reales encontrados al desbloquear las capas excluidas del typecheck
- ✅ `src/security/secret-scanner.ts`: `scanDirectory` usaba `this` dentro de una función anidada → `TypeError` en cuanto había una entrada. Convertida a arrow function. Además `addExcludePattern` mutaba el array global compartido entre instancias (fuga entre instancias) → copia por instancia. Tests: `test/security/secret-scanner.test.ts`.
- ✅ `src/security/pqc/hybrid-crypto.ts`: `createCipheriv("ChaCha20-Poly1305", …)` sin `authTagLength` lanza en Node; y los tipos `Cipheriv` no exponen `setAAD/getAuthTag`. Ahora `{ authTagLength: 16 }` + `CipherGCM/DecipherGCM`. Tests de ida y vuelta y de manipulación para ambos algoritmos: `test/security/hybrid-symmetric.test.ts`.

## Pendiente real (requiere red / decisión)
1. Regenerar lockfile: alinear Prisma, actualizar ESLint, añadir `@vitest/coverage-v8`.
2. Correr `pnpm typecheck:layers` con dependencias reales; corregir lo que salga y entonces quitar las exclusiones de `tsconfig.json` y de `eslint.config.mjs`.
3. Pruebas con Docker real de los endurecimientos de compose (`read_only`, `cap_drop`).
4. Decidir capabilities de `metadata.json` y retirar el override de `next`.
