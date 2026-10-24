---
state: draft
authoring: engine-generated
human_approval: pending
date: 2026-10-24
---

# Auditoría del runtime y compatibilidad con Netlify

La intención del cambio fue localizar y corregir fallos reproducibles del runtime principal, sus pruebas, configuración y despliegue en Netlify. Este informe registra evidencia computacional; no constituye aprobación humana, certificación de seguridad ni autorización de producción. No se cambiaron estados de capacidad a `verified` o `wired` ni se modificó el historial BookPI.

## Hallazgos corregidos

| Hallazgo observado | Corrección |
| --- | --- |
| TypeScript y Vitest no resolvían el import de sovereign-core-confidence | Se corrigió la ruta relativa de la prueba al módulo existente. |
| El entrenamiento de regresión podía producir pesos y sesgo infinitos | Se rechazó el estado numérico no finito en cada actualización, antes de generar un artefacto. |
| DEEPSEEK_MODEL se utilizaba sin documentarse | Se añadió su valor predeterminado público al ejemplo de configuración. |
| Una prueba exigía publicar un avance del 100% y un SHA histórico | Se alineó la prueba con el README y el principio canónico de no atribuir porcentajes sin denominador reproducible. |
| No existía configuración de despliegue ni adaptador para Netlify | Se añadió una función compatible con Request/Response y el empaquetado de los archivos de interfaz. El servidor abre un puerto únicamente cuando se ejecuta como entrada directa. |
| Servir vídeos grandes desde una función excedería límites de respuesta | Se añadió preparación de medios estáticos para el CDN durante el despliegue, conservando sus URLs. |
| La auditoría inicial de dependencias informó 53 avisos: 6 altos, 42 moderados y 5 bajos | Se fijaron versiones corregidas de Hono, su adaptador Node, lodash, valibot, body-parser, undici y fast-uri. La auditoría final informó cero avisos. |

El adaptador preserva métodos HTTP, parámetros repetidos, bytes de cuerpos, cabeceras múltiples, respuestas comprimidas y respuestas sin cuerpo. Limita la lectura de solicitudes a 256 KiB antes de invocar Express y utiliza la IP del contexto de Netlify para el adaptador HTTP. Los vídeos se sirven desde archivos estáticos para conservar soporte de rangos sin depender del límite de una función.

## Evidencia y alcance

La suite final aprobó 1.704 pruebas en 289 archivos. Se ejecutaron la suite completa Vitest, typecheck principal y por capas, ESLint, el smoke estático de interfaz, las comprobaciones de entorno y SOPS y la suite de invariantes de seguridad. Se añadió cobertura del adaptador para HTML, JavaScript, salud HTTP, JSON inválido, HEAD, ETag/304, compresión gzip y tamaño máximo de solicitudes. La instalación final con lockfile congelado terminó correctamente. Las versiones corregidas no eliminaron las advertencias de peers de las herramientas opcionales de Prisma.

La comprobación estructural inicial pasó 44 de 44 controles; es una comprobación estática y no prueba conectividad. La suite de seguridad estática pasó 14 invariantes y no equivale a un pentest. `pnpm audit` final devolvió cero vulnerabilidades conocidas por el registro consultado en esta fecha; no garantiza ausencia de vulnerabilidades desconocidas.

## Bloqueos y limitaciones pendientes

1. El preflight evaluado con NODE_ENV=production en este entorno devolvió FAIL por ausencia de GENESIS_ADMIN_API_TOKEN. También informó ausencia de APP_PUBLIC_URL y evidencia BookPI volátil. No se generaron credenciales ni se desactivaron controles para ocultar estos fallos. Esta observación describe el entorno de trabajo, no una inspección de valores privados del runtime publicado.
2. `pnpm format:check` falló en 1.134 archivos preexistentes. Se conservó el gate. La normalización masiva de archivos ajenos al cambio quedó pendiente: numerosas pruebas estructurales comparan texto fuente literal y necesitan una revisión conjunta al normalizar formato. Los nuevos módulos y pruebas se formatearon con la configuración vigente.
3. No se ejecutaron compilaciones ni se realizó un despliegue de producción durante esta auditoría. La validación de compilación corresponde al proceso de despliegue. El nuevo empaquetado de medios y la función requieren una comprobación HTTP sobre el deploy resultante.
4. No se ejecutaron migraciones ni pruebas de servicios externos reales: PostgreSQL, Supabase Auth, Stripe, proveedores de IA, síntesis de voz, GPU, IGE-OMEGA y otros servicios opcionales. Tener código o variables declaradas no demuestra conectividad, pago, inferencia ni persistencia durable. Las pruebas locales pueden emplear dobles de prueba.
5. El alcance ejecutado fue el runtime TypeScript y sus comprobaciones existentes. No se certificaron los subproyectos Rust, Java/Jenkins, Python, los componentes React excluidos ni todas las bibliotecas importadas históricamente en src/lib. Se conservan las exclusiones de TypeScript documentadas en docs/STATUS.md.
6. Los retiros financieros, KYC, fiscalidad y conciliación siguen pendientes según el README canónico. No se sustituyeron por simulaciones ni se presentó el devengo como transferencia bancaria.

## Supuestos, compensaciones y divergencias

Se conservó Express y los proveedores ya integrados. El adaptador utiliza serverless-http como puente de bytes HTTP y añade una dependencia de runtime. Sus respuestas son almacenadas temporalmente en memoria por el adaptador; la transmisión de respuestas largas en streaming no está certificada. La persistencia en memoria y los límites de proveedores conservan sus restricciones previas.

La exigencia obsoleta del test de publicar “100%” se registró como divergencia entre prueba y documentación. Se priorizó la documentación canónica y se eliminó la exigencia de una cifra no sustentada; el cambio permanece en borrador para revisión humana. No hay evidencia que permita declarar el proyecto 100% funcional o listo para producción financiera.
