---
state: draft
authorship: engine-generated
human_approval: pending
date: 2026-10-24
---

# Análisis de archivos, datos y funciones de Isabella

**Conclusión: no existe evidencia de que todos los archivos, datos y funciones estén operativos dentro de Isabella.** El runtime principal responde y su suite local pasa, pero hay código fuera de sus entradas, importaciones sin resolver en áreas inactivas, contratos declarativos y dependencias degradadas. Incorporar archivos o mencionar capacidades no demuestra ejecución, autorización, persistencia ni disponibilidad de producción.

## Alcance y método

Se inventariaron 1.776 archivos ordinarios del árbol de trabajo con tamaño y SHA-256. El análisis localizó 1.135 archivos TypeScript/JavaScript en src, 6.863 declaraciones de funciones/métodos en src y 231 registros literales de rutas, 226 en archivos alcanzables por importación. El grafo del servidor contiene 339 archivos y las entradas JavaScript del navegador aportan otros dos. Son recuentos estáticos: no acreditan ejecución de cada símbolo o registro. Se excluyeron dependencias instaladas, metadatos de Git, archivos de entorno y credenciales, artefactos compilados y carpetas internas generadas. Se analizaron por separado los siete adjuntos de esta sesión mediante metadatos y referencias explícitas a rutas; no se publicaron sus contenidos ni se ingirieron en memoria operativa.

El inventario JSON asociado contiene una fila por archivo, declaraciones de funciones y métodos TypeScript/JavaScript con ubicación, importaciones relativas sin resolver y registros de rutas HTTP literales. El grafo parte de src/server.ts, la función Netlify y los dos scripts que la interfaz HTML carga. Excluye aristas exclusivamente de tipos y considera posibles las importaciones dinámicas literales y condicionales. Un módulo alcanzable por importación puede contener funciones que nunca se llaman: el inventario no las declara ejecutadas.

Las comprobaciones HTTP invocaron localmente el adaptador Netlify con solicitudes GET sin credenciales. No se llamó a endpoints de mutación, no se configuraron proveedores ni se desplegó. Estos resultados describen el entorno local de esta revisión, no la instalación publicada. No se ejecutaron compilaciones.

## Hallazgos principales

| Hallazgo | Evidencia observada | Implicación |
| --- | --- | --- |
| Runtime principal accesible, dependencias incompletas | / y /health respondieron 200; /api/v1/healthz respondió 503 | El servidor está vivo, pero no todas sus dependencias están disponibles. |
| Código sin camino de importación desde las entradas actuales | 795 archivos de código de src; 514 en src/lib y 167 en src/components | Existen bibliotecas, interfaces alternativas y posibles duplicados que no quedan integrados automáticamente en la interfaz o servidor actuales. También hay CLI y archivos de tipos que legítimamente tienen otras entradas. |
| Importaciones relativas sin resolver | 115 en el conjunto analizado; ninguna en los archivos del grafo principal | El runtime principal no presenta ese bloqueo estático; las áreas inactivas sí necesitan revisión. El total incluye referencias a dist generado, no solamente archivos fuente faltantes. |
| Comprobación de tipos ampliada fallida | 21.932 diagnósticos en 269 archivos al retirar exclusiones | 21.624 diagnósticos corresponden a componentes React; predominan JSX no habilitado, tipado JSX y dependencias ausentes. No representan 21.932 defectos independientes. El typecheck habitual no certifica estas áreas. |
| Código duplicado literalmente | 220 grupos de código con SHA-256 idéntico, 440 archivos | Hay deuda de mantenimiento y versiones paralelas. No se borraron archivos: igualdad de bytes no garantiza equivalencia de resolución de imports. |
| Módulo alternativo de salud sin cargar | Cinco registros de rutas en src/routes/health.ts sin camino desde las entradas | /health existe mediante otra implementación; /healthz, /readyz, /status y /metrics respondieron 404. No deben confundirse con /api/v1/healthz y /api/v1/readyz. |
| Catálogo de plataforma desalineado | El endpoint declara count:30 y una referencia textual a un archivo; PLATFORM_GIFTS contiene 32 entradas | Ese endpoint no enumera ni comprueba las 32 funciones. Además, varias etiquetas “sin cablear” del catálogo están desactualizadas frente a módulos que el servidor sí instancia. |
| Los 7.000 controles son principalmente declarativos | generateControls produjo 6.996 declared, 3 wired, 1 blocked y 0 verified | Son estados generados desde un catálogo y overrides, no 7.000 comprobaciones operativas ni aprobaciones humanas. No se cambiaron estos estados. |
| Persistencia y autoridad de firma degradadas | La salud profunda informó bookpi-ledger y signing-authority degradados como dependencias requeridas | No hay evidencia local de continuidad durable del ledger ni de autoridad de firma disponible. |
| Funciones administrativas inaccesibles en este entorno | Integrations graph y platform capabilities respondieron 503 sin credenciales | Se preservó el control de acceso; no se introdujeron tokens, identidades ficticias ni bypasses para obtener una respuesta favorable. |
| Servicio financiero no disponible operativamente | /api/v1/revenue/health respondió 503/degraded | Código de cálculo o contabilidad no acredita cobros, retiros o conciliación reales. |

## Qué existe y qué no se ha demostrado

| Subsistema | Existencia y conexión observadas | Límite operativo |
| --- | --- | --- |
| Interfaz actual | HTML y scripts app.js/chat-plus.js servidos por el runtime; GET / respondió 200 | Los componentes React de src/components no forman parte automáticamente de esta interfaz. |
| GAME OVER / UAGP | Módulos TypeScript importados por el servidor, rutas y pruebas existentes | El plugin Jenkins es un proyecto Java separado; no se ejecutó Jenkins ni se certificó un circuito de aprobación empresarial. |
| MAGPIE-X | MagpieBus instanciado por Genesis; publicación y suscripción locales con pruebas | Su contrato indica memoria de proceso; no demuestra una red federada durable, transporte distribuido ni entrega exactamente una vez. |
| YUN | Ruta de lectura respondió 200 con cero eventos; validación y hashing existen | No hay eventos de negocio observados en este proceso ni evidencia de federación externa. Un hash valida contenido, no veracidad. |
| ISA-X | Archivos de firma, claves, revocación y challenge alcanzables a través de imports y cubiertos por pruebas | Esto no demuestra que cada ruta HTTP exija ISA-X. La documentación declara bloqueados proveedores poscuánticos/HSM; no se certificó ML-DSA/ML-KEM productivo. |
| BookPI / Atlas / IKES | Adaptadores y estructuras implementados | La existencia de tablas SQL, constructores o imports no demuestra migraciones aplicadas, ingesta completa ni almacenamiento remoto saludable. |
| Modelos e inferencia | Enrutadores y proveedores implementados; la salud devuelve un modo de inferencia | No se realizó una inferencia real con cada proveedor/modelo; faltan evidencias de cuotas, conectividad, calidad y costes. |
| Rust, Python y Java | Archivos y subproyectos inventariados | No se construyeron ni probaron estos runtimes en esta revisión. Su presencia no los incorpora al proceso Node ni al despliegue Netlify. |

## Datos, documentos y adjuntos

Los JSON inventariados resultaron sintácticamente válidos. No se concluye de ello que sus registros sean correctos, actuales, autorizados, persistentes o consultados por Isabella. El catálogo src/authz-runtime/authz-runtime/catalog.json no tiene un camino de importación runtime desde las entradas consideradas. Los SQL son instrucciones de migración: inventariarlos no los ejecuta.

Se analizaron metadatos y referencias explícitas de los siete adjuntos. El documento sobre el plugin GAME OVER contiene 24 rutas explícitas de código; 21 tienen un archivo correspondiente al resolver también la raíz del subproyecto Java. El documento MAGPIE-X contiene 187 rutas explícitas y 48 se resolvieron en el árbol actual. Las otras referencias pueden ser propuestas, nombres históricos o rutas no incorporadas; no se declararon defectos automáticamente. Los otros cinco documentos no aportaron rutas detectables mediante ese patrón, lo cual no significa ausencia de requisitos ni implementación completa.

La comparación de rutas es una comprobación léxica, no una validación semántica exhaustiva de los documentos. No existe en esta revisión una matriz humana aprobada que enlace cada requisito de esos documentos con una función ejecutada, un dataset admitido, una prueba y una aprobación. Los documentos de especificación no se trataron como datos ya aprendidos o memoria verificada. Las cifras de rendimiento o superioridad declaradas en referencias tampoco se convirtieron en hechos observados.

## Pruebas, evidencia y reproducción

La suite actual volvió a aprobar **1.704 pruebas en 289 archivos**. Esto demuestra los casos automatizados existentes, no el comportamiento de todos los archivos. La comprobación de tipos ampliada fue adicional y deliberadamente más amplia que el gate habitual; su fallo se conservó como hallazgo.

Se añadieron herramientas diagnósticas reproducibles que escriben solo metadatos y evidencia filtrada:

- node scripts/operational-inventory.mjs: inventario, hashes, símbolos, rutas e importaciones.
- pnpm exec tsx scripts/operational-probe.ts: sondeos GET locales y resumen del catálogo. Importa el runtime existente y finaliza después de registrar sus resultados.
- node scripts/operational-typecheck.mjs: typecheck sin exclusiones en configuración temporal, sin emitir código. Devuelve error cuando TypeScript falla y elimina la configuración temporal.

Los resultados detallados son INVENTARIO-OPERATIVO-2026-10-24.json, SONDEO-OPERATIVO-2026-10-24.json, TYPECHECK-COMPLETO-2026-10-24.json y REFERENCIAS-ADJUNTAS-2026-10-24.json. El inventario no incluye su propio JSON de salida. Las funciones se contabilizan como declaraciones, métodos y funciones asignadas a variables; no equivale a una enumeración de todas las invocaciones o callbacks anónimos.

## Acciones necesarias para afirmar integración completa

1. Definir y aprobar qué bibliotecas, componentes y requisitos pertenecen a la versión desplegable. Resolver versiones paralelas antes de conectarlas; no todo archivo auxiliar debe convertirse en una ruta pública.
2. Vincular cada requisito de los documentos con código, contrato, prueba reproducible, fuente de datos y autoridad humana. Mantener separados declared, implemented, tested y human-approved.
3. Corregir o retirar explícitamente las dependencias y rutas de importación del frontend alternativo; decidir su integración con la interfaz HTML actual antes de activar JSX o añadir dependencias indiscriminadamente.
4. Alinear el catálogo de plataforma con instancias y rutas reales; sustituir referencias textuales y cifras fijas por resultados comprobables, manteniendo separadas disponibilidad y autorización.
5. Validar migraciones, persistencia, identidades, firmas, modelos y flujos financieros en sus entornos reales. Registrar evidencia humana antes de promover capacidades a verified o wired.
6. Verificar la instalación desplegada y los subproyectos separados. Resolver también la deuda de formato global documentada en la auditoría anterior.

Esta revisión produjo evidencia y herramientas de análisis. No modificó la autorización, no conectó automáticamente código inactivo, no ingirió documentos como conocimiento verificado y no promovió capacidades. Permanece en estado draft hasta revisión humana.
