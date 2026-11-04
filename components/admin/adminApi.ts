export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}

export async function adminApi<T>(
  path: string,
  token?: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(path, { ...init, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload.error === 'string' ? payload.error : 'No se pudo completar la solicitud';
    throw new AdminApiError(message, response.status);
  }
  return payload as T;
}

export type Publication = {
  id: number;
  dia_campana: number | null;
  texto_imagen: string;
  color_fondo: string;
  copy_facebook: string;
  estado: 'borrador' | 'aprobado' | string;
  fecha_programada: string | null;
  fecha_publicacion: string | null;
  fb_post_id: string | null;
};
