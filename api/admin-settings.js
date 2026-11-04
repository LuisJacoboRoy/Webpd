import {
  getEditorialSettings,
  isMissingEditorialSettingsTable,
  MAX_CUSTOM_INSTRUCTIONS_LENGTH,
} from '../server/editorialSettings.js';
import { authorizeAdmin, jsonResponse, parseJsonBody } from '../server/http.js';
import { getSupabase } from '../server/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return jsonResponse(res, 405, { error: 'Method not allowed' });
  }

  try {
    const session = await authorizeAdmin(req, res);
    if (!session) return;

    if (req.method === 'GET') {
      return jsonResponse(res, 200, { settings: await getEditorialSettings() });
    }

    const body = parseJsonBody(req);
    const instructions = body.custom_instructions;
    if (typeof instructions !== 'string' || instructions.length > MAX_CUSTOM_INSTRUCTIONS_LENGTH) {
      return jsonResponse(res, 400, {
        error: `Las instrucciones deben tener como máximo ${MAX_CUSTOM_INSTRUCTIONS_LENGTH} caracteres`,
      });
    }

    const { data, error } = await getSupabase()
      .from('admin_editorial_settings')
      .upsert({
        id: 1,
        custom_instructions: instructions.trim(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select('custom_instructions, updated_at')
      .single();
    if (error) throw error;

    return jsonResponse(res, 200, { settings: data });
  } catch (error) {
    console.error('Editorial settings request failed:', error);
    if (isMissingEditorialSettingsTable(error)) {
      return jsonResponse(res, 503, {
        error: 'Aplica la migración 20261104000000_admin_editorial_settings.sql en Supabase antes de editar el prompt.',
      });
    }
    return jsonResponse(res, 500, { error: 'No se pudo cargar o guardar la configuración editorial' });
  }
}
