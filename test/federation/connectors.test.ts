import { describe, expect, it } from 'vitest';
import {
  FederationRegistry,
  federationSecret,
  normalizeInboundPayload,
  signPayload,
  verifyPayloadSignature,
  type FederationPersistence,
} from '../../src/federation/connectors';

type FederationFile = Parameters<FederationPersistence['save']>[0];

function memoryPersistence(): FederationPersistence {
  let saved: FederationFile = { connectors: [], inbox: [] };
  return {
    load: () => saved,
    save: (file) => {
      saved = file;
    },
  };
}

const SECRET = 'federation-secret-with-at-least-32-characters';

describe('native federation connectors', () => {
  it('registers, lists and removes connectors with validated targets', () => {
    const registry = new FederationRegistry(memoryPersistence());
    const connector = registry.createConnector({
      name: 'WhatsApp principal',
      kind: 'whatsapp',
      targetUrl: 'https://example.com/hooks/whatsapp',
    });
    expect(registry.listConnectors()).toHaveLength(1);
    expect(registry.getConnector(connector.id)?.kind).toBe('whatsapp');
    expect(() =>
      registry.createConnector({ name: 'bad', kind: 'webhook', targetUrl: 'http://example.com' })
    ).toThrow('CONNECTOR_URL_INVALID');
    expect(registry.removeConnector(connector.id)).toBe(true);
    expect(registry.listConnectors()).toHaveLength(0);
  });

  it('normalizes Evolution/WhatsApp and Cloud API payload shapes', () => {
    expect(
      normalizeInboundPayload({
        data: {
          messages: [
            {
              key: { remoteJid: '5215550000000@s.whatsapp.net', id: 'ABC123' },
              message: { conversation: 'Hola Isabella' },
            },
          ],
        },
      })
    ).toEqual({
      from: '5215550000000@s.whatsapp.net',
      text: 'Hola Isabella',
      remoteMessageId: 'ABC123',
    });

    expect(
      normalizeInboundPayload({
        entry: [
          {
            changes: [
              {
                value: {
                  metadata: { phone_number_id: 'phone-1' },
                  messages: [{ from: '5215550000001', id: 'wamid.1', text: { body: 'Hola' } }],
                },
              },
            ],
          },
        ],
      })
    ).toEqual({ from: '5215550000001', text: 'Hola', remoteMessageId: 'wamid.1' });
  });

  it('deduplicates remote messages per connector', () => {
    const registry = new FederationRegistry(memoryPersistence());
    const connector = registry.createConnector({ name: 'openwa', kind: 'openwa' });
    const payload = { key: { id: 'msg-1' }, conversation: 'uno' };
    registry.ingest(connector, payload);
    expect(registry.hasRemoteMessage(connector.id, 'msg-1')).toBe(true);
    expect(registry.hasRemoteMessage(connector.id, 'msg-2')).toBe(false);
    expect(registry.listInbox(10)).toHaveLength(1);
  });
});

describe('signed webhook verification', () => {
  it('accepts a fresh signature and rejects tampering, staleness and malformed input', () => {
    const body = JSON.stringify({ hello: 'mundo' });
    const fresh = String(Math.floor(Date.now() / 1000));
    const signature = signPayload(SECRET, fresh, body);

    expect(verifyPayloadSignature(SECRET, fresh, body, signature)).toBe(true);
    expect(verifyPayloadSignature(SECRET, fresh, body, `sha256=${signature}`)).toBe(true);
    expect(verifyPayloadSignature(SECRET, fresh, `${body} `, signature)).toBe(false);
    expect(verifyPayloadSignature(SECRET, fresh, body, '0'.repeat(64))).toBe(false);

    const stale = String(Math.floor(Date.now() / 1000) - 600);
    expect(verifyPayloadSignature(SECRET, stale, body, signPayload(SECRET, stale, body))).toBe(
      false
    );
    expect(verifyPayloadSignature(SECRET, 'not-a-timestamp', body, signature)).toBe(false);
  });

  it('requires a secret of at least 32 characters', () => {
    expect(federationSecret({ ISABELLA_FEDERATION_SECRET: 'short' })).toBeNull();
    expect(federationSecret({ ISABELLA_FEDERATION_SECRET: SECRET })).toBe(SECRET);
  });
});
