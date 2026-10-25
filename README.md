# ISABELLA VILLASEÑOR AI · GENESIS TINA V6

**Isabella** es una plataforma de inteligencia gobernada: conversación, agentes locales gratuitos, catálogos de capacidades, observabilidad, evidencia e integración REST. Este repositorio contiene el runtime V6 Terminus, la interfaz web multipágina y el chat dedicado.

> **Invariante de diseño:** CAPABILITY ≠ AUTHORITY ≠ EXECUTION ≠ EVIDENCE ≠ LEARNING ≠ PRODUCTION.
>
> **Contrato de evidencia:** SPECIFIED ≠ IMPLEMENTED ≠ TESTED.
>
> Un módulo presente en el código no equivale a una integración externa activa ni a un despliegue certificado. Este README describe el árbol actual; no es una certificación de producción.

## Mapa rápido

| Superficie | Ruta |
| --- | --- |
| Chat dedicado | `/chat` |
| Plataforma multipágina | `/platform` |
| Catálogo público de la plataforma | `/api/v1/platform/catalog` |
| Estado del nodo | `/platform/status` |
| Guía para desarrolladores | `/platform/developers` |
| Inventario generado de rutas | [`docs/api/README.md`](docs/api/README.md) |
| Benchmark de interfaces y decisiones adoptadas | [`docs/design/AI-INTERFACE-BENCHMARK-2026-10.md`](docs/design/AI-INTERFACE-BENCHMARK-2026-10.md) |

## Qué incluye esta revisión

- **Chat dedicado** en `/chat`: sesiones locales, búsqueda de historial, adjuntos de texto, voz nativa con entrega SSE por oración y barge-in —con respaldo a `speechSynthesis`—, exportación Markdown/JSON, inspector de sesión y entrega progresiva SSE.
- **Plataforma de 17 páginas** agrupadas en cinco áreas (Espacio, Capacidades, Comercial, Confianza y Cuenta local), con HTML renderizado en servidor, activos con hash de contenido, ETag, compresión previa y un 404 real para rutas fuera del catálogo.
- **Seguridad verificada, no declarada**: contraseñas scrypt, TOTP sin replay, WebAuthn con anclas y firma, certificados con SPKI fijado, dispositivo con reto de un solo uso, evidencia gobernada por claves registradas y sandbox que falla cerrado. 27 pruebas nuevas cubren los caminos positivos y negativos.
- **HyperCore Turbo v2** aplicado a los cuellos de botella reales: fast lane determinista, caché TTL + LRU con single-flight y stale-while-revalidate, compuerta de concurrencia para proveedores, histogramas acotados de latencia y fragmentación determinista para SSE.
- **Motores nativos honestos**: LLM determinista con traza, router MoE top-k, TTS es-MX con fairness y memoizador Turbo. Calculan en proceso; no se presentan como redes neuronales entrenadas ni como un MoE de producción.
- **Ocho flujos de monetización cotizables** por unidades reales, con aritmética entera y reparto en puntos base. Cotizar no cobra ni transfiere.
- **Agente local gratuito y determinista**: siete herramientas allowlisted, sin modelo generativo, sin shell, sin filesystem y sin red externa. Las escrituras exigen un token administrativo verificado por el servidor, nunca un campo del cuerpo HTTP.
- **Rutas públicas de cognición** JSON y SSE con cuota separada: las respuestas locales no consumen la cuota de proveedores externos.
- **Contratos congelados**: 230 rutas inventariadas desde `src/`, pruebas de entorno, pruebas de seguridad y pruebas de rendimiento de CPU.
- **Verdad operativa visible**: la interfaz declara el motor real, la latencia, los fragmentos y el estado de readiness. Un fallback local no se presenta como un LLM.
- **Paleta preservada**: cristal cian `#9ff7ff`, lila `#c9b8ff`, menta `#a9f5d0`, rosa `#ffb9d8`, tinta `#07131b` y fondo `#070c13`.

## Estado real de esta versión

- La política de reparto v5, la persistencia de suscripciones, el checkout de Stripe, la verificación de webhooks y el libro mayor transaccional están implementados en esta rama. Su validación real requiere PostgreSQL de prueba, variables privadas y pruebas end-to-end.
- **Avance global de implementación: no publicado como porcentaje único.** No existe un denominador de requisitos ponderados y reproducible que permita derivar una cifra verificable; cada subsistema debe evaluarse con sus pruebas y evidencia.
- Los pagos a creadores mediante Stripe Connect, el onboarding KYC, las retenciones/impuestos, las devoluciones, los contracargos y la conciliación bancaria **no están habilitados**. El devengo contable no significa que el dinero se haya transferido.
- `POST /api/v1/revenue/my/wallet/payout` responde `503 PAYOUTS_NOT_CONFIGURED` hasta que exista un proveedor de payout real, KYC, política fiscal, holdback y conciliación.
- Los encabezados `x-user-id` y `x-session-id` no se aceptan como identidad: las rutas de wallet exigen identidad verificada por el host.
- `GET /api/v1/readyz` puede responder `503` de forma honesta cuando una dependencia requerida no está configurada. Un proceso que sirve HTML no es lo mismo que un sistema listo para producción.
- El historial del chat, la biblioteca, el perfil y las preferencias viven en `localStorage` del navegador. No hay sincronización de cuenta en esta interfaz.
- Los proveedores externos, si el operador los habilita, reciben el prompt y parte del historial según su propia política. El modo Soberano evita esa llamada.

## Arquitectura

| Área | Responsabilidad |
| --- | --- |
| `src/server.ts` | Runtime HTTP, gobernanza, cuotas, wiring de dependencias y rutas cognitivas |
| `src/platform/` | Catálogo declarativo, render SSR y contrato de las 17 páginas |
| `src/routes/platform.ts` | Rutas HTML, activos inmutables y catálogo de plataforma de solo lectura |
| `src/routes/agents.ts` | Catálogo y ejecución del agente local; aprobación decidida en servidor |
| `src/agents/` | Runtime determinista, herramientas allowlisted y conocimiento curado |
| `src/performance/hypercore-turbo.ts` | Caché, coalescing, gate, histogramas y chunking determinista |
| `src/hypercore/turbo-optimizer.ts` | Memoizador LRU con métricas de acierto y latencia por proceso |
| `src/inference/local-fast-lane.ts` | Detección de intenciones locales acotadas y no ambiguas |
| `src/routes/native-engines.ts` | API de motores nativos: inventario, generación local y diagnóstico MoE |
| `src/tts/` y `src/lib/native-ml/` | Voz es-MX, router con fairness, TTS nativo y MoE top-k gobernado |
| `src/security/rate-limit.ts` | Límites de ventana fija por proceso, con fallo cerrado bajo presión |
| `src/ui/platform/` | Chat dedicado (`chat.html`, `chat.js`) y plataforma multipágina (`site.css`, `site.js`) |
| `src/commerce/` y `src/economy/` | Suscripciones, reparto, ledger de doble entrada, webhooks, outbox y flujos de monetización |
| `src/routes/economy.ts` | API v3: valuación, cotización dinámica, regalías y flujos de monetización |
| `src/bookpi/` | Evidencia encadenada; backend en memoria, JSONL o PostgreSQL según configuración |
| `src/ige-omega/` | Sonda acotada de salud del gateway Rust; no implica inferencia autenticada |
| `test/` | Contratos de rutas, entorno, seguridad, agentes, HyperCore y rendimiento |
| `scripts/` | Inventario de rutas, aseguramiento del repositorio, smoke tests y evidencia |

Los motores de monetización heredados que producen simulaciones o estructuras en memoria no deben usarse como fuente de verdad financiera. Los nuevos settlements pasan por la política compartida de `src/commerce/revenue-share.ts` y el motor normalizado de Revenue Fabric.

## Motores nativos (in-process)

Estos motores calculan dentro del proceso. Ninguno concede autoridad ni ejecuta efectos gobernados: son superficies de cómputo, no de decisión.

| Motor | Archivo | Qué hace de verdad | Qué NO es |
| --- | --- | --- | --- |
| LLM nativo | `src/inference/local-engine.ts` | Coincidencia determinista de intenciones con traza de términos, puntaje de coincidencia y distribución de intenciones servidas | Un modelo neuronal entrenado |
| MoE nativo | `src/lib/native-ml/moe-native.ts` | Router top-k con SGD puro en TypeScript; artefactos con verificación de hash y diagnóstico de balance (entropía, Gini, desviación de carga) | Un MoE de producción con miles de expertos |
| TTS nativo | `src/tts/` | Normalización es-MX, prosodia, pistas culturales, emoción heurística de 12 ejes, enrutamiento con fairness, memoria de pronunciación y gobernanza anti-replay | Un vocoder neural (AMoSE/BigVGAN) |
| Hyper Core Turbo (memoizador) | `src/hypercore/turbo-optimizer.ts` | Memoizador acotado con desalojo LRU real, `hitRate` como fracción (0..1), latencia p50/p95 y muestras de contexto en buffer aparte | Una caché distribuida o un benchmark de throughput |
| HyperCore Turbo v2 (compuerta) | `src/performance/hypercore-turbo.ts` | TTL + LRU con single-flight, stale-while-revalidate, compuerta de proveedores, histogramas y fragmentación SSE | Streaming nativo del proveedor |
| Router cognitivo de voz | `src/tts/router.ts` | Softmax top-k con término de fairness `−β·share` sobre backends reales | Expertos neuronales aprendidos |
| Entrega de voz progresiva | `src/tts/streaming.ts` | Segmentación de oraciones es-MX sobre deltas, eliminación de bloques de razonamiento partidos, topes de búfer y barge-in por actor con TTL y consumo único | Audio PCM, vocoder o streaming nativo del proveedor |
| Presupuesto de contexto | `src/inference/context-budget.ts` | Estimación determinista de tokens, protección de system prompt/ancla/cola y resumen extractivo **literal** del medio; publica la estrategia aplicada | Un resumen generativo o una memoria canónica |
| Inspector de artefactos abiertos | `src/inference/open-model-artifact.ts` | Cabeceras GGUF v1–v3, manifiesto, SHA-256, tamaño, procedencia HTTPS y clasificación SPDX de licencia; nunca carga pesos | Una descarga, una ejecución o una aprobación de producción |

### Honestidad de métricas

- `hitRate` es una fracción de operaciones del proceso (0..1); `cacheHitRate` es el mismo valor en porcentaje (0..100). Nunca puede superar 1.
- Las cifras de latencia son mediciones de reloj de pared del trabajo envuelto, no de la red ni del proveedor.
- El diagnóstico MoE reporta el router **inicial (no entrenado)** como línea base; entrenar es una operación gobernada y separada, con aprobación `PENDING_REVIEW`.
- Un acierto de caché no es una autorización y una traza no es evidencia de producción.

## Superficies web

La plataforma es multipágina a propósito: la conversación, la administración, el comercio y la documentación no comparten el mismo lienzo.

| Grupo | Ruta | Propósito |
| --- | --- | --- |
| Espacio | `/chat` | Chat dedicado; sesión local y entrega progresiva |
| Espacio | `/platform` | Panorama de la plataforma y sus límites |
| Espacio | `/platform/status` | Salud, readiness, proveedores y métricas locales |
| Capacidades | `/platform/skills` | Catálogo auditable de skills; listar no ejecuta |
| Capacidades | `/platform/tools` | Herramientas y política del agente local |
| Capacidades | `/platform/marketplace` | Catálogo y resolución de packs; no instala |
| Capacidades | `/platform/integrations` | REST, SSE, voz, visión, webhooks y proveedores |
| Comercial | `/platform/pricing` | Planes y cuotas leídas del servidor |
| Comercial | `/platform/donations` | Apoyo al proyecto; sin pagos simulados |
| Confianza | `/platform/governance` | Separación entre capacidad, autoridad y evidencia |
| Confianza | `/platform/docs` | Documentación, madurez y operación |
| Confianza | `/platform/developers` | Endpoints, ejemplos, límites y compatibilidad |
| Confianza | `/platform/faq` | Respuestas directas sobre producto, privacidad y costos |
| Confianza | `/platform/about` | Origen, registro académico y compromiso |
| Cuenta local | `/platform/library` | Archivos y artefactos guardados en el navegador |
| Cuenta local | `/platform/profile` | Perfil local, insignias e historial |
| Cuenta local | `/platform/settings` | Motor, lente, streaming, voz y borrado de datos |

Todas las páginas se compilan una vez al arrancar. Los activos se sirven con hash de contenido y caché inmutable; el HTML usa `no-cache` y ETag. `/platform/chat` redirige con `308` a `/chat`. Una página desconocida devuelve `404`, no una redirección silenciosa.

## HyperCore Turbo v2

HyperCore Turbo no promete una velocidad imposible: elimina trabajo evitable y hace visible el que queda.

| Primitiva | Comportamiento real |
| --- | --- |
| Fast lane determinista | Resuelve intenciones cortas y no ambiguas sin red: saludo, gratitud, identidad, capacidades, privacidad, presencia, hora, aritmética, estado del nodo, skills y conocimiento curado |
| Caché de respuestas | TTL + LRU acotada, con coalescing de cargas simultáneas y stale-while-revalidate |
| Compuerta de proveedores | Máximo 6 llamadas concurrentes y 96 en cola; la saturación falla cerrado |
| Histogramas | p50/p90/p95/p99 sobre una ventana acotada de muestras, por proceso |
| Entrega progresiva | Fragmentos deterministas de texto ya generado; no es streaming nativo del proveedor |
| Cache key de cognición | Incluye entrada, motor, lente e historial saneado; nunca autoridad |

Reglas de la fast lane:

- Solo se activa para entradas de hasta **240 caracteres** que coincidan con un patrón inequívoco.
- Una pregunta general, larga o ambigua sigue la ruta gobernada de proveedores.
- La fast lane no concede autoridad, no ejecuta efectos externos y no afirma ser un modelo de lenguaje.
- El clasificador Genesis Turbo solo se ejecuta cuando no existe ya una respuesta local completa.

Mediciones locales de esta revisión (`Server-Timing`, proceso de desarrollo, no SLA):

| Intención | Latencia en caliente | Primera invocación |
| --- | ---: | ---: |
| Hora del servidor | 6–15 ms | ~234 ms |
| Conocimiento curado | 3–11 ms | ~137 ms |
| Ruta HTTP completa (reloj) | 15–24 ms | ~464 ms |

La primera invocación paga inicialización de JIT/ICU; por eso el formateador de fecha y el índice de conocimiento se construyen una sola vez. El arranque con `tsx` es más lento que producción y no se oculta.

## Agente local gratuito y seguro

El agente local es la primera ruta funcional de Isabella cuando no hay proveedor configurado. No es un LLM: es un runtime determinista con herramientas acotadas.

| Herramienta | Efecto | Límite |
| --- | --- | --- |
| `clock.now` | Lectura | Hora UTC y `America/Mexico_City` |
| `math.calculate` | Lectura | Aritmética con `+ - * / % ^` y paréntesis; sin `eval` |
| `text.summarize` | Lectura | Resumen extractivo local de 40–4.000 caracteres |
| `knowledge.search` | Lectura | Búsqueda en conocimiento curado; sin web ni memoria privada |
| `platform.status` | Lectura | Resumen acotado del proceso, BookPI y readiness declarada |
| `skills.list` | Lectura | Catálogo; no ejecuta skills |
| `memory.proposal` | Escritura | Cola de revisión; no muta memoria canónica |

Política de ejecución:

- Entrada máxima de **4.000 caracteres**; máximo **3 herramientas** por ejecución; **1.500 ms** por herramienta.
- Sin shell, sin filesystem, sin navegador, sin acceso a entorno y sin red saliente.
- Las herramientas de lectura no crean autoridad. `memory.proposal` requiere aprobación administrativa.
- La aprobación se decide comparando un bearer administrativo contra el secreto del proceso; enviar `approvalGranted: true` en el cuerpo no sirve.
- Los resultados y errores se acotan para no filtrar detalles internos.
- Cada ejecución genera un evento de auditoría; el sellado BookPI es best-effort y un fallo se contabiliza, no se oculta.
- El agente no modifica la memoria canónica, no crea evidencia de producción y no sustituye revisión humana.

## Modelos gratuitos y open source: qué es real hoy

La estrategia implementada es **local primero y externo con opt-in explícito**:

1. **Determinista local**: fast lane y agente allowlisted. Gratis, sin clave, sin red y con latencia medida.
2. **Proveedores gratuitos configurables**: keyless con opt-in del operador, OpenRouter en modelos gratuitos explícitos, Hugging Face, AI Gateway y endpoints compatibles. La cadena `Auto` intenta las rutas habilitadas y declara el motor ganador.
3. **Proveedores de pago**: doble candado. Requieren configuración del operador y autorización; no se activan silenciosamente.
4. **Fallback declarado**: si no hay proveedor disponible, la respuesta se marca `sovereign-fallback`; no se presenta como inferencia de un LLM.

Reglas para integrar agentes open source sin romper la gobernanza:

- Ejecutar el modelo en un proceso separado con límites de CPU, memoria y tiempo; nunca dentro del proceso HTTP principal.
- Mantener una allowlist de herramientas y negar por defecto shell, filesystem, red y credenciales.
- Separar lectura de escritura; toda escritura requiere aprobación verificada en servidor.
- Acotar entrada, salida, número de pasos y tiempo total; fallar cerrado ante saturación.
- No enviar secretos al modelo, al navegador ni a prompts.
- Declarar licencia, procedencia y limitaciones de cada modelo, dataset y herramienta.
- No prometer inferencia gratuita ilimitada: la cuota, disponibilidad y licencia dependen de cada proveedor.

Los adaptadores `OllamaAdapter` y `OllamaProvider` existen en el repositorio, pero el encadenamiento cognitivo principal **no afirma** que Ollama, llama.cpp u otro runtime local de pesos abiertos esté activo por defecto. Habilitarlo exige configuración, pruebas de integración y un gate de seguridad explícito. Esta es una ruta de evolución, no una capacidad certificada.

Antes de habilitar cualquier peso abierto, `src/inference/open-model-artifact.ts` inspecciona la cabecera GGUF (v1–v3) y el manifiesto sin cargar el modelo: verifica SHA-256, tamaño y procedencia HTTPS, y clasifica la licencia en SPDX (`permissive`, `copyleft`, `proprietary` o `unknown`). Un informe válido demuestra integridad del archivo, **no** aprobación de producción ni permiso de uso comercial; por eso declara `authority: "NONE"` y `productionApproved: false`. El inspector no descarga, no ejecuta y no está expuesto como ruta HTTP.

## APIs públicas

| Método | Endpoint | Función |
| --- | --- | --- |
| GET | `/api/v1/health` | Salud superficial del proceso |
| GET | `/api/v1/healthz` | Readiness; puede ser `503` si falta una dependencia |
| GET | `/api/v1/readyz` | Readiness con evidencia por dependencia |
| GET | `/api/v1/status` | Identidad, versión y estado operativo |
| POST | `/api/v1/cognition/route` | Respuesta cognitiva gobernada en JSON |
| POST | `/api/v1/cognition/stream` | Entrega progresiva por SSE |
| GET | `/api/v1/agents` | Catálogo y política del agente local |
| POST | `/api/v1/agents/run` | Ejecuta el agente local con herramientas allowlisted |
| GET | `/api/v1/hypercore/turbo/status` | Métricas locales, gate, caché y estado del agente |
| GET | `/api/v1/hypercore/skills` | Catálogo de skills del motor HyperCore |
| GET | `/api/v1/platform/catalog` | Catálogo de las 17 páginas; autoridad `READ_ONLY` |
| GET | `/api/v1/billing/plans` | Planes y cuotas declaradas por el servidor |
| POST | `/api/v1/tts/stream` | Entrega progresiva de planes de prosodia por SSE |
| POST | `/api/v1/tts/interrupt` | Barge-in de un solo uso por actor |

El inventario completo y generado de **232 rutas** está en [`docs/api/README.md`](docs/api/README.md) y [`docs/api/route-inventory.json`](docs/api/route-inventory.json). La superficie está congelada por una prueba de contrato; añadir o renombrar una ruta exige regenerar el inventario deliberadamente.

### Motores nativos y economía

| Método | Endpoint | Función |
| --- | --- | --- |
| GET | `/api/v1/native/engines` | Inventario de motores nativos con su estado y límites declarados |
| GET | `/api/v1/native/llm/status` | Estado del LLM nativo y distribución de intenciones servidas |
| POST | `/api/v1/native/llm/generate` | Generación determinista con traza; requiere administración |
| POST | `/api/v1/native/moe/diagnostics` | Diagnóstico real de balance del router MoE; requiere administración |
| GET | `/api/v1/hf/references` | Referencias verificadas del Hub por dominio nativo (`?domain=llm\|moe\|tts\|asr`) |
| GET | `/api/v3/economy/streams` | Catálogo de flujos de monetización con resumen por cadencia |
| POST | `/api/v3/economy/quote` | Cotiza un flujo; `fundsMoved:false`, sin cobro ni transferencia |

Las respuestas de los motores nativos declaran `authorizationPerformed:false` y `executionPerformed:false`. Generar texto, diagnosticar un router o cotizar un flujo no concede autoridad, no cobra y no produce efectos gobernados.

### Conversación

```bash
curl -s http://127.0.0.1:3000/api/v1/cognition/route \
  -H 'content-type: application/json' \
  -d '{"input":"Explica el invariante de gobernanza.","modelEngine":"auto","focusLens":"governance","history":[]}'
```

Campos relevantes de la respuesta: `output`, `responseEngine`, `fastLane`, `fastLaneInfo`, `decision`, `nativeRouting`, `conversationContextTurns`, `contextBudget` y la disponibilidad declarada de proveedores. La cabecera `Server-Timing: cognition;dur=...` mide la ruta cognitiva.

### Entrega progresiva

`POST /api/v1/cognition/stream` con el mismo cuerpo devuelve `text/event-stream`:

- `meta`: `requestId`, `modelEngine`, `admitted`, `streamMode`, `contextBudget`.
- `chunk`: `index`, `text`.
- `done`: `responseEngine`, `fastLane`, `fastLaneInfo`, `chunks`, `latencyMs`, `providerReadiness`, `contextBudget`, `disclaimers`.
- `error`: código saneado.

La respuesta se genera completa y luego se fragmenta de forma determinista. **No es streaming nativo del proveedor.** Un fragmento no es evidencia ni autorización.

La voz sigue la misma disciplina con `POST /api/v1/tts/stream`: emite `meta`, `chunk`, `interrupted` y `done` con planes de prosodia por oración —ritmo, tono, pausas y respiración—, no audio PCM. `POST /api/v1/tts/interrupt` marca un barge-in de un solo uso y alcance por actor; una entrega en curso responde `interrupted` sin chunks posteriores y la marca se consume. Ambos declaran `authorizationPerformed: false` y `executionPerformed: false`.

La interfaz de chat consume esos eventos con `fetch` + lector SSE: reproduce cada oración en orden, respeta `pauseAfterMs` con un tope de 1,2 s y, al desactivar la voz o enviar un mensaje nuevo, aborta el lector, cancela la síntesis del navegador y publica el mismo `x-session-id` en `/api/v1/tts/interrupt`. Si el stream no entrega ningún chunk (por ejemplo, backend no disponible), recurre a `speechSynthesis` con el texto completo. El texto hablado nunca se ejecuta ni concede autoridad.

### Límites de tasa

| Bucket | Límite |
| --- | ---: |
| Cognición pública (`route`, `stream`) | 30/minuto |
| Proveedor externo (`route`, `stream` cuando aplica) | 8/minuto |
| Propuestas de memoria | 10/minuto |
| Escaneos y catálogos públicos | 30/minuto |
| Economía y Omega | 20/minuto |
| Lingüística | 20/minuto |

La cuota de proveedor solo se consume cuando la petición puede alcanzar un proveedor externo. Las respuestas locales siguen disponibles bajo la cuota de cognición. Los límites son por proceso y por bucket + IP; **no son un WAF distribuido**. Respeta `429` y `Retry-After`.

### Límites de entrada

- Entrada cognitiva máxima: **20.000 caracteres**.
- Historial saneado a **8 turnos** y comprimido antes de llegar al proveedor con un presupuesto determinista (`CHAT_CONTEXT_MAX_INPUT_TOKENS`, 512–32.000; por defecto 3.000). Se conservan el system prompt, el ancla y los últimos turnos; el medio se resume de forma extractiva literal, nunca generativa. El historial sigue siendo contexto no confiable, jamás instrucciones de sistema.
- Agente local: **4.000 caracteres**, 3 herramientas, 1.500 ms por herramienta.
- Adjuntos del chat: 120 KB por archivo y 240 KB por mensaje.

## Seguridad y datos

- **Nunca** publiques ni envíes al navegador `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` ni tokens administrativos. Viven solo en el entorno del servidor.
- Ningún cuerpo HTTP concede autoridad, roles, scopes o aprobación. La capa de confianza decide.
- **Verificación criptográfica real:** contraseñas con scrypt y sal por hash; TOTP RFC 6238 con ventana ±1 y anti-replay por paso; WebAuthn con anclas RP ID/origen, flags UP/UV, `signCount` creciente y firma de la aserción; certificados con SPKI fijado y firma del reto; dispositivo con reto de un solo uso emitido por el servidor y firma fresca. Sin anclas configuradas se falla cerrado.
- **Gobernanza cognitiva:** denegación por defecto sin política aplicable, DSL restringido sin `eval`, firmas de evidencia solo contra claves registradas, clasificación con clearance, cadena de procedencia verificada y sandbox que rechaza ejecutar sin backend de aislamiento.
- La caché no es un permiso; el single-flight no crea identidad; los fragmentos SSE no son evidencia. La verificación criptográfica es local y no sustituye una auditoría externa.
- BookPI registra integridad, no veracidad. La memoria de proceso no es durable; JSONL local no es WORM; PostgreSQL es durable y compartido, pero no WORM.
- El rate limiter es de ventana fija por proceso. No se eliminan buckets activos para admitir claves nuevas: bajo presión se falla cerrado.
- El chat público no muta la memoria canónica. Las propuestas quedan en cola de revisión.
- El contenido de usuario se escapa antes de insertarse en el DOM. Las respuestas del modelo se tratan como texto no confiable.
- La compatibilidad OpenAI es de protocolo, no de identidad ni afiliación.

## Configuración

Copia `.env.example` a `.env` y reemplaza solo valores locales. Nunca subas secretos reales.

Variables principales:

```dotenv
DATABASE_URL=postgresql://user:password@host:5432/isabella
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=
ISABELLA_PUBLIC_URL=https://tu-dominio.example

# Solo servidor
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_PREMIUM=
STRIPE_PRICE_VIP=
STRIPE_PRICE_ENTERPRISE=

# Proveedores opcionales
OPENROUTER_API_KEY=
OPENROUTER_FREE_MODEL=google/gemini-flash-1.5
KEYLESS_FREE_PROVIDER=
AI_GATEWAY_API_KEY=
GEMINI_API_KEY=

# Precio Premium de referencia
ISABELLA_REFERENCE_AI_PRICE_CENTS=2000
ISABELLA_PRICE_MARKUP_BPS=2500
```

Cada lectura de `process.env` en `src/` debe estar documentada en `.env.example`; una prueba de contrato lo verifica. Para el detalle completo, consulta [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md).

### Migraciones

Aplicar en un entorno de pruebas, en este orden:

1. `src/commerce/migrations/002_persistent_subscriptions.sql` — suscripción persistente, cliente Stripe y orden de eventos.
2. `src/economy/revenue-fabric/migrations/002_creator_share_policy.sql` — atribución del creador, unidades monetarias versionadas y distribución de plataforma.

Verifica respaldo, permisos y resultado de cada migración. No ejecutes cambios financieros directamente sobre producción sin staging.

### Stripe

1. Configura Price IDs mensuales de VIP y Enterprise.
2. Para Premium, configura un Price ID solo si coincide con el importe calculado por la política.
3. Registra `/api/v1/billing/stripe/webhook` en Stripe.
4. Suscribe al menos `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated` y `customer.subscription.deleted`.
5. Configura `STRIPE_WEBHOOK_SECRET` y verifica `/api/v1/revenue/health`.
6. Prueba checkout, cancelación, vencimiento, eventos repetidos y eventos fuera de orden en modo test.

`checkout.session.completed` por sí solo no concede elegibilidad: el estado pagado se determina con eventos de suscripción firmados y un periodo vigente.

## Flujos nativos de monetización

`src/economy/monetization-streams.ts` define ocho flujos medidos por unidades que el runtime nativo puede contar de verdad. Todos usan aritmética entera sobre unidades menores (centavos) y reparto exacto en puntos base; el remanente de redondeo lo absorbe la plataforma.

| ID | Flujo | Unidad | Cadencia |
| --- | --- | --- | --- |
| `M-21-native-llm-tokens` | LLM nativo por token | `inference_token` | uso |
| `M-22-moe-routing` | Enrutamiento MoE por consulta | `moe_route` | uso |
| `M-23-native-tts-chars` | TTS nativo por carácter | `tts_character` | uso |
| `M-24-native-asr-seconds` | ASR nativo por segundo | `asr_second` | uso |
| `M-25-evidence-seals` | Sellos de evidencia BookPI | `evidence_seal` | uso |
| `M-26-sovereign-data-vault` | Bóveda de datos soberana | `vault_gb_month` | recurrente |
| `M-27-federation-capacity` | Capacidad de federación | `federation_hour` | recurrente |
| `M-28-agent-tasks` | Tareas de agente verificadas | `agent_task` | evento |

Los precios son referencias de configuración, **no un promedio de mercado verificado** ni una garantía de ingresos. La participación del creador se limita al rango de política 50–80%. La cotización calcula; no cobra, no debita y no transfiere. El medidor persistido de estos flujos aún no está conectado al ledger económico.

## Política de reparto v5

La política aplica sobre el **pool distribuible**, después de costes directos, impuestos, comisiones de pasarela y reservas configuradas.

| Tipo de ingreso | Creador | Plataforma |
| --- | ---: | ---: |
| API de Isabella (`ISA_API`) | 75% | 25% |
| Starter | 50% | 50% |
| Professional | 60% | 40% |
| Advanced | 70% | 30% |
| Elite | 80% | 20% |
| Sovereign | 80% | 20% |
| Hyperautomation | 50–80%, según nivel | 50–20% |
| Suscripción de Isabella | 0% | 100% |
| Data Vault | 50–80%, con evidencia explícita | 50–20% |

La elegibilidad del creador se resuelve en servidor: identidad verificada, plan de pago (`premium`, `vip` o `enterprise`), suscripción `active`, periodo pagado vigente e identificador de creador válido. Las cuentas gratuitas, en prueba, vencidas, canceladas o sin estado verificable no reciben participación. Si falta la fuente persistente, la elegibilidad falla de forma cerrada.

La participación de plataforma se asigna internamente: **20%** Fondo Fénix, **30%** infraestructura y **50%** DAO/tesorería comunitaria. Es una asignación contable, no una transferencia de fondos. El cálculo usa centavos enteros y el residuo de redondeo se asigna a DAO.

El plan Premium usa una referencia configurable de **US$20/mes** y un margen predeterminado del **25%**, para un precio calculado de **US$25/mes**:

`monthlyPrice = ceil(referencePriceCents × (10000 + markupBps) / 10000)`

Es una regla de configuración, no un promedio de mercado verificado. Si `STRIPE_PRICE_PREMIUM` está configurado, Stripe debe devolver un precio activo en USD, mensual y con el mismo importe calculado.

## Integridad financiera

- El ledger usa enteros en unidades menores (centavos), no punto flotante.
- La persistencia escribe journal, settlement y outbox en una sola transacción PostgreSQL.
- Las escrituras se serializan con bloqueo transaccional y verifican la cabeza actual de la cadena.
- La restauración recorre la cadena por `previous_hash`, no por fecha; verifica hash y balance de débitos/créditos.
- Los endpoints de settlement y consumo exigen una clave idempotente estable de 8–200 caracteres seguros.
- Las claves de idempotencia no pueden reutilizarse con un payload económico diferente.
- Los eventos Stripe se verifican con firma HMAC y ventana temporal de cinco minutos, se deduplican en inbox y solo se aplican si son más recientes.
- Los registros antiguos conservan `legacy_major`; los nuevos usan `minor_v2`. No se reescriben asientos históricos.
- Si la base histórica tiene más de una cabeza de ledger, el sistema falla cerrado y exige reconciliación manual.

## Desarrollo y validación

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm run format:check
pnpm test
pnpm run build
```

Pruebas específicas de esta superficie:

```bash
pnpm exec vitest run test/agents test/inference/local-fast-lane.test.ts
pnpm exec vitest run test/platform test/deployment/route-inventory.test.ts
pnpm exec vitest run test/performance test/deployment/ttl-single-flight.test.ts
```

Para PostgreSQL y runtime:

```bash
pnpm run postgres:e2e
pnpm run smoke:runtime
pnpm run smoke:production
```

No se afirma que estas comprobaciones estén aprobadas en CI remota hasta que el pipeline muestre resultados exitosos. `pnpm run build` ejecuta el aseguramiento estructural del repositorio, la suite completa y el bundle de producción; los bloqueos de aseguramiento no se omiten.

### Verificación local de esta revisión

Ejecutada antes del push sobre el árbol de este commit:

| Comprobación | Resultado |
| --- | --- |
| `pnpm run typecheck` | Sin errores (incluye `zero-trust` y `gobernanza cognitiva`) |
| `pnpm run lint` | Sin errores ni advertencias; ambos módulos dejaron de estar excluidos |
| `node scripts/repository-assurance.mjs` | PASS: 43/44 comprobaciones; 0 fallos; 1 advertencia (RA-028) |
| `vitest run --maxWorkers=4` | 307 archivos y 1.851 pruebas aprobadas; 0 fallos |
| `esbuild` + `node --check` | Bundle ESM generado; sintaxis válida en servidor y UI |
| `node scripts/check-env-example.mjs` | OK: 141 claves documentadas, 96 variables leídas en `src/` |
| `node scripts/generate-status.mjs --check` | `STATUS_OK` |
| `prettier --check` | Pendiente por el desajuste histórico del árbol (ver gates) |

La suite se ejecutó con paralelismo limitado para evitar el agotamiento de recursos de Windows que interrumpió el arranque de workers en una primera pasada. `pnpm run format:check` sigue pendiente por el desajuste histórico descrito en los gates. Esta evidencia es local y no sustituye el resultado de la CI remota.

## Gates pendientes para liberar

- Ejecutar CI completa en el remoto y confirmar typecheck, lint, formato, pruebas y build.
- Validar PostgreSQL, migraciones, Stripe test mode y Supabase Auth en staging.
- Implementar Stripe Connect, onboarding/KYC, cálculo fiscal/CFDI, retiros, reembolsos, contracargos y conciliación.
- Añadir moderación de ofertas y disputas de marketplace.
- Confirmar procesamiento de outbox persistente y alertas operativas.
- Revisar el historial del ledger: si hay ramas múltiples, conciliarlas mediante un procedimiento auditado.
- Validar una matriz de dispositivos y navegadores más amplia; la revisión actual cubre escritorio y móvil emulado.
- Certificar cualquier runtime local de pesos abiertos (Ollama/llama.cpp/vLLM) antes de presentarlo como proveedor activo.
- Sustituir el rate limiting por proceso por un control distribuido si se despliega en múltiples réplicas.
- Probar recuperación ante caída, rotación de claves y restauración de evidencia.
- Conectar el medidor real de los flujos nativos (tokens, rutas MoE, caracteres TTS, sellos) al ledger económico: hoy la cotización existe, la medición persistida no.
- Alinear el formato histórico con `prettier.config.mjs`: la verificación global reporta archivos preexistentes y debe resolverse antes de exigir `format:check` como gate.

**No confundir:** catálogo ≠ disponibilidad; sesión de checkout ≠ suscripción activa; devengo ≠ dinero pagado al creador; cotización ≠ cobro; caché ≠ permiso; fragmento SSE ≠ evidencia; código implementado ≠ despliegue verificado.

## Registro y licencia

- **Proyecto:** Isabella Villaseñor AI · Genesis TINA V6 · TAMV Online Network.
- **Nodo Cero:** Real del Monte (Mineral del Monte), Hidalgo, México.
- **Fundador:** Edwin Oswaldo Castillo Trejo (Anubis Villaseñor).
- **ORCID:** 0009-0008-5050-1539.
- **DOI:** 10.5281/zenodo.20606361.
- **Licencia:** MIT, ver [`LICENSE`](LICENSE).
- **Seguridad:** consulta [`SECURITY.md`](SECURITY.md) antes de reportar una vulnerabilidad.

La confianza se demuestra con código, pruebas y evidencia; no con una declaración de marketing.
