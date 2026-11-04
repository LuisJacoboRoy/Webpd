import { authorizeAdmin, jsonResponse, parseJsonBody, validColor } from '../server/http.js';
import { getSupabase } from '../server/supabase.js';

const publicationFields = 'id, dia_campana, texto_imagen, color_fondo, copy_facebook, estado, fecha_programada, fecha_publicacion, fb_post_id';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return jsonResponse(res, 405, { error: 'Method not allowed' });
    }

    const session = await authorizeAdmin(req, res);
    if (!session) return;

    const supabase = getSupabase();
    if (req.method === 'GET') {
      const type = req.query.tipo;
      if (type === 'lote') {
        const { data, error } = await supabase
          .from('publicaciones')
          .select(publicationFields)
          .gte('dia_campana', 1)
          .lte('dia_campana', 10)
          .order('dia_campana', { ascending: true })
          .limit(10);
        if (error) throw error;
        return jsonResponse(res, 200, { publicaciones: data });
      }

      if (type === 'historial') {
        const page = Number.parseInt(req.query.page, 10);
        if (!Number.isInteger(page) || page < 1 || page > 4) {
          return jsonResponse(res, 400, { error: 'La página debe ser un número del 1 al 4' });
        }
        const { data, error } = await supabase
          .from('publicaciones')
          .select(publicationFields)
          .is('dia_campana', null)
          .order('fecha_programada', { ascending: false, nullsFirst: false })
          .range((page - 1) * 10, page * 10 - 1);
        if (error) throw error;
        return jsonResponse(res, 200, { publicaciones: data, page, maxPages: 4 });
      }

      return jsonResponse(res, 400, { error: 'Tipo de consulta no válido' });
    }

    const body = parseJsonBody(req);
    if (body.accion === 'actualizar') {
      const id = Number(body.id);
      if (!Number.isInteger(id) || id < 1) {
        return jsonResponse(res, 400, { error: 'Identificador de publicación no válido' });
      }

      const updates = {};
      if (body.texto_imagen !== undefined) {
        if (typeof body.texto_imagen !== 'string' || body.texto_imagen.length > 120) {
          return jsonResponse(res, 400, { error: 'El texto del banner debe tener como máximo 120 caracteres' });
        }
        updates.texto_imagen = body.texto_imagen;
      }
      if (body.copy_facebook !== undefined) {
        if (typeof body.copy_facebook !== 'string' || body.copy_facebook.length > 5000) {
          return jsonResponse(res, 400, { error: 'El texto de Facebook no puede superar 5000 caracteres' });
        }
        updates.copy_facebook = body.copy_facebook;
      }
      if (body.color_fondo !== undefined) {
        if (!validColor(body.color_fondo)) {
          return jsonResponse(res, 400, { error: 'Color de fondo no válido' });
        }
        updates.color_fondo = body.color_fondo;
      }
      if (body.estado !== undefined) {
        if (!['borrador', 'aprobado'].includes(body.estado)) {
          return jsonResponse(res, 400, { error: 'Estado de publicación no válido' });
        }
        updates.estado = body.estado;
      }
      if (Object.keys(updates).length === 0) {
        return jsonResponse(res, 400, { error: 'No se enviaron cambios válidos' });
      }

      const { data, error } = await supabase
        .from('publicaciones')
        .update(updates)
        .eq('id', id)
        .gte('dia_campana', 1)
        .lte('dia_campana', 10)
        .select(publicationFields)
        .maybeSingle();
      if (error) throw error;
      if (!data) return jsonResponse(res, 404, { error: 'La publicación no pertenece al lote activo' });
      return jsonResponse(res, 200, { publicacion: data });
    }

    if (body.accion === 'validar_lote') {
      const { data, error } = await supabase.rpc('validar_lote');
      if (error) throw error;
      return jsonResponse(res, 200, { resultado: data });
    }

    return jsonResponse(res, 400, { error: 'Acción de publicación no válida' });
  } catch (error) {
    console.error('Publication request failed:', error);
    return jsonResponse(res, 500, { error: 'No se pudo completar la operación de publicaciones' });
  }
}
