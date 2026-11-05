import { authorizeAdmin, jsonResponse } from '../server/http.js';
import { getSupabase } from '../server/supabase.js';

const STORAGE_BUCKET = 'admin-generated-images';
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return jsonResponse(res, 405, { error: 'Method not allowed' });
  }

  try {
    const session = await authorizeAdmin(req, res);
    if (!session) return;

    const publicationId = Number(req.query.id);
    if (!Number.isInteger(publicationId) || publicationId < 1) {
      return jsonResponse(res, 400, { error: 'Identificador de publicación no válido' });
    }

    const supabase = getSupabase();
    const { data: publication, error: publicationError } = await supabase
      .from('publicaciones')
      .select('id, imagen_generada_path')
      .eq('id', publicationId)
      .maybeSingle();
    if (publicationError) throw publicationError;
    if (!publication?.imagen_generada_path) {
      return jsonResponse(res, 404, { error: 'Esta publicación no tiene una imagen generada guardada' });
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(publication.imagen_generada_path, SIGNED_URL_TTL_SECONDS);
    if (error) throw error;

    res.setHeader('Cache-Control', 'private, no-store');
    return jsonResponse(res, 200, {
      previewUrl: data.signedUrl,
      expiresIn: SIGNED_URL_TTL_SECONDS,
    });
  } catch (error) {
    console.error('Saved publication image request failed:', error);
    if (['PGRST204', '42703', '42P01'].includes(error?.code) ||
        /bucket not found/i.test(error?.message || '')) {
      return jsonResponse(res, 503, {
        error: 'Aplica la migración 20261104160000_generated_image_storage.sql en Supabase para habilitar las imágenes guardadas.',
      });
    }
    return jsonResponse(res, 500, { error: 'No se pudo cargar la imagen guardada' });
  }
}
