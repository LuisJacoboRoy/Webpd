import assert from 'node:assert/strict';
import test from 'node:test';
import { getAssistantEnvironment, processIncomingText } from './whatsapp-assistant.js';

const env = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  WHATSAPP_ACCESS_TOKEN: 'test-whatsapp-token',
  WHATSAPP_PHONE_NUMBER_ID: 'test-phone-number-id',
  Gemini_API_Key: 'test-gemini-api-key',
};

function createSupabaseHarness() {
  const outboundMessages = [];
  return {
    outboundMessages,
    from(table) {
      if (table === 'whatsapp_conversations') {
        return {
          select() {
            return {
              eq() {
                return { maybeSingle: async () => ({ data: null, error: null }) };
              },
            };
          },
          insert() {
            return {
              select() {
                return { single: async () => ({
                  data: { id: 1, whatsapp_number: '15551234567', automated_status: 'automated' },
                  error: null,
                }) };
              },
            };
          },
        };
      }

      if (table === 'whatsapp_messages') {
        return {
          select(columns) {
            if (columns === 'id') {
              return {
                eq() {
                  return { maybeSingle: async () => ({ data: null, error: null }) };
                },
              };
            }
            return {
              eq() {
                return {
                  order() {
                    return {
                      limit: async () => ({
                        data: [
                          { role: 'assistant', content: 'Tenemos productos decorativos.' },
                          { role: 'user', content: '¿Qué productos venden?' },
                        ],
                        error: null,
                      }),
                    };
                  },
                };
              },
            };
          },
          insert(message) {
            if (message.direction === 'outbound') outboundMessages.push(message);
            return Promise.resolve({ error: null });
          },
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  };
}

test('Gemini environment variable selects Gemini and its default model', () => {
  const config = getAssistantEnvironment(env);

  assert.equal(config.aiProvider, 'gemini');
  assert.equal(config.aiApiKey, env.Gemini_API_Key);
  assert.equal(config.aiModel, 'gemini-2.5-flash');
});

test('incoming WhatsApp text is answered through Gemini and recorded', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  const supabase = createSupabaseHarness();
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    const body = init?.body ? JSON.parse(init.body) : null;
    requests.push({ url, init, body });

    if (url.includes('generativelanguage.googleapis.com')) {
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: 'Atendemos de lunes a sábado.' }] } }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (url.includes('graph.facebook.com') && body?.type === 'text') {
      return new Response(JSON.stringify({ messages: [{ id: 'wamid.reply-1' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(null, { status: 200 });
  };

  try {
    const result = await processIncomingText({
      env,
      getSupabaseClient: () => supabase,
      message: {
        id: 'wamid.incoming-1',
        from: '15551234567',
        timestamp: '1760000000',
        type: 'text',
        text: { body: '¿Cuál es su horario?' },
      },
      delay: async () => {},
    });

    const geminiRequest = requests.find(request =>
      request.url.includes('generativelanguage.googleapis.com')
    );
    const whatsAppReply = requests.find(request =>
      request.url.includes('graph.facebook.com') && request.body?.type === 'text'
    );

    assert.equal(result.status, 'replied');
    assert.match(geminiRequest.url, /models\/gemini-2\.5-flash:generateContent$/);
    assert.equal(
      new Headers(geminiRequest.init.headers).get('x-goog-api-key'),
      env.Gemini_API_Key
    );
    assert.deepEqual(geminiRequest.body.contents, [
      { role: 'user', parts: [{ text: '¿Qué productos venden?' }] },
      { role: 'model', parts: [{ text: 'Tenemos productos decorativos.' }] },
      { role: 'user', parts: [{ text: '¿Cuál es su horario?' }] },
    ]);
    assert.match(geminiRequest.body.systemInstruction.parts[0].text, /única fuente comercial autorizada/);
    assert.equal(whatsAppReply.body.text.body, 'Atendemos de lunes a sábado.');
    assert.equal(supabase.outboundMessages[0].content, 'Atendemos de lunes a sábado.');
    assert.equal(supabase.outboundMessages[0].meta_message_id, 'wamid.reply-1');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
