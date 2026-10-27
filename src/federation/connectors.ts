/**
 * Native connector registry and signed-webhook inbox.
 *
 * Inspired by the CONCEPTS of OpenWA/Evolution API (signed webhook ingress) and
 * the repository's own security/persistence conventions. Implemented from
 * scratch; no third-party source code is copied.
 */
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const CONNECTOR_KINDS = ['whatsapp', 'openwa', 'evolution', 'webhook'] as const;
export type ConnectorKind = (typeof CONNECTOR_KINDS)[number];

export interface ConnectorRecord {
  readonly id: string;
  readonly name: string;
  readonly kind: ConnectorKind;
  readonly targetUrl: string | null;
  readonly createdAt: string;
  readonly status: 'registered';
}

export interface InboxEntry {
  readonly id: string;
  readonly connectorId: string;
  readonly receivedAt: string;
  readonly kind: ConnectorKind;
  readonly from: string;
  readonly text: string;
  readonly remoteMessageId: string | null;
}

interface FederationFile {
  connectors: ConnectorRecord[];
  inbox: InboxEntry[];
}

export interface FederationPersistence {
  load(): FederationFile;
  save(file: FederationFile): void;
}

export class FileFederationPersistence implements FederationPersistence {
  constructor(private readonly filePath: string) {}

  load(): FederationFile {
    if (!fs.existsSync(this.filePath)) return { connectors: [], inbox: [] };
    const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf8')) as Partial<FederationFile>;
    const connectors = Array.isArray(parsed.connectors)
      ? parsed.connectors.filter((entry): entry is ConnectorRecord => validConnector(entry))
      : [];
    const inbox = Array.isArray(parsed.inbox)
      ? parsed.inbox.filter((entry): entry is InboxEntry => validInbox(entry))
      : [];
    return { connectors, inbox };
  }

  save(file: FederationFile): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const temporary = `${this.filePath}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(file, null, 2), { mode: 0o600 });
    fs.renameSync(temporary, this.filePath);
  }
}

const MAX_INBOX = 200;
const NAME_MAX = 80;

function validConnector(value: unknown): value is ConnectorRecord {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.kind === 'string' &&
    (CONNECTOR_KINDS as readonly string[]).includes(entry.kind) &&
    (entry.targetUrl === null || typeof entry.targetUrl === 'string') &&
    typeof entry.createdAt === 'string' &&
    entry.status === 'registered'
  );
}

function validInbox(value: unknown): value is InboxEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.connectorId === 'string' &&
    typeof entry.receivedAt === 'string' &&
    typeof entry.kind === 'string' &&
    typeof entry.from === 'string' &&
    typeof entry.text === 'string' &&
    (entry.remoteMessageId === null || typeof entry.remoteMessageId === 'string')
  );
}

function safeTarget(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    const loopback = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    if (url.protocol === 'http:' && !loopback) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export class FederationRegistry {
  private state: FederationFile;
  constructor(private readonly persistence: FederationPersistence | null = null) {
    this.state = persistence?.load() ?? { connectors: [], inbox: [] };
  }

  private persist(): void {
    this.persistence?.save(this.state);
  }

  listConnectors(): ConnectorRecord[] {
    return [...this.state.connectors];
  }

  getConnector(id: string): ConnectorRecord | null {
    return this.state.connectors.find((connector) => connector.id === id) ?? null;
  }

  createConnector(input: {
    name: string;
    kind: ConnectorKind;
    targetUrl?: string | null;
  }): ConnectorRecord {
    const name = input.name.trim().slice(0, NAME_MAX);
    if (!name) throw new Error('CONNECTOR_NAME_REQUIRED');
    if (!CONNECTOR_KINDS.includes(input.kind)) throw new Error('CONNECTOR_KIND_INVALID');
    const targetUrl = safeTarget(input.targetUrl);
    if (input.targetUrl && !targetUrl) throw new Error('CONNECTOR_URL_INVALID');
    const connector: ConnectorRecord = {
      id: randomUUID(),
      name,
      kind: input.kind,
      targetUrl,
      createdAt: new Date().toISOString(),
      status: 'registered',
    };
    this.state.connectors.push(connector);
    this.persist();
    return connector;
  }

  removeConnector(id: string): boolean {
    const before = this.state.connectors.length;
    this.state.connectors = this.state.connectors.filter((connector) => connector.id !== id);
    if (this.state.connectors.length === before) return false;
    this.persist();
    return true;
  }

  listInbox(limit = 50): InboxEntry[] {
    return this.state.inbox.slice(0, Math.min(MAX_INBOX, Math.max(1, limit)));
  }

  /** True when the same remote message was already stored for this connector. */
  hasRemoteMessage(connectorId: string, remoteMessageId: string): boolean {
    return this.state.inbox.some(
      (entry) => entry.connectorId === connectorId && entry.remoteMessageId === remoteMessageId
    );
  }

  ingest(connector: ConnectorRecord, payload: unknown): InboxEntry {
    const normalized = normalizeInboundPayload(payload);
    const entry: InboxEntry = {
      id: randomUUID(),
      connectorId: connector.id,
      receivedAt: new Date().toISOString(),
      kind: connector.kind,
      from: normalized.from,
      text: normalized.text.slice(0, 4_000),
      remoteMessageId: normalized.remoteMessageId,
    };
    this.state.inbox.unshift(entry);
    if (this.state.inbox.length > MAX_INBOX) this.state.inbox.length = MAX_INBOX;
    this.persist();
    return entry;
  }
}

function firstString(...values: unknown[]): string {
  for (const value of values) if (typeof value === 'string' && value.trim()) return value.trim();
  return '';
}

/**
 * Normalizes the common WhatsApp/Evolution/OpenWA payload shapes without
 * trusting them: the result is display text only and never becomes a system
 * instruction or an authorization signal.
 */
export function normalizeInboundPayload(payload: unknown): {
  from: string;
  text: string;
  remoteMessageId: string | null;
} {
  const root = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const data =
    root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : {};
  const entry = Array.isArray(root.entry) ? root.entry[0] : undefined;
  const change =
    entry && typeof entry === 'object' && Array.isArray((entry as Record<string, unknown>).changes)
      ? ((entry as Record<string, unknown>).changes as unknown[])[0]
      : undefined;
  const changeValue =
    change && typeof change === 'object'
      ? ((change as Record<string, unknown>).value as Record<string, unknown> | undefined)
      : undefined;
  const message =
    (Array.isArray(data.messages) ? data.messages[0] : undefined) ??
    (Array.isArray(root.messages) ? root.messages[0] : undefined) ??
    (Array.isArray(changeValue?.messages) ? changeValue?.messages[0] : undefined) ??
    (Array.isArray(root.message) ? root.message[0] : undefined) ??
    (root.key || root.conversation || root.extendedTextMessage ? root : undefined);
  const envelope =
    message && typeof message === 'object' ? (message as Record<string, unknown>) : {};
  // Evolution/OpenWA wrap the real message under `message`; Baileys-style and
  // Cloud API payloads keep the content at the top level.
  const msg =
    envelope.message && typeof envelope.message === 'object'
      ? (envelope.message as Record<string, unknown>)
      : envelope;
  const key =
    (envelope.key && typeof envelope.key === 'object'
      ? (envelope.key as Record<string, unknown>)
      : undefined) ??
    (msg.key && typeof msg.key === 'object' ? (msg.key as Record<string, unknown>) : {});
  const textNode =
    msg.text && typeof msg.text === 'object' ? (msg.text as Record<string, unknown>) : {};
  const extended =
    msg.extendedTextMessage && typeof msg.extendedTextMessage === 'object'
      ? (msg.extendedTextMessage as Record<string, unknown>)
      : {};
  const text = firstString(
    msg.conversation,
    extended.text,
    textNode.body,
    msg.text,
    msg.body,
    envelope.text !== msg.text ? envelope.text : undefined,
    root.text,
    root.body
  );
  return {
    from: firstString(
      key.remoteJid,
      envelope.from,
      msg.from,
      envelope.sender,
      msg.sender,
      root.from,
      changeValue?.metadata && (changeValue.metadata as Record<string, unknown>).phone_number_id
    ),
    text: text || '(mensaje sin texto)',
    remoteMessageId: firstString(key.id, envelope.id, msg.id, root.messageId) || null,
  };
}

export function federationSecret(env: Readonly<Record<string, string | undefined>>): string | null {
  const secret = env.ISABELLA_FEDERATION_SECRET?.trim() ?? '';
  return secret.length >= 32 ? secret : null;
}

export function signPayload(secret: string, timestamp: string, body: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`, 'utf8').digest('hex');
}

export function verifyPayloadSignature(
  secret: string,
  timestamp: string,
  body: string,
  signature: string
): boolean {
  if (!/^\d{10,13}$/.test(timestamp)) return false;
  const issuedAt = Number(timestamp) < 1e12 ? Number(timestamp) * 1000 : Number(timestamp);
  if (Math.abs(Date.now() - issuedAt) > 5 * 60_000) return false;
  const expected = Buffer.from(signPayload(secret, timestamp, body), 'hex');
  const received = /^sha256=/i.test(signature) ? signature.slice(7) : signature;
  if (!/^[a-f0-9]{64}$/i.test(received)) return false;
  const candidate = Buffer.from(received, 'hex');
  return candidate.length === expected.length && timingSafeEqual(expected, candidate);
}

export function createDefaultFederationRegistry(
  env: Readonly<Record<string, string | undefined>> = process.env
): FederationRegistry {
  const mode = (env.ISABELLA_FEDERATION_STORE ?? '').trim().toLowerCase();
  if (mode === 'memory' || (!mode && env.VERCEL)) return new FederationRegistry();
  const filePath = (env.ISABELLA_FEDERATION_STORE_PATH ?? '.data/federation.json').trim();
  try {
    return new FederationRegistry(
      new FileFederationPersistence(path.resolve(process.cwd(), filePath))
    );
  } catch (error) {
    console.warn('[Isabella] Federation persistence unavailable; using memory', {
      message: error instanceof Error ? error.message.slice(0, 180) : 'ERROR',
    });
    return new FederationRegistry();
  }
}
