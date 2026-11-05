const GRAPH_API_BASE_URL = 'https://graph.facebook.com';
const PAGE_TIME_ZONE = 'America/Mexico_City';
const MAX_SCHEDULE_DAYS = 74;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const SUPABASE_IMAGE_BUCKET = 'admin-generated-images';
const LINK_PATTERN = /https?:\/\/[^\s<>"']+/i;

export class MetaConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MetaConfigurationError';
  }
}

export class MetaGraphError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MetaGraphError';
  }
}

export function getMetaConfig() {
  const pageId = process.env.META_PAGE_ID;
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  const graphApiVersion = process.env.META_GRAPH_API_VERSION;

  if (!pageId || !/^\d+$/.test(pageId)) {
    throw new MetaConfigurationError('Configura META_PAGE_ID con el identificador de tu página de Facebook.');
  }
  if (!pageAccessToken) {
    throw new MetaConfigurationError('Configura META_PAGE_ACCESS_TOKEN como secreto privado del servidor.');
  }
  if (!graphApiVersion || !/^v\d+\.\d+$/.test(graphApiVersion)) {
    throw new MetaConfigurationError('Configura META_GRAPH_API_VERSION con una versión vigente, por ejemplo vXX.0.');
  }

  return { pageId, pageAccessToken, graphApiVersion };
}

function getLocalDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PAGE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function addDays(dateString, amount) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return date.toISOString().slice(0, 10);
}

function minuteForPublication(publicationId) {
  let hash = 0;
  for (const character of String(publicationId)) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash % 60;
}

function localDateTimeToTimestamp(dateString, hour, minute) {
  const [year, month, day] = dateString.split('-').map(Number);
  const targetWallTime = Date.UTC(year, month - 1, day, hour, minute);
  let timestamp = targetWallTime;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: PAGE_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(timestamp));
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    const observedWallTime = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute)
    );
    timestamp += targetWallTime - observedWallTime;
  }

  return Math.floor(timestamp / 1000);
}

function scheduledDateTime(publicationId, scheduledDate, now = new Date()) {
  const localToday = getLocalDateParts(now);
  let date = scheduledDate < `${localToday.year}-${localToday.month}-${localToday.day}`
    ? `${localToday.year}-${localToday.month}-${localToday.day}`
    : scheduledDate;
  const minute = minuteForPublication(publicationId);
  let timestamp = localDateTimeToTimestamp(date, 20, minute);

  if (timestamp < Math.floor(now.getTime() / 1000) + 10 * 60) {
    date = addDays(date, 1);
    timestamp = localDateTimeToTimestamp(date, 20, minute);
  }

  return { date, minute, timestamp };
}

function extractLink(copy) {
  const match = LINK_PATTERN.exec(copy);
  if (!match) return null;
  return match[0].replace(/[.,!?;:)\]}]+$/u, '');
}

async function graphRequest(path, fields, config, options = {}) {
  const response = await fetch(
    `${GRAPH_API_BASE_URL}/${config.graphApiVersion}/${path}`,
    {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${config.pageAccessToken}`,
      },
      signal: AbortSignal.timeout(25_000),
    }
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    console.error('Meta Graph API request failed:', {
      endpoint: path,
      status: response.status,
      code: payload.error?.code,
      subcode: payload.error?.error_subcode,
    });
    throw new MetaGraphError(
      'Meta rechazó la programación. Verifica el Page ID, la versión de Graph API y que el token de página tenga permiso para crear contenido.'
    );
  }
  if (typeof payload.id !== 'string' || !payload.id) {
    throw new MetaGraphError(`Meta no devolvió el identificador esperado al ${fields}.`);
  }
  return payload;
}

async function uploadUnpublishedPhoto(supabase, publication, config) {
  const { data: image, error } = await supabase.storage
    .from(SUPABASE_IMAGE_BUCKET)
    .download(publication.imagen_generada_path);
  if (error) throw error;

  const mimeType = image.type || 'image/png';
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(mimeType)) {
    throw new Error(`La imagen de la publicación ${publication.id} tiene un formato no compatible.`);
  }
  if (image.size === 0 || image.size > MAX_IMAGE_BYTES) {
    throw new Error(`La imagen de la publicación ${publication.id} excede el tamaño permitido.`);
  }

  const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/webp' ? 'webp' : 'png';
  const body = new FormData();
  body.set('published', 'false');
  body.set('source', new Blob([await image.arrayBuffer()], { type: mimeType }), `publication-${publication.id}.${extension}`);
  return graphRequest(`${config.pageId}/photos`, 'subir la imagen', config, {
    method: 'POST',
    body,
  });
}

async function createScheduledPagePost(supabase, publication, config, now) {
  const scheduled = scheduledDateTime(publication.id, publication.fecha_programada, now);
  const copy = typeof publication.copy_facebook === 'string' ? publication.copy_facebook.trim() : '';
  const hasImage = Boolean(publication.imagen_generada_path);
  const link = hasImage ? null : extractLink(copy);
  const message = link
    ? copy.replace(link, '').trim()
    : copy;
  const form = new URLSearchParams({
    published: 'false',
    scheduled_publish_time: String(scheduled.timestamp),
  });
  if (message) form.set('message', message);
  if (link) form.set('link', link);

  if (hasImage) {
    const photo = await uploadUnpublishedPhoto(supabase, publication, config);
    form.set('attached_media', JSON.stringify([{ media_fbid: photo.id }]));
  }

  const post = await graphRequest(`${config.pageId}/feed`, 'programar la publicación', config, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });

  return { postId: post.id, scheduledDate: scheduled.date };
}

export async function schedulePendingMetaPosts(supabase, options = {}) {
  const config = options.config || getMetaConfig();
  const now = options.now || new Date();
  const localToday = getLocalDateParts(now);
  const lastSchedulableDate = addDays(
    `${localToday.year}-${localToday.month}-${localToday.day}`,
    MAX_SCHEDULE_DAYS
  );

  const { data: publications, error } = await supabase
    .from('publicaciones')
    .select('id, copy_facebook, fecha_programada, imagen_generada_path')
    .is('dia_campana', null)
    .eq('estado', 'aprobado')
    .is('fb_post_id', null)
    .not('fecha_programada', 'is', null)
    .lte('fecha_programada', lastSchedulableDate)
    .order('fecha_programada', { ascending: true })
    .order('id', { ascending: true })
    .limit(10);
  if (error) throw error;

  const results = { scheduled: 0, failures: [] };
  for (const publication of publications || []) {
    try {
      const { postId, scheduledDate } = await createScheduledPagePost(supabase, publication, config, now);
      const updates = { fb_post_id: postId };
      if (scheduledDate !== publication.fecha_programada) {
        updates.fecha_programada = scheduledDate;
      }

      const { data: saved, error: saveError } = await supabase
        .from('publicaciones')
        .update(updates)
        .eq('id', publication.id)
        .is('fb_post_id', null)
        .select('id')
        .maybeSingle();
      if (saveError) throw saveError;
      if (!saved) {
        throw new Error(`Meta programó la publicación ${publication.id}, pero no se pudo guardar su identificador en Supabase.`);
      }
      results.scheduled += 1;
    } catch (error) {
      console.error(`Could not schedule publication ${publication.id}:`, error);
      results.failures.push(publication.id);
    }
  }

  return results;
}
