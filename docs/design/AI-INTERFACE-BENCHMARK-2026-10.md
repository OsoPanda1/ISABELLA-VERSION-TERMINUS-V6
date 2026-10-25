# Benchmark de interfaces de IA · 2026-10

> **Alcance:** selección de trabajo de 50 productos de IA, no un ranking oficial. Los rasgos se compilan de documentación pública y observación de interfaces hasta 2026-10. Este documento no implica afiliación, integración ni certificación de esos productos.
>
> **Uso:** cada fila enumera cinco rasgos de diseño u operación y la decisión tomada para Isabella. «Adoptado» describe una implementación o una dirección de diseño; no convierte una función en producción.
>
> **Invariante:** CAPABILITY ≠ AUTHORITY ≠ EXECUTION ≠ EVIDENCE. Una interfaz elegante no concede permisos.

## Criterios de selección

Se eligieron productos que representan patrones distintos: asistentes generales, investigación con fuentes, estudios de desarrollo, generación visual y de audio, agentes autónomos, plataformas de modelos abiertos, herramientas de documento y suites empresariales. El objetivo no fue copiar estética, sino extraer contratos de interacción verificables.

Cada producto se evalúa en cinco dimensiones:

1. **Orientación:** cómo hace visible el estado, el modelo y los límites.
2. **Trabajo:** cómo organiza conversaciones, proyectos, archivos y artefactos.
3. **Control:** cómo permite elegir modo, profundidad, fuentes y permisos.
4. **Ritmo:** cómo reduce latencia percibida y comunica progreso.
5. **Confianza:** cómo trata citas, evidencia, privacidad y errores.

## Matriz de 50 productos

| # | Producto | Cinco rasgos de interfaz / operación | Decisión en Isabella |
|---:|---|---|---|
| 1 | **ChatGPT** | Barra lateral de conversaciones; selector de modelo con capacidades; panel de artefactos; modo de voz; controles de memoria | Chat con sesiones locales, selector de motor declarado, inspector, voz del navegador y borrado local explícito |
| 2 | **Claude** | Proyectos y espacios; artefactos laterales; contexto largo con citas; tono y persona; transparencia de seguridad | Biblioteca local, inspector lateral, fuentes curadas, lentes de análisis y avisos de límites |
| 3 | **Gemini** | Entrada multimodal; investigación profunda; integración con Workspace; Gems reutilizables; superposición en vivo | Adjuntos de texto, páginas de integraciones, starters reutilizables y APIs multimodales declaradas sin sobreafirmar |
| 4 | **Microsoft Copilot** | Identidad de tenant; citas en respuestas; constructor de agentes; contexto de Office; etiquetas de cumplimiento | Gobernanza visible, separación autoridad/ejecución, evidencia, documentación para desarrolladores y negación por defecto |
| 5 | **Perplexity** | Respuesta con fuentes; preguntas de seguimiento; modos de foco; colecciones; búsqueda Pro | Conocimiento curado con fuentes del repositorio, enlaces relacionados, lentes y biblioteca local |
| 6 | **Grok** | Contexto en tiempo real; modos de personalidad; razonamiento activable; generación de imagen; integración social | Modos y lentes explícitos, fast lane frente a ruta gobernada y prohibición de afirmar tiempo real sin fuente |
| 7 | **DeepSeek** | Modelo de razonamiento explícito; niveles de costo; ejecución de código; bilingüismo; pesos abiertos | Selección de motor, ruta local/agente, ejecución acotada sin shell y declaración de modelo real |
| 8 | **Mistral Le Chat** | Soberanía europea; respuestas rápidas; multimodalidad; despliegue on-premise; citas | Modo Soberano sin proveedor externo, local-first, readiness declarada y citas de conocimiento curado |
| 9 | **Meta AI** | Presencia multiplataforma; creación de imagen; contexto social; voz; ligereza | Fast lane de presencia, datos locales privados y ninguna conexión social implícita |
| 10 | **Poe** | Catálogo de bots; costo en puntos; constructor de bots; ramas de conversación; compartir | Catálogo de skills/tools, página de planes sin puntos ficticios y sesiones locales exportables |
| 11 | **Character.AI** | Personas; voz; personajes comunitarios; memoria de chat; descubrimiento | Persona de marca, voz, starters curados; se rechaza el diseño de engagement parasocial |
| 12 | **Pi** | Tono conversacional calmado; voz; memoria; empatía; interfaz simple | Tipografía editorial, paleta serena, memoria local controlable y microcopy sin presión |
| 13 | **You.com** | Multi-modelo; agentes; modos de investigación; aplicaciones; citas | Selector de motor, catálogo de tools, transparencia de fuentes y rutas separadas |
| 14 | **Hugging Face Chat** | Catálogo de modelos abiertos; model cards; comunidad; capa gratuita; Spaces | Sección de modelos abiertos, divulgación de procedencia, documentación y ausencia de promesas de cuota ilimitada |
| 15 | **OpenRouter** | Gateway unificado; enrutamiento por precio/latencia; fallbacks; preferencias de proveedor; analítica de uso | Cadena de proveedores, fallback declarado, métricas turbo y cuotas separadas por bucket |
| 16 | **Groq** | Latencia muy baja; tokens por segundo; API simple; catálogo de modelos; playground | Fast lane determinista, histogramas p50/p95/p99 y métricas honestas por proceso |
| 17 | **Together AI** | Hosting de modelos abiertos; fine-tuning; serverless; playground; precios claros | Ruta de evolución documentada; no se presenta como integración activa |
| 18 | **Replicate** | Playground de modelos; versiones inmutables; ejemplos de API; comunidad; aviso de cold start | Contratos versionados, ejemplos de API y declaración de arranque en frío |
| 19 | **Vercel v0** | Prompt a interfaz; vista previa de componentes; historial de iteraciones; despliegue; exportación de código | Previsualización de estados, historial de sesión, exportación Markdown/JSON y build reproducible |
| 20 | **Cursor** | Edición en línea; contexto del repositorio; modo agente; diff previo; elección de modelo | Inspector de contexto, gobernanza de diff, modos explícitos y ninguna ejecución destructiva automática |
| 21 | **GitHub Copilot** | Sugerencias inline; chat; agentes de workspace; resumen de PR; políticas empresariales | Sección de desarrolladores, evidencia de rutas y políticas de autoridad antes de ejecutar |
| 22 | **Replit** | IDE en navegador; agente; despliegue; colaboración; plantillas | Workspace local para biblioteca y artefactos; no se simula un IDE ni un despliegue |
| 23 | **Lovable** | Chat a aplicación; edición visual; integración con Supabase; sincronización GitHub; publicación | Plataforma multipágina modular; se rechaza la promesa de publicación automática sin gates |
| 24 | **Bolt.new** | Full-stack en navegador; instalación de paquetes; reparación de errores; despliegue; transparencia de tokens | Límites declarados, sin instalación silenciosa y errores saneados |
| 25 | **Devin** | Planificación autónoma; terminal y navegador; línea de progreso; checkpoints; revisión | Línea de pasos del agente, aprobaciones, auditoría y ausencia total de shell/navegador |
| 26 | **Windsurf** | Flujos en cascada; conciencia de contexto; terminal; checkpoints; controles empresariales | Estado de flujo en inspector, puntos de control de sesión y compuertas de aprobación |
| 27 | **Notion AI** | Escritura inline; preguntas sobre workspace; bases de datos; plantillas; permisos | Biblioteca y documentos locales, plantillas de respuesta y separación de permisos |
| 28 | **Jasper** | Voz de marca; campañas; plantillas; colaboración; gobernanza de contenido | Lentes de marca, starters editoriales y tipografía consistente |
| 29 | **Grammarly** | Corrección inline; tono; claridad; originalidad; extensión de navegador | Herramientas de texto acotadas, control de tono por lente y ningún escaneo externo no declarado |
| 30 | **Midjourney** | Ingeniería de prompt; referencias de estilo; cuadrícula de variaciones; galería comunitaria; escalado | Galería local de artefactos y referencias visuales; sin generación de imagen activa en esta interfaz |
| 31 | **Runway** | Editor de línea de tiempo; vídeo generativo; control de movimiento; activos; colaboración | Dirección de diseño para futura galería; no se declara capacidad de vídeo |
| 32 | **ElevenLabs** | Biblioteca de voces; consentimiento de clonación; multilingüismo; doblaje; API | Solo voz del navegador; clonación de voz explícitamente no implementada |
| 33 | **Suno** | Texto a canción; estilos; letras; stems; comunidad | No se declara generación musical; la sección de audio describe solo guiones locales |
| 34 | **Synthesia** | Vídeo con avatares; plantillas; guion; localización; kit de marca | Documentación de límites; sin avatares ni vídeo generado |
| 35 | **HeyGen** | Avatares; traducción; voz; plantillas; API | Ruta de evolución; no se presenta como capacidad activa |
| 36 | **Adobe Firefly** | Modelos con licencia comercial; relleno generativo; credenciales de contenido; kit de marca; integración | Sección de procedencia y licencias; la evidencia se declara como registro, no como certificación |
| 37 | **Canva Magic Studio** | Plantillas; arrastrar y soltar; kit de marca; transformación mágica; colaboración | Sistema visual con tokens, páginas compuestas y exportación; sin edición colaborativa |
| 38 | **Figma AI** | Conciencia del sistema de diseño; auto-layout; prototipos; comentarios; entrega a desarrollo | Tokens CSS, responsive real, inventario de rutas y documentación de componentes |
| 39 | **Framer AI** | Generación de sitios; CMS; animaciones; localización; publicación | SSR multipágina, movimiento con `prefers-reduced-motion` y navegación real; sin publicación automática |
| 40 | **Gamma** | Prompt a presentación; tarjetas; temas; exportación; analítica | Secciones en tarjetas, jerarquía editorial y exportación de documentos |
| 41 | **Manus** | Agente autónomo de tareas; vista del navegador; registro de pasos; archivos; aprobaciones | Pasos del agente local, aprobaciones, artefactos locales; sin navegador controlado |
| 42 | **Genspark** | Multiagente; sparkpages; citas; modos de tarea; medios | Páginas modulares, citas curadas y modos explícitos |
| 43 | **NotebookLM** | Respuestas ancladas a fuentes; citas; resumen de audio; notebooks; límites de fuentes | Base curada con fuentes del repositorio; se declara que no hay conector NotebookLM |
| 44 | **Khanmigo** | Tutoría paso a paso; guardrails; herramientas docentes; seguridad; tono educativo | Tono académico y divulgación de límites; sin pretender certificación pedagógica |
| 45 | **Wolfram Alpha** | Cálculo estructurado; pasos; unidades; gráficas; API | Calculadora segura y acotada; no se presenta como sistema de álgebra completo |
| 46 | **IBM watsonx** | Gobernanza de modelos; inventario; riesgo; flujos empresariales; auditoría | Página de gobernanza, model cards conceptuales y auditoría BookPI |
| 47 | **Azure AI Studio** | Catálogo de modelos; prompt flow; evaluaciones; despliegues; seguridad de contenido | Contratos de prueba, evaluación de rutas y estados de readiness |
| 48 | **Google AI Studio** | Playground de prompts; claves; parámetros; evaluaciones; exportación de código | Guía de desarrolladores, ejemplos ejecutables y límites documentados |
| 49 | **Ollama** | Modelos locales; CLI/API simple; privacidad; biblioteca; compatibilidad OpenAI | Adaptadores existentes; habilitación local pendiente de gate y pruebas, no certificada |
| 50 | **LM Studio** | Modelos locales de escritorio; chat; modo servidor; gestor de modelos; información de hardware | Ruta de evolución para runtime local; no se declara activo |

## Síntesis: 12 patrones adoptados

| Patrón | Implementación en Isabella |
| --- | --- |
| Separar conversación de catálogo | `/chat` dedicado y 17 páginas de plataforma con URL propia |
| Hacer visible el motor real | `responseEngine`, badge de chat y campos del inspector |
| Declarar el progreso sin mentir | SSE con `meta` → `chunk` → `done`; aviso de que no es streaming nativo |
| Sesiones locales primero | Historial, biblioteca, perfil y ajustes en `localStorage` |
| Inspector de contexto | Panel derecho con ruta, intención, latencia, turbo, caché, gate y agente |
| Navegación por grupos | Cinco grupos (Espacio, Capacidades, Comercial, Confianza, Cuenta local) |
| Paleta y tipografía con identidad | Cristal cian, lila, menta, rosa, tinta y fondo oscuro; serif editorial para titulares |
| Estados vacíos, degradados y de error | Mensajes explícitos; readiness `503` visible; fallback local declarado |
| Accesibilidad operativa | Foco visible, ARIA en drawers, `prefers-reduced-motion`, navegación por teclado y paleta de comandos |
| Activos rápidos y versionados | HTML SSR, hash de contenido, ETag, compresión previa y caché inmutable |
| Autoridad fuera del cuerpo HTTP | Aprobación administrativa verificada en servidor; el cuerpo no concede permisos |
| Exportación y borrado reales | Markdown/JSON y eliminación de sesión, biblioteca y preferencias |

## Patrones rechazados deliberadamente

- **Ejecución autónoma silenciosa:** ninguna herramienta escribe, instala o paga sin aprobación.
- **Identidad de modelo oculta:** el motor real se declara incluso cuando es un fallback local.
- **Agencia teatral:** no se simulan pasos, navegador, terminal ni resultados de herramientas.
- **Puntos, monedas o saldos ficticios:** los planes se leen del servidor; no hay gamificación financiera.
- **Paywalls ambiguos:** si un canal de pago no está configurado, se dice y no se recogen datos de tarjeta.
- **Engagement infinito:** no hay rachas, notificaciones artificiales ni presión social.
- **Sincronización oculta:** el historial local no se envía a una cuenta remota inexistente.
- **Citas decorativas:** las fuentes apuntan a conocimiento curado del repositorio; no se inventan enlaces.
- **Instalación de packs desde el marketplace:** el marketplace resuelve y planifica; no instala.
- **Telemetría de terceros:** la interfaz no carga analítica propia ni rastreadores de producto.

## Aplicación por superficie

| Superficie | Patrones aplicados |
| --- | --- |
| Chat | Sesiones locales, motor declarado, SSE, inspector, exportación, voz, adjuntos de texto |
| Panorama | Narrativa editorial, tarjetas de capacidades, accesos a chat y estado |
| Estado | Readiness, métricas locales, proveedores declarados, enlaces JSON |
| Skills / Tools | Catálogo auditable, política de agente, aprobación humana, límites de ejecución |
| Marketplace | Resolución de packs, huellas SHA-256, `enabled: false`, cero instalación |
| Planes / Donaciones | Precios del servidor, ausencia de checkout simulado, canales explícitos |
| Integraciones / Desarrolladores | REST, SSE, compatibilidad OpenAI, ejemplos y límites |
| Gobernanza | Invariante, BookPI, autoridad, fail-closed |
| Biblioteca / Perfil / Ajustes | Datos locales, insignias no certificantes, borrado real |
| Docs / FAQ / Acerca de | Madurez declarada, privacidad, origen y registro académico |

## Estado de adopción

- **Implementado y probado en unidad/contrato:** chat, 18 páginas, catálogo, SSE, fast lane, agente local, inspector, biblioteca local, perfil, canon Ω∞ y ajustes.
- **Implementado con dependencia de configuración:** proveedores externos, Stripe, PostgreSQL, BookPI durable y webhooks.
- **Diseñado, no habilitado:** ejecución de skills administrativas desde la UI, instalación de marketplace, checkout público sin operador, runtime local de pesos abiertos y generación multimedia.
- **Rechazado por diseño:** autonomía sin aprobación, ocultamiento del motor, pagos simulados y engagement coercitivo.

Este benchmark documenta decisiones de interfaz; no es una evaluación independiente de los productos mencionados ni una garantía de paridad funcional.
