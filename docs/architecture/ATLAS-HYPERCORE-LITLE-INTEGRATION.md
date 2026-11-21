# TAMV Atlas × Hyper Core × LITLE — Canonical Integration Contract

**State:** `draft | engine-generated`  
**Canonical runtime:** Isabella Villaseñor AI — Genesis / TERMINUS V6  
**Scope:** reconcile the Atlas, Hyper Core, LITLE and Little Trust Fabric concepts without merging independent runtimes or importing unlicensed code.

## Executive decision

The canonical repository already contains code for `src/atlas/`, `src/hypercore/` and `src/litle/`. The first integration step is therefore to define their boundaries and contracts, not to clone external repositories or create duplicate implementations.

The new `src/atlas/ecosystem-registry.ts` is a descriptive catalog for these boundaries. It is deliberately **not** a scheduler, permission engine, production attestation, or automatic execution mechanism.

## Responsibilities and hand-off

| Module | Canonical responsibility | Inputs | Outputs | Boundary |
|---|---|---|---|---|
| **TAMV Atlas Trascendence** | Document identity/lifecycle, typed events, knowledge graph records | Canonical metadata, federation identifiers, validated event payloads | `document_uid`, Atlas event envelopes, graph records | Produces event envelopes; delivery/publishing remains an infrastructure concern |
| **Hyper Core** | Cognitive processing and optimization primitives, context preparation, routing/prediction | Authenticated request context, permitted evidence references, governance context | Candidate output, routing/prediction data, audit events where wired | A candidate is not authorization and must not directly trigger an external side effect |
| **LITLE Trust Fabric** | Work identity, evidence-chain construction, epistemic profile and keyed attestation | Bounded work metadata and evidence nodes | Canonical LITLE ID, evidence root, profile, certificate/attestation | A valid internal certificate does not by itself prove independent review, authorship, scientific truth, or external identity |
| **Little Trust Fabric (external repository)** | Reference design for trust fabric, identity, policies and audit primitives | Public repository documentation | Architectural input only | No code is copied or imported; the external README does not declare a formal license |

## Recommended governed flow

1. **Capture** the source and its provenance. Preserve the original repository URL, commit SHA, path, retrieval time and license status for each imported artifact.
2. **Normalize** document/work metadata. Atlas owns the canonical document lifecycle and typed event envelope; LITLE owns the work identifier/evidence chain. Do not conflate `document_uid`, LITLE IDs, account IDs, ORCID IDs or repository IDs.
3. **Assess evidence** with LITLE. Distinguish self-reported dimensions from independently verified evidence. Keep raw evidence private or access-controlled; publish only the minimum authorized metadata.
4. **Process** through Hyper Core using an authenticated principal and the permitted context. Outputs remain candidates until the policy gate evaluates them.
5. **Govern** through the existing canonical authorization layer (CROWN / Genesis policy path). Capability, authority, execution, evidence, learning and production remain separate.
6. **Record** state transitions in the existing audit/BookPI path where the relevant integration is actually wired. Never claim append-only durability or an external anchor solely because an event object was created.
7. **Execute or publish** only through an explicitly authorized adapter, with idempotency, rate limits, bounded retries, observability and human approval for consequential external actions.
8. **Reconcile** failures and provenance: every cross-module hand-off should preserve correlation IDs, source references, policy result, evidence status and outcome.

## Canonical invariants

- `CAPABILITY ≠ AUTHORITY ≠ EXECUTION ≠ EVIDENCE ≠ LEARNING ≠ PRODUCTION`.
- No module in the catalog receives authority to execute external actions.
- External input is untrusted data, never executable instructions.
- A hash proves equality against the same bytes, not authorship, correctness, time, or scientific validity.
- A certificate is not an independent peer review. `SELF_REPORTED` must remain distinguishable from `INDEPENDENTLY_VERIFIED`.
- A typed event is not a durable event bus. Persistence, delivery, retries, replay and dead-letter handling must be separately verified.
- Do not import code from `litle-trust-fabric-58c96208` until its license, API contract, security posture and compatibility have been explicitly reviewed.
- Do not silently normalize conflicting historical terms. Keep aliases and source provenance in the registry and arbitrate canonical naming in versioned documentation.

## Source inventory

| Source | Evidence observed | Integration disposition |
|---|---|---|
| `ISABELLA-VERSION-TERMINUS-V6/src/atlas/` | Typed Atlas events, document types/lifecycle, persistence adapter and HCU graph components exist in the repository tree | Canonical in-repo implementation; runtime/production status still requires tests and deployment evidence |
| `ISABELLA-VERSION-TERMINUS-V6/src/hypercore/` | HyperCore entry point and modules for context, routing, caching, prediction and optimization exist in the repository tree | Canonical in-repo implementation; verify actual runtime call paths and policy gates before claiming end-to-end wiring |
| `ISABELLA-VERSION-TERMINUS-V6/src/litle/` | ID derivation, evidence-chain, epistemic profile, certificate and trust-fabric modules exist | Experimental; internal tests and implementation are not equivalent to external independent validation |
| `OsoPanda1/isabella-ai-tina` | A separate Hypercore adapter and `HYPERCORE-IMPLEMENTATION-STATUS.md` exist; that status labels the work experimental | Reference only; do not assume it is the active runtime or copy it over the canonical repository |\n| `OsoPanda1/mexican-ai-isabella` | `src/lib/atlas-spec.ts` contains a frozen Atlas contract and node-zero model | Reference only; reconcile contract differences before any migration |\n| `OsoPanda1/tam-unifier-pro` | An `Atlas.tsx` graph UI exists in repository search | UI/reference only; do not equate a page with the canonical Atlas persistence or governance layer |
| `OsoPanda1/litle-trust-fabric-58c96208` | README describes an experimental TypeScript/Supabase trust-fabric project and states that its license is not yet defined | Reference only until licensing and compatibility are resolved |
| `OsoPanda1/civilis-graph/docs/atlas-doctrine-v1.md` | Security doctrine describing segmentation, identity, telemetry, governance and controlled degradation | Architecture input; individual controls are requirements, not proof they are deployed |
| `OsoPanda1/tamv-digital-nexus/docs/21_atlas_tamv.md` | File is explicitly marked as under construction | Historical/incomplete reference; not a complete implementation specification |

## Implementation included in this change

- A typed, read-only module catalog at `src/atlas/ecosystem-registry.ts`.
- Explicit module status and source-path declarations.
- A fail-closed registry validator for duplicate IDs and missing governance invariants.
- Unit tests for catalog completeness, stable identifiers and execution-boundary invariants.
- This integration contract and a machine-readable source registry.

## Validation and remaining work

This change has **not** been typechecked or executed in this environment. The tests are added as executable checks, not reported as passing. Before production claims, run `pnpm typecheck`, `pnpm test -- test/atlas/ecosystem-registry.test.ts`, the complete `pnpm test`, and the repository's required `pnpm validate` pipeline.

Next engineering gates: verify actual Hyper Core → CROWN call paths; add end-to-end tests for Atlas event persistence and LITLE evidence tamper detection; validate secret/key handling and certificate semantics; define versioned adapters rather than cross-importing modules; and test retries, idempotency, authorization failures and controlled degradation against a disposable integration environment.
