# Integración selectiva del material local de Descargas — 2026-10-24

state: engine-generated (pendiente de revisión humana con nombre) · Alcance: análisis local de la carpeta de Descargas del operador y adaptación **selectiva** de ideas al runtime nativo de Isabella. No se copiaron datos personales, credenciales, binarios pesados ni código con licencia incompatible o no verificable.

## Criterio de admisión

Una pieza se integra solo si cumple las cuatro condiciones:

1. Aporta una capacidad que el repositorio no tenía o tenía incompleta.
2. Su licencia permite reutilización y atribución (MIT, Apache-2.0, BSD, dominio público o especificación pública).
3. Puede implementarse sin conceder autoridad, sin ejecutar efectos externos y sin inventar resultados.
4. Tiene pruebas deterministas en este repositorio.

Todo lo demás se documenta como rechazado; no se incorpora "por si acaso".

## Incorporado

| Origen | Licencia | Destino | Cambio real |
|---|---|---|---|
| Hermes Agent (`tools/tts_streaming.py`, Nous Research) | MIT | `src/tts/streaming.ts` | `SentenceChunker` reimplementado en TypeScript con límites de español, eliminación de bloques de razonamiento partidos entre deltas, topes de búfer y `BargeInRegistry` con TTL y consumo único. No se copió Python ni se añadió dependencia. |
| Hermes Agent (compresión de contexto previa al LLM) | MIT | `src/inference/context-budget.ts` | Presupuesto de tokens determinista, resumen **extractivo literal** del medio de la conversación, protección del system prompt, del ancla y de los últimos turnos; el resumen se marca explícitamente como contexto no confiable. |
| Especificación pública GGUF (ggml) | MIT | `src/inference/open-model-artifact.ts` | Inspector de cabecera GGUF v1–v3, validación de manifiesto, SHA-256, tamaño y procedencia HTTPS. No carga pesos, no descarga, no ejecuta y no aprueba producción (`authority: "NONE"`). |

### Conexión con el runtime

- `POST /api/v1/tts/stream` entrega planes de prosodia por SSE, oración por oración; `POST /api/v1/tts/interrupt` marca un barge-in por actor. Ambos declaran `authorizationPerformed: false` y `executionPerformed: false`.
- `/api/v1/cognition/route` y `/api/v1/cognition/stream` aplican `budgetConversationHistory` antes de llamar a cualquier proveedor y publican `contextBudget` con la estrategia exacta aplicada. El historial saneado original sigue siendo la clave de caché y el conteo público.
- El inspector de artefactos es una librería de análisis; no se expuso como ruta HTTP ni permite rutas arbitrarias del sistema de archivos.

## Rechazado o no adoptado

| Material | Motivo |
|---|---|
| `isabella-agent-sdk.ts` (mexa) con fallback no seguro | El fallback evadía controles de autorización; contradice `CAPABILITY ≠ AUTHORITY`. |
| `isabella-inference-engine.ts` (mexa) | Duplicaba el motor determinista ya existente; el repositorio actual está por delante en router MoE, fast lane y proveedores. Reemplazarlo habría sido una regresión. |
| `voiceUtils.ts` (continuidad de voz del navegador) | Duplicaba lógica ya presente en `src/ui/app.js`; no aportaba una capacidad nueva verificable. |
| Documentos, PDFs, audio, video, bases de datos personales y capturas | No son código reutilizable; contienen datos personales o material sin licencia explícita. |
| Zips de repositorios Isabella ya fusionados | El material útil ya está en este repositorio; volver a copiarlo introduciría duplicados y deriva. |
| Cualquier credencial, token, `.env` o volcado de configuración | Prohibido por la política de secretos. No se leyó ni se commiteó. |

## Invariantes preservadas

- `CAPABILITY ≠ AUTHORITY ≠ EXECUTION ≠ EVIDENCE ≠ LEARNING ≠ PRODUCTION`.
- `SPECIFIED ≠ IMPLEMENTED ≠ TESTED`: las nuevas capacidades están implementadas y probadas; lo que sigue siendo objetivo de diseño se declara en `docs/tts/GENESIS-TTS-RUNTIME.md` y en el estado del motor.
- Un plan de voz, un chunk SSE, un resumen de contexto o un informe de artefacto **no** son evidencia, permiso ni aprobación de producción.

## Verificación

- `tsc --noEmit` limpio.
- `eslint src/**/*.{ts,tsx,js,jsx} --max-warnings=0` limpio.
- `scripts/repository-assurance.mjs`: PASS estructural, 43/44 comprobaciones, 0 fallos, 1 advertencia.
- Suite completa: **305 archivos y 1.824 pruebas aprobadas; 0 fallos** (ejecución del 2026-10-24 con `--maxWorkers=4`).
- Bundle `esbuild` ESM generado y `node --check` válido en `dist/server.js` y `src/ui/app.js`.
- Los seis archivos nuevos pasan `prettier --check`; el árbol preexistente conserva el desajuste de formato documentado en el README.
- Pruebas nuevas: segmentación/barge-in, `planStream`, SSE e interrupción, presupuesto de contexto, GGUF/manifiesto/hash/traversal, y contratos de inventario de rutas y OpenAPI.
