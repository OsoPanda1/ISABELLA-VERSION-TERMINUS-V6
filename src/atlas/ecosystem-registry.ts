/**
 * TAMV knowledge stack registry.
 *
 * This is a descriptive capability catalog, not an execution router or an authority
 * grant. Presence in this registry never means production verification.
 */
export type StackModuleStatus =
  | 'code-present-unverified'
  | 'experimental'
  | 'reference-only';

export type StackModuleId = 'atlas' | 'transformative-map' | 'hypercore' | 'litle' | 'little-trust-fabric';

export interface StackModuleDescriptor {
  readonly id: StackModuleId;
  readonly canonicalName: string;
  readonly status: StackModuleStatus;
  readonly responsibility: string;
  readonly sourcePaths: readonly string[];
  readonly consumes: readonly string[];
  readonly produces: readonly string[];
  /** This catalog grants no module authority to execute external side effects. */
  readonly mayExecuteExternalActions: false;
  /** External actions require the canonical policy gate and any required human approval. */
  readonly requiresGovernanceGate: true;
}

const STACK_MODULES = [
  {
    id: 'atlas',
    canonicalName: 'TAMV Atlas Trascendence',
    status: 'code-present-unverified',
    responsibility: 'Canonical document identity, lifecycle metadata, typed events, and knowledge graph persistence.',
    sourcePaths: ['src/atlas/documents.ts', 'src/atlas/events.ts', 'src/atlas/hcu-store.ts', 'src/atlas/persistence.ts'],
    consumes: ['canonical document metadata', 'federation identifiers', 'governed event payloads'],
    produces: ['document_uid', 'typed Atlas events', 'HCU graph records'],
    mayExecuteExternalActions: false,
    requiresGovernanceGate: true,
  },
  {
    id: 'transformative-map',
    canonicalName: 'TAMV Transformative Map / HCU',
    status: 'code-present-unverified',
    responsibility: 'Deterministic classical directed-hypergraph simulation, scenario comparison, quarantine and seeded sensitivity analysis.',
    sourcePaths: ['src/atlas/transformative-map.ts', 'src/ui/tamv-transformative-map.html'],
    consumes: ['declared atoms and X/Y/Z scores', 'directed hyperedges', 'source references and TQAF levels', 'exogenous shocks', 'quarantine set', 'scenario parameters'],
    produces: ['2026–2050 activation timeline', 'system tension index', 'SHA3-512 input digest', 'optional 200-run sensitivity intervals'],
    mayExecuteExternalActions: false,
    requiresGovernanceGate: true,
  },
  {
    id: 'hypercore',
    canonicalName: 'Hyper Core / HyperCore',
    status: 'code-present-unverified',
    responsibility: 'Governed cognitive processing, semantic/context preparation, model routing, prediction, and optimization primitives.',
    sourcePaths: ['src/hypercore/index.ts', 'src/hypercore/hypercore.ts', 'src/hypercore/context-compiler.ts', 'src/hypercore/adaptive-model-router.ts'],
    consumes: ['authorized request context', 'policy decisions', 'permitted evidence references'],
    produces: ['candidate outputs', 'routing and prediction results', 'BookPI audit events where wired'],
    mayExecuteExternalActions: false,
    requiresGovernanceGate: true,
  },
  {
    id: 'litle',
    canonicalName: 'LITLE Trust Fabric',
    status: 'experimental',
    responsibility: 'Canonical work identifiers, provenance/evidence chains, epistemic profiles, and keyed attestations.',
    sourcePaths: ['src/litle/id.ts', 'src/litle/evidence.ts', 'src/litle/epistemic.ts', 'src/litle/certificate.ts', 'src/litle/trust-fabric.ts'],
    consumes: ['bounded work metadata', 'evidence nodes and parent references', 'declared epistemic dimensions'],
    produces: ['canonical LITLE ID', 'evidence root', 'epistemic profile', 'attestation and certificate'],
    mayExecuteExternalActions: false,
    requiresGovernanceGate: true,
  },
  {
    id: 'little-trust-fabric',
    canonicalName: 'Little Trust Fabric (external reference)',
    status: 'reference-only',
    responsibility: 'External concept reference for federated identity, access policies, and trust audit primitives; not imported as executable code.',
    sourcePaths: ['https://github.com/OsoPanda1/litle-trust-fabric-58c96208'],
    consumes: ['external repository documentation'],
    produces: ['architecture reference only'],
    mayExecuteExternalActions: false,
    requiresGovernanceGate: true,
  },
] as const satisfies readonly StackModuleDescriptor[];

export function listTamvKnowledgeStackModules(): readonly StackModuleDescriptor[] {
  return STACK_MODULES;
}

export function getTamvKnowledgeStackModule(id: StackModuleId): StackModuleDescriptor {
  const module = STACK_MODULES.find((candidate) => candidate.id === id);
  if (!module) throw new Error(`TAMV_STACK_MODULE_UNKNOWN:${id}`);
  return module;
}

export function validateTamvKnowledgeStackRegistry(): readonly string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const module of STACK_MODULES) {
    if (ids.has(module.id)) errors.push(`duplicate_module_id:${module.id}`);
    ids.add(module.id);
    if (!module.canonicalName.trim()) errors.push(`empty_canonical_name:${module.id}`);
    if (module.sourcePaths.length === 0) errors.push(`missing_source_paths:${module.id}`);
    if (module.mayExecuteExternalActions !== false) errors.push(`external_execution_not_forbidden:${module.id}`);
    if (module.requiresGovernanceGate !== true) errors.push(`governance_gate_not_required:${module.id}`);
  }
  return errors;
}
