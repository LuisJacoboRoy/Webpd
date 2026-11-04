const encoder = new TextEncoder();
const SESSION_TTL_SECONDS = 60 * 60 * 12;

export function jsonResponse(res, status, payload) {
  return res.status(status).json(payload);
}

export function requirePost(req, res) {
  if (req.method === 'POST') return true;
  res.setHeader('Allow', 'POST');
  jsonResponse(res, 405, { error: 'Method not allowed' });
  return false;
}

export function getAdminSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be configured with at least 32 characters');
  }
  return secret;
}

function toBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return Uint8Array.from(atob(padded), character => character.charCodeAt(0));
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getAdminSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createAdminToken(forzarCambio = false) {
  const payload = {
    sub: 'admin',
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    forzarCambio,
  };
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    'HMAC',
    await getSigningKey(),
    encoder.encode(encodedPayload)
  );

  return `${encodedPayload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminToken(token) {
  if (typeof token !== 'string') return null;
  const [encodedPayload, encodedSignature, extra] = token.split('.');
  if (!encodedPayload || !encodedSignature || extra) return null;

  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await getSigningKey(),
      fromBase64Url(encodedSignature),
      encoder.encode(encodedPayload)
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload)));
    if (payload.sub !== 'admin' || !Number.isInteger(payload.exp) ||
        payload.exp <= Math.floor(Date.now() / 1000) ||
        typeof payload.forzarCambio !== 'boolean') {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getBearerToken(req) {
  const authorization = req.headers?.authorization || req.headers?.get?.('authorization');
  if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) return null;
  return authorization.slice(7);
}

export async function authorizeAdmin(req, res, options = {}) {
  const session = await verifyAdminToken(getBearerToken(req));
  if (!session) {
    jsonResponse(res, 401, { error: 'Sesión inválida o vencida' });
    return null;
  }
  if (session.forzarCambio && !options.allowPasswordChange) {
    jsonResponse(res, 403, { error: 'Debes cambiar la contraseña antes de continuar' });
    return null;
  }
  return session;
}

export function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  return {};
}

export function validColor(value) {
  return typeof value === 'string' && /^#[\da-fA-F]{6}$/.test(value);
}
