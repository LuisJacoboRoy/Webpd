import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { Readable } from 'node:stream';
import test from 'node:test';
import { createWhatsAppWebhookHandler } from './whatsapp.js';

const appSecret = 'test-meta-app-secret';
const env = {
  WHATSAPP_VERIFY_TOKEN: 'test-verify-token',
  META_APP_SECRET: appSecret,
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
};

function createResponse() {
  return {
    headers: {},
    statusCode: null,
    body: null,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };
}

function createGetRequest(token) {
  return {
    method: 'GET',
    query: {
      'hub.mode': 'subscribe',
      'hub.verify_token': token,
      'hub.challenge': 'challenge-value',
    },
    headers: {},
  };
}

function createPostRequest(payload, signatureOverride) {
  const rawBody = Buffer.from(JSON.stringify(payload));
  const signature = signatureOverride ||
    `sha256=${createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
  const request = Readable.from([rawBody]);
  request.method = 'POST';
  request.headers = { 'x-hub-signature-256': signature };
  return request;
}

function createHarness({ persistError, env: handlerEnv = env } = {}) {
  const records = new Map();
  const calls = [];
  const handler = createWhatsAppWebhookHandler({
    env: handlerEnv,
    getSupabaseClient() {
      return {
        from(table) {
          assert.equal(table, 'whatsapp_webhook_events');
          return {
            async upsert(rows, options) {
              calls.push({ rows, options });
              if (persistError) return { error: persistError };
              for (const row of rows) records.set(row.event_key, row);
              return { error: null };
            },
          };
        },
      };
    },
  });
  return { handler, records, calls };
}

function messagePayload(changeValue) {
  return {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'business-account-id',
      changes: [{
        field: 'messages',
        value: {
          metadata: {
            display_phone_number: '15550001111',
            phone_number_id: 'phone-number-id',
          },
          ...changeValue,
        },
      }],
    }],
  };
}

test('GET verifies a valid Meta token and returns the challenge as plain text', async () => {
  const { handler } = createHarness();
  const res = createResponse();

  await handler(createGetRequest(env.WHATSAPP_VERIFY_TOKEN), res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body, 'challenge-value');
  assert.equal(res.headers['content-type'], 'text/plain; charset=utf-8');
});

test('GET rejects an invalid verification token', async () => {
  const { handler } = createHarness();
  const res = createResponse();

  await handler(createGetRequest('wrong-token'), res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body, 'Forbidden');
});

test('POST verifies the raw-body signature and stores an incoming text message', async () => {
  const { handler, records } = createHarness();
  const res = createResponse();
  const payload = messagePayload({
    messages: [{
      id: 'wamid.text-1',
      from: '15551234567',
      timestamp: '1760000000',
      type: 'text',
      text: { body: 'Hola' },
    }],
  });

  await handler(createPostRequest(payload), res);

  const [record] = records.values();
  assert.equal(res.statusCode, 200);
  assert.equal(records.size, 1);
  assert.equal(record.event_type, 'message');
  assert.equal(record.message_id, 'wamid.text-1');
  assert.equal(record.sender_number, '15551234567');
  assert.equal(record.whatsapp_number, '15550001111');
  assert.equal(record.phone_number_id, 'phone-number-id');
  assert.equal(record.message_type, 'text');
  assert.deepEqual(record.content, { text: { body: 'Hola' } });
  assert.equal(record.meta_timestamp, new Date(1760000000 * 1000).toISOString());
  assert.deepEqual(record.payload, payload);
});

test('POST stores multimedia message content', async () => {
  const { handler, records } = createHarness();
  const res = createResponse();
  const payload = messagePayload({
    messages: [{
      id: 'wamid.image-1',
      from: '15551234567',
      timestamp: '1760000001',
      type: 'image',
      image: { id: 'media-id', mime_type: 'image/jpeg', caption: 'Foto' },
    }],
  });

  await handler(createPostRequest(payload), res);

  assert.equal(res.statusCode, 200);
  assert.equal([...records.values()][0].message_type, 'image');
  assert.deepEqual([...records.values()][0].content.image, {
    id: 'media-id',
    mime_type: 'image/jpeg',
    caption: 'Foto',
  });
});

test('POST rejects an invalid signature without attempting persistence', async () => {
  const { handler, calls } = createHarness();
  const res = createResponse();

  await handler(createPostRequest(messagePayload({ messages: [] }), `sha256=${'0'.repeat(64)}`), res);

  assert.equal(res.statusCode, 401);
  assert.equal(calls.length, 0);
});

test('POST stores sent, delivered, read, and failed message statuses', async () => {
  const { handler, records } = createHarness();
  const res = createResponse();
  const payload = messagePayload({
    statuses: ['sent', 'delivered', 'read', 'failed'].map((status, index) => ({
      id: 'wamid.outbound-1',
      status,
      timestamp: String(1760000002 + index),
      recipient_id: '15551234567',
    })),
  });

  await handler(createPostRequest(payload), res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(
    [...records.values()].map(row => row.message_state),
    ['sent', 'delivered', 'read', 'failed']
  );
  assert([...records.values()].every(row => row.message_id === 'wamid.outbound-1'));
});

test('POST treats a repeated message ID as an idempotent event', async () => {
  const { handler, records, calls } = createHarness();
  const payload = messagePayload({
    messages: [{
      id: 'wamid.duplicate-1',
      from: '15551234567',
      timestamp: '1760000003',
      type: 'text',
      text: { body: 'Hola' },
    }],
  });

  const firstResponse = createResponse();
  await handler(createPostRequest(payload), firstResponse);
  const secondResponse = createResponse();
  await handler(createPostRequest(payload), secondResponse);

  assert.equal(firstResponse.statusCode, 200);
  assert.equal(secondResponse.statusCode, 200);
  assert.equal(records.size, 1);
  assert.equal(calls[1].options.ignoreDuplicates, true);
});

test('POST accepts the SUPABASEW-prefixed Vercel environment variables', async () => {
  const { handler } = createHarness({
    env: {
      WHATSAPP_VERIFY_TOKEN: env.WHATSAPP_VERIFY_TOKEN,
      META_APP_SECRET: env.META_APP_SECRET,
      SUPABASEW_SUPABASE_URL: 'https://example.supabase.co',
      SUPABASEW_SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    },
  });
  const res = createResponse();
  const payload = messagePayload({
    messages: [{
      id: 'wamid.prefixed-env',
      from: '15551234567',
      timestamp: '1760000006',
      type: 'text',
      text: { body: 'Hola' },
    }],
  });

  await handler(createPostRequest(payload), res);

  assert.equal(res.statusCode, 200);
});

test('POST reports persistence failures instead of acknowledging the event', async () => {
  const { handler } = createHarness({ persistError: { code: 'DB_ERROR' } });
  const res = createResponse();
  const payload = messagePayload({
    messages: [{
      id: 'wamid.persistence-error',
      from: '15551234567',
      timestamp: '1760000004',
      type: 'text',
      text: { body: 'Hola' },
    }],
  });

  await handler(createPostRequest(payload), res);

  assert.equal(res.statusCode, 503);
  assert.equal(res.body, 'Event could not be stored');
});

test('the function handler returns a successful Vercel-compatible POST response', async () => {
  const { handler } = createHarness();
  const res = createResponse();
  const payload = messagePayload({
    statuses: [{
      id: 'wamid.vercel-response',
      status: 'read',
      timestamp: '1760000005',
      recipient_id: '15551234567',
    }],
  });

  await handler(createPostRequest(payload), res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body, 'EVENT_RECEIVED');
  assert.equal(res.headers['cache-control'], 'no-store');
});
