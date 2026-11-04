import { authorizeAdmin, jsonResponse, parseJsonBody, requirePost } from '../server/http.js';

const MODEL = 'gemini-3.1-flash-image';
const MAX_PROMPT_LENGTH = 2000;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

export const config = { maxDuration: 60 };

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
    if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
      return jsonResponse(res, 400, {
        error: `Describe la imagen en un máximo de ${MAX_PROMPT_LENGTH} caracteres`,
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

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', image.length);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Image-Model', MODEL);
    return res.status(200).send(image);
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      return jsonResponse(res, 504, { error: 'Gemini tardó demasiado en generar la imagen; vuelve a intentarlo' });
    }
    console.error('Gemini image generation failed:', error);
    return jsonResponse(res, 500, { error: 'No se pudo completar la generación de imagen' });
  }
}
