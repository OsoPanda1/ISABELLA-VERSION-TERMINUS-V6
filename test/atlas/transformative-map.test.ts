import { describe, expect, it } from 'vitest';
import { simulateTransformativeMap, type TransformativeMapInput } from '../../src/atlas/transformative-map';

const base: TransformativeMapInput = {
  atoms: [
    { id: 'ia', name: 'Inteligencia artificial', domain: 1, impact: 80, risk: 45, evidence: 30 },
    { id: 'policy', name: 'Gobernanza de IA', domain: 5, impact: 70, risk: 60, evidence: 25 },
  ],
  hyperedges: [
    { id: 'h1', label: 'La gobernanza condiciona la adopción', sources: ['ia'], targets: [{ id: 'policy', effect: 1 }], weight: 0.6, lag: 1, sourceRef: 'https://example.org/evidence', evidenceLevel: 'N2' },
  ],
  shocks: [{ nodeId: 'ia', year: 2026, magnitude: 1 }],
  scenario: 'B',
  targetYear: 2027,
};

describe('TAMV Transformative Map HCU engine', () => {
  it('simulates the complete 2026–2050 horizon and labels outputs as relative activations', () => {
    const result = simulateTransformativeMap(base);
    expect(result.schema).toBe('tamv.transformative-map.v1');
    expect(result.timeline).toHaveLength(25);
    expect(result.timeline[0]?.year).toBe(2026);
    expect(result.timeline.at(-1)?.year).toBe(2050);
    expect(result.nodes.find((node) => node.id === 'ia')?.activation).toBeGreaterThan(0);
    expect(result.digest).toMatch(/^[a-f0-9]{128}$/);
    expect(result.digestScope).toContain('not signature');
    expect(result.limitations).toContain('Activation is a relative model magnitude in [-1, 1], not a probability or physical measurement.');
  });

  it('is deterministic and canonicalizes object-key order for the input digest', () => {
    const first = simulateTransformativeMap(base);
    const reordered: TransformativeMapInput = {
      ...base,
      atoms: base.atoms.map((atom) => ({ evidence: atom.evidence, risk: atom.risk, impact: atom.impact, domain: atom.domain, name: atom.name, id: atom.id })),
    };
    expect(simulateTransformativeMap(reordered).digest).toBe(first.digest);
    expect(simulateTransformativeMap(base).timeline).toEqual(first.timeline);
  });

  it('requires valid DOI/URL-shaped provenance and a declared TQAF level before counting an edge as traceable', () => {
    expect(simulateTransformativeMap(base).traceability).toEqual({
      edges: 1, sourcedEdges: 1, sourcedAndLevelledEdges: 1, ratio: 1,
    });
    const withoutLevel = { ...base, hyperedges: [{ ...base.hyperedges[0]!, evidenceLevel: undefined }] };
    expect(simulateTransformativeMap(withoutLevel).traceability.ratio).toBe(0);
  });

  it('quarantine stops outgoing propagation from a node while retaining its local shock', () => {
    const result = simulateTransformativeMap({ ...base, quarantine: ['ia'] });
    expect(result.nodes.find((node) => node.id === 'ia')?.quarantined).toBe(true);
    expect(result.nodes.find((node) => node.id === 'ia')?.activation).toBeGreaterThan(0);
    expect(result.nodes.find((node) => node.id === 'policy')?.activation).toBe(0);
  });

  it('produces repeatable 200-run sensitivity intervals using the fixed seed', () => {
    const input = { ...base, sensitivity: true };
    const first = simulateTransformativeMap(input);
    const second = simulateTransformativeMap(input);
    expect(first.sensitivity?.runs).toBe(200);
    expect(first.sensitivity?.seed).toBe(20261101);
    expect(first.sensitivity).toEqual(second.sensitivity);
    const interval = first.sensitivity?.intervals.policy;
    expect(interval).toBeDefined();
    expect(interval!.p10).toBeLessThanOrEqual(interval!.p50);
    expect(interval!.p50).toBeLessThanOrEqual(interval!.p90);
  });

  it('fails closed on invalid weights, unknown nodes, and unsupported year bounds', () => {
    expect(() => simulateTransformativeMap({ ...base, hyperedges: [{ ...base.hyperedges[0]!, weight: 0.01 }] })).toThrow('TAMV_HCU_INVALID:edge_weight:h1');
    expect(() => simulateTransformativeMap({ ...base, shocks: [{ nodeId: 'missing', year: 2026, magnitude: 1 }] })).toThrow('TAMV_HCU_INVALID:shock_node');
    expect(() => simulateTransformativeMap({ ...base, targetYear: 2051 })).toThrow('TAMV_HCU_INVALID:target_year_2026_2050');
  });
});
