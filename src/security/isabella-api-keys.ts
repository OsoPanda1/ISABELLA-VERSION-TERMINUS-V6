import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { envFlag } from '../lib/env-flags';

export const API_KEY_SCOPES = [
  'cognition:read',
  'cognition:write',
  'memory:write',
  'admin:keys',
] as const;
export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

export type IsabellaApiKeyRecord = {
  id: string;
  prefix: string;
  tenantId: string;
  name: string;
  scopes: readonly ApiKeyScope[];
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
};

type StoredKey = IsabellaApiKeyRecord & { digest: Buffer };

export type CreateApiKeyInput = {
  tenantId: string;
  name: string;
  scopes: readonly ApiKeyScope[];
  expiresAt?: string | null;
};

export type IssuedApiKey = { secret: string; record: IsabellaApiKeyRecord };
export type ApiKeyVerification =
  | { ok: true; record: IsabellaApiKeyRecord }
  | { ok: false; reason: 'invalid' | 'expired' | 'revoked' | 'scope' };

export interface ApiKeyPersistence {
  load(): StoredKey[];
  save(records: readonly StoredKey[]): void;
}

export interface ApiKeyStoreOptions {
  readonly persistence?: ApiKeyPersistence | null;
  readonly pepper?: string | null;
  readonly now?: () => number;
}

const PREFIX = 'isa_live_';
const TENANT_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,63}$/;
const NAME_MAX = 80;
const MAX_KEYS = 5_000;

const publicRecord = ({ digest: _digest, ...record }: StoredKey): IsabellaApiKeyRecord => record;
const validScope = (scope: string): scope is ApiKeyScope =>
  (API_KEY_SCOPES as readonly string[]).includes(scope);

function validIso(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function parseStored(entry: unknown): StoredKey | null {
  if (!entry || typeof entry !== 'object') return null;
  const value = entry as Record<string, unknown>;
  if (typeof value.id !== 'string' || typeof value.prefix !== 'string') return null;
  if (typeof value.tenantId !== 'string' || typeof value.name !== 'string') return null;
  if (!Array.isArray(value.scopes) || !value.scopes.every((s) => typeof s === 'string'))
    return null;
  if (!value.scopes.every(validScope)) return null;
  if (!validIso(value.createdAt)) return null;
  if (value.expiresAt !== null && !validIso(value.expiresAt)) return null;
  if (value.revokedAt !== null && !validIso(value.revokedAt)) return null;
  if (value.lastUsedAt !== null && !validIso(value.lastUsedAt)) return null;
  if (typeof value.digest !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(value.digest)) return null;
  return {
    id: value.id,
    prefix: value.prefix,
    tenantId: value.tenantId,
    name: value.name,
    scopes: value.scopes as ApiKeyScope[],
    createdAt: value.createdAt,
    expiresAt: value.expiresAt as string | null,
    revokedAt: value.revokedAt as string | null,
    lastUsedAt: value.lastUsedAt as string | null,
    digest: Buffer.from(value.digest, 'base64'),
  };
}

/** Atomic JSON persistence for local/operator deployments. Only digests are written. */
export class FileApiKeyPersistence implements ApiKeyPersistence {
  constructor(private readonly filePath: string) {}

  load(): StoredKey[] {
    if (!fs.existsSync(this.filePath)) return [];
    const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf8')) as unknown;
    if (!Array.isArray(parsed)) throw new Error('API_KEY_STORE_INVALID');
    const records: StoredKey[] = [];
    for (const entry of parsed) {
      const record = parseStored(entry);
      if (record) records.push(record);
    }
    return records;
  }

  save(records: readonly StoredKey[]): void {
    const directory = path.dirname(this.filePath);
    fs.mkdirSync(directory, { recursive: true });
    const temporary = `${this.filePath}.${process.pid}.tmp`;
    const payload = records.map((record) => ({
      ...publicRecord(record),
      digest: record.digest.toString('base64'),
    }));
    fs.writeFileSync(temporary, JSON.stringify(payload, null, 2), { mode: 0o600 });
    fs.renameSync(temporary, this.filePath);
  }
}

export class IsabellaApiKeyStore {
  private readonly keys = new Map<string, StoredKey>();
  private readonly persistence: ApiKeyPersistence | null;
  private readonly pepper: string | null;
  private readonly now: () => number;

  constructor(options: ApiKeyStoreOptions = {}) {
    this.persistence = options.persistence ?? null;
    this.pepper = options.pepper?.trim() || null;
    this.now = options.now ?? Date.now;
    for (const record of this.persistence?.load() ?? []) {
      if (this.keys.size >= MAX_KEYS) break;
      if (!this.keys.has(record.id)) this.keys.set(record.id, record);
    }
  }

  private digest(secret: string): Buffer {
    return this.pepper
      ? createHmac('sha256', this.pepper).update(secret, 'utf8').digest()
      : createHash('sha256').update(secret, 'utf8').digest();
  }

  private persist(): void {
    this.persistence?.save([...this.keys.values()]);
  }

  issue(input: CreateApiKeyInput): IssuedApiKey {
    const tenantId = input.tenantId.trim();
    const name = input.name.trim().slice(0, NAME_MAX);
    const scopes = [...new Set(input.scopes)];
    if (
      !TENANT_PATTERN.test(tenantId) ||
      !name ||
      scopes.length === 0 ||
      scopes.some((scope) => !validScope(scope))
    ) {
      throw new Error('API_KEY_INPUT_INVALID');
    }
    if (this.keys.size >= MAX_KEYS) throw new Error('API_KEY_STORE_FULL');
    const expiresAt = input.expiresAt ?? null;
    if (expiresAt !== null && (!validIso(expiresAt) || Date.parse(expiresAt) <= this.now())) {
      throw new Error('API_KEY_EXPIRY_INVALID');
    }
    const issuedValue = `${PREFIX}${randomBytes(32).toString('base64url')}`;
    const record: StoredKey = {
      id: randomUUID(),
      prefix: issuedValue.slice(0, 16),
      tenantId,
      name,
      scopes,
      createdAt: new Date(this.now()).toISOString(),
      expiresAt,
      revokedAt: null,
      lastUsedAt: null,
      digest: this.digest(issuedValue),
    };
    this.keys.set(record.id, record);
    this.persist();
    return { secret: issuedValue, record: publicRecord(record) };
  }

  list(tenantId?: string): IsabellaApiKeyRecord[] {
    return [...this.keys.values()]
      .filter((record) => !tenantId || record.tenantId === tenantId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(publicRecord);
  }

  get(id: string): IsabellaApiKeyRecord | null {
    const record = this.keys.get(id);
    return record ? publicRecord(record) : null;
  }

  rotate(id: string): IssuedApiKey | null {
    const record = this.keys.get(id);
    if (!record || record.revokedAt) return null;
    if (record.expiresAt && Date.parse(record.expiresAt) <= this.now()) return null;
    const issuedValue = `${PREFIX}${randomBytes(32).toString('base64url')}`;
    record.prefix = issuedValue.slice(0, 16);
    record.lastUsedAt = null;
    record.digest = this.digest(issuedValue);
    this.persist();
    return { secret: issuedValue, record: publicRecord(record) };
  }

  revoke(id: string): boolean {
    const record = this.keys.get(id);
    if (!record || record.revokedAt) return false;
    record.revokedAt = new Date(this.now()).toISOString();
    this.persist();
    return true;
  }

  verify(secret: string, requiredScope?: ApiKeyScope, tenantId?: string): ApiKeyVerification {
    if (!secret.startsWith(PREFIX) || secret.length < PREFIX.length + 20)
      return { ok: false, reason: 'invalid' };
    const digest = this.digest(secret);
    for (const record of this.keys.values()) {
      if (record.digest.length !== digest.length) continue;
      if (!timingSafeEqual(record.digest, digest)) continue;
      if (tenantId && record.tenantId !== tenantId) return { ok: false, reason: 'invalid' };
      if (record.revokedAt) return { ok: false, reason: 'revoked' };
      if (record.expiresAt && Date.parse(record.expiresAt) <= this.now())
        return { ok: false, reason: 'expired' };
      if (requiredScope && !record.scopes.includes(requiredScope))
        return { ok: false, reason: 'scope' };
      record.lastUsedAt = new Date(this.now()).toISOString();
      return { ok: true, record: publicRecord(record) };
    }
    return { ok: false, reason: 'invalid' };
  }
}

/**
 * Selects persistence from the environment. Serverless filesystems are
 * ephemeral, so they fail closed to memory unless an explicit durable store is
 * supplied. The file backend writes digests only and never the raw key.
 */
export function createDefaultApiKeyStore(
  env: Readonly<Record<string, string | undefined>> = process.env
): IsabellaApiKeyStore {
  const mode = (env.ISABELLA_API_KEY_STORE ?? '').trim().toLowerCase();
  const vercelEnvironment = (env.VERCEL_ENV ?? '').trim().toLowerCase();
  const isProductionServerless =
    (envFlag(env, 'VERCEL') || vercelEnvironment !== '') &&
    (vercelEnvironment === 'production' ||
      vercelEnvironment === 'preview' ||
      (env.NODE_ENV ?? '').trim().toLowerCase() === 'production');

  // No synchronous shared-database adapter is wired into this store yet.
  // Refuse to serve production with ephemeral credentials rather than silently
  // losing/replacing keys across cold starts or failed local-file persistence.
  if (isProductionServerless) {
    console.warn(
      '[Isabella] API key store is ephemeral on serverless; configure a durable adapter for production-grade key persistence.'
    );
    return new IsabellaApiKeyStore();
  }

  if (mode === 'memory' || (!mode && envFlag(env, 'VERCEL'))) return new IsabellaApiKeyStore();
  const filePath = (env.ISABELLA_API_KEY_STORE_PATH ?? '.data/api-keys.json').trim();
  try {
    return new IsabellaApiKeyStore({
      persistence: new FileApiKeyPersistence(path.resolve(process.cwd(), filePath)),
      pepper: env.ISABELLA_API_KEY_PEPPER ?? null,
    });
  } catch (error) {
    console.warn('[Isabella] API key persistence unavailable; using in-memory store', {
      message: error instanceof Error ? error.message.slice(0, 180) : 'ERROR',
    });
    return new IsabellaApiKeyStore();
  }
}
