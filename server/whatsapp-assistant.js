import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getSupabase } from './supabase.js';

const KNOWLEDGE_FILE = path.resolve(process.cwd(), 'docs', 'DIAMANTE_PINTURAS_LLM.md');
const HISTORY_LIMIT = 20;

export function getAssistantEnvironment(env = process.env) {
  return {
    supabaseUrl: env.SUPABASEW_SUPABASE_URL || env.SUPABASE_URL,
    supabaseServiceRoleKey:
      env.SUPABASEW_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
    whatsappAccessToken: env.WHATSAPP_ACCESS_TOKEN,
    whatsappPhoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    aiApiKey: env.AI_API_KEY,
    aiModel: env.AI_MODEL || 'gpt-4o-mini',
    aiApiUrl:
      env.AI_API_URL ||
      'https://api.openai.com/v1/chat/completions',
  };
}

async function readKnowledge() {
  return readFile(KNOWLEDGE_FILE, 'utf8');
}

async function getConversation(supabase, whatsappNumber) {
  const { data, error } = await supabase
    .from('whatsapp_conversations')
    .select('id, whatsapp_number, automated_status')
    .eq('whatsapp_number', whatsappNumber)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;

  const { data: created, error: createError } = await supabase
    .from('whatsapp_conversations')
    .insert({ whatsapp_number: whatsappNumber })
    .select('id, whatsapp_number, automated_status')
    .single();
  if (createError) throw createError;
  return created;
}

async function insertInbound(supabase, conversationId, message) {
  const { data: existing, error: lookupError } = await supabase
    .from('whatsapp_messages')
    .select('id')
    .eq('meta_message_id', message.id)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return false;

  const { error } = await supabase
    .from('whatsapp_messages')
    .insert({
      conversation_id: conversationId,
      meta_message_id: message.id,
      direction: 'inbound',
      role: 'user',
      content: message.text.body,
      message_type: 'text',
      meta_timestamp: message.timestamp
        ? new Date(Number(message.timestamp) * 1000).toISOString()
        : null,
    });
  if (error && error.code !== '23505') throw error;
  if (error?.code === '23505') return false;
  return true;
}

async function getHistory(supabase, conversationId) {
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT);
  if (error) throw error;
  return (data || []).reverse();
}

async function markSeen(accessToken, phoneNumberId, messageId) {
  await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  });
}

async function showTyping(accessToken, phoneNumberId, messageId) {
  await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
      typing_indicator: { type: 'text' },
    }),
  });
}

async function generateReply({ apiKey, apiUrl, model, knowledge, history, incoming }) {
  const systemPrompt =
    `Actúa según el siguiente documento como única fuente comercial autorizada. ` +
    `Si el documento no contiene la respuesta, di que no tienes ese dato y deriva a atención humana.\n\n` +
    knowledge;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: incoming },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider returned ${response.status}`);
  }

  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('AI provider returned empty content');
  }
  return content.trim();
}

async function sendWhatsAppText({ accessToken, phoneNumberId, recipient, text }) {
  const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'text',
      text: { preview_url: false, body: text },
    }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp send returned ${response.status}`);
  }
  const result = await response.json();
  return result?.messages?.[0]?.id || null;
}

async function recordOutbound(supabase, conversationId, metaMessageId, content) {
  await supabase
    .from('whatsapp_messages')
    .insert({
      conversation_id: conversationId,
      meta_message_id: metaMessageId,
      direction: 'outbound',
      role: 'assistant',
      content,
      message_type: 'text',
      delivery_state: 'sent',
    });
}

export async function processIncomingText({
  env = process.env,
  getSupabaseClient,
  message,
  delay = ms => new Promise(resolve => setTimeout(resolve, ms)),
}) {
  if (!message || message.type !== 'text' || typeof message.text?.body !== 'string') {
    return { status: 'unsupported' };
  }

  const config = getAssistantEnvironment(env);
  if (
    !config.supabaseUrl ||
    !config.supabaseServiceRoleKey ||
    !config.whatsappAccessToken ||
    !config.whatsappPhoneNumberId ||
    !config.aiApiKey
  ) {
    return { status: 'not_configured' };
  }

  const supabase =
    getSupabaseClient?.() ||
    getSupabase({
      url: config.supabaseUrl,
      serviceRoleKey: config.supabaseServiceRoleKey,
    });

  const conversation = await getConversation(supabase, message.from);
  if (conversation.automated_status !== 'automated') {
    await insertInbound(supabase, conversation.id, message);
    return { status: 'human_control' };
  }

  const history = await getHistory(supabase, conversation.id);
  const inserted = await insertInbound(supabase, conversation.id, message);
  if (!inserted) return { status: 'duplicate' };
  await markSeen(config.whatsappAccessToken, config.whatsappPhoneNumberId, message.id);

  const knowledge = await readKnowledge();

  await showTyping(config.whatsappAccessToken, config.whatsappPhoneNumberId, message.id);
  const naturalDelay = Math.min(2200, 700 + message.text.body.length * 18);
  await delay(naturalDelay);

  const reply = await generateReply({
    apiKey: config.aiApiKey,
    apiUrl: config.aiApiUrl,
    model: config.aiModel,
    knowledge,
    history,
    incoming: message.text.body,
  });

  const metaMessageId = await sendWhatsAppText({
    accessToken: config.whatsappAccessToken,
    phoneNumberId: config.whatsappPhoneNumberId,
    recipient: message.from,
    text: reply,
  });
  await recordOutbound(supabase, conversation.id, metaMessageId, reply);

  return { status: 'replied', metaMessageId };
}
