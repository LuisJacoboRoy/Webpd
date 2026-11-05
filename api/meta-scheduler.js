import { timingSafeEqual } from 'node:crypto';
import { jsonResponse } from '../server/http.js';
import { getSupabase } from '../server/supabase.js';
import { MetaConfigurationError, schedulePendingMetaPosts } from '../server/metaGraph.js';

export const config = { maxDuration: 60 };

function isAuthorized(req, expectedSecret) {
  const authorization = req.headers?.authorization;
  if (!expectedSecret || typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
    return false;
  }

  const provided = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(expectedSecret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return jsonResponse(res, 405, { error: 'Method not allowed' });
  }

  if (!process.env.CRON_SECRET) {
    return jsonResponse(res, 503, { error: 'CRON_SECRET no está configurado en el servidor' });
  }
  if (!isAuthorized(req, process.env.CRON_SECRET)) {
    return jsonResponse(res, 401, { error: 'No autorizado' });
  }

  try {
    const result = await schedulePendingMetaPosts(getSupabase());
    if (result.failures.length > 0) {
      return jsonResponse(res, 502, {
        error: 'No se pudieron programar todas las publicaciones; se volverán a intentar en la siguiente ejecución.',
        programadas: result.scheduled,
        pendientes_con_error: result.failures.length,
      });
    }

    res.setHeader('Cache-Control', 'private, no-store');
    return jsonResponse(res, 200, { programadas: result.scheduled });
  } catch (error) {
    console.error('Meta scheduled publishing run failed:', error);
    if (error instanceof MetaConfigurationError) {
      return jsonResponse(res, 503, { error: error.message });
    }
    return jsonResponse(res, 500, { error: 'No se pudo completar la programación de publicaciones en Meta' });
  }
}
