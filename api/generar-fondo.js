import { authorizeAdmin, jsonResponse, parseJsonBody, requirePost } from '../server/http.js';
import { getSupabase } from '../server/supabase.js';

const MODEL = 'gemini-3.1-flash-image';
const MAX_PROMPT_LENGTH = 2000;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const STORAGE_BUCKET = 'admin-generated-images';

export const config = { maxDuration: 60 };

function getImageExtension(mimeType) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/webp') return 'webp';
  return 'png';
}

function isMissingImageStorageSetup(error) {
  return ['PGRST204', '42703', '42P01'].includes(error?.code) ||
    /bucket not found/i.test(error?.message || '');
}

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    const session = await authorizeAdmin(req, res);
    if (!session) return;

    const apiKey = process.env.keygoogleimg;
    if (!apiKey) {
      return jsonResponse(res, 503, { error: 'La variable keygoogleimg no está configurada en el servidor' });
    }

    const body = parseJsonBody(req);
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const publicationId = Number(body.publicationId);
    if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
      return jsonResponse(res, 400, {
        error: `Describe la imagen en un máximo de ${MAX_PROMPT_LENGTH} caracteres`,
      });
    }
    if (!Number.isInteger(publicationId) || publicationId < 1) {
      return jsonResponse(res, 400, { error: 'Selecciona una publicación válida para guardar la imagen' });
    }

    const supabase = getSupabase();
    const { data: publication, error: publicationError } = await supabase
      .from('publicaciones')
      .select('id, dia_campana, estado, imagen_generada_path')
      .eq('id', publicationId)
      .gte('dia_campana', 1)
      .lte('dia_campana', 10)
      .maybeSingle();
    if (publicationError) throw publicationError;
    if (!publication) {
      return jsonResponse(res, 404, { error: 'La publicación no pertenece al lote activo' });
    }
    if (publication.estado === 'aprobado') {
      return jsonResponse(res, 409, {
        error: 'Desaprueba la publicación antes de reemplazar su imagen para que pueda revisarse de nuevo',
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        signal: AbortSignal.timeout(55_000),
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{
              text: [
                'Crea una imagen fotográfica publicitaria realista basada en esta descripción.',
                'No incluyas texto, letras, logotipos, etiquetas ni envases de marcas.',
                'La imagen servirá como escena visual para una publicación de Pinturas Diamante.',
                `Descripción: ${prompt}`,
              ].join(' '),
            }],
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const apiError = errorBody.error || {};
      console.error('Gemini image generation returned HTTP status:', response.status, apiError.status || '');
      if (response.status === 429) {
        return jsonResponse(res, 429, { error: 'Se alcanzó la cuota o límite de imágenes de Gemini para este proyecto' });
      }
      if (response.status === 403 || response.status === 404) {
        return jsonResponse(res, 502, {
          error: `El modelo de imágenes ${MODEL} no está habilitado para la API key o el proyecto de Google`,
        });
      }
      return jsonResponse(res, 502, { error: 'Gemini no pudo generar la imagen solicitada' });
    }

    const result = await response.json();
    const parts = result.candidates?.[0]?.content?.parts;
    const imagePart = Array.isArray(parts)
      ? parts.find(part => typeof part.inlineData?.data === 'string')
      : null;
    if (!imagePart) {
      const reason = result.candidates?.[0]?.finishReason;
      console.error('Gemini image response did not contain image data:', reason || 'no finish reason');
      return jsonResponse(res, 502, {
        error: 'Gemini no devolvió una imagen. Revisa si la solicitud fue bloqueada por sus políticas y vuelve a intentar.',
      });
    }

    const mimeType = imagePart.inlineData.mimeType;
    const base64 = imagePart.inlineData.data;
    if (!IMAGE_TYPES.has(mimeType) || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
      return jsonResponse(res, 502, { error: 'Gemini devolvió un formato de imagen no compatible' });
    }

    const image = Buffer.from(base64, 'base64');
    if (image.length === 0 || image.length > MAX_IMAGE_BYTES) {
      return jsonResponse(res, 502, { error: 'La imagen generada excede el tamaño permitido' });
    }

    const storagePath = `${publicationId}/${crypto.randomUUID()}.${getImageExtension(mimeType)}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, image, {
        contentType: mimeType,
        cacheControl: '3600',
      });
    if (uploadError) throw uploadError;

    const { data: savedPublication, error: saveError } = await supabase
      .from('publicaciones')
      .update({
        imagen_generada_path: storagePath,
        imagen_generada_prompt: prompt,
        imagen_generada_modelo: MODEL,
      })
      .eq('id', publicationId)
      .eq('estado', 'borrador')
      .gte('dia_campana', 1)
      .lte('dia_campana', 10)
      .select('id, dia_campana, estado, imagen_generada_path, imagen_generada_prompt, imagen_generada_modelo')
      .maybeSingle();
    if (saveError || !savedPublication) {
      const { error: cleanupError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([storagePath]);
      if (cleanupError) {
        console.error('Could not remove unlinked generated image:', cleanupError);
      }
      if (saveError) throw saveError;
      return jsonResponse(res, 409, {
        error: 'La publicación cambió durante la generación; no se reemplazó la imagen guardada. Actualiza el panel e inténtalo de nuevo.',
      });
    }

    if (publication.imagen_generada_path && publication.imagen_generada_path !== storagePath) {
      const { error: removeError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([publication.imagen_generada_path]);
      if (removeError) {
        console.error('New image saved but previous image cleanup failed:', removeError);
      }
    }

    const { data: signedImage, error: signedUrlError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, 60 * 60);
    if (signedUrlError) {
      console.error('Generated image saved but signed preview URL failed:', signedUrlError);
      return jsonResponse(res, 200, {
        publication: savedPublication,
        previewUrl: null,
        warning: 'La imagen se guardó, pero no se pudo cargar la vista previa. Vuelve a abrir la publicación para intentar verla.',
      });
    }

    return jsonResponse(res, 200, {
      publication: savedPublication,
      previewUrl: signedImage.signedUrl,
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      return jsonResponse(res, 504, { error: 'Gemini tardó demasiado en generar la imagen; vuelve a intentarlo' });
    }
    console.error('Gemini image generation failed:', error);
    if (isMissingImageStorageSetup(error)) {
      return jsonResponse(res, 503, {
        error: 'Aplica la migración 20261104160000_generated_image_storage.sql en Supabase antes de generar imágenes.',
      });
    }
    return jsonResponse(res, 500, { error: 'No se pudo completar la generación de imagen' });
  }
}
