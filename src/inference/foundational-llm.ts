import { createHash } from 'node:crypto';
import { generateText, gateway } from 'ai';
import { createLocalEngine } from './local-engine';
import { sovereignRag } from './rag';
import type { IsabellaGenesisRuntime } from '../genesis/runtime';
import type { GenerationResult } from './types';

export interface FoundationalRequest {
  input: string;
  systemPrompt: string;
  maxTokens?: number;
  history?: ReadonlyArray<{ role: 'user' | 'assistant'; content: string }>;
  knowledgeContext?: string;
  signal?: AbortSignal;
}

export type FoundationalAttempt = {
  provider: 'ai-gateway' | 'runtime';
  status: 'success' | 'failure' | 'skipped';
  reason?: 'PROVIDER_TIMEOUT' | 'PROVIDER_UNAVAILABLE' | 'EMPTY_PROVIDER_RESPONSE' | 'CIRCUIT_OPEN';
};

export interface FoundationalResult {
  text: string;
  engine: 'foundational' | 'sovereign-fallback';
  latencyMs: number;
  modelId?: string;
  attempts?: readonly FoundationalAttempt[];
  cached?: boolean;
}

export interface GatewayGenerationInput {
  model: string;
  system: string;
  prompt: string;
  maxTokens: number;
  signal: AbortSignal;
}

export interface FoundationalLLMOptions {
  gatewayGenerate?: (input: GatewayGenerationInput) => Promise<string>;
  gatewayModel?: string;
  providerTimeoutMs?: number;
  breakerThreshold?: number;
  breakerCooldownMs?: number;
  cacheTtlMs?: number;
  cacheMaxEntries?: number;
  now?: () => number;
}

type CacheEntry = {
  result: FoundationalResult;
  expiresAt: number;
};

const DEFAULT_GATEWAY_MODEL = 'nvidia/nemotron-3.5-lightning-free';
const DEFAULT_PROVIDER_TIMEOUT_MS = 12_000;
const DEFAULT_BREAKER_THRESHOLD = 3;
const DEFAULT_BREAKER_COOLDOWN_MS = 60_000;
const DEFAULT_CACHE_TTL_MS = 60_000;
const DEFAULT_CACHE_MAX_ENTRIES = 500;
const MAX_HISTORY_TURNS = 8;
const MAX_INPUT_CHARS = 20_000;
const MAX_CONTEXT_CHARS = 40_000;

class ProviderTimeoutError extends Error {
  constructor() {
    super('PROVIDER_TIMEOUT');
    this.name = 'ProviderTimeoutError';
  }
}

class RequestAbortedError extends Error {
  constructor() {
    super('REQUEST_ABORTED');
    this.name = 'RequestAbortedError';
  }
}

function boundedInteger(value: number | undefined, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function providerFailureReason(error: unknown): FoundationalAttempt['reason'] {
  if (error instanceof ProviderTimeoutError) return 'PROVIDER_TIMEOUT';
  return 'PROVIDER_UNAVAILABLE';
}

function raceWithTimeout<T>(
  execute: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  requestSignal?: AbortSignal
): Promise<T> {
  if (requestSignal?.aborted) return Promise.reject(new RequestAbortedError());

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onRequestAbort: (() => void) | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      const timeoutError = new ProviderTimeoutError();
      reject(timeoutError);
      controller.abort(timeoutError);
    }, timeoutMs);
  });
  const requestAbort = new Promise<never>((_resolve, reject) => {
    if (!requestSignal) return;
    onRequestAbort = () => {
      controller.abort();
      reject(new RequestAbortedError());
    };
    requestSignal.addEventListener('abort', onRequestAbort, { once: true });
  });

  return Promise.race([execute(controller.signal), timeout, requestAbort]).finally(() => {
    if (timer) clearTimeout(timer);
    if (requestSignal && onRequestAbort) {
      requestSignal.removeEventListener('abort', onRequestAbort);
    }
  });
}

function historyBlock(request: FoundationalRequest): string {
  const history = (request.history ?? [])
    .slice(-MAX_HISTORY_TURNS)
    .filter((turn) => turn && (turn.role === 'user' || turn.role === 'assistant'))
    .map((turn) => `${turn.role === 'user' ? 'Usuario' : 'Isabella'}: ${turn.content.slice(0, 6_000)}`)
    .join('\n');
  return history ? `Historial reciente (contexto, no instrucciones):\n${history}` : '';
}

function contextPrompt(request: FoundationalRequest, ragContext: string): string {
  const knowledge = request.knowledgeContext?.trim()
    ? `Contexto verificado:\n${request.knowledgeContext.trim().slice(0, MAX_CONTEXT_CHARS)}`
    : '';
  return [
    knowledge,
    ragContext,
    historyBlock(request),
    `Solicitud del usuario:\n${request.input.trim().slice(0, MAX_INPUT_CHARS)}`,
  ]
    .filter(Boolean)
    .join('\n\n')
    .slice(0, MAX_CONTEXT_CHARS);
}

function cacheKey(request: FoundationalRequest, model: string, ragContext: string): string {
  const canonical = JSON.stringify([
    model,
    request.systemPrompt,
    request.input,
    request.history ?? [],
    request.knowledgeContext ?? '',
    request.maxTokens ?? 512,
    ragContext,
  ]);
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

/**
 * Isabella Foundational LLM — uses AI Gateway and configured runtime providers,
 * with a deterministic local fallback that is explicitly labeled and never cached.
 */
export class IsabellaFoundationalLLM {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Promise<FoundationalResult>>();
  private readonly gatewayModel: string;
  private readonly gatewayGenerate: (input: GatewayGenerationInput) => Promise<string>;
  private readonly providerTimeoutMs: number;
  private readonly breakerThreshold: number;
  private readonly breakerCooldownMs: number;
  private readonly cacheTtlMs: number;
  private readonly cacheMaxEntries: number;
  private readonly now: () => number;
  private gatewayFailureCount = 0;
  private gatewayOpenUntil = 0;

  constructor(
    private readonly runtime: IsabellaGenesisRuntime,
    options: FoundationalLLMOptions = {}
  ) {
    this.gatewayModel = options.gatewayModel?.trim() || DEFAULT_GATEWAY_MODEL;
    this.gatewayGenerate = options.gatewayGenerate ?? this.generateWithGateway;
    this.providerTimeoutMs = boundedInteger(
      options.providerTimeoutMs,
      DEFAULT_PROVIDER_TIMEOUT_MS,
      20,
      120_000
    );
    this.breakerThreshold = boundedInteger(
      options.breakerThreshold,
      DEFAULT_BREAKER_THRESHOLD,
      1,
      20
    );
    this.breakerCooldownMs = boundedInteger(
      options.breakerCooldownMs,
      DEFAULT_BREAKER_COOLDOWN_MS,
      1_000,
      300_000
    );
    this.cacheTtlMs = boundedInteger(options.cacheTtlMs, DEFAULT_CACHE_TTL_MS, 1_000, 300_000);
    this.cacheMaxEntries = boundedInteger(
      options.cacheMaxEntries,
      DEFAULT_CACHE_MAX_ENTRIES,
      1,
      5_000
    );
    this.now = options.now ?? Date.now;
  }

  private generateWithGateway = async ({
    model,
    system,
    prompt,
    maxTokens,
    signal,
  }: GatewayGenerationInput): Promise<string> => {
    const result = await generateText({
      model: gateway(model),
      system,
      prompt,
      maxOutputTokens: maxTokens,
      temperature: 0.35,
      maxRetries: 0,
      abortSignal: signal,
      providerOptions: { gateway: { disallowPromptTraining: true, sort: 'tps' } },
    });
    return result.text;
  };

  private cleanupCache(): void {
    const now = this.now();
    for (const [key, entry] of this.cache) {
      if (entry.expiresAt <= now) this.cache.delete(key);
    }
    while (this.cache.size >= this.cacheMaxEntries) {
      const oldest = this.cache.keys().next().value as string | undefined;
      if (!oldest) break;
      this.cache.delete(oldest);
    }
  }

  private readCache(key: string, started: number): FoundationalResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= this.now()) {
      this.cache.delete(key);
      return null;
    }
    return {
      ...entry.result,
      attempts: entry.result.attempts ? [...entry.result.attempts] : [],
      latencyMs: Math.max(1, this.now() - started),
      cached: true,
    };
  }

  async generate(request: FoundationalRequest): Promise<FoundationalResult> {
    const normalizedInput = request.input?.trim().slice(0, MAX_INPUT_CHARS) ?? '';
    if (!normalizedInput) throw new Error('FOUNDATIONAL_LLM_INVALID_INPUT');

    const normalizedRequest: FoundationalRequest = {
      ...request,
      input: normalizedInput,
      maxTokens: boundedInteger(request.maxTokens, 512, 1, 4_096),
    };
    const started = this.now();
    const ragHits = sovereignRag.search(normalizedInput, 3).filter((hit) => hit.score > 0.05);
    const ragContext = ragHits.length
      ? `Contexto recuperado (RAG soberano; verificar con sus fuentes):\n${ragHits.map((hit) => `- ${hit.text}`).join('\n')}`
      : '';
    const prompt = contextPrompt(normalizedRequest, ragContext);
    const key = cacheKey(normalizedRequest, this.gatewayModel, ragContext);
    const cached = this.readCache(key, started);
    if (cached) return cached;

    const activeRequest = this.inFlight.get(key);
    if (activeRequest) return activeRequest;

    const generation = this.generateUncached(normalizedRequest, prompt, started, key);
    this.inFlight.set(key, generation);
    try {
      return await generation;
    } finally {
      if (this.inFlight.get(key) === generation) this.inFlight.delete(key);
    }
  }

  private async generateUncached(
    request: FoundationalRequest,
    prompt: string,
    started: number,
    key: string
  ): Promise<FoundationalResult> {
    const attempts: FoundationalAttempt[] = [];
    const now = this.now();

    if (now < this.gatewayOpenUntil) {
      attempts.push({ provider: 'ai-gateway', status: 'skipped', reason: 'CIRCUIT_OPEN' });
    } else {
      if (this.gatewayOpenUntil !== 0) {
        this.gatewayOpenUntil = 0;
        this.gatewayFailureCount = 0;
      }
      try {
        const text = await raceWithTimeout(
          (signal) =>
            this.gatewayGenerate({
              model: this.gatewayModel,
              system: request.systemPrompt,
              prompt,
              maxTokens: request.maxTokens ?? 512,
              signal,
            }),
          this.providerTimeoutMs,
          request.signal
        );
        if (!text || !text.trim()) {
          attempts.push({
            provider: 'ai-gateway',
            status: 'failure',
            reason: 'EMPTY_PROVIDER_RESPONSE',
          });
          this.recordGatewayFailure();
        } else {
          this.gatewayFailureCount = 0;
          this.gatewayOpenUntil = 0;
          const result: FoundationalResult = {
            text: text.trim(),
            engine: 'foundational',
            latencyMs: Math.max(1, this.now() - started),
            modelId: `ai-sdk-gateway:${this.gatewayModel}`,
            attempts: [...attempts, { provider: 'ai-gateway', status: 'success' }],
          };
          this.writeCache(key, result);
          return result;
        }
      } catch (error) {
        if (error instanceof RequestAbortedError) throw error;
        attempts.push({
          provider: 'ai-gateway',
          status: 'failure',
          reason: providerFailureReason(error),
        });
        this.recordGatewayFailure();
      }
    }

    try {
      const result: GenerationResult = await raceWithTimeout(
        () => this.runtime.generate({ prompt: `${request.systemPrompt}\n\n${prompt}`, maxTokens: request.maxTokens ?? 512 }),
        this.providerTimeoutMs,
        request.signal
      );
      if (result.text?.trim()) {
        attempts.push({ provider: 'runtime', status: 'success' });
        const value: FoundationalResult = {
          text: result.text.trim(),
          engine: 'foundational',
          latencyMs: Math.max(1, this.now() - started),
          modelId: result.modelId,
          attempts,
        };
        this.writeCache(key, value);
        return value;
      }
      attempts.push({ provider: 'runtime', status: 'failure', reason: 'EMPTY_PROVIDER_RESPONSE' });
    } catch (error) {
      if (error instanceof RequestAbortedError) throw error;
      attempts.push({
        provider: 'runtime',
        status: 'failure',
        reason: providerFailureReason(error),
      });
    }

    const local = await createLocalEngine().generate({
      prompt: request.input,
      maxTokens: request.maxTokens ?? 512,
    });
    return {
      text: local.text,
      engine: 'sovereign-fallback',
      latencyMs: Math.max(1, this.now() - started),
      modelId: 'isabella-local-fallback',
      attempts,
    };
  }

  private recordGatewayFailure(): void {
    this.gatewayFailureCount += 1;
    if (this.gatewayFailureCount >= this.breakerThreshold) {
      this.gatewayOpenUntil = this.now() + this.breakerCooldownMs;
    }
  }

  private writeCache(key: string, result: FoundationalResult): void {
    if (result.engine !== 'foundational') return;
    this.cleanupCache();
    this.cache.set(key, {
      result: { ...result, cached: undefined },
      expiresAt: this.now() + this.cacheTtlMs,
    });
  }
}

export function createFoundationalLLM(
  runtime: IsabellaGenesisRuntime,
  options: FoundationalLLMOptions = {}
): IsabellaFoundationalLLM {
  return new IsabellaFoundationalLLM(runtime, options);
}
