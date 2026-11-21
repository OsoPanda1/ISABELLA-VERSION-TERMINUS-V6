/**
 * TAMV Transformative Map — deterministic HCU simulation contract.
 *
 * This is a classical, discrete-time directed-hypergraph model, not quantum
 * computing, telemetry, peer review, or a probability estimator. Parameters
 * and X/Y/Z scores are declared inputs until calibrated against evidence.
 */
import { buildEvidenceChain, contentHash, createEvidenceNode } from '../litle/evidence';

export type HcuDomainIndex = 0 | 1 | 2 | 3 | 4 | 5;
export type HcuScenario = 'A' | 'B' | 'C';
export type HcuEvidenceLevel = 'N1' | 'N2' | 'N3';

export interface TransformativeAtom {
  readonly id: string;
  readonly name: string;
  readonly domain: HcuDomainIndex;
  readonly impact: number;
  readonly risk: number;
  readonly evidence: number;
  readonly tri?: string;
  readonly note?: string;
}

export interface TransformativeTarget {
  readonly id: string;
  readonly effect: 1 | -1;
}

export interface TransformativeHyperedge {
  readonly id: string;
  readonly label: string;
  readonly sources: readonly string[];
  readonly targets: readonly TransformativeTarget[];
  readonly weight: number;
  readonly lag: number;
  readonly disabled?: boolean;
  readonly sourceRef?: string;
  readonly evidenceLevel?: HcuEvidenceLevel;
}

export interface TransformativeShock {
  readonly nodeId: string;
  readonly year: number;
  readonly magnitude: number;
}

export interface TransformativeMapInput {
  readonly atoms: readonly TransformativeAtom[];
  readonly hyperedges: readonly TransformativeHyperedge[];
  readonly shocks?: readonly TransformativeShock[];
  readonly quarantine?: readonly string[];
  readonly scenario: HcuScenario;
  readonly targetYear?: number;
  readonly sensitivity?: boolean;
}

export interface TransformativeNodeResult {
  readonly id: string;
  readonly name: string;
  readonly kind: 'core' | 'domain' | 'atom';
  readonly domain: number;
  readonly impact: number;
  readonly risk: number;
  readonly evidence: number;
  readonly activation: number;
  readonly quarantined: boolean;
}

export interface TransformativeMapResult {
  readonly schema: 'tamv.transformative-map.v1';
  readonly model: 'HCU-classical-directed-hypergraph';
  readonly yearRange: readonly [2026, 2050];
  readonly scenario: { readonly id: HcuScenario; readonly name: string; readonly gain: number; readonly decay: number; readonly riskAmplification: number };
  readonly targetYear: number;
  readonly nodes: readonly TransformativeNodeResult[];
  readonly timeline: readonly { readonly year: number; readonly activations: Readonly<Record<string, number>>; readonly tension: number }[];
  readonly traceability: { readonly edges: number; readonly sourcedEdges: number; readonly sourcedAndLevelledEdges: number; readonly ratio: number };
  readonly sensitivity?: { readonly runs: 200; readonly seed: 20261101; readonly targetYear: number; readonly intervals: Readonly<Record<string, { readonly p10: number; readonly p50: number; readonly p90: number }>> };
  readonly digest: string;
  readonly litleEvidence: { readonly algorithm: 'SHA3-512'; readonly rootHash: string; readonly nodeCount: number; readonly scope: 'structural chain over declared input; no source retrieval, attestation, signing or persistence' };
  readonly digestScope: 'SHA3-512 of canonical input; local integrity only, not signature or external anchor';
  readonly limitations: readonly string[];
}

const START_YEAR = 2026;
const END_YEAR = 2050;
const YEARS = END_YEAR - START_YEAR;
const SCENARIOS = {
  A: { name: 'Expansión controlada', gain: 0.8, decay: 0.6, riskAmplification: 0.2 },
  B: { name: 'Transformación estructural', gain: 1, decay: 0.72, riskAmplification: 0.5 },
  C: { name: 'Mutación sistémica', gain: 1.3, decay: 0.85, riskAmplification: 1 },
} as const;
const DOMAIN_NAMES = ['IA y Cognición', 'Economía Soberana', 'Gobernanza', 'Clima y Biosfera', 'Salud y Vida', 'Seguridad'] as const;
const SOURCE_REF = /^(?:https?:\/\/\S+|10\.\d{4,9}\/\S+)$/i;
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

function fail(message: string): never { throw new Error(`TAMV_HCU_INVALID:${message}`); }
function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)); }
function finiteRange(value: unknown, min: number, max: number, field: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) fail(field);
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}
function validate(input: TransformativeMapInput): void {
  if (!input || !Array.isArray(input.atoms) || input.atoms.length < 1 || input.atoms.length > 500) fail('atoms_count_1_500');
  if (!Array.isArray(input.hyperedges) || input.hyperedges.length > 2_000) fail('hyperedges_count_0_2000');
  if (!['A', 'B', 'C'].includes(input.scenario)) fail('scenario');
  if (input.targetYear !== undefined && (!Number.isInteger(input.targetYear) || input.targetYear < START_YEAR || input.targetYear > END_YEAR)) fail('target_year_2026_2050');
  const ids = new Set<string>(['core', ...Array.from({ length: 6 }, (_, i) => `D${i}`)]);
  for (const atom of input.atoms) {
    if (!atom || typeof atom.id !== 'string' || !ID_RE.test(atom.id) || ids.has(atom.id)) fail('atom_id_unique_and_not_reserved');
    ids.add(atom.id);
    if (typeof atom.name !== 'string' || !atom.name.trim() || atom.name.length > 200) fail(`atom_name:${atom.id}`);
    if (!Number.isInteger(atom.domain) || atom.domain < 0 || atom.domain > 5) fail(`atom_domain:${atom.id}`);
    finiteRange(atom.impact, 0, 100, `atom_impact:${atom.id}`);
    finiteRange(atom.risk, 0, 100, `atom_risk:${atom.id}`);
    finiteRange(atom.evidence, 0, 100, `atom_evidence:${atom.id}`);
    if (atom.tri !== undefined && (typeof atom.tri !== 'string' || atom.tri.length > 64)) fail(`atom_tri:${atom.id}`);
    if (atom.note !== undefined && (typeof atom.note !== 'string' || atom.note.length > 4_000)) fail(`atom_note:${atom.id}`);
  }
  const validIds = ids;
  const edgeIds = new Set<string>();
  for (const edge of input.hyperedges) {
    if (!edge || typeof edge.id !== 'string' || !ID_RE.test(edge.id) || edgeIds.has(edge.id)) fail('hyperedge_id_unique');
    edgeIds.add(edge.id);
    if (typeof edge.label !== 'string' || edge.label.length > 240) fail(`edge_label:${edge.id}`);
    if (!Array.isArray(edge.sources) || edge.sources.length < 1 || edge.sources.length > 100) fail(`edge_sources:${edge.id}`);
    if (!Array.isArray(edge.targets) || edge.targets.length < 1 || edge.targets.length > 100) fail(`edge_targets:${edge.id}`);
    if (edge.sources.some((id) => !validIds.has(id) || id === 'core') || edge.targets.some((target) => !target || !validIds.has(target.id) || target.id === 'core' || (target.effect !== 1 && target.effect !== -1))) fail(`edge_reference_or_sign:${edge.id}`);
    if (new Set(edge.sources).size !== edge.sources.length) fail(`edge_duplicate_source:${edge.id}`);
    if (new Set(edge.targets.map((target) => target.id)).size !== edge.targets.length) fail(`edge_duplicate_target:${edge.id}`);
    finiteRange(edge.weight, 0.05, 1, `edge_weight:${edge.id}`);
    if (!Number.isInteger(edge.lag) || edge.lag < 1 || edge.lag > 15) fail(`edge_lag:${edge.id}`);
    if (edge.sourceRef !== undefined && (typeof edge.sourceRef !== 'string' || edge.sourceRef.length > 2048)) fail(`edge_source_ref:${edge.id}`);
    if (edge.evidenceLevel !== undefined && !['N1', 'N2', 'N3'].includes(edge.evidenceLevel)) fail(`edge_evidence_level:${edge.id}`);
  }
  if (input.shocks !== undefined && (!Array.isArray(input.shocks) || input.shocks.length > 1_000)) fail('shocks_count_0_1000');
  for (const shock of input.shocks ?? []) {
    if (!shock || !validIds.has(shock.nodeId) || shock.nodeId === 'core') fail('shock_node');
    if (!Number.isInteger(shock.year) || shock.year < START_YEAR || shock.year > END_YEAR) fail('shock_year_2026_2050');
    finiteRange(shock.magnitude, -1, 1, 'shock_magnitude_-1_1');
  }
  if (input.quarantine !== undefined && (!Array.isArray(input.quarantine) || input.quarantine.length > ids.size)) fail('quarantine');
  for (const id of input.quarantine ?? []) if (!validIds.has(id)) fail(`quarantine_node:${id}`);
}
type ModelNode = { id: string; name: string; kind: 'core' | 'domain' | 'atom'; domain: number; impact: number; risk: number; evidence: number };
type ModelEdge = { id: string; sources: number[]; targets: { index: number; effect: number }[]; weight: number; lag: number; disabled: boolean };
type BuiltModel = { nodes: ModelNode[]; edges: ModelEdge[]; index: Map<string, number>; domainAtoms: number[][]; input: TransformativeMapInput };

function buildModel(input: TransformativeMapInput): BuiltModel {
  const nodes: ModelNode[] = [{ id: 'core', name: 'Ω Core', kind: 'core', domain: -1, impact: 0, risk: 0, evidence: 0 }];
  for (let domain = 0; domain < 6; domain++) nodes.push({ id: `D${domain}`, name: DOMAIN_NAMES[domain]!, kind: 'domain', domain, impact: 0, risk: 0, evidence: 0 });
  for (const atom of input.atoms) nodes.push({ id: atom.id, name: atom.name, kind: 'atom', domain: atom.domain, impact: atom.impact, risk: atom.risk, evidence: atom.evidence });
  const index = new Map(nodes.map((node, i) => [node.id, i]));
  const domainAtoms = Array.from({ length: 6 }, (_, domain) => nodes.flatMap((node, i) => node.kind === 'atom' && node.domain === domain ? [i] : []));
  const mean = (list: number[], key: 'impact' | 'risk' | 'evidence') => list.length ? list.reduce((sum, i) => sum + nodes[i]![key], 0) / list.length : 0;
  for (let domain = 0; domain < 6; domain++) {
    const node = nodes[domain + 1]!;
    node.impact = mean(domainAtoms[domain]!, 'impact');
    node.risk = mean(domainAtoms[domain]!, 'risk');
    node.evidence = mean(domainAtoms[domain]!, 'evidence');
  }
  nodes[0]!.impact = mean([1, 2, 3, 4, 5, 6], 'impact');
  nodes[0]!.risk = mean([1, 2, 3, 4, 5, 6], 'risk');
  nodes[0]!.evidence = mean([1, 2, 3, 4, 5, 6], 'evidence');
  const edges = input.hyperedges.map((edge) => ({
    id: edge.id,
    sources: edge.sources.map((id) => index.get(id)!),
    targets: edge.targets.map((target) => ({ index: index.get(target.id)!, effect: target.effect })),
    weight: edge.weight,
    lag: edge.lag,
    disabled: edge.disabled === true,
  }));
  return { nodes, edges, index, domainAtoms, input };
}
type Perturbation = { weight: number[]; lag: number[]; gain: number; decay: number };
function simulate(model: BuiltModel, perturbation?: Perturbation): number[][] {
  const { nodes, edges, index, domainAtoms, input } = model;
  const scenario = SCENARIOS[input.scenario];
  const quarantine = new Set(input.quarantine ?? []);
  const q = nodes.map((node) => quarantine.has(node.id) ? 0 : 1);
  const gain = scenario.gain * (perturbation?.gain ?? 1);
  const decay = Math.min(0.95, scenario.decay * (perturbation?.decay ?? 1));
  const activations: number[][] = [];
  for (let t = 0; t <= YEARS; t++) {
    const current = new Array<number>(nodes.length).fill(0);
    const previous = t > 0 ? activations[t - 1]! : null;
    if (previous) for (let i = 0; i < nodes.length; i++) current[i] = previous[i]! * decay;
    if (previous) {
      for (let ei = 0; ei < edges.length; ei++) {
        const edge = edges[ei]!;
        if (edge.disabled) continue;
        const lag = perturbation?.lag[ei] ?? edge.lag;
        const sourceTime = t - lag;
        if (sourceTime < 0) continue;
        const sourceState = activations[sourceTime]!;
        let source = 0;
        for (const sourceIndex of edge.sources) source += sourceState[sourceIndex]! * q[sourceIndex]!;
        source /= Math.sqrt(edge.sources.length);
        if (source === 0) continue;
        const weight = perturbation?.weight[ei] ?? edge.weight;
        for (const target of edge.targets) {
          const targetRisk = nodes[target.index]!.risk / 100;
          current[target.index] += target.effect * weight * gain * source * (1 + scenario.riskAmplification * (targetRisk - 0.5));
        }
      }
      for (let domain = 0; domain < 6; domain++) {
        const members = domainAtoms[domain]!;
        const domainIndex = domain + 1;
        if (members.length) current[domainIndex] += 0.25 * gain * members.reduce((sum, i) => sum + previous[i]! * q[i]!, 0) / members.length;
        const domainValue = previous[domainIndex]! * q[domainIndex]!;
        if (domainValue !== 0) for (const atomIndex of members) current[atomIndex] += 0.1 * gain * domainValue;
      }
    }
    for (const shock of input.shocks ?? []) if (shock.year - START_YEAR === t) {
      const shockIndex = index.get(shock.nodeId);
      if (shockIndex !== undefined) current[shockIndex] += shock.magnitude;
    }
    for (let i = 0; i < nodes.length; i++) current[i] = clamp(current[i]!, -1, 1);
    activations.push(current);
  }
  return activations;
}
function rng(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function percentile(sorted: number[], p: number): number {
  return sorted[Math.max(0, Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1))))] ?? 0;
}

export function simulateTransformativeMap(input: TransformativeMapInput): TransformativeMapResult {
  validate(input);
  const model = buildModel(input);
  const activation = simulate(model);
  const targetYear = input.targetYear ?? 2032;
  const yearIndex = targetYear - START_YEAR;
  const quarantine = new Set(input.quarantine ?? []);
  const nodes: TransformativeNodeResult[] = model.nodes.map((node, i) => ({
    ...node,
    activation: activation[yearIndex]![i]!,
    quarantined: quarantine.has(node.id),
  }));
  const timeline = activation.map((row, t) => {
    const year = START_YEAR + t;
    let weighted = 0, weights = 0;
    for (let i = 7; i < model.nodes.length; i++) {
      weighted += model.nodes[i]!.impact * Math.abs(row[i]!);
      weights += model.nodes[i]!.impact;
    }
    return {
      year,
      activations: Object.fromEntries(model.nodes.map((node, i) => [node.id, row[i]!])),
      tension: weights > 0 ? weighted / weights : 0,
    };
  });
  const activeEdges = input.hyperedges.filter((edge) => edge.disabled !== true);
  const sourcedEdges = activeEdges.filter(
    (edge) => typeof edge.sourceRef === 'string' && SOURCE_REF.test(edge.sourceRef.trim())
  ).length;
  const sourcedAndLevelledEdges = activeEdges.filter(
    (edge) =>
      typeof edge.sourceRef === 'string' &&
      SOURCE_REF.test(edge.sourceRef.trim()) &&
      !!edge.evidenceLevel
  ).length;
  let sensitivity: TransformativeMapResult['sensitivity'];
  if (input.sensitivity) {
    const random = rng(20261101);
    const samples = model.nodes.map(() => [] as number[]);
    for (let run = 0; run < 200; run++) {
      const perturbation: Perturbation = { weight: [], lag: [], gain: 0.85 + 0.3 * random(), decay: 0.9 + 0.2 * random() };
      for (const edge of model.edges) {
        perturbation.weight.push(clamp(edge.weight * (0.75 + 0.5 * random()), 0.05, 1));
        const r = random();
        perturbation.lag.push(clamp(edge.lag + (r < 1 / 3 ? -1 : r < 2 / 3 ? 0 : 1), 1, 15));
      }
      const runActivation = simulate(model, perturbation)[yearIndex]!;
      for (let i = 0; i < samples.length; i++) samples[i]!.push(runActivation[i]!);
    }
    sensitivity = {
      runs: 200,
      seed: 20261101,
      targetYear,
      intervals: Object.fromEntries(model.nodes.map((node, i) => {
        const sorted = samples[i]!.slice().sort((a, b) => a - b);
        return [node.id, { p10: percentile(sorted, 0.1), p50: percentile(sorted, 0.5), p90: percentile(sorted, 0.9) }];
      })),
    };
  }
  const canonicalInput = canonical({
    atoms: input.atoms,
    hyperedges: input.hyperedges,
    shocks: input.shocks ?? [],
    quarantine: [...(input.quarantine ?? [])].sort(),
    scenario: input.scenario,
    targetYear,
    sensitivity: input.sensitivity === true,
  });
  // Build an actual LITLE structural evidence chain over declared inputs and the computed result.
  // This records provenance structure only; it neither fetches sources nor issues a certificate.
  const evidenceNodes = [
    createEvidenceNode({
      id: 'hcu:input',
      type: 'PROMPT',
      content: canonicalInput,
      metadata: { artifact: 'tamv-transformative-map-input', status: 'declared-unverified' },
    }),
    ...input.atoms.map((atom, index) =>
      createEvidenceNode({
        id: `hcu:atom:${index}`,
        type: 'PROMPT',
        content: canonical(atom),
        parentIds: ['hcu:input'],
        metadata: {
          artifact: 'hcu-atom',
          declaredEvidenceScore: String(atom.evidence),
          sourceIdentity: atom.tri ?? 'not-declared',
        },
      })
    ),
    ...input.hyperedges.map((edge, index) =>
      createEvidenceNode({
        id: `hcu:edge:${index}`,
        type: 'PROMPT',
        content: canonical(edge),
        parentIds: ['hcu:input'],
        metadata: {
          artifact: 'hcu-hyperedge',
          sourceRef: edge.sourceRef ?? 'not-declared',
          tqafLevel: edge.evidenceLevel ?? 'not-declared',
          enabled: String(edge.disabled !== true),
        },
      })
    ),
    ...(input.shocks ?? []).map((shock, index) =>
      createEvidenceNode({
        id: `hcu:shock:${index}`,
        type: 'PROMPT',
        content: canonical(shock),
        parentIds: ['hcu:input'],
        metadata: { artifact: 'hcu-exogenous-shock', year: String(shock.year) },
      })
    ),
  ];
  const resultEvidenceParents = evidenceNodes
    .filter((node) => node.id !== 'hcu:input')
    .map((node) => node.id);
  resultEvidenceParents.push('hcu:input');
  const resultEvidenceNode = createEvidenceNode({
    id: 'hcu:result',
    type: 'MODEL',
    content: canonical({ digest: contentHash(canonicalInput), targetYear, scenario: input.scenario, timeline }),
    parentIds: resultEvidenceParents,
    metadata: { artifact: 'hcu-simulation-result', verification: 'not-independent' },
  });
  const evidenceChain = buildEvidenceChain([...evidenceNodes, resultEvidenceNode]);
  return {
    schema: 'tamv.transformative-map.v1',
    model: 'HCU-classical-directed-hypergraph',
    yearRange: [START_YEAR, END_YEAR] as const,
    scenario: { id: input.scenario, ...SCENARIOS[input.scenario] },
    targetYear,
    nodes,
    timeline,
    traceability: {
      edges: activeEdges.length,
      sourcedEdges,
      sourcedAndLevelledEdges,
      ratio: activeEdges.length ? sourcedAndLevelledEdges / activeEdges.length : 0,
    },
    ...(sensitivity ? { sensitivity } : {}),
    digest: contentHash(canonicalInput),
    litleEvidence: {
      algorithm: evidenceChain.algorithm,
      rootHash: evidenceChain.rootHash,
      nodeCount: evidenceChain.nodes.length,
      scope: 'structural chain over declared input; no source retrieval, attestation, signing or persistence',
    },
    digestScope: 'SHA3-512 of canonical input; local integrity only, not signature or external anchor',
    limitations: [
      'X/Y/Z-style scores are declarations supplied by the caller; this engine does not independently verify them.',
      'Weights, delays and scenario parameters are hypotheses unless empirically calibrated.',
      'Activation is a relative model magnitude in [-1, 1], not a probability or physical measurement.',
      'A syntactically valid DOI/URL and TQAF level do not prove source truth, peer review, authorship or accessibility.',
      'The digest detects input changes but is not a digital signature, trusted timestamp or external immutable anchor.',
      'This is a classical discrete-time model; quantum terminology in prototype materials does not imply quantum computation.',
    ],
  };
}
