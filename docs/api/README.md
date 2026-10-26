# Inventario de rutas de API — Isabella Genesis V6

> Archivo **generado automáticamente** por `scripts/route-inventory.mjs`.
> `state: auto_generated` — no editar a mano; requiere revisión humana para ser
> evidencia (*CAPABILITY ≠ AUTHORITY ≠ EVIDENCE*, AGENTS.md).

- **Generado:** 2026-10-25T16:59:17.127Z
- **Fuente:** `src/server.ts` (parseo estático, sin ejecutar el servidor)
- **Rutas totales:** 243 · **Sensibles:** 144 · **Con contrato verificado:** 10
- **Contratos de tipo considerados:** `InferenceCapability`, `ModelDescriptor`, `GenerationRequest`, `GenerationResult`, `InferenceAdapter`, `EmbeddingAdapter`, `InferenceRouter`

## Tabla de rutas

| Método | Ruta | Handler | Sensible | Auth | Rate-limit | Validación | Verificado |
|---|---|---|---|---|---|---|---|
| `GET` | `/` | `inline@src/server.ts:234` | no | no | no | no | no |
| `GET` | `/styles/cinematic.css` | `inline@src/server.ts:241` | no | no | no | no | no |
| `GET` | `/styles/command-center.css` | `inline@src/server.ts:248` | no | no | no | no | no |
| `GET` | `/ui/app.js` | `inline@src/server.ts:255` | no | no | no | no | no |
| `GET` | `/ui/chat-plus.js` | `inline@src/server.ts:262` | no | no | no | no | no |
| `GET` | `/ui/cognition-client.js` | `inline@src/server.ts:269` | sí | no | no | no | no |
| `GET` | `/assets/video/IntroVideoIsabella.mp4` | `inline@src/server.ts:284` | no | no | no | no | no |
| `GET` | `/assets/video/IntroVideoIsabella-web.mp4` | `inline@src/server.ts:285` | no | no | no | no | no |
| `GET` | `/assets/video/IntroVideoIsabella-poster.jpg` | `inline@src/server.ts:286` | no | sí | sí | no | no |
| `GET` | `/api/v1/linguistics/stats` | `inline@src/server.ts:897` | no | no | no | no | no |
| `GET` | `/api/v1/linguistics/search` | `inline@src/server.ts:901` | no | no | sí | sí | no |
| `POST` | `/api/v1/linguistics/analyze` | `inline@src/server.ts:909` | sí | no | sí | sí | no |
| `POST` | `/api/v1/linguistics/ingest` | `inline@src/server.ts:917` | sí | sí | sí | sí | no |
| `GET` | `/health` | `inline@src/server.ts:931` | no | no | no | no | no |
| `GET` | `/api/v1/health` | `inline@src/server.ts:941` | no | no | no | no | sí |
| `GET` | `/api/v1/healthz` | `inline@src/server.ts:955` | no | no | no | no | no |
| `GET` | `/api/v1/status` | `inline@src/server.ts:969` | no | no | no | no | sí |
| `GET` | `/api/v1/memory` | `inline@src/server.ts:1021` | no | sí | no | sí | sí |
| `POST` | `/api/v1/memory/ingest` | `inline@src/server.ts:1094` | sí | no | sí | sí | no |
| `GET` | `/api/v1/memory/proposals` | `inline@src/server.ts:1120` | no | sí | no | no | no |
| `POST` | `/api/v1/memory/proposals/:proposalId/resolve` | `inline@src/server.ts:1125` | sí | sí | no | sí | no |
| `GET` | `/api/v1/bookpi/events` | `inline@src/server.ts:1146` | no | no | sí | no | no |
| `GET` | `/api/v1/bookpi/events/admin` | `inline@src/server.ts:1167` | sí | sí | no | no | no |
| `POST` | `/api/v1/tools/execute` | `inline@src/server.ts:1173` | sí | no | sí | sí | no |
| `GET` | `/api/v1/cognition/native-runtime` | `inline@src/server.ts:1225` | sí | no | no | no | sí |
| `POST` | `/api/v1/cognition/route` | `inline@src/server.ts:1244` | sí | no | sí | sí | sí |
| `GET` | `/api/v1/hypercore/turbo/status` | `inline@src/server.ts:1623` | no | no | sí | no | no |
| `POST` | `/api/v1/cognition/stream` | `inline@src/server.ts:1645` | sí | no | sí | sí | sí |
| `GET` | `/api/v1/cognition/multimodal` | `inline@src/server.ts:1830` | sí | no | no | no | no |
| `POST` | `/api/v1/cognition/vision` | `inline@src/server.ts:1844` | sí | no | sí | sí | no |
| `POST` | `/api/v1/cognition/image` | `inline@src/server.ts:1899` | sí | no | sí | sí | no |
| `POST` | `/api/v1/cognition/speech` | `inline@src/server.ts:1952` | sí | no | sí | sí | no |
| `POST` | `/api/v1/cognition/transcribe` | `inline@src/server.ts:2001` | sí | no | sí | sí | no |
| `POST` | `/api/v1/cognitive/request` | `inline@src/server.ts:2039` | sí | no | sí | sí | no |
| `POST` | `/api/v1/isabella/mediate` | `inline@src/server.ts:2181` | sí | sí | sí | sí | sí |
| `POST` | `/api/v1/isabella/entropy` | `inline@src/server.ts:2248` | sí | no | sí | sí | no |
| `GET` | `/api/v1/isabella/status` | `inline@src/server.ts:2265` | no | no | no | no | no |
| `GET` | `/api/v1/hsf/status` | `inline@src/server.ts:2275` | no | no | no | no | no |
| `POST` | `/api/v1/hsf/invoke` | `inline@src/server.ts:2288` | sí | sí | sí | sí | no |
| `GET` | `/api/v1/quantum/pennylane/status` | `inline@src/server.ts:2352` | no | no | no | no | no |
| `POST` | `/api/v1/quantum/pennylane/execute` | `inline@src/server.ts:2364` | sí | sí | sí | sí | no |
| `POST` | `/api/v1/triple-blockade/scan` | `inline@src/server.ts:2417` | sí | no | sí | no | no |
| `POST` | `/api/v1/notebook/generate` | `inline@src/server.ts:2451` | sí | no | sí | sí | no |
| `POST` | `/api/v1/audio-overview/generate` | `inline@src/server.ts:2521` | sí | no | sí | sí | no |
| `GET` | `/api/v1/territory/rdm` | `inline@src/server.ts:2569` | no | no | no | no | no |
| `POST` | `/api/v1/sanitization/scan` | `inline@src/server.ts:2590` | sí | no | sí | sí | no |
| `POST` | `/api/v1/knowledge/admit` | `inline@src/server.ts:2613` | sí | sí | sí | sí | no |
| `POST` | `/api/v1/governance/git` | `inline@src/server.ts:2715` | sí | no | sí | sí | no |
| `POST` | `/api/v1/governance/quality-gates` | `inline@src/server.ts:2726` | sí | no | sí | sí | no |
| `POST` | `/api/v1/governance/deployment` | `inline@src/server.ts:2745` | sí | no | sí | sí | no |
| `POST` | `/api/v1/governance/verify-agent-app` | `inline@src/server.ts:2765` | sí | no | sí | sí | no |
| `POST` | `/api/v1/governance/lifecycle-plan` | `inline@src/server.ts:2785` | sí | no | sí | sí | no |
| `POST` | `/api/v1/diff/observe` | `inline@src/server.ts:2796` | sí | no | sí | sí | no |
| `POST` | `/api/v1/sanitization/harden` | `inline@src/server.ts:2820` | sí | no | no | sí | no |
| `POST` | `/api/v1/security/triangulate` | `inline@src/server.ts:2835` | sí | no | no | sí | no |
| `POST` | `/api/v1/ops/readiness` | `inline@src/server.ts:2913` | sí | no | no | sí | no |
| `GET` | `/api/v1/readyz` | `inline@src/server.ts:2924` | no | no | no | no | no |
| `GET` | `/api/v1/ops/snapshot` | `inline@src/server.ts:2936` | no | no | no | no | no |
| `GET` | `/api/v1/integrations/graph` | `inline@src/server.ts:2946` | no | sí | no | no | sí |
| `GET` | `/api/v1/ops/latency` | `inline@src/server.ts:3028` | no | sí | no | no | no |
| `POST` | `/api/v1/isa/pipeline` | `inline@src/server.ts:3040` | sí | no | no | sí | no |
| `POST` | `/api/v1/isa/act` | `inline@src/server.ts:3050` | sí | no | no | sí | no |
| `POST` | `/api/v1/litle/attest` | `inline@src/server.ts:3079` | sí | sí | sí | sí | no |
| `POST` | `/api/v1/litle/verify` | `inline@src/server.ts:3129` | sí | no | sí | sí | no |
| `POST` | `/api/v1/connectors/ingest` | `inline@src/server.ts:3217` | sí | no | no | sí | no |
| `GET` | `/api/v1/metrics` | `inline@src/server.ts:3301` | no | sí | no | no | no |
| `GET` | `/api/v1/runtime/capabilities` | `inline@src/server.ts:3313` | no | no | no | no | no |
| `POST` | `/api/v1/memory/verified` | `inline@src/server.ts:3334` | sí | sí | no | sí | no |
| `GET` | `/api/v1/memory/verified` | `inline@src/server.ts:3354` | no | sí | no | sí | no |
| `GET` | `/api/v1/osiris/status` | `inline@src/server.ts:3368` | no | sí | no | no | no |
| `POST` | `/api/v1/osiris/inspect` | `inline@src/server.ts:3373` | sí | sí | no | sí | no |
| `GET` | `/api/v1/billing/prices` | `inline@src/server.ts:3438` | no | no | no | no | no |
| `GET` | `/api/v1/billing/plans` | `inline@src/server.ts:3458` | no | no | no | no | no |
| `GET` | `/api/v1/billing/entitlements` | `inline@src/server.ts:3470` | no | no | no | sí | no |
| `GET` | `/api/v1/billing/subscription` | `inline@src/server.ts:3480` | no | sí | no | sí | no |
| `POST` | `/api/v1/billing/subscribe` | `inline@src/server.ts:3492` | sí | sí | no | sí | no |
| `POST` | `/api/v1/billing/cancel` | `inline@src/server.ts:3534` | sí | sí | no | sí | no |
| `GET` | `/api/v1/billing/usage` | `inline@src/server.ts:3560` | no | sí | no | sí | no |
| `POST` | `/api/v1/commerce/offers` | `inline@src/server.ts:3578` | sí | sí | no | sí | no |
| `GET` | `/api/v1/gameover/constitution` | `inline@src/server.ts:3629` | no | sí | no | no | no |
| `GET` | `/api/v1/gameover/passports` | `inline@src/server.ts:3634` | no | sí | no | no | no |
| `POST` | `/api/v1/gameover/passports` | `inline@src/server.ts:3645` | sí | sí | no | sí | no |
| `POST` | `/api/v1/gameover/passports/revoke` | `inline@src/server.ts:3676` | sí | sí | no | sí | no |
| `POST` | `/api/v1/gameover/govern` | `inline@src/server.ts:3694` | sí | sí | no | sí | no |
| `GET` | `/api/v1/memory/stats` | `inline@src/server.ts:4048` | no | sí | no | no | no |
| `POST` | `/api/v1/memory/query` | `inline@src/server.ts:4053` | sí | sí | no | sí | no |
| `POST` | `/api/v1/security/authenticate` | `inline@src/server.ts:4064` | sí | sí | no | sí | no |
| `GET` | `/api/v1/security/audit` | `inline@src/server.ts:4074` | sí | sí | no | no | no |
| `POST` | `/api/v1/governance/evaluate` | `inline@src/server.ts:4081` | sí | sí | no | sí | no |
| `GET` | `/api/v1/governance/audit` | `inline@src/server.ts:4091` | sí | sí | no | no | no |
| `POST` | `/api/v1/learning/train` | `inline@src/server.ts:4098` | sí | sí | no | sí | no |
| `GET` | `/api/v1/observability/metrics` | `inline@src/server.ts:4126` | no | sí | no | no | no |
| `GET` | `/api/v1/observability/health` | `inline@src/server.ts:4132` | no | sí | no | no | no |
| `GET` | `/api/v1/observability/slos` | `inline@src/server.ts:4138` | no | sí | no | no | no |
| `GET` | `/api/v1/observability/alerts` | `inline@src/server.ts:4144` | no | sí | no | no | no |
| `GET` | `/api/v1/observability/dashboards` | `inline@src/server.ts:4149` | no | sí | no | no | no |
| `GET` | `/api/v1/federation/status` | `inline@src/server.ts:4156` | no | sí | no | no | no |
| `GET` | `/api/v1/federation/telemetry` | `inline@src/server.ts:4161` | no | sí | no | no | no |
| `POST` | `/api/v1/federation/cross` | `inline@src/server.ts:4166` | sí | sí | no | sí | no |
| `GET` | `/api/v1/pipeline/metrics` | `inline@src/server.ts:4183` | sí | sí | no | no | no |
| `GET` | `/api/v1/pipeline/stats/hot` | `inline@src/server.ts:4188` | sí | sí | no | no | no |
| `GET` | `/api/v1/pipeline/stats/cold` | `inline@src/server.ts:4193` | sí | sí | no | no | no |
| `GET` | `/api/v1/platform/capabilities` | `inline@src/server.ts:4199` | no | sí | no | no | no |
| `POST` | `/api/v1/evidence-graph/append` | `inline@src/server.ts:4204` | sí | sí | no | sí | no |
| `GET` | `/api/v1/evidence-graph/verify` | `inline@src/server.ts:4222` | sí | sí | no | no | no |
| `POST` | `/api/v1/temporal/record` | `inline@src/server.ts:4227` | sí | sí | no | sí | no |
| `GET` | `/api/v1/temporal/versions` | `inline@src/server.ts:4238` | no | sí | no | no | no |
| `POST` | `/api/v1/citemesh/publish` | `inline@src/server.ts:4243` | sí | sí | no | sí | no |
| `GET` | `/api/v1/citemesh/replay` | `inline@src/server.ts:4254` | no | sí | no | sí | no |
| `POST` | `/api/v1/cognitive-capital/list` | `inline@src/server.ts:4261` | sí | sí | no | sí | no |
| `POST` | `/api/v1/cognitive-capital/trade` | `inline@src/server.ts:4276` | sí | sí | no | sí | no |
| `POST` | `/api/v1/immune/report` | `inline@src/server.ts:4287` | sí | sí | no | sí | no |
| `POST` | `/api/v1/immune/assess` | `inline@src/server.ts:4298` | sí | sí | no | sí | no |
| `POST` | `/api/v1/fabric/execute` | `inline@src/server.ts:4309` | sí | sí | no | sí | no |
| `GET` | `/api/v1/monetization/plans` | `inline@src/server.ts:4321` | no | sí | no | no | no |
| `POST` | `/api/v1/monetization/escrow` | `inline@src/server.ts:4326` | sí | sí | no | sí | no |
| `POST` | `/api/v1/monetization/escrow/release` | `inline@src/server.ts:4337` | sí | sí | no | sí | no |
| `POST` | `/api/v1/monetization/payout` | `inline@src/server.ts:4348` | sí | sí | no | sí | no |
| `POST` | `/api/v1/monetization/scer-split` | `inline@src/server.ts:4359` | sí | sí | no | sí | no |
| `POST` | `/api/v1/pricing/dynamic` | `inline@src/server.ts:4370` | sí | sí | no | sí | no |
| `GET` | `/api/v1/monetization/stats` | `inline@src/server.ts:4381` | no | sí | no | no | no |
| `GET` | `/api/v1/ops/preflight` | `inline@src/server.ts:4387` | no | sí | no | no | no |
| `GET` | `/api/v1/reina/status` | `inline@src/server.ts:4406` | no | no | sí | no | no |
| `POST` | `/api/v1/reina/adjudicate` | `inline@src/server.ts:4413` | sí | sí | no | sí | no |
| `GET` | `/api/v1/reina/log/proof/:index` | `inline@src/server.ts:4441` | no | sí | no | sí | no |
| `GET` | `/api/v1/agents` | `inline@src/routes/agents.ts:28` | no | no | sí | no | no |
| `POST` | `/api/v1/agents/run` | `inline@src/routes/agents.ts:50` | sí | no | sí | sí | no |
| `POST` | `/api/v1/civilization/cycle` | `inline@src/routes/civilization.ts:25` | sí | no | sí | sí | no |
| `POST` | `/api/v1/security/document-seal` | `inline@src/routes/document-seal.ts:57` | sí | no | sí | sí | no |
| `POST` | `/api/v1/security/document-seal/verify` | `inline@src/routes/document-seal.ts:91` | sí | no | sí | sí | no |
| `GET` | `/api/v1/security/document-seal` | `inline@src/routes/document-seal.ts:120` | sí | no | sí | no | no |
| `POST` | `/api/v3/economy/calculate` | `inline@src/routes/economy.ts:55` | sí | no | sí | sí | no |
| `POST` | `/api/v3/economy/settle` | `inline@src/routes/economy.ts:94` | sí | no | sí | sí | no |
| `GET` | `/api/v3/economy/ledger` | `inline@src/routes/economy.ts:140` | no | no | sí | no | no |
| `GET` | `/api/v3/economy/streams` | `inline@src/routes/economy.ts:156` | no | no | sí | no | no |
| `POST` | `/api/v3/economy/quote` | `inline@src/routes/economy.ts:167` | sí | no | sí | sí | no |
| `POST` | `/api/v1/governance/order-permissions` | `inline@src/routes/governance-permissions.ts:32` | sí | no | sí | sí | no |
| `POST` | `/api/v1/governance/order-authorize` | `inline@src/routes/governance-permissions.ts:47` | sí | no | sí | sí | no |
| `GET` | `/api/v1/hf/catalog` | `inline@src/routes/hf-hub.ts:28` | no | no | sí | sí | no |
| `POST` | `/api/v1/hf/ingest` | `inline@src/routes/hf-hub.ts:47` | sí | no | sí | sí | no |
| `GET` | `/api/v1/hf/references` | `inline@src/routes/hf-hub.ts:73` | no | no | sí | sí | no |
| `GET` | `/api/v1/hypercore/modes` | `inline@src/routes/hypercore.ts:59` | no | no | no | no | no |
| `POST` | `/api/v1/hypercore/run` | `inline@src/routes/hypercore.ts:70` | sí | sí | no | sí | no |
| `POST` | `/api/v1/hypercore/predict` | `inline@src/routes/hypercore.ts:101` | sí | sí | no | sí | no |
| `GET` | `/api/v1/hypercore/skills` | `inline@src/routes/hypercore.ts:146` | no | no | no | no | no |
| `POST` | `/api/v1/hypercore/skills/execute` | `inline@src/routes/hypercore.ts:163` | sí | sí | sí | sí | no |
| `POST` | `/api/v1/mcp` | `inline@src/routes/hypercore.ts:203` | sí | sí | sí | sí | no |
| `GET` | `/api/v1/emergency/status` | `inline@src/routes/ihec.ts:37` | no | no | sí | no | no |
| `POST` | `/api/v1/emergency/snapshot` | `inline@src/routes/ihec.ts:51` | sí | no | sí | sí | no |
| `POST` | `/api/v1/emergency/recover` | `inline@src/routes/ihec.ts:76` | sí | no | sí | sí | no |
| `POST` | `/api/v1/emergency/repair` | `inline@src/routes/ihec.ts:102` | sí | no | sí | sí | no |
| `GET` | `/api/v1/emergency/governance` | `inline@src/routes/ihec.ts:111` | sí | no | sí | no | no |
| `POST` | `/api/v1/emergency/failover` | `inline@src/routes/ihec.ts:116` | sí | no | sí | sí | no |
| `GET` | `/api/v1/emergency/cache` | `inline@src/routes/ihec.ts:134` | no | no | sí | no | no |
| `POST` | `/api/v1/emergency/rag` | `inline@src/routes/ihec.ts:139` | sí | no | sí | sí | no |
| `GET` | `/api/v1/emergency/telemetry` | `inline@src/routes/ihec.ts:152` | no | no | sí | no | no |
| `GET` | `/api/v1/emergency/crisis` | `inline@src/routes/ihec.ts:165` | no | no | sí | no | no |
| `GET` | `/api/v1/emergency/mutation` | `inline@src/routes/ihec.ts:170` | no | no | sí | no | no |
| `GET` | `/api/v1/emergency/topology` | `inline@src/routes/ihec.ts:175` | no | no | sí | sí | no |
| `GET` | `/api/v1/ivcc/status` | `inline@src/routes/ivcc.ts:166` | no | no | sí | no | no |
| `POST` | `/api/v1/ivcc/plan` | `inline@src/routes/ivcc.ts:175` | sí | no | sí | no | no |
| `POST` | `/api/v1/voice/create` | `inline@src/routes/ivcc.ts:192` | sí | no | sí | sí | no |
| `POST` | `/api/v1/consent/register` | `inline@src/routes/ivcc.ts:274` | sí | no | sí | sí | no |
| `POST` | `/api/v1/consent/validate` | `inline@src/routes/ivcc.ts:305` | sí | no | sí | sí | no |
| `DELETE` | `/api/v1/consent/revoke` | `inline@src/routes/ivcc.ts:329` | sí | no | sí | sí | no |
| `GET` | `/api/v1/audit` | `inline@src/routes/ivcc.ts:361` | no | no | sí | sí | no |
| `POST` | `/api/v1/ivcc/memory` | `inline@src/routes/ivcc.ts:380` | sí | no | sí | sí | no |
| `DELETE` | `/api/v1/ivcc/memory` | `inline@src/routes/ivcc.ts:423` | sí | no | sí | sí | no |
| `POST` | `/api/v1/synthesize` | `inline@src/routes/ivcc.ts:446` | sí | no | sí | no | no |
| `GET` | `/api/v1/customization/catalog` | `inline@src/routes/marketplace.ts:41` | no | no | sí | no | no |
| `GET` | `/api/v1/customization/catalog/:id` | `inline@src/routes/marketplace.ts:54` | no | no | sí | sí | no |
| `GET` | `/api/v1/marketplace` | `inline@src/routes/marketplace.ts:65` | no | no | sí | no | no |
| `GET` | `/api/v1/marketplace/:packId` | `inline@src/routes/marketplace.ts:70` | no | no | sí | sí | no |
| `POST` | `/api/v1/marketplace/plan` | `inline@src/routes/marketplace.ts:81` | sí | no | sí | sí | no |
| `GET` | `/api/v1/native/engines` | `inline@src/routes/native-engines.ts:73` | no | no | no | no | no |
| `GET` | `/api/v1/native/llm/status` | `inline@src/routes/native-engines.ts:114` | no | no | sí | no | no |
| `POST` | `/api/v1/native/llm/generate` | `inline@src/routes/native-engines.ts:127` | sí | no | sí | sí | no |
| `POST` | `/api/v1/native/moe/diagnostics` | `inline@src/routes/native-engines.ts:158` | sí | no | sí | sí | no |
| `GET` | `/api/v3/omega/constitution` | `inline@src/routes/omega.ts:70` | no | no | sí | no | no |
| `POST` | `/api/v3/omega/constitution/evaluate` | `inline@src/routes/omega.ts:81` | sí | no | sí | sí | no |
| `POST` | `/api/v3/omega/simulation/run` | `inline@src/routes/omega.ts:100` | sí | no | sí | sí | no |
| `POST` | `/api/v3/omega/capital/value` | `inline@src/routes/omega.ts:121` | sí | no | sí | sí | no |
| `POST` | `/api/v3/omega/civilization/value` | `inline@src/routes/omega.ts:143` | sí | no | sí | sí | no |
| `GET` | `/api/v3/omega/nexus` | `inline@src/routes/omega.ts:157` | no | no | sí | sí | no |
| `POST` | `/api/v3/omega/twins/federate` | `inline@src/routes/omega.ts:163` | sí | no | sí | sí | no |
| `POST` | `/api/v3/omega/memory/store` | `inline@src/routes/omega.ts:181` | sí | no | sí | sí | no |
| `POST` | `/api/v3/omega/memory/query` | `inline@src/routes/omega.ts:201` | sí | no | sí | sí | no |
| `POST` | `/api/v3/omega/trust/analyze` | `inline@src/routes/omega.ts:220` | sí | no | sí | sí | no |
| `POST` | `/api/v3/omega/research/run` | `inline@src/routes/omega.ts:234` | sí | no | sí | sí | no |
| `POST` | `/api/v3/omega/territory/fabricate` | `inline@src/routes/omega.ts:250` | sí | no | sí | sí | no |
| `GET` | `/v1/models` | `inline@src/routes/openai.ts:107` | no | no | no | no | no |
| `POST` | `/v1/chat/completions` | `inline@src/routes/openai.ts:121` | sí | no | no | sí | no |
| `POST` | `/v1/completions` | `inline@src/routes/openai.ts:186` | sí | no | no | sí | no |
| `POST` | `/api/v1/pipeline/execute` | `inline@src/routes/pipeline.ts:91` | sí | no | sí | sí | no |
| `GET` | `/chat` | `inline@src/routes/platform.ts:115` | no | no | sí | no | no |
| `GET` | `/platform` | `inline@src/routes/platform.ts:124` | no | no | sí | no | no |
| `GET` | `/platform/:page` | `inline@src/routes/platform.ts:134` | no | no | sí | sí | no |
| `GET` | `/styles/platform.css` | `inline@src/routes/platform.ts:167` | no | no | no | no | no |
| `GET` | `/ui/platform.js` | `inline@src/routes/platform.ts:175` | no | no | no | no | no |
| `GET` | `/ui/platform-chat.js` | `inline@src/routes/platform.ts:183` | no | no | no | no | no |
| `GET` | `/api/v1/platform/catalog` | `inline@src/routes/platform.ts:191` | no | no | sí | no | no |
| `POST` | `/api/v1/revenue/iet/calculate` | `inline@src/routes/revenue-fabric.ts:98` | sí | no | sí | sí | no |
| `POST` | `/api/v1/revenue/settle` | `inline@src/routes/revenue-fabric.ts:128` | sí | no | sí | sí | no |
| `GET` | `/api/v1/revenue/settlements/:idempotencyKey` | `inline@src/routes/revenue-fabric.ts:232` | no | no | sí | sí | no |
| `GET` | `/api/v1/revenue/ledger/journals` | `inline@src/routes/revenue-fabric.ts:248` | no | no | sí | no | no |
| `GET` | `/api/v1/revenue/ledger/verify` | `inline@src/routes/revenue-fabric.ts:256` | sí | no | sí | no | no |
| `POST` | `/api/v1/revenue/usage` | `inline@src/routes/revenue-fabric.ts:268` | sí | no | sí | sí | no |
| `GET` | `/api/v1/revenue/usage/:userId` | `inline@src/routes/revenue-fabric.ts:313` | no | no | sí | no | no |
| `GET` | `/api/v1/revenue/usage/:userId/invoice` | `inline@src/routes/revenue-fabric.ts:329` | no | no | sí | no | no |
| `GET` | `/api/v1/revenue/wallet/:userId` | `inline@src/routes/revenue-fabric.ts:377` | no | no | sí | sí | no |
| `POST` | `/api/v1/revenue/wallet/:userId/credit` | `inline@src/routes/revenue-fabric.ts:402` | sí | no | sí | sí | no |
| `POST` | `/api/v1/revenue/wallet/:userId/debit` | `inline@src/routes/revenue-fabric.ts:439` | sí | no | sí | sí | no |
| `GET` | `/api/v1/revenue/my/wallet` | `inline@src/routes/revenue-fabric.ts:460` | no | no | sí | no | no |
| `POST` | `/api/v1/revenue/my/wallet/payout` | `inline@src/routes/revenue-fabric.ts:479` | sí | no | sí | no | no |
| `POST` | `/api/v1/revenue/eligibility/:userId` | `inline@src/routes/revenue-fabric.ts:496` | sí | no | sí | sí | no |
| `GET` | `/api/v1/revenue/eligibility/:userId` | `inline@src/routes/revenue-fabric.ts:514` | no | no | sí | no | no |
| `POST` | `/api/v1/revenue/contributions/:userId` | `inline@src/routes/revenue-fabric.ts:526` | sí | no | sí | sí | no |
| `GET` | `/api/v1/revenue/contributions/:userId/total` | `inline@src/routes/revenue-fabric.ts:545` | no | no | sí | no | no |
| `GET` | `/api/v1/revenue/streams` | `inline@src/routes/revenue-fabric.ts:557` | no | no | sí | no | no |
| `POST` | `/api/v1/billing/checkout` | `inline@src/routes/revenue-fabric.ts:583` | sí | no | sí | sí | no |
| `POST` | `/api/v1/billing/portal` | `inline@src/routes/revenue-fabric.ts:608` | sí | no | sí | no | no |
| `POST` | `/api/v1/billing/stripe/webhook` | `inline@src/routes/revenue-fabric.ts:628` | sí | no | no | sí | no |
| `GET` | `/api/v1/revenue/outbox/status` | `inline@src/routes/revenue-fabric.ts:664` | no | no | sí | no | no |
| `GET` | `/api/v1/revenue/outbox/dead-letter` | `inline@src/routes/revenue-fabric.ts:672` | no | no | sí | no | no |
| `POST` | `/api/v1/revenue/outbox/retry/:eventId` | `inline@src/routes/revenue-fabric.ts:680` | sí | no | sí | no | no |
| `GET` | `/api/v1/revenue/health` | `inline@src/routes/revenue-fabric.ts:712` | no | no | no | no | no |
| `POST` | `/api/v1/intelligence/triage` | `inline@src/routes/traffic-light.ts:28` | sí | no | sí | sí | no |
| `GET` | `/api/v3/treasury/balance/:partyId` | `inline@src/routes/treasury.ts:60` | no | no | sí | sí | no |
| `POST` | `/api/v3/treasury/credit` | `inline@src/routes/treasury.ts:112` | sí | no | no | no | no |
| `POST` | `/api/v3/treasury/debit` | `inline@src/routes/treasury.ts:113` | sí | no | no | no | no |
| `POST` | `/api/v3/affiliates/register` | `inline@src/routes/treasury.ts:115` | sí | no | sí | sí | no |
| `POST` | `/api/v3/affiliates/attribute` | `inline@src/routes/treasury.ts:135` | sí | no | sí | sí | no |
| `POST` | `/api/v3/fraud/analyze` | `inline@src/routes/treasury.ts:170` | sí | no | sí | sí | no |
| `GET` | `/api/v1/tts/status` | `inline@src/routes/tts.ts:83` | no | no | no | no | no |
| `POST` | `/api/v1/tts/plan` | `inline@src/routes/tts.ts:87` | sí | no | sí | no | no |
| `POST` | `/api/v1/tts/stream` | `inline@src/routes/tts.ts:97` | sí | no | sí | no | sí |
| `POST` | `/api/v1/tts/interrupt` | `inline@src/routes/tts.ts:150` | sí | no | sí | no | sí |
| `POST` | `/api/v1/tts/synthesize` | `inline@src/routes/tts.ts:163` | sí | no | sí | no | no |
| `POST` | `/api/v1/tts/memory` | `inline@src/routes/tts.ts:175` | sí | no | sí | sí | no |
| `DELETE` | `/api/v1/tts/memory` | `inline@src/routes/tts.ts:186` | sí | no | sí | no | no |
| `POST` | `/api/v1/intelligence/turbo-plan` | `inline@src/routes/turbo-planner.ts:27` | sí | no | sí | sí | no |
| `POST` | `/api/v1/yun/events` | `inline@src/routes/yun-events.ts:29` | sí | no | no | sí | no |
| `GET` | `/api/v1/yun/events` | `inline@src/routes/yun-events.ts:53` | no | no | sí | no | no |

> Las columnas **Auth**, **Rate-limit** y **Validación** son heurísticas de análisis
> estático sobre el cuerpo del handler (presencia de `authorizeApiToken` /
> `verifyBearerToken` / `assertBalancedAuthority`, `enforceRateLimit` y guardas de
> entrada). No son una prueba en ejecución.

## Cómo regenerar

```bash
node scripts/route-inventory.mjs
```

El script reescribe por completo `docs/api/route-inventory.json` y este README.
No requiere dependencias ni red. Si `src/server.ts` no tiene rutas parseables,
reporta la verdad: lista vacía + aviso en consola.

## Semántica de `verified`

`verified: true` **no** significa "la ruta funciona". Significa que existe al menos
una referencia externa al contrato de la ruta:

1. una **prueba** que cita la ruta (`test:...`), o
2. la **documentación** canónica (`docs:docs/spec/BLUEPRINT-API-v4.2.0.md`), o
3. un **contrato de tipo** cuyo nombre comparte el dominio de la ruta
   (`types:src/inference/types.ts:...`).

Ser simplemente un handler de Express tipado por inferencia **no** cuenta como
verificado. Hoy la mayoría de rutas queda con `verified: false` (233 de 243);
eso es el estado real del repositorio, no un defecto del script.

## UI/API truthfulness (ISA-451..458)

Este inventario es la **base de veracidad** para cualquier superficie de UI o
catálogo de API:

- **ISA-451 (MoE UI truth):** si el catálogo etiqueta una ruta como "DeepSeek-V3"
  o "MoE", debe apuntar a una fila con `verified: true` y con un contrato
  respaldado; si no, la UI debe rotularla como heurística/simulación.
- **ISA-452/453 (CoT/Swarm UI truth):** las trazas de razonamiento y las
  estrategias de enjambre deben declarse simuladas salvo que mapeen a una ruta
  verificada de este inventario.
- **ISA-454 (RAG UI truth):** la presentación de RAG debe ligarse a la ruta de
  memoria/retrieval realmente inventariada, no a datos de ejemplo.
- **ISA-455..458 (simulador / tenant / actor):** toda acción privilegiada del
  simulador debe corresponder a una ruta sensible con `Auth: sí`; la UI nunca
  debe enviar `tenantId`/`actorId` como autoridad — el servidor debe derivarlos.
  Las rutas sensibles **sin** auth/rate-limit/validación son deuda explícita
  visible en la tabla.
- **ISA-475 (claim-to-code map):** este archivo es el mapa "claim → ruta
  ejecutable" que exige el checklist.

## Evidencia y `.gitignore`

Los artefactos en `evidence/*.json` (p. ej. `production-evidence.json`,
`security-suite.json`) **no** se versionan: la línea `evidence/*.json` se añade al
`.gitignore` del repositorio por el ensamblador. La evidencia misma se adjunta
como artefacto de CI ligado al SHA exacto (ISA-325 / ISA-336 / ISA-337).
