import { authorizeAdmin, createAdminToken, jsonResponse, parseJsonBody, requirePost } from '../server/http.js';
import { getSupabase } from '../server/supabase.js';

const DEFAULT_PASSWORD = 'contrasena';
const encoder = new TextEncoder();

async function hashPassword(password, salt = null) {
  const saltValue = salt || Array.from(
    crypto.getRandomValues(new Uint8Array(16)),
    byte => byte.toString(16).padStart(2, '0')
  ).join('');
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${saltValue}:${password}`));
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  return `sha256$${saltValue}$${hash}`;
}

async function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') return false;
  const [, salt, savedDigest] = storedHash.split('$');
  if (salt && savedDigest) {
    const candidate = await hashPassword(password, salt);
    return secureEqual(candidate, storedHash);
  }

  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const candidate = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  return secureEqual(storedHash, candidate);
}

function secureEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const session = await authorizeAdmin(req, res, { allowPasswordChange: true });
      if (!session) return;
      return jsonResponse(res, 200, { ok: true, forzarCambio: session.forzarCambio });
    }

    if (!requirePost(req, res)) return;
    const body = parseJsonBody(req);
    const supabase = getSupabase();

    if (body.action === 'change-password') {
      const session = await authorizeAdmin(req, res, { allowPasswordChange: true });
      if (!session) return;
      const newPassword = body.newPassword;
      if (typeof newPassword !== 'string' || newPassword.length < 12 || newPassword.length > 128) {
        return jsonResponse(res, 400, { error: 'La nueva contraseña debe tener entre 12 y 128 caracteres' });
      }

      const { data: user, error: findError } = await supabase
        .from('usuarios')
        .select('id, contrasena_hash, password_changed')
        .eq('usuario', 'admin')
        .maybeSingle();
      if (findError) throw findError;
      if (!user) return jsonResponse(res, 401, { error: 'La cuenta de administración ya no existe' });
      if (user.password_changed === true &&
          !await verifyPassword(DEFAULT_PASSWORD, user.contrasena_hash)) {
        return jsonResponse(res, 401, { error: 'La contraseña ya fue actualizada; inicia sesión nuevamente' });
      }

      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          contrasena_hash: await hashPassword(newPassword),
          password_changed: true,
        })
        .eq('id', user.id);
      if (updateError) throw updateError;

      return jsonResponse(res, 200, {
        token: await createAdminToken(false),
        forzarCambio: false,
      });
    }

    if (body.action !== 'login') {
      return jsonResponse(res, 400, { error: 'Acción de autenticación no válida' });
    }

    const username = body.usuario;
    const password = body.password;
    if (username !== 'admin' || typeof password !== 'string' || password.length > 128) {
      return jsonResponse(res, 401, { error: 'Usuario o contraseña incorrectos' });
    }

    const { data: user, error: findError } = await supabase
      .from('usuarios')
      .select('id, usuario, contrasena_hash, password_changed')
      .eq('usuario', 'admin')
      .maybeSingle();
    if (findError) throw findError;

    let activeUser = user;
    if (!activeUser) {
      const { count, error: countError } = await supabase
        .from('usuarios')
        .select('id', { count: 'exact', head: true });
      if (countError) throw countError;
      if (count !== 0 || password !== DEFAULT_PASSWORD) {
        return jsonResponse(res, 401, { error: 'Usuario o contraseña incorrectos' });
      }
      const setupSecret = process.env.ADMIN_INITIAL_SETUP_SECRET;
      if (!setupSecret || setupSecret.length < 32) {
        return jsonResponse(res, 503, { error: 'El acceso inicial no está configurado' });
      }
      if (!secureEqual(body.setupSecret, setupSecret)) {
        return jsonResponse(res, 401, { error: 'Usuario o contraseña incorrectos' });
      }

      const { data: createdUser, error: insertError } = await supabase
        .from('usuarios')
        .insert({
          usuario: 'admin',
          contrasena_hash: await hashPassword(DEFAULT_PASSWORD),
          password_changed: false,
        })
        .select('id, usuario, contrasena_hash, password_changed')
        .single();
      if (insertError) throw insertError;
      activeUser = createdUser;
    }

    const passwordMatches = await verifyPassword(password, activeUser.contrasena_hash);
    if (!passwordMatches) return jsonResponse(res, 401, { error: 'Usuario o contraseña incorrectos' });

    const forzarCambio = activeUser.password_changed !== true ||
      await verifyPassword(DEFAULT_PASSWORD, activeUser.contrasena_hash);
    return jsonResponse(res, 200, {
      token: await createAdminToken(forzarCambio),
      forzarCambio,
    });
  } catch (error) {
    console.error('Authentication request failed:', error);
    return jsonResponse(res, 500, { error: 'No se pudo completar la autenticación' });
  }
}
