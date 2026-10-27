# Isabella Villaseñor AI — Genesis TINA V6

**Proyecto:** Isabella Villaseñor AI · TAMV Online Network  
**Versión del paquete:** `0.1.0`  
**Rama auditada:** `main`  
**Commit auditado:** `9add636bdba1a84525df8812eaad915df93fc139`  
**Estado:** **PREPRODUCCIÓN — despliegue registrado, liberación productiva no certificada**  
**Avance de producción:** **61% (estimación conservadora de referencia; no equivale a aprobación de release).** Debe recalcularse con evidencia reproducible después de cerrar los gates de CI, runtime, persistencia y proveedor real.

> **CAPABILITY ≠ AUTHORITY ≠ EXECUTION ≠ EVIDENCE ≠ LEARNING ≠ PRODUCTION**
>
> Que una capacidad exista en el código o que un despliegue finalice no prueba por sí solo que esté operativa, sea durable, segura o esté certificada para producción.

## 1. Qué es

Isabella es un runtime web de conversación y gobernanza de capacidades para TAMV Online Network. Integra servidor HTTP, interfaz web, rutas cognitivas, agentes locales deterministas, selección opcional de proveedores de IA, memoria acotada, BookPI, observabilidad, voz, integraciones y componentes comerciales.

La capa `src/omega/genesis/` organiza capacidades en doce capas deterministas. No constituye un modelo fundacional entrenado ni demuestra conciencia, autonomía jurídica, aprendizaje autónomo en producción o ejecución de acciones externas.

## 2. Estado verificado y límites de esta auditoría

El repositorio y los metadatos de GitHub se consultaron el **27 de octubre de 2026**.

| Comprobación | Resultado observado | Interpretación |
| --- | --- | --- |
| Rama principal | `main` en `9add636bdba1a84525df8812eaad915df93fc139` | Referencia de esta revisión |
| Estados de Vercel asociados al commit | Despliegues reportados como completados | No demuestra que todas las funciones pasen pruebas E2E |
| GitHub Actions — Repository Assurance | **FAILURE** | Gate bloqueante pendiente |
| GitHub Actions — CI/CD Pipeline | **FAILURE** | Seguridad, tests, lint/typecheck y etapas posteriores no certificadas en ese run |
| Detalle de logs del run | No recuperable durante esta consulta | Causa exacta de cada fallo aún requiere logs reproducibles |
| Protección de release por checks requeridos | Estado no certificado; un status informa “No required projects to validate” | No asumir que la rama impide desplegar código con CI rojo |
| Proveedor de IA real | Depende de configuración y conectividad | Debe demostrarse con una prueba E2E de respuesta generada |
| Persistencia durable | Depende del backend configurado | Los stores en memoria no son persistencia de producción |

**Conclusión:** existe evidencia de despliegue, pero el commit auditado tiene ejecuciones de CI fallidas. No declarar producción certificada hasta que los gates obligatorios estén verdes y se prueben los flujos críticos en el entorno desplegado.

## 3. Funcionalidades implementadas en el repositorio

- Servidor Express/TypeScript y rutas de plataforma.
- Rutas de cognición JSON y SSE.
- Agente local determinista con herramientas allowlisted.
- Política de proveedores externos y adaptador opcional de Ollama.
- Rutas de voz/TTS sujetas a proveedor y configuración.
- Estado, health checks, readiness y métricas.
- Memoria de sesión, propuestas de memoria y componentes BookPI.
- Integraciones opcionales con PostgreSQL/Prisma y Stripe.
- Controles de seguridad, límites de entrada y gobernanza de capacidades.
- Capa Genesis con contratos OpenAPI/AsyncAPI; dichos contratos no implican que se hayan publicado endpoints nuevos.

La disponibilidad efectiva de cada función depende de las variables, los secretos, las dependencias externas y la ruta ejecutada. Un catálogo o adaptador no prueba disponibilidad real.

## 4. Arquitectura de alto nivel

| Ruta/carpeta | Responsabilidad principal |
| --- | --- |
| `src/server.ts` | Arranque HTTP, wiring y rutas |
| `src/inference/` | Selección de proveedor, presupuesto, contexto y voz |
| `src/agents/` | Runtime local determinista y herramientas permitidas |
| `src/routes/` | API, plataforma, agentes, federación y comercio |
| `src/memory/` | Memoria de sesión y conocimiento |
| `src/bookpi/` | Registro de eventos y evidencia |
| `src/omega/` y `src/omega/genesis/` | Gobernanza, capas y contratos cognitivos |
| `src/security/` | Tokens, límites y controles de seguridad |
| `src/commerce/` y `src/economy/` | Suscripciones, Stripe y cotizaciones |
| `src/ui/` | Interfaz web |
| `api/index.js` | Adaptador de Vercel que importa `dist/server.js` |
| `scripts/` | Gates de entorno, readiness, smoke tests y verificación |

## 5. Instalación local

Requisitos declarados: **Node.js 24.x**, Corepack y pnpm **10.28.0**.

```bash
corepack enable
corepack pnpm install --frozen-lockfile
cp .env.example .env
```

Completa las variables necesarias para la modalidad elegida. No uses valores de ejemplo ni secretos reales en el repositorio.

Comandos principales:

```bash
corepack pnpm run typecheck
corepack pnpm run lint
corepack pnpm run format:check
corepack pnpm test
corepack pnpm run build:dist
corepack pnpm run smoke:runtime
corepack pnpm run smoke:ui
corepack pnpm run check:env
corepack pnpm run check:sops
corepack pnpm run deploy:readiness
```

Para ejecutar localmente:

```bash
corepack pnpm run dev
```

El script `validate` usa Corepack/pnpm para ejecutar typecheck, lint, formato y build. Ejecuta además los smoke tests y las pruebas E2E de las integraciones que realmente se vayan a habilitar.

## 6. Configuración de Vercel

El repositorio incluye `vercel.json` con:

- instalación mediante `corepack pnpm install --frozen-lockfile`;
- build mediante `corepack pnpm run build:dist`;
- función `api/index.js` con duración máxima configurada de 60 segundos;
- inclusión de `dist/**`, `src/ui/**` y recursos de vídeo;
- rewrite general hacia `/api`.

Antes de publicar, confirma en el proyecto correcto de Vercel el directorio raíz, Node.js 24.x, comandos, variables de entorno y dominios. La existencia de varios estados de despliegue asociados a diferentes proyectos exige comprobar cuál es el proyecto canónico y cuál dominio se considera producción.

## 7. Variables y servicios externos

Configura solo los servicios que vayas a activar. Las variables se documentan en `.env.example`; sus valores no deben copiarse literalmente a producción.

| Servicio | Configuración y validación requerida |
| --- | --- |
| Runtime | `NODE_ENV=production`, `PORT`, URL pública y orígenes permitidos |
| Proveedor de IA | Configurar un proveedor soportado, su clave si aplica, modelo permitido y timeout; ejecutar una conversación E2E |
| PostgreSQL | `DATABASE_URL` y las URLs auxiliares que requiera el backend seleccionado; probar TLS, conexión, migraciones y lectura/escritura |
| BookPI | Secreto de integridad fuerte y backend persistente; probar reinicio, integridad y recuperación |
| Tokens operativos | Generar tokens únicos, de alta entropía y rotables; no reutilizar valores de ejemplo |
| Voz | Seleccionar proveedor, límites de texto y consentimiento para transmitir contenido a terceros |
| Stripe | Claves de test, Price IDs coherentes y webhook secret; probar checkout y webhook en modo test antes de activar cobros |
| WebAuthn/federación | Configurar solo si se habilitan esas funciones; validar dominios, claves y firma |
| Observabilidad | Logs sin secretos, alertas, retención y correlación por request |

En Vercel, el filesystem y los stores en memoria pueden ser efímeros o estar aislados por instancia. No uses un store en memoria para API keys, federación, sesiones o evidencia que deban sobrevivir a reinicios o distribuirse entre instancias. Usa un backend durable y prueba concurrencia y recuperación.

## 8. API y comprobaciones mínimas

El inventario canónico de rutas está en `docs/api/route-inventory.json`. Entre las rutas documentadas se encuentran:

- `GET /api/v1/healthz` — salud del proceso.
- `GET /api/v1/readyz` — readiness de dependencias.
- `GET /api/v1/status` — estado operativo.
- `POST /api/v1/cognition/route` — conversación JSON.
- `POST /api/v1/cognition/stream` — conversación SSE.
- `GET /api/v1/agents` y `POST /api/v1/agents/run` — agente local.
- `POST /api/v1/tts/stream` — salida de voz cuando está habilitada.

Ejemplo de conversación local:

```bash
curl -i https://TU-DOMINIO/api/v1/healthz
curl -i https://TU-DOMINIO/api/v1/readyz
curl -sS https://TU-DOMINIO/api/v1/cognition/route \
  -H 'content-type: application/json' \
  -d '{"input":"Explica qué puedes hacer y qué limitaciones tienes.","modelEngine":"auto","focusLens":"general","history":[]}'
```

Revisa código HTTP, esquema de respuesta, motor reportado, latencia, errores, logs y consumo del proveedor. Una respuesta determinista local no debe contarse como inferencia de un LLM.

## 9. Checklist de liberación

### Bloqueos previos a staging

- [ ] Recuperar logs y corregir los fallos de **Repository Assurance**.
- [ ] Recuperar logs y corregir los fallos del workflow **CI/CD Pipeline**.
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
- [ ] Ejecutar Stripe en modo test: checkout, firma de webhook, idempotencia, duplicados y eventos fuera de orden.
- [ ] Configurar logs, métricas, alertas, backup, restauración y procedimiento de rollback.
- [ ] Completar pruebas de navegador para navegación, formularios, errores, accesibilidad y móvil.
- [ ] Revisar dependencias, licencia, vulnerabilidades y secretos expuestos.
- [ ] Registrar aprobación humana, SHA exacto, resultados de los gates y URL de la release.

### Criterio de liberación

**No publicar como producción certificada** si algún gate obligatorio falla, si el proveedor real no responde de extremo a extremo, si los datos críticos son efímeros o si no existe rollback comprobado. Si solo se valida el runtime básico, etiquetar el entorno como preview o beta técnica.

## 10. Limitaciones explícitas

- El agente local es determinista; no sustituye un modelo neuronal.
- Los proveedores gratuitos o sin clave pueden cambiar, limitar solicitudes, fallar o tener condiciones de privacidad distintas.
- El streaming de texto fragmentado no implica generación token a token por el modelo.
- Los contratos OpenAPI/AsyncAPI no implican endpoints desplegados.
- Los módulos de gobernanza y evidencia no son certificaciones externas.
- Las funciones comerciales no equivalen a pagos reales de extremo a extremo.
- Las afirmaciones de producción requieren pruebas observables del commit y entorno exactos.

## 11. Seguridad y gobernanza

- Nunca publiques tokens, claves privadas, cadenas de conexión ni secretos de Stripe.
- Usa variables de entorno o el almacén de secretos del proveedor.
- Rota cualquier credencial que haya aparecido en logs, commits o conversaciones compartidas.
- Mantén aprobación humana para efectos externos sensibles.
- Revisa [SECURITY.md](SECURITY.md) y [AGENTS.md](AGENTS.md) antes de aprobar cambios de gobernanza.

## 12. Registro del proyecto

- **Proyecto:** Isabella Villaseñor AI · Genesis TINA V6.
- **Ecosistema:** TAMV Online Network.
- **ORCID:** [0009-0008-5050-1539](https://orcid.org/0009-0008-5050-1539).
- **DOI declarado para IGE-Ω:** [10.5281/zenodo.20606361](https://doi.org/10.5281/zenodo.20606361).
- **Licencia:** MIT, consultar [LICENSE](LICENSE).

Este README es una guía operativa y un registro de estado; no sustituye una auditoría de seguridad independiente ni la evidencia de pruebas de producción.
