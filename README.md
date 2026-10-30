# Isabella Villaseñor AI — Genesis TINA V6

Isabella es un runtime web operativo para conversación, memoria de sesión, herramientas allowlisted, habilidades ejecutables, RAG soberano y gobernanza humana visible. El producto separa capacidad, autoridad, ejecución, evidencia y producción: una prueba automatizada demuestra comportamiento computacional, no aprobación humana ni certificación productiva.

> Estado del repositorio: `draft | engine-generated` hasta revisión humana nominal. No se declara conciencia, autonomía jurídica ni autoridad propia.

## Qué está operativo

- Servidor HTTP Express/TypeScript en `src/server.ts`.
- Workspace web interactivo en `src/ui/` con chat, intro, Studio, Tools, Skills, Governance y Nexus.
- API de conversación JSON y SSE.
- Runtime local determinista con herramientas allowlisted.
- **LLM fundacional propio** (`src/inference/foundational-llm.ts`) con orquestación de proveedores open source/free (Hugging Face, Ollama, Gratis) y fallback soberano garantizado.
- Memoria conversacional inyectada en el prompt.
- **RAG soberano** (`src/inference/rag.ts`) con recuperación por similitud coseno sobre base de conocimiento local.
- Selección de proveedores externos y carril local compatible.
- Memoria de sesión y persistencia opcional.
- BookPI y evidencia con hash-chain cuando existe almacenamiento durable.
- IsabellaEngine con habilidades ejecutables, validación fail-closed y arbitraje híbrido.
- Fallback `PROGRAM → ACTION_CHUNK → HUMAN_REVIEW`.
- Voz, pagos, federación y proveedores de IA detrás de configuración y controles explícitos.
- Idioma nativo: español latinoamericano mexicano (es-MX) con módulo i18n (`src/lib/i18n.ts`) y endpoint `/api/v1/i18n/locale`.
- Hardening HTTP (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS condicional).

## Arquitectura

```text
src/server.ts                 Arranque, wiring, HTTP y API
src/ui/                       Interfaz web servida por el runtime
src/isabella/                 Engine, biblioteca y programas de habilidades
src/cognition/                Ruteo cognitivo, evaluación y contexto
src/agents/                   Agente local determinista y herramientas
src/inference/                Proveedores de IA, LLM fundacional, RAG, presupuestos y voz
src/memory/                   Memoria de sesión, IKES y adaptadores
src/bookpi/                   Ledger, evidencia, Merkle y almacenamiento
src/genesis/                  Runtime y gobernanza Genesis
src/security/                 Tokens, límites, claves y controles
src/routes/                   Superficies HTTP de la plataforma
scripts/                      Gates, smoke tests y verificación operativa
test/                         Tests unitarios, integración y smoke
```

## Requisitos

- Node.js `24.x`
- Corepack
- pnpm `10.28.0`
- Un proveedor de IA si se desea inferencia externa (o LLM fundacional local)
- PostgreSQL/Supabase si se necesita persistencia durable

## Instalación

```bash
corepack enable
corepack pnpm install --frozen-lockfile
cp .env.example .env
corepack pnpm run check:env
```

Nunca commits secretos. En Vercel, configura las variables desde el proyecto y no desde archivos versionados.

## Ejecutar Isabella

```bash
corepack pnpm run dev
```

El servidor escucha en `http://localhost:8080` salvo que `PORT` defina otro puerto. Abre `/` para el workspace visual, `/chat` para el chat dedicado y `/platform` para el catálogo de plataforma.

### Primera interacción

1. Abre `/`.
2. Autoriza o salta la intro audiovisual.
3. Pulsa `ABRIR CHAT`.
4. Escribe una instrucción en el campo de conversación.
5. Envía con el botón o `Enter`.
6. Usa `Tools`, `Skills` y `Governance` para inspeccionar capacidades, ejecución y evidencia.
7. Usa `Ctrl/Cmd + K` para abrir la paleta de acciones.

## API principal

```text
GET  /api/v1/healthz
GET  /api/v1/readyz
GET  /api/v1/status
GET  /api/v1/isabella/providers
POST /api/v1/isabella/foundational
POST /api/v1/isabella/rag/add
GET  /api/v1/isabella/rag/search?q=...
POST /api/v1/cognition/route
POST /api/v1/cognition/stream
GET  /api/v1/agents
POST /api/v1/agents/run
```

## Variables relevantes

| Área             | Variables                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Base de datos    | `DATABASE_URL`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL`                                                       |
| Supabase         | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`                                     |
| IA               | `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `HF_TOKEN`, `DEEPSEEK_APIKEY`, `AI_GATEWAY_API_KEY` |
| Ollama           | `OLLAMA_ENABLED`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`                                                         |
| Local compatible | `ISABELLA_LOCAL_COMPAT_ENABLED`, `ISABELLA_LOCAL_COMPAT_BASE_URL`, `ISABELLA_LOCAL_COMPAT_MODEL`            |
| Seguridad        | `GENESIS_ADMIN_API_TOKEN`, `GENESIS_HUMAN_APPROVAL_TOKEN`, `BOOKPI_INTEGRITY_SECRET`                        |
| Stripe           | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`                                      |

En producción, las rutas administrativas y la persistencia durable requieren los secretos obligatorios definidos en `.env.example`. La ausencia de una integración opcional debe producir un estado degradado explícito, no datos simulados presentados como reales.

## Validación

Ejecuta los gates en este orden:

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

## Estado de producción

Avance global de implementación: no publicado como porcentaje único. Mientras no exista un denominador de requisitos ponderados y reproducible, una cifra agregada sería especulación y no se presenta como hecho.

La aplicación puede ejecutarse y mostrar el workspace hoy, pero la certificación productiva depende de configuración, conectividad, almacenamiento durable, firma, pruebas E2E y aprobación humana. El estado correcto se consulta en `/api/v1/readyz`, en los logs del runtime y en los gates del repositorio.