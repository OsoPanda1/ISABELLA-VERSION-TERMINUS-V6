# Isabella Villaseñor AI — Genesis TINA V6

Isabella es un **Runtime Web Operativo y Sistema Federado de Inteligencia Artificial Gobernada (FGAIS)**. No es un chatbot: es un runtime con gobernanza determinista, memoria jerárquica, LLM fundacional propio, RAG soberano, herramientas allowlisted, habilidades ejecutables y auditoría criptográfica.

> Estado del repositorio: `draft | engine-generated` hasta revisión humana nominal. No se declara conciencia, autonomía jurídica ni autoridad propia.

## Categorización del sistema

| Categoría | Descripción | Módulos clave |
|---|---|---|
| **Runtime & HTTP** | Servidor Express/TypeScript, rutas, rate limiting, hardening | `src/server.ts`, `src/http/`, `src/routes/` |
| **LLM Fundacional** | Orquestación de proveedores (HF, Ollama, Gratis, AI SDK Gateway) + fallback soberano | `src/inference/foundational-llm.ts`, `src/inference/free-providers.ts`, `src/inference/router.ts` |
| **RAG Soberano** | Embeddings deterministas + búsqueda por similitud coseno | `src/inference/rag.ts`, `src/inference/embeddings.ts` |
| **Memoria** | 5 niveles (immediate, session, project, territorial, historical) + IKES | `src/memory/hierarchical.ts`, `src/memory/ikes.ts` |
| **Gobernanza** | CROWN, AEGIS, Policy Gate, Zero Trust, Prompt Guard, Intention Parser | `src/genesis/`, `src/security/` |
| **Ciberseguridad** | Threat intel, JCS, fetchSafeUpstream, advanced threat intel | `src/security/advanced-threat-intel.ts`, `src/security/jcs.ts`, `src/security/fetch-safe.ts` |
| **Monetización** | SCER economy, Profit Guard, dynamic pricing, Stripe | `src/economy/`, `src/commerce/` |
| **Voz/TTS** | Genesis TTS MX-Prime, IVCC, consentimiento | `src/tts/`, `src/inference/speech.ts` |
| **Evaluación** | Benchmark de Isabella, quality gates | `src/evaluation/benchmark.ts`, `scripts/` |
| **Integraciones** | MCP, Vercel domains, Hugging Face Hub | `src/infra/vercel-domains.ts`, `/api/mcp` |

## Funciones principales

- Conversación gobernada con memoria de sesión y contexto verificado.
- LLM fundacional que intenta proveedores reales y siempre responde (fallback soberano).
- RAG soberano con recuperación semántica local.
- Análisis de intención (8 dominios canónicos).
- Guard de amenazas multi-capa (9 categorías).
- Canonicalización JCS (RFC 8785).
- Firma/verificación Ed25519.
- Memoria jerárquica de 5 niveles.
- Monetización con margen positivo garantizado (Profit Guard).
- Búsqueda de dominios (Vercel Registrar).
- i18n nativo español latinoamericano mexicano (es-MX).
- MCP-compatible (tools/list, tools/call).

## Tools y Skills

- `IsabellaEngine` con 9 primitivas: `observe`, `pick`, `place`, `move`, `rotate`, `handover`, `release`, `wait`, `verify`.
- Fallback de 4 niveles: `PROGRAM → ACTION_CHUNK → HUMAN_REVIEW → DEGRADED`.
- Habilidades de alto impacto siempre terminan en `HUMAN_REVIEW`.
- 250+ herramientas gobernadas en el motor agéntico.

## Programas y librerías nativas

- **ML nativo**: embeddings soberanos (`src/inference/embeddings.ts`), RAG, local engine.
- **Criptografía**: Ed25519, JCS, fetchSafeUpstream, advanced threat intel.
- **Gobernanza**: CROWN, AEGIS, Policy Gate, Zero Trust.
- **Economía**: SCER, dynamic pricing, Profit Guard, treasury, affiliates, fraud detection.

## LLM Fundacional Nativo

Isabella posee un LLM fundacional propio (`src/inference/foundational-llm.ts`) que:
- Orquesta proveedores open source/free (Hugging Face, Ollama, Gratis, AI SDK Gateway).
- Inyecta memoria conversacional e historial.
- Recupera contexto verificado (RAG + verified knowledge).
- Garantiza respuesta siempre (fallback soberano).
- Cachea respuestas (60s) para baja latencia.

## Librerías nativas de Machine Learning

- `src/inference/embeddings.ts`: embeddings deterministas (hashed bag-of-words, 256 dims).
- `src/inference/rag.ts`: búsqueda por similitud coseno.
- `src/inference/local-engine.ts`: motor determinista con 14+ intenciones.
- `src/inference/foundational-llm.ts`: orquestación y cache.

## Endpoints principales

```text
GET  /api/v1/healthz
GET  /api/v1/readyz
GET  /api/v1/status
GET  /api/v1/isabella/full-status
GET  /api/v1/isabella/providers
POST /api/v1/isabella/foundational
POST /api/v1/isabella/rag/add
GET  /api/v1/isabella/rag/search
POST /api/v1/isabella/eval
POST /api/isabella/chat
POST /api/isabella/isa/reason
POST /api/isabella/crypto/sign
POST /api/isabella/crypto/verify
POST /api/v1/memory/store
GET  /api/v1/memory/recall
GET  /api/v1/memory/snapshot
POST /api/v1/security/threat-intel
POST /api/v1/security/intent
POST /api/v1/security/prompt-guard
POST /api/v1/security/canonicalize
POST /api/v1/monetization/profit-price
POST /api/v1/domains/search
GET  /api/v1/i18n/locale
POST /api/mcp
```

## Variables de entorno

Ver `.env.example` y `.env.generated` (generado localmente, no commitado). Variables externas requeridas: DB, Supabase, AI keys, Stripe, etc.

## Validación

```bash
corepack pnpm run typecheck
corepack pnpm run lint
corepack pnpm run format:check
corepack pnpm test
corepack pnpm run smoke:ui
corepack pnpm run smoke:runtime
corepack pnpm run build
corepack pnpm run deploy:readiness
```

## Avance

Avance global de implementación: no publicado como porcentaje único. Mientras no exista un denominador de requisitos ponderados y reproducible, una cifra agregada sería especulación y no se presenta como hecho.

El proyecto ha evolucionado significativamente: LLM fundacional, RAG, memoria, seguridad, monetización, MCP, i18n es-MX, evaluación y hardening implementados en código real. Persistencia durable y embeddings en Postgres son los siguientes pasos.