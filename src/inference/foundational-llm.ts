import { createLocalEngine } from './local-engine';
import type { IsabellaGenesisRuntime } from '../genesis/runtime';
import type { GenerationResult } from './types';

export interface FoundationalRequest {
  input: string;
  systemPrompt: string;
  maxTokens?: number;
}

export interface FoundationalResult {
  text: string;
  engine: 'foundational' | 'sovereign-fallback';
  latencyMs: number;
  modelId?: string;
}

/**
 * Isabella Foundational LLM — orquesta proveedores reales (open source / free)
 * con memoria de contexto y fallback soberano garantizado.
 */
export class IsabellaFoundationalLLM {
  constructor(private readonly runtime: IsabellaGenesisRuntime) {}

  async generate(request: FoundationalRequest): Promise<FoundationalResult> {
    const started = Date.now();
    const maxTokens = request.maxTokens ?? 512;
    const prompt = `${request.systemPrompt}\n\nSolicitud del usuario:\n${request.input}`;

    // 1. Intentar proveedores reales registrados (Ollama, HF, Gratis, etc.)
    try {
      const result: GenerationResult = await this.runtime.generate({
        prompt,
        maxTokens,
      });
      if (result.text && result.text.trim().length > 0) {
        return {
          text: result.text.trim(),
          engine: 'foundational',
          latencyMs: Math.max(1, Date.now() - started),
          modelId: result.modelId,
        };
      }
    } catch {
      // Degradar al motor local soberano.
    }

    // 2. Fallback local determinista enriquecido (nunca se presenta como modelo externo).
    const local = await createLocalEngine().generate({ prompt: request.input, maxTokens });
    return {
      text: local.text,
      engine: 'sovereign-fallback',
      latencyMs: Math.max(1, Date.now() - started),
      modelId: 'isabella-local-fallback',
    };
  }
}

export function createFoundationalLLM(runtime: IsabellaGenesisRuntime): IsabellaFoundationalLLM {
  return new IsabellaFoundationalLLM(runtime);
}