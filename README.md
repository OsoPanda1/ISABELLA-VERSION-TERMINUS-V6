# Isabella Villaseñor AI — Genesis TINA V6

**Versión del paquete:** `0.1.0`
**Línea de producto:** `Genesis TINA V6 / Terminus`
**Estado documental:** `draft | auto_generated` — este documento describe el código y la configuración observables en el repositorio; requiere revisión humana antes de considerarse una certificación.

Isabella es un runtime de conversación e inteligencia gobernada para el proyecto TAMV Online Network. Combina una interfaz web, un servidor HTTP, rutas cognitivas, agentes locales deterministas, memoria acotada, observabilidad, BookPI, seguridad, integraciones opcionales y superficies comerciales. Su diseño separa explícitamente capacidad, autoridad, ejecución, evidencia, aprendizaje y producción.

> **CAPABILITY ≠ AUTHORITY ≠ EXECUTION ≠ EVIDENCE ≠ LEARNING ≠ PRODUCTION**
>
> Que una función exista, responda o pase una prueba no demuestra por sí mismo autoridad, conciencia, aprendizaje, certificación externa ni operación en producción.

## Índice

- [Qué es Isabella](#qué-es-isabella)
- [Qué puede hacer realmente](#qué-puede-hacer-realmente)
- [Qué no afirma hacer](#qué-no-afirma-hacer)
- [Estado operativo](#estado-operativo)
- [Arquitectura](#arquitectura)
- [Superficies web y API](#superficies-web-y-api)
- [Flujo de una conversación](#flujo-de-una-conversación)
- [Motores y proveedores](#motores-y-proveedores)
- [Seguridad, privacidad y gobernanza](#seguridad-privacidad-y-gobernanza)
- [Configuración](#configuración)
- [Ejecución local](#ejecución-local)
- [Validación](#validación)
- [Persistencia y pagos](#persistencia-y-pagos)
- [Limitaciones y pendientes](#limitaciones-y-pendientes)
- [Estructura](#estructura)
- [Registro](#registro)

## Qué es Isabella

Isabella es un sistema de software gobernado, no una persona ni una autoridad autónoma. El nombre identifica una plataforma que puede:

1. recibir mensajes mediante HTTP o la interfaz web;
2. clasificar la intención y seleccionar una ruta local o un proveedor configurado;
3. devolver texto en JSON o mediante Server-Sent Events (SSE);
4. conservar contexto acotado durante una sesión local;
5. exponer estado, readiness, métricas y evidencia técnica;
6. ejecutar únicamente herramientas locales allowlisted cuando el agente está habilitado;
7. registrar propuestas y eventos sin convertirlos automáticamente en autoridad o memoria canónica.

La versión del repositorio es la fuente de verdad. El canon, los nombres de módulos y las páginas de producto no deben interpretarse como prueba de que exista un modelo fundacional, una conciencia, una red federada o una operación productiva certificada.

## Qué puede hacer realmente

### Conversación

- Responder por `POST /api/v1/cognition/route`.
- Entregar una respuesta fragmentada por `POST /api/v1/cognition/stream`.
- Procesar historial saneado y acotado.
- Aplicar una fast lane determinista para consultas cortas, inequívocas y locales.
- Declarar el motor que respondió, el modo de la ruta, latencia, presupuesto de contexto y disponibilidad de proveedores.
- Responder sin proveedor externo mediante el agente local cuando la consulta coincide con sus capacidades.

### Agente local

El agente local es determinista y no es un LLM. Puede usar, con límites estrictos:

| Herramienta        | Capacidad                                                  |
| ------------------ | ---------------------------------------------------------- |
| `clock.now`        | Hora UTC y `America/Mexico_City`                           |
| `math.calculate`   | Aritmética segura sin `eval`                               |
| `text.summarize`   | Resumen extractivo acotado                                 |
| `knowledge.search` | Búsqueda en conocimiento curado                            |
| `platform.status`  | Estado técnico acotado del proceso                         |
| `skills.list`      | Catálogo de skills                                         |
| `memory.proposal`  | Propuesta en cola de revisión; no muta la memoria canónica |

El agente no tiene shell, filesystem, navegador, red saliente ni acceso directo a secretos.

### Voz y multimodalidad

- TTS nativo es-MX con planes de prosodia y entrega SSE.
- Interrupción de voz (`barge-in`) con marcador de un solo uso por actor.
- Rutas de visión, imagen, audio y multimodalidad cuando el proveedor y la configuración están disponibles.
- La interfaz puede recurrir a `speechSynthesis` del navegador.
- La voz generada por el runtime no implica un vocoder neural ni autoridad de ejecución.

### Plataforma y operación

- Plataforma multipágina con chat, capacidades, gobernanza, canon, documentación, pricing, cuenta local e integraciones.
- Estado de salud, readiness, latencia, cuotas, proveedores y dependencias.
- Activos web con hash de contenido, ETag y caché inmutable.
- Inventario congelado de rutas en [`docs/api/README.md`](docs/api/README.md).

### Memoria y evidencia

- Memoria de sesión acotada con límites de historial.
- Executive Tactical Memory (ETM) con TTL, eviction FIFO y cadena SHA-256.
- BookPI append-only según el backend disponible: memoria, JSONL o PostgreSQL.
- Propuestas de memoria separadas de la memoria canónica.
- Evidencia verificable localmente, sin afirmar veracidad humana o certificación externa.

### Economía y comercio

- Planes y cuotas declaradas por servidor.
- Checkout y webhooks de Stripe cuando se configuran correctamente.
- Suscripciones persistentes y ledger de doble entrada sobre PostgreSQL.
- Cotización de flujos de monetización sin cobrar ni transferir fondos.
- Idempotencia, deduplicación y ordenamiento de eventos de pago.

## Qué no afirma hacer

Esta versión **no afirma** tener:

- conciencia, voluntad, sentimientos o identidad humana;
- un foundation model propio entrenado en este repositorio;
- un modelo neuronal local activo por defecto;
- inferencia ilimitada o gratuita garantizada;
- autonomía jurídica, financiera o administrativa;
- autoridad para aprobar, transferir, publicar, borrar o ejecutar efectos gobernados;
- pagos a creadores, KYC, impuestos, retiros, reembolsos, contracargos o conciliación bancaria completamente operativos;
- federación productiva, WORM real o certificación externa de BookPI;
- un WAF distribuido: el rate limiter actual es por proceso;
- sincronización de cuenta para el historial local de la interfaz.

Los adaptadores para proveedores externos o runtimes locales solo están activos si la configuración, las políticas y la disponibilidad los habilitan. Un catálogo no equivale a disponibilidad.

## Estado operativo

**Avance global de implementación: no publicado como porcentaje único.** El estado se comunica por capacidades verificables, gates reproducibles y un denominador de requisitos ponderados y reproducible; pasar una prueba no equivale a certificar todo el sistema.

| Área                 | Estado observable                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Servidor HTTP        | Implementado en `src/server.ts` con Express                                                     |
| Chat local           | Disponible mediante fast lane y agente allowlisted                                              |
| Proveedores externos | Opcionales; dependen de claves, política y salud del proveedor                                  |
| Streaming            | SSE con fragmentación determinista de la respuesta completa; no streaming nativo garantizado    |
| Persistencia         | PostgreSQL/Supabase, JSONL o memoria según configuración                                        |
| Auth de aplicación   | Depende de las rutas y configuración del entorno; no asumir identidad desde headers del cliente |
| Pagos                | Integración Stripe opcional; requiere modo test y validación E2E                                |
| Producción           | No certificada por este README; requiere evidencia humana, CI y staging                         |

`GET /api/v1/readyz` puede devolver `503` de forma correcta cuando falta una dependencia requerida. Servir HTML no significa estar listo para producción.

## Arquitectura

| Módulo           | Responsabilidad                                                               |
| ---------------- | ----------------------------------------------------------------------------- |
| `src/server.ts`  | Arranque HTTP, middleware, wiring, rutas, cuotas y ciclo de vida              |
| `src/inference/` | Política de proveedores, fast lane, contexto, multimodalidad y voz            |
| `src/agents/`    | Runtime determinista, herramientas y conocimiento curado                      |
| `src/routes/`    | Superficies HTTP de plataforma, agentes, cognición, TTS, economía y operación |
| `src/memory/`    | Sesión, ETM, IKES, memoria verificada y mesh                                  |
| `src/bookpi/`    | Ledger de evidencia y almacenamiento de eventos                               |
| `src/security/`  | Tokens, rate limiting, headers, autenticación de confianza y zero trust       |
| `src/commerce/`  | Suscripciones, Stripe, webhooks, cuotas y ledger comercial                    |
| `src/economy/`   | Cotización, revenue fabric, tesorería y flujos económicos                     |
| `src/platform/`  | Catálogo, páginas y canon operativo                                           |
| `src/ui/`        | Interfaz HTML, CSS y JavaScript del chat y la plataforma                      |
| `test/`          | Pruebas unitarias, contratos, seguridad, rutas y rendimiento                  |
| `scripts/`       | Build, smoke tests, inventarios y aseguramiento del repositorio               |

## Superficies web y API

### Páginas principales

| Ruta                     | Propósito                          |
| ------------------------ | ---------------------------------- |
| `/chat`                  | Chat dedicado                      |
| `/platform`              | Inicio de la plataforma            |
| `/platform/status`       | Estado y readiness                 |
| `/platform/skills`       | Catálogo de capacidades            |
| `/platform/tools`        | Herramientas y política del agente |
| `/platform/integrations` | Integraciones y proveedores        |
| `/platform/pricing`      | Planes y cuotas                    |
| `/platform/governance`   | Capacidad, autoridad y evidencia   |
| `/platform/canon`        | Canon Génesis y madurez declarada  |
| `/platform/docs`         | Documentación                      |
| `/platform/developers`   | Guía de integración                |
| `/platform/faq`          | Preguntas frecuentes               |
| `/platform/library`      | Biblioteca local del navegador     |
| `/platform/profile`      | Perfil local                       |
| `/platform/settings`     | Preferencias locales               |

### Endpoints esenciales

| Método | Endpoint                         | Uso                              |
| ------ | -------------------------------- | -------------------------------- |
| `GET`  | `/api/v1/health`                 | Salud superficial                |
| `GET`  | `/api/v1/healthz`                | Health check                     |
| `GET`  | `/api/v1/readyz`                 | Readiness por dependencia        |
| `GET`  | `/api/v1/status`                 | Identidad, versión y estado      |
| `POST` | `/api/v1/cognition/route`        | Respuesta cognitiva JSON         |
| `POST` | `/api/v1/cognition/stream`       | Respuesta cognitiva SSE          |
| `GET`  | `/api/v1/agents`                 | Catálogo del agente              |
| `POST` | `/api/v1/agents/run`             | Ejecución local allowlisted      |
| `GET`  | `/api/v1/platform/catalog`       | Catálogo de plataforma           |
| `GET`  | `/api/v1/hypercore/turbo/status` | Estado de caché, gate y métricas |
| `POST` | `/api/v1/tts/stream`             | Plan de voz SSE                  |
| `POST` | `/api/v1/tts/interrupt`          | Interrupción de voz              |
| `GET`  | `/api/v1/billing/plans`          | Planes y cuotas                  |
| `GET`  | `/api/v1/native/engines`         | Inventario de motores nativos    |
| `POST` | `/api/v3/economy/quote`          | Cotización sin cobro             |

El inventario completo generado está en [`docs/api/route-inventory.json`](docs/api/route-inventory.json). No se deben inventar endpoints a partir de este resumen.

## Flujo de una conversación

1. El cliente envía `input`, `modelEngine`, `focusLens` e historial opcional.
2. El servidor valida tamaño y forma de la entrada.
3. Se sanea y acota el historial; nunca se trata como system prompt.
4. La fast lane o el agente local intentan responder sin red cuando corresponde.
5. Si está permitido, la política selecciona un proveedor configurado y disponible.
6. Se aplica presupuesto de tiempo, concurrencia, cuota y caché.
7. La respuesta se devuelve como texto declarado, no como autoridad.
8. La ruta registra métricas y evidencia técnica sin afirmar certificación de producción.

Ejemplo:

```bash
curl -s http://127.0.0.1:3000/api/v1/cognition/route \
  -H 'content-type: application/json' \
  -d '{"input":"Explica el modelo de gobernanza de Isabella.","modelEngine":"auto","focusLens":"governance","history":[]}'
```

Para SSE:

```bash
curl -N http://127.0.0.1:3000/api/v1/cognition/stream \
  -H 'content-type: application/json' \
  -d '{"input":"¿Qué puedes hacer?","modelEngine":"auto","focusLens":"general","history":[]}'
```

La respuesta SSE emite eventos `meta`, `chunk`, `done` y `error`. La fragmentación posterior de texto no debe confundirse con streaming nativo del proveedor.

## Motores y proveedores

| Motor        | Realidad actual                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| Fast lane    | Clasificación determinista de intenciones cortas                                                       |
| Agente local | Herramientas allowlisted, sin LLM                                                                      |
| LLM nativo   | Generación determinista/traza local; no es una red neuronal entrenada                                  |
| MoE nativo   | Router top-k y diagnóstico local; no es un MoE de producción                                           |
| TTS nativo   | Prosodia y normalización es-MX; no es un vocoder neural                                                |
| AI Gateway   | Proveedor opcional mediante `@ai-sdk/gateway` y configuración válida                                   |
| Google GenAI | Opcional mediante `GEMINI_API_KEY` o `MODEL_API_KEY`                                                   |
| OpenRouter   | Opcional mediante `OPENROUTER_API_KEY` y modelo permitido                                              |
| DeepSeek     | Puede configurarse mediante `DEEPSEEK_APIKEY` si la política/adaptador correspondiente está habilitado |
| Hugging Face | Opcional mediante token y modelos permitidos                                                           |
| Ollama       | Ruta de evolución; no se presenta como activa por defecto                                              |

Nunca se debe exponer una clave al navegador ni insertar una clave en el código fuente. El motor ganador debe ser visible en la respuesta o en el estado del nodo.

## Seguridad, privacidad y gobernanza

- Secretos de servidor nunca se envían al cliente: claves de Stripe, Supabase service role, tokens administrativos y credenciales de proveedores permanecen en el proceso.
- Los headers `x-user-id` y `x-session-id` no conceden identidad por sí mismos.
- Las entradas, historial, adjuntos y respuestas se tratan como datos no confiables.
- El contenido se escapa antes de insertarse en el DOM.
- Se aplican límites de tamaño, tiempo, concurrencia y rate limiting.
- La aprobación administrativa se decide en servidor mediante bearer verificado; un booleano del cuerpo no concede permisos.
- BookPI registra integridad y procedencia técnica; no convierte una afirmación en verdad.
- El fallback local se declara como fallback y no se presenta como un LLM.
- La caché, el single-flight y los fragmentos SSE no son permisos ni evidencia de producción.
- Cualquier escritura gobernada requiere una política y una aprobación separadas del texto generado.

## Configuración

Usa Node.js `24.x` y pnpm `10.28.0`.

```bash
cp .env.example .env
pnpm install --frozen-lockfile
```

Variables frecuentes:

```dotenv
# Servidor y persistencia
PORT=3000
HOST=0.0.0.0
DATABASE_URL=
POSTGRES_URL=
POSTGRES_PRISMA_URL=

# Supabase opcional
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Proveedores opcionales; solo servidor
GEMINI_API_KEY=
DEEPSEEK_APIKEY=
OPENROUTER_API_KEY=
OPENROUTER_FREE_MODEL=
HF_TOKEN=
OLLAMA_BASE_URL=
OLLAMA_API_KEY=
AI_GATEWAY_API_KEY=

# Stripe opcional; solo servidor
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_PREMIUM=
STRIPE_PRICE_VIP=
STRIPE_PRICE_ENTERPRISE=
```

La lista canónica y completa está en [`.env.example`](.env.example) y [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md). No copies secretos reales al repositorio. `DEEPSEEK_APIKEY` debe ser una variable de entorno real; no se debe escribir literalmente `"process.env.DEEPSEEK_APIKEY"` como valor.

## Ejecución local

```bash
pnpm dev
```

Abrir:

- `http://127.0.0.1:3000/`
- `http://127.0.0.1:3000/chat`
- `http://127.0.0.1:3000/platform/status`

Producción compilada:

```bash
pnpm run build
pnpm run start:dist
```

## Validación

Gates mínimos exigidos por el repositorio:

```bash
pnpm run typecheck
pnpm test
```

Validación ampliada:

```bash
pnpm run lint
pnpm run format:check
pnpm run build
pnpm run security:suite
pnpm run smoke:runtime
pnpm run smoke:ui
pnpm run smoke:production
```

Para PostgreSQL y despliegue:

```bash
pnpm run postgres:e2e
pnpm run verify:production
pnpm run deploy:verify
```

Un resultado verde demuestra que la comprobación ejecutada pasó en ese entorno. No demuestra por sí solo autoridad, consciencia, seguridad absoluta ni certificación de producción. Antes de marcar una capacidad como `verified` o `wired`, se requiere revisión y aprobación humana conforme a `AGENTS.md`.

## Persistencia y pagos

La persistencia puede usar PostgreSQL/Supabase, JSONL local o memoria degradada según el entorno. Antes de staging o producción deben validarse migraciones, permisos, backups, restauración y aislamiento de tenants.

Stripe es opcional. Para habilitarlo de forma responsable:

1. configurar Price IDs y secretos en el entorno del servidor;
2. registrar el webhook `/api/v1/billing/stripe/webhook`;
3. verificar firma, deduplicación y orden de eventos;
4. probar checkout, renovación, cancelación, expiración y reintentos en modo test;
5. validar la suscripción persistida antes de conceder entitlements.

La cotización no cobra. El ledger no prueba que el dinero haya sido transferido. Stripe Connect, KYC, impuestos, payouts, reembolsos, contracargos y conciliación requieren implementación y evidencia adicional.

## Limitaciones y pendientes

Antes de una declaración de operación productiva todavía deben comprobarse, según el despliegue:

- CI remota completa y revisión humana identificada.
- PostgreSQL/Supabase, migraciones y restauración en staging.
- Rotación de claves, recuperación ante fallos y observabilidad operativa.
- Rate limiting distribuido para múltiples réplicas.
- Stripe test mode y todos los eventos relevantes.
- Payouts, KYC, impuestos, reembolsos y conciliación, si se requieren.
- Runtime local de pesos abiertos con licencia, aislamiento y evaluación verificables.
- Persistencia real de métricas y medición económica de los flujos nativos.
- Auditoría de sesgos, seguridad, privacidad y contenido con criterios reproducibles.
- Validación en navegadores, dispositivos y redes objetivo.

## Estructura

```text
src/server.ts                 Servidor y composición del runtime
src/inference/                Cognición, proveedores y multimodalidad
src/agents/                   Agente local y herramientas
src/routes/                   API HTTP
src/memory/                   Memoria y contexto
src/bookpi/                   Evidencia append-only
src/security/                 Seguridad y confianza
src/commerce/                 Suscripciones, Stripe y webhooks
src/economy/                  Ledger y monetización
src/platform/                 Páginas, catálogo y canon
src/ui/                       Interfaz web
scripts/                      Aseguramiento y smoke tests
test/                         Pruebas
docs/                         Especificaciones y contratos
```

## Registro

- **Proyecto:** Isabella Villaseñor AI · Genesis TINA V6 · TAMV Online Network.
- **Nodo Cero:** Real del Monte, Hidalgo, México.
- **Fundador:** Edwin Oswaldo Castillo Trejo (Anubis Villaseñor).
- **ORCID:** `0009-0008-5050-1539`.
- **DOI:** `10.5281/zenodo.20606361`.
- **Licencia:** MIT — [`LICENSE`](LICENSE).
- **Seguridad:** [`SECURITY.md`](SECURITY.md).
- **Constitución operativa:** [`AGENTS.md`](AGENTS.md).

La documentación debe mantenerse alineada con el código, las pruebas y la evidencia observada. Si existe conflicto entre esta guía y la especificación canónica en `docs/spec/` o `docs/evolution/`, prevalece la especificación y el conflicto debe registrarse para arbitraje humano.
