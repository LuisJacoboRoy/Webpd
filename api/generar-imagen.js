import { ImageResponse } from '@vercel/og';
import { createElement as h } from 'react';
import { getSupabase } from '../server/supabase.js';
import { getBearerToken, verifyAdminToken } from '../server/http.js';

const BASE_IMAGE_URL = 'https://raw.githubusercontent.com/LuisJacoboRoy/Webpd/main/public/img/pubs/bannerdp.png';

export default async function handler(req, res) {
  const session = await verifyAdminToken(getBearerToken(req));
  if (!session || session.forzarCambio) {
    return res.status(401).json({ error: 'Sesión inválida o vencida' });
  }

  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const id = Number(url.searchParams.get('id'));
  const day = Number(url.searchParams.get('dia'));
  if ((!Number.isInteger(id) || id < 1) && (!Number.isInteger(day) || day < 1 || day > 10)) {
    return res.status(400).json({ error: 'Se requiere un id o un día de campaña válido' });
  }

  try {
    const supabase = getSupabase();
    let query = supabase
      .from('publicaciones')
      .select('id, dia_campana, texto_imagen, color_fondo')
      .limit(1);
    query = Number.isInteger(id) && id > 0 ? query.eq('id', id) : query.eq('dia_campana', day);

    const { data: publication, error } = await query.maybeSingle();
    if (error) throw error;
    if (!publication) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const text = (url.searchParams.get('texto_imagen') || publication.texto_imagen).slice(0, 120);
    const requestedColor = url.searchParams.get('color_fondo');
    const storedColor = /^#[\da-fA-F]{6}$/.test(publication.color_fondo || '')
      ? publication.color_fondo
      : '#16a34a';
    const backgroundColor = /^#[\da-fA-F]{6}$/.test(requestedColor || '')
      ? requestedColor
      : storedColor;

    const image = new ImageResponse(
      h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '7%',
          backgroundColor,
          color: '#ffffff',
          textAlign: 'center',
        },
        children: [
          h('img', {
            src: BASE_IMAGE_URL,
            alt: 'Pinturas Diamante',
            style: { width: '45%', height: 'auto', objectFit: 'contain' },
          }),
          h('div', {
            style: {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              marginTop: '5%',
              fontSize: '4.5%',
              fontWeight: 700,
              lineHeight: 1.2,
              overflowWrap: 'break-word',
            },
            children: text,
          }),
        ],
      }),
      { width: 1080, height: 1080 }
    );
    const png = Buffer.from(await image.arrayBuffer());

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).send(png);
  } catch (error) {
    console.error('Image generation failed:', error);
    return res.status(500).json({ error: 'No se pudo generar la imagen' });
  }
}
