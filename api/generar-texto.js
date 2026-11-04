import { authorizeAdmin, jsonResponse, parseJsonBody, requirePost } from '../server/http.js';
import {
  buildEditorialSystemInstruction,
  getEditorialSettings,
  isMissingEditorialSettingsTable,
} from '../server/editorialSettings.js';

const MODEL = 'gemini-2.5-flash';

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    const session = await authorizeAdmin(req, res);
    if (!session) return;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    const body = parseJsonBody(req);
    const topic = typeof body.tema === 'string' ? body.tema.trim().slice(0, 2000) : '';
    const editorialSettings = await getEditorialSettings();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: buildEditorialSystemInstruction(editorialSettings.custom_instructions),
            }],
          },
          contents: [{
            role: 'user',
            parts: [{
              text: `Genera un texto breve para redes sociales sobre: ${topic || 'soluciones de pintura de Pinturas Diamante en Oaxaca'}.`,
            }],
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                texto_imagen: { type: 'STRING' },
                copy_facebook: { type: 'STRING' },
              },
              required: ['texto_imagen', 'copy_facebook'],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini returned HTTP status:', response.status);
      return jsonResponse(res, 502, { error: 'El servicio de redacción no pudo generar el contenido' });
    }

    const result = await response.json();
    const generated = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof generated !== 'string') {
      return jsonResponse(res, 502, { error: 'La respuesta de redacción no contiene el formato esperado' });
    }

    let content;
    try {
      content = JSON.parse(generated);
    } catch {
      return jsonResponse(res, 502, { error: 'La respuesta de redacción no contiene JSON válido' });
    }

    const bannerText = typeof content.texto_imagen === 'string' ? content.texto_imagen.trim() : '';
    const facebookCopy = typeof content.copy_facebook === 'string' ? content.copy_facebook.trim() : '';
    const wordCount = typeof bannerText === 'string' ? bannerText.split(/\s+/).filter(Boolean).length : 0;
    const hashtags = typeof facebookCopy === 'string' ? facebookCopy.match(/#[\p{L}\p{N}_]+/gu) || [] : [];
    if (!bannerText || wordCount > 5 || !facebookCopy || hashtags.length < 3 || hashtags.length > 5) {
      return jsonResponse(res, 502, { error: 'El contenido generado no cumple los requisitos editoriales; vuelve a intentarlo' });
    }

    return jsonResponse(res, 200, {
      texto_imagen: bannerText,
      copy_facebook: facebookCopy,
    });
  } catch (error) {
    console.error('Text generation failed:', error);
    if (isMissingEditorialSettingsTable(error)) {
      return jsonResponse(res, 503, {
        error: 'Aplica la migración 20261104000000_admin_editorial_settings.sql en Supabase antes de generar contenido.',
      });
    }
    return jsonResponse(res, 500, { error: 'No se pudo generar el contenido' });
  }
}
