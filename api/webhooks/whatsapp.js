import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { getSupabase } from '../../server/supabase.js';
import { processIncomingText } from '../../server/whatsapp-assistant.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_BODY_BYTES = 1_000_000;

function getHeader(req, name) {
  const headers = req.headers;
  const value = typeof headers?.get === 'function'
    ? headers.get(name)
    : headers?.[name.toLowerCase()];
  return typeof value === 'string' ? value : null;
}

function equalStringsSafely(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

async function readRawBody(req) {
  if (typeof req[Symbol.asyncIterator] !== 'function') {
    throw new Error('Request stream is unavailable');
  }

  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > MAX_BODY_BYTES) {
      const error = new Error('Request body is too large');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks, totalBytes);
}

function parseUnixTimestamp(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return null;
  const date = new Date(seconds * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function getEventKey(parts) {
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex');
}

function getMessageContent(message) {
  const content = { ...message };
  delete content.id;
  delete content.from;
  delete content.timestamp;
  delete content.type;
  return Object.keys(content).length > 0 ? content : null;
}

function normalizeWebhookEvents(payload) {
  const records = [];
  const entries = Array.isArray(payload.entry) ? payload.entry : [];

  for (const entry of entries) {
    const changes = Array.isArray(entry.changes) ? entry.changes : [];
    for (let changeIndex = 0; changeIndex < changes.length; changeIndex += 1) {
      const change = changes[changeIndex];
      const value = change?.value || {};
      const metadata = value.metadata || {};
      const whatsappNumber = metadata.display_phone_number || null;
      const phoneNumberId = metadata.phone_number_id || null;
      const initialCount = records.length;

      for (const message of Array.isArray(value.messages) ? value.messages : []) {
        if (typeof message?.id !== 'string' || typeof message.type !== 'string') {
          throw new Error('Invalid WhatsApp message event');
        }
        records.push({
          event_key: getEventKey(['message', phoneNumberId, message.id]),
          event_type: 'message',
          message_id: message.id,
          sender_number: message.from || null,
          whatsapp_number: whatsappNumber,
          phone_number_id: phoneNumberId,
          message_type: message.type,
          content: getMessageContent(message),
          meta_timestamp: parseUnixTimestamp(message.timestamp),
          message_state: null,
          payload,
        });
      }

      for (const status of Array.isArray(value.statuses) ? value.statuses : []) {
        if (typeof status?.id !== 'string' || typeof status.status !== 'string') {
          throw new Error('Invalid WhatsApp message status event');
        }
        records.push({
          event_key: getEventKey([
            'status',
            phoneNumberId,
            status.id,
            status.status,
            String(status.timestamp || ''),
          ]),
          event_type: 'status',
          message_id: status.id,
          sender_number: status.recipient_id || null,
          whatsapp_number: whatsappNumber,
          phone_number_id: phoneNumberId,
          message_type: null,
          content: status.errors ? { errors: status.errors } : null,
          meta_timestamp: parseUnixTimestamp(status.timestamp),
          message_state: status.status,
          payload,
        });
      }

      if (records.length === initialCount) {
        const eventType = typeof change?.field === 'string' ? change.field : 'notification';
        records.push({
          event_key: getEventKey([
            'notification',
            entry.id || null,
            eventType,
            entry.time || null,
            changeIndex,
            value,
          ]),
          event_type: eventType,
          message_id: null,
          sender_number: null,
          whatsapp_number: whatsappNumber,
          phone_number_id: phoneNumberId,
          message_type: null,
          content: null,
          meta_timestamp: parseUnixTimestamp(entry.time),
          message_state: null,
          payload,
        });
      }
    }
  }

  if (records.length === 0) {
    records.push({
      event_key: getEventKey(['notification', payload]),
      event_type: 'notification',
      message_id: null,
      sender_number: null,
      whatsapp_number: null,
      phone_number_id: null,
      message_type: null,
      content: null,
      meta_timestamp: null,
      message_state: null,
      payload,
    });
  }

  return records;
}

function sendText(res, status, message) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).send(message);
}

function getQueryValue(req, key) {
  const value = req.query?.[key];
  return typeof value === 'string' ? value : null;
}

export function createWhatsAppWebhookHandler(options = {}) {
  const env = options.env || process.env;
  const getSupabaseClient = options.getSupabaseClient || (() => getSupabase({
    url: env.SUPABASEW_SUPABASE_URL || env.SUPABASE_URL || env.STORAGE_SUPABASE_URL,
    serviceRoleKey: env.SUPABASEW_SUPABASE_SERVICE_ROLE_KEY ||
      env.SUPABASE_SERVICE_ROLE_KEY ||
      env.STORAGE_SUPABASE_SERVICE_KEY,
  }));

  return async function whatsappWebhookHandler(req, res) {
    if (req.method === 'GET') {
      const verifyToken = env.WHATSAPP_VERIFY_TOKEN;
      if (!verifyToken) return sendText(res, 503, 'Webhook verification is not configured');

      const mode = getQueryValue(req, 'hub.mode');
      const token = getQueryValue(req, 'hub.verify_token');
      const challenge = getQueryValue(req, 'hub.challenge');
      if (mode === 'subscribe' && token && equalStringsSafely(token, verifyToken) && challenge !== null) {
        return sendText(res, 200, challenge);
      }
      return sendText(res, 403, 'Forbidden');
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return sendText(res, 405, 'Method Not Allowed');
    }

    const hasSupabaseUrl =
      env.SUPABASEW_SUPABASE_URL || env.SUPABASE_URL || env.STORAGE_SUPABASE_URL;
    const hasSupabaseServiceRoleKey =
      env.SUPABASEW_SUPABASE_SERVICE_ROLE_KEY ||
      env.SUPABASE_SERVICE_ROLE_KEY ||
      env.STORAGE_SUPABASE_SERVICE_KEY;
    if (!env.META_APP_SECRET || !hasSupabaseUrl || !hasSupabaseServiceRoleKey) {
      return sendText(res, 503, 'Webhook is not configured');
    }

    let rawBody;
    try {
      rawBody = await readRawBody(req);
    } catch (error) {
      const status = error.statusCode || 400;
      return sendText(res, status, status === 413 ? 'Payload Too Large' : 'Invalid request body');
    }

    const suppliedSignature = getHeader(req, 'x-hub-signature-256');
    if (!suppliedSignature || !/^sha256=[\da-f]{64}$/i.test(suppliedSignature)) {
      return sendText(res, 401, 'Invalid signature');
    }

    const expectedSignature = `sha256=${createHmac('sha256', env.META_APP_SECRET)
      .update(rawBody)
      .digest('hex')}`;
    if (!equalStringsSafely(suppliedSignature.toLowerCase(), expectedSignature)) {
      return sendText(res, 401, 'Invalid signature');
    }

    let payload;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return sendText(res, 400, 'Invalid webhook payload');
      }
    } catch {
      return sendText(res, 400, 'Invalid webhook payload');
    }

    let records;
    try {
      records = normalizeWebhookEvents(payload);
    } catch {
      return sendText(res, 400, 'Invalid webhook event');
    }

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('whatsapp_webhook_events')
        .upsert(records, { onConflict: 'event_key', ignoreDuplicates: true });
      if (error) throw error;

      for (const record of records) {
        if (record.event_type === 'status' && record.message_id && record.message_state) {
          await supabase
            .from('whatsapp_messages')
            .update({ delivery_state: record.message_state, updated_at: new Date().toISOString() })
            .eq('meta_message_id', record.message_id);
        }
      }
    } catch (error) {
      console.error('WhatsApp webhook persistence failed', {
        code: error?.code || 'unknown',
      });
      return sendText(res, 503, 'Event could not be stored');
    }

    for (const record of records) {
      if (record.event_type !== 'message' || record.message_type !== 'text') continue;
      try {
        await processIncomingText({
          env,
          getSupabaseClient,
          message: {
            id: record.message_id,
            from: record.sender_number,
            timestamp: record.meta_timestamp
              ? String(Math.floor(new Date(record.meta_timestamp).getTime() / 1000))
              : null,
            type: 'text',
            text: record.content?.text,
          },
        });
      } catch (error) {
        console.error('WhatsApp assistant processing failed', {
          code: error?.code || 'unknown',
        });
        return sendText(res, 503, 'Event could not be processed');
      }
    }

    return sendText(res, 200, 'EVENT_RECEIVED');
  };
}

export default createWhatsAppWebhookHandler();
