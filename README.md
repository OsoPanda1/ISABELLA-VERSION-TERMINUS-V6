# Isabella Villaseñor AI · Genesis TINA V6

**Proyecto:** Isabella Villaseñor AI · TAMV Online Network
**Versión del paquete:** `0.1.0`
**Rama:** `main`
**Commit de referencia:** `cb04652`
**Estado:** **PREPRODUCCIÓN — despliegue registrado, liberación productiva NO certificada**
**Última revisión de este README:** 27 de octubre de 2026 (engine-generated, pendiente de aprobación humana).

**Avance global de implementación: no publicado como porcentaje único.** La madurez se reporta por **gates verificables** (CI, runtime, persistencia, proveedor de IA, seguridad, pagos) con evidencia humana reproducida. Mientras no exista un denominador de requisitos ponderados y reproducible, una cifra agregada sería especulación y está prohibida por [AGENTS.md](AGENTS.md).

> **CAPABILITY ≠ AUTHORITY ≠ EXECUTION ≠ EVIDENCE ≠ LEARNING ≠ PRODUCTION**
>
> **SPECIFIED ≠ IMPLEMENTED ≠ TESTED**
>
> Que una capacidad exista en el código o que un despliegue finalice no prueba por sí solo que esté operativa, sea durable, segura o esté certificada para producción. Ningún control generado por máquina se declara "verificado" sin evidencia humana.

## 1. Qué es

Isabella es un runtime web de conversación y gobernanza de capacidades para TAMV Online Network. Integra servidor HTTP, interfaz web, rutas cognitivas, agentes locales deterministas, selección opcional de proveedores de IA, memoria acotada, BookPI, observabilidad, voz, integraciones, componentes comerciales y una biblioteca de **machine learning nativo gobernado** sin dependencias externas.

La capa `src/omega/genesis/` organiza capacidades en doce capas deterministas. **No** constituye un modelo fundacional entrenado ni demuestra conciencia, autonomía jurídica, aprendizaje autónomo en producción o ejecución de acciones externas.

## 2. Estado verificado y límites de esta auditoría

El repositorio se consultó el **27 de octubre de 2026**. HEAD local y `origin/main` coinciden en `cb04652`.

| Comprobación | Resultado observado | Interpretación |
| --- | --- | --- |
| Rama principal | `main` en `cb04652` | Referencia de esta revisión |
| `check:env` | `ENV_EXAMPLE_OK keys=165 read_in_src=95` | Contrato de entorno guardado por script |
| Estados de Vercel asociados al commit | Despliegues reportados como completados | No demuestra que todas las funciones pasen pruebas E2E |
| GitHub Actions — Repository Assurance / CI-CD | Requiere re-ejecución en el SHA exacto | No declarar verde sin logs reproducibles |
| Proveedor de IA real | Depende de configuración y conectividad | Debe demostrarse con una prueba E2E de respuesta generada |
| Persistencia durable | Depende del backend configurado | Los stores en memoria no son persistencia de producción |
| Native ML (`src/lib/native-ml/`) | Biblioteca funcional + tests en verde | **Excluida del typecheck principal**; `draft` hasta aprobación humana |

**Conclusión:** existe evidencia de despliegue, pero **no** se declara producción certificada hasta que los gates obligatorios estén verdes en el SHA exacto y se prueben los flujos críticos en el entorno desplegado con aprobación humana nominal.

## 3. Funcionalidades implementadas en el repositorio

- Servidor Express/TypeScript y rutas de plataforma (inventario de rutas **congelado**; no se añaden rutas HTTP nuevas sin arbitraje humano).
- Rutas de cognición JSON y SSE.
- Agente local determinista con herramientas allowlisted.
- Política de proveedores externos y adaptador opcional de Ollama.
- Rutas de voz/TTS sujetas a proveedor y configuración.
- Estado, health checks, readiness y métricas.
- Memoria de sesión, propuestas de memoria y componentes BookPI (hash-chain SHA-256 en memoria; no WORM durable — ver §11).
- Integraciones opcionales con PostgreSQL/Prisma y Stripe.
- Controles de seguridad, límites de entrada y gobernanza de capacidades.
- Capa Genesis con contratos OpenAPI/AsyncAPI; dichos contratos **no** implican endpoints nuevos publicados.
- **Native Governed ML** (§4): biblioteca determinista sin dependencias, con pruebas unitarias.

La disponibilidad efectiva de cada función depende de las variables, los secretos, las dependencias externas y la ruta ejecutada. Un catálogo o adaptador no prueba disponibilidad real.

## 4. Native Governed ML (`src/lib/native-ml/`)

Superficie de **biblioteca** (no rutas HTTP). Todo cambio de estado de capacidad se registra en el ledger BookPI. Estado: `draft | engine-generated`, salida `PENDING_REVIEW` por construcción.

Además del núcleo previo (regresión logística SGD binaria/multiclase, k-means, anomalía z-score, FedAvg, DataCard/ModelCard), se añadieron **21 módulos** funcionales y con tests:

| Módulo | Capacidad |
| --- | --- |
| `prng` | PRNG determinista con semilla (mulberry32) para reproducibilidad |
| `preprocessing` | escaladores estándar/mín-máx, estadísticos de columna |
| `metrics` | precisión, recall, F1, matriz de confusión, silhouette |
| `evaluation` | splits estratificados, validación cruzada, bootstrap AUC |
| `multiclass` | softmax SGD multiclase |
| `tree` | CART y bosque aleatorio sin dependencias |
| `calibration` | Platt scaling / temperatura |
| `explain` | importancia por permutación |
| `drift` | KS, PSI, JSD con guarda de borde `D=0` |
| `anomaly-forest` | isolation forest |
| `timeseries` | colas y estadísticos de serie temporal |
| `ranking` | TF-IDF coseno / ranking |
| `online` | aprendizaje en línea (`partialFit`) con sigmoid correcto |
| `federation-robust` | agregación robusta (mediana/trimmed-mean) + pantalla de envenenado por pérdida |
| `registry` | registro gobernado de artefactos |
| `serde` | serialización canónica con hash |
| `feature-contract` | contrato de características |
| `fairness` | equidad de grupos |
| `cards` | dossier de modelo (ModelCard) |
| `provenance` | ledger hash-chained con pruebas de inclusión Merkle (reutiliza `src/bookpi/merkle`) |
| `native-ml-engine` | orquestador gobernado `trainBinary` (authorize → escala → split → SGD → métricas → Platt → artifact → registry → ledger → dossier) |

**Límite honesto:** `src/lib` está excluido del `tsc` de typecheck principal; estos módulos se empaquetan con esbuild (build + vitest) y se prueban, pero **no** pueden declararse "listos para producción" por esa exclusión (CAPABILITY ≠ PRODUCTION). Ver `docs/STATUS.md`.

## 5. Arquitectura de alto nivel

| Ruta/carpeta | Responsabilidad principal |
| --- | --- |
| `src/server.ts` | Arranque HTTP, wiring y rutas |
| `src/inference/` | Selección de proveedor, presupuesto, contexto y voz |
| `src/agents/` | Runtime local determinista y herramientas permitidas |
| `src/routes/` | API, plataforma, agentes, federación y comercio |
| `src/memory/` | Memoria de sesión y conocimiento |
| `src/bookpi/` | Registro de eventos, evidencia y motor Merkle |
| `src/omega/` y `src/omega/genesis/` | Gobernanza, capas y contratos cognitivos |
| `src/lib/native-ml/` | Biblioteca de ML nativo gobernado (draft) |
| `src/security/` | Tokens, límites y controles de seguridad |
| `src/commerce/` y `src/economy/` | Suscripciones, Stripe y cotizaciones |
| `src/ui/` | Interfaz web |
| `api/index.js` | Adaptador de Vercel que importa `dist/server.js` |
| `scripts/` | Gates de entorno, readiness, smoke tests y verificación |

## 6. Instalación local

Requisitos declarados: **Node.js 24.x**, Corepack y pnpm **10.28.0**.

```bash
corepack enable
corepack pnpm install --frozen-lockfile
cp .env.example .env
```

Completa las variables necesarias para la modalidad elegida. No uses valores de ejemplo ni secretos reales en el repositorio.

Comandos principales (gates):

```bash
corepack pnpm run typecheck
corepack pnpm run lint
corepack pnpm run format:check
corepack pnpm test
corepack pnpm run build
corepack pnpm run check:env
corepack pnpm run check:sops
corepack pnpm run security:suite
corepack pnpm run deploy:readiness
```

Para ejecutar localmente:

```bash
corepack pnpm run dev
```

El script `validate` usa Corepack/pnpm para ejecutar typecheck, lint, formato y build. Ejecuta además los smoke tests y las pruebas E2E de las integraciones que realmente se vayan a habilitar.

## 7. Configuración de Vercel

El repositorio incluye `vercel.json` con instalación `corepack pnpm install --frozen-lockfile`, build `corepack pnpm run build:dist`, función `api/index.js` (duración máx. 60 s), inclusión de `dist/**` y `src/ui/**`, y rewrite general hacia `/api`.

Antes de publicar, confirma en el proyecto correcto de Vercel el directorio raíz, Node.js 24.x, comandos, variables de entorno y dominios. La existencia de varios estados de despliegue asociados a diferentes proyectos exige comprobar cuál es el proyecto canónico y cuál dominio se considera producción.

## 8. Contrato de entorno: secretos y variables

El contrato canónico está en [`.env.example`](.env.example) (**165 claves**) y es guardado por `scripts/check-env-example.mjs`, que falla si existe una lectura `process.env.X` en `src/` no documentada. Ejecuta `corepack pnpm run check:env` para validarlo.

### 8.1 Claves REQUIRED en producción (el runtime aborta sin ellas)

`loadConfig` (`src/config.ts`) lanza `CONFIG_MISSING_PRODUCTION` si `NODE_ENV=production` y falta alguna de:

- `DATABASE_URL` — PostgreSQL con TLS; sin él no hay persistencia durable.
- `GENESIS_ADMIN_API_TOKEN` — token de rutas administrativas.
- `GENESIS_HUMAN_APPROVAL_TOKEN` — firma de aprobación humana.
- `GENESIS_HUMAN_APPROVER_ID` — identidad del aprobador humano.

### 8.2 Claves que activan funcionalidades completas (opcionales pero necesarias para el 100 %)

| Funcionalidad | Clave(s) |
| --- | --- |
| CORS seguro | `ALLOWED_ORIGINS` (lista exacta; nunca `*` en producción) |
| Integridad BookPI | `BOOKPI_INTEGRITY_SECRET` (≥32, alta entropía), `BOOKPI_LEDGER_PATH` |
| Voz IVCC durable | `IVCC_DATA_DIR`, `IVCC_SUBJECT_SALT`, `IVCC_WATERMARK_SECRET` |
| Tokens operativos | `OPS_API_TOKEN`, `HSF_API_TOKEN`, `GENESIS_PUBLIC_API_TOKEN` |
| API keys nativas | `ISABELLA_API_KEY_STORE(_PATH)`, `ISABELLA_API_KEY_PEPPER` |
| Federación | `ISABELLA_FEDERATION_STORE(_PATH)`, `ISABELLA_FEDERATION_SECRET` (≥32), `ISABELLA_FEDERATION_VERIFY_TOKEN` (≥16) |
| Aprobaciones firmadas | `ISABELLA_APPROVAL_PRIVATE_KEY_PEM`, `ISABELLA_APPROVAL_TRUSTED_PUBLIC_KEY_PEM`, `ISABELLA_APPROVAL_KEY_ID`, `ISABELLA_APPROVAL_TRUSTED_KEY_ID` |
| WebAuthn | `WEBAUTHN_RP_ID`, `WEBAUTHN_ORIGIN` |
| Proveedor de IA (≥1) | `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `HF_TOKEN`, `OPENAI_COMPAT_API_TOKEN`, `AI_GATEWAY_API_KEY`, `DEEPSEEK_APIKEY`, u Ollama local (`OLLAMA_ENABLED` + `OLLAMA_BASE_URL` + `OLLAMA_MODEL`) |
| Pagos Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Precios Stripe (catálogo commerce) | `STRIPE_PRICE_PREMIUM_MONTHLY`, `STRIPE_PRICE_PREMIUM_YEARLY`, `STRIPE_PRICE_VIP_MONTHLY`, `STRIPE_PRICE_VIP_YEARLY` |
| Precios Stripe (economy/revenue-fabric) | `STRIPE_PRICE_PREMIUM`, `STRIPE_PRICE_VIP`, `STRIPE_PRICE_ENTERPRISE` |
| Supabase (alt.) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc. |
| Datos opcionales | `NEO4J_*`, `QDRANT_*`, `REDIS_URL`, `S3_*`, `MONGODB_URI` |
| Quantum / IGE-Ω | `PENNYLANE_BRIDGE_URL`, `PENNYLANE_BACKEND`, `IGE_OMEGA_ENDPOINT` |
| Observabilidad | `OTEL_EXPORTER_OTLP_*`, `OTEL_SERVICE_NAME` |
| Procedencia PID | `ORCID_ID`, `ZENODO_DOI`, `DATACITE_DOI`, `ISNI`, `PID_NAMESPACE`, `PID_STRICT` |

> **Divergencia de precios (pendiente de arbitraje humano):** `src/commerce/pricing.ts` fija Premium mensual 1900¢ / anual 19000¢ y VIP mensual 7900¢ / anual 79000¢, mientras la política de `economy` documenta "US$20 de referencia + 25% = US$25/mes". Ambos conjuntos de Price IDs conviven; **no** se activa cobro real hasta reconciliar la política con el catálogo y evidencia humana. Ver §11.

En Vercel, el filesystem y los stores en memoria pueden ser efímeros o estar aislados por instancia. No uses un store en memoria para API keys, federación, sesiones o evidencia que deba sobrevivir a reinicios o distribuirse entre instancias. Usa un backend durable y prueba concurrencia y recuperación.

## 9. API y comprobaciones mínimas

El inventario canónico de rutas está en `docs/api/route-inventory.json` (**congelado**). Entre las rutas documentadas:

- `GET /api/v1/healthz` — salud del proceso.
- `GET /api/v1/readyz` — readiness de dependencias.
- `GET /api/v1/status` — estado operativo.
- `POST /api/v1/cognition/route` — conversación JSON.
- `POST /api/v1/cognition/stream` — conversación SSE.
- `GET /api/v1/agents` y `POST /api/v1/agents/run` — agente local.
- `POST /api/v1/tts/stream` — salida de voz cuando está habilitada.

```bash
curl -i https://TU-DOMINIO/api/v1/healthz
curl -i https://TU-DOMINIO/api/v1/readyz
curl -sS https://TU-DOMINIO/api/v1/cognition/route \
  -H 'content-type: application/json' \
  -d '{"input":"Explica qué puedes hacer y qué limitaciones tienes.","modelEngine":"auto","focusLens":"general","history":[]}'
```

Una respuesta determinista local no debe contarse como inferencia de un LLM.

## 10. Gates pendientes para liberar

Los gates de liberación son obligatorios: CI verde en el SHA exacto, pruebas E2E de runtime/proveedor, persistencia durable, seguridad y rollback comprobado. La presencia de especificaciones no sustituye su implementación ni sus pruebas.

### Bloqueos previos a staging

- [ ] Recuperar logs y corregir los fallos de **Repository Assurance** y **CI/CD Pipeline** en el SHA exacto.
- [ ] Ejecutar y registrar typecheck, lint, formato, tests y build en el mismo SHA.
- [ ] Revisar el workflow de Rust/IGE-Ω y determinar si sus fallos corresponden a código, toolchain o configuración.
- [ ] Hacer obligatorios los checks correctos para proteger la rama de release.
- [ ] Confirmar que `build:dist` genera el artefacto importado por `api/index.js`.

### Bloqueos previos a producción

- [ ] Elegir y documentar el proyecto y dominio canónicos de Vercel.
- [ ] Validar en vivo health, readiness, páginas, rutas API y logs de la versión desplegada.
- [ ] Completar una conversación E2E con proveedor real configurado y verificar respuesta, timeout y fallback.
- [ ] Probar PostgreSQL con TLS, migraciones, operaciones CRUD y recuperación ante reconexión.
- [ ] Confirmar que BookPI y toda información crítica sobreviven a reinicios y no dependen de memoria efímera.
- [ ] Revisar autenticación, autorización, CORS, rate limiting, límites de payload y protección de rutas administrativas.
- [ ] Ejecutar pruebas de abuso, prompt injection, filtración de secretos, SSRF y manejo de errores.
- [ ] Probar voz/TTS y documentar qué contenido sale a terceros.
- [ ] Ejecutar Stripe en modo test: checkout, firma de webhook, idempotencia, duplicados y eventos fuera de orden (y reconciliar la divergencia de precios de §8).
- [ ] Configurar logs, métricas, alertas, backup, restauración y procedimiento de rollback.
- [ ] Completar pruebas de navegador para navegación, formularios, errores, accesibilidad y móvil.
- [ ] Revisar dependencias, licencia, vulnerabilidades y secretos expuestos.
- [ ] Aprobar con nombre humano el Native ML y registrar evidencia (pasar de `draft` a `wired` solo tras aprobación).
- [ ] Registrar aprobación humana, SHA exacto, resultados de los gates y URL de la release.

**Criterio de liberación:** no publicar como producción certificada si algún gate obligatorio falla, si el proveedor real no responde de extremo a extremo, si los datos críticos son efímeros o si no existe rollback comprobado.

## 11. Limitaciones explícitas

- El agente local es determinista; no sustituye un modelo neuronal.
- **BookPI** provee hoy una hash-chain SHA-256 **volátil en memoria**. No es almacenamiento WORM durable, ni un árbol de Merkle firmado externamente, ni un log de auditoría firmado (ver `SECURITY.md` / `docs/STATUS.md`).
- **Post-cuántica / HSM:** los proveedores ML-DSA/ML-KEM **no** están configurados. El sistema **no** debe afirmar verificación FIPS/ML-DSA/ML-KEM hasta que exista proveedor real y evidencia de pruebas. `BOOKPI_SIGNATURE_ALGORITHM=ML-DSA-65` es un valor de contrato, no una verificación.
- El Native ML está excluido del typecheck principal y es `draft` sin aprobación humana.
- Los proveedores gratuitos o sin clave pueden cambiar, limitar solicitudes, fallar o tener condiciones de privacidad distintas.
- El streaming de texto fragmentado no implica generación token a token por el modelo.
- Los contratos OpenAPI/AsyncAPI no implican endpoints desplegados.
- Existe una divergencia de política de precios entre `commerce` y `economy` (§8) sin arbitraje humano.
- Las funciones comerciales no equivalen a pagos reales de extremo a extremo.
- Las afirmaciones de producción requieren pruebas observables del commit y entorno exactos.

## 12. Seguridad y gobernanza

- Nunca publiques tokens, claves privadas, cadenas de conexión ni secretos de Stripe.
- Usa variables de entorno o el almacén de secretos del proveedor; rota cualquier credencial que haya aparecido en logs, commits o conversaciones compartidas.
- Genera secretos con `openssl rand -base64 32`; no reutilices valores de ejemplo.
- Mantén aprobación humana para efectos externos sensibles.
- Revisa [SECURITY.md](SECURITY.md) y [AGENTS.md](AGENTS.md) antes de aprobar cambios de gobernanza.

## 13. Registro del proyecto

- **Proyecto:** Isabella Villaseñor AI · Genesis TINA V6.
- **Ecosistema:** TAMV Online Network.
- **ORCID:** [0009-0008-5050-1539](https://orcid.org/0009-0008-5050-1539).
- **DOI declarado para IGE-Ω:** [10.5281/zenodo.20606361](https://doi.org/10.5281/zenodo.20606361).
- **Licencia:** MIT, consultar [LICENSE](LICENSE).

Este README es una guía operativa y un registro de estado; **no** sustituye una auditoría de seguridad independiente ni la evidencia de pruebas de producción. Estado del documento: `draft | engine-generated` hasta revisión humana.
