import { describe, expect, it } from 'vitest';
import {
  getTamvKnowledgeStackModule,
  listTamvKnowledgeStackModules,
  validateTamvKnowledgeStackRegistry,
} from '../../src/atlas/ecosystem-registry';

describe('TAMV knowledge stack registry', () => {
  it('declares Atlas, Hyper Core, LITLE and the external Little Trust Fabric reference', () => {
    expect(listTamvKnowledgeStackModules().map((module) => module.id)).toEqual([
      'atlas',
      'hypercore',
      'litle',
      'little-trust-fabric',
    ]);
  });

  it('keeps external execution authority disabled and governance mandatory', () => {
    for (const module of listTamvKnowledgeStackModules()) {
      expect(module.mayExecuteExternalActions).toBe(false);
      expect(module.requiresGovernanceGate).toBe(true);
    }
    expect(validateTamvKnowledgeStackRegistry()).toEqual([]);
  });

  it('marks external Little Trust Fabric as reference-only rather than importing its code', () => {
    const module = getTamvKnowledgeStackModule('little-trust-fabric');
    expect(module.status).toBe('reference-only');
    expect(module.sourcePaths[0]).toContain('litle-trust-fabric-58c96208');
  });

  it('keeps LITLE experimental until evidence supports a stronger status', () => {
    expect(getTamvKnowledgeStackModule('litle').status).toBe('experimental');
  });

  it('fails closed for unknown module IDs', () => {
    expect(() => getTamvKnowledgeStackModule('unknown' as never)).toThrow(
      'TAMV_STACK_MODULE_UNKNOWN:unknown',
    );
  });
});
