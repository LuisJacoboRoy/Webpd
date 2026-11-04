import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, AdminApiError, Publication } from './adminApi';

type Props = {
  token: string;
  onLogout: () => void;
  onSessionExpired: () => void;
};

type PublicationsResponse = { publicaciones: Publication[] };
type TextResponse = { texto_imagen: string; copy_facebook: string };
type ImagePreviewProps = {
  token: string;
  publication: Publication;
};

const ImagePreview: React.FC<ImagePreviewProps> = ({ token, publication }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = '';
    setImageError('');
    setImageUrl('');

    const timeout = window.setTimeout(async () => {
      const params = new URLSearchParams({
        texto_imagen: publication.texto_imagen,
        color_fondo: publication.color_fondo,
      });
      if (publication.dia_campana !== null) params.set('dia', String(publication.dia_campana));
      else params.set('id', String(publication.id));

      try {
        const response = await fetch(`/api/generar-imagen?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('No se pudo cargar la vista previa');
        objectUrl = URL.createObjectURL(await response.blob());
        setImageUrl(objectUrl);
      } catch (error) {
        if (!controller.signal.aborted) {
          setImageError(error instanceof Error ? error.message : 'Error al generar la imagen');
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [publication.id, publication.dia_campana, publication.texto_imagen, publication.color_fondo, token]);

  return (
    <div className="admin-preview">
      {imageUrl ? <img src={imageUrl} alt={`Vista previa de publicación ${publication.id}`} /> : (
        <span>{imageError || 'Generando vista previa…'}</span>
      )}
    </div>
  );
};

const AdminDashboard: React.FC<Props> = ({ token, onLogout, onSessionExpired }) => {
  const [batch, setBatch] = useState<Publication[]>([]);
  const [history, setHistory] = useState<Publication[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [dirtyIds, setDirtyIds] = useState<Set<number>>(() => new Set());
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const selected = useMemo(
    () => batch.find(publication => publication.id === selectedId) || null,
    [batch, selectedId]
  );

  const handleError = useCallback((requestError: unknown) => {
    if (requestError instanceof AdminApiError && requestError.status === 401) {
      onSessionExpired();
      return;
    }
    setError(requestError instanceof Error ? requestError.message : 'Ocurrió un error inesperado.');
  }, [onSessionExpired]);

  const loadBatch = useCallback(async () => {
    const result = await adminApi<PublicationsResponse>('/api/publicaciones?tipo=lote', token);
    setBatch(result.publicaciones);
    setDirtyIds(new Set());
    setSelectedId(current => current && result.publicaciones.some(item => item.id === current)
      ? current
      : result.publicaciones[0]?.id ?? null);
  }, [token]);

  const loadHistory = useCallback(async (page: number) => {
    const result = await adminApi<PublicationsResponse>(
      `/api/publicaciones?tipo=historial&page=${page}`,
      token
    );
    setHistory(result.publicaciones);
  }, [token]);

  useEffect(() => {
    let active = true;
    setBusy(true);
    Promise.all([
      adminApi<PublicationsResponse>('/api/publicaciones?tipo=lote', token),
      adminApi<PublicationsResponse>('/api/publicaciones?tipo=historial&page=1', token),
    ]).then(([batchResult, historyResult]) => {
      if (!active) return;
      setBatch(batchResult.publicaciones);
      setDirtyIds(new Set());
      setSelectedId(batchResult.publicaciones[0]?.id ?? null);
      setHistory(historyResult.publicaciones);
    }).catch(handleError).finally(() => {
      if (active) setBusy(false);
    });
    return () => { active = false; };
  }, [token, handleError]);

  function updateSelected(changes: Partial<Publication>) {
    if (!selected) return;
    setBatch(current => current.map(publication =>
      publication.id === selected.id ? { ...publication, ...changes } : publication
    ));
    setDirtyIds(current => new Set(current).add(selected.id));
  }

  async function saveSelected(event?: FormEvent) {
    event?.preventDefault();
    if (!selected) return;
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const result = await adminApi<{ publicacion: Publication }>('/api/publicaciones', token, {
        method: 'POST',
        body: JSON.stringify({
          accion: 'actualizar',
          id: selected.id,
          texto_imagen: selected.texto_imagen,
          color_fondo: selected.color_fondo,
          copy_facebook: selected.copy_facebook,
          estado: selected.estado,
        }),
      });
      setBatch(current => current.map(publication =>
        publication.id === result.publicacion.id ? result.publicacion : publication
      ));
      setDirtyIds(current => {
        const next = new Set(current);
        next.delete(result.publicacion.id);
        return next;
      });
      setNotice('Cambios guardados.');
    } catch (requestError) {
      handleError(requestError);
    } finally {
      setBusy(false);
    }
  }

  async function generateCopy() {
    if (!selected) return;
    setError('');
    setNotice('');
    setGenerating(true);
    try {
      const result = await adminApi<TextResponse>('/api/generar-texto', token, {
        method: 'POST',
        body: JSON.stringify({ tema: selected.copy_facebook || selected.texto_imagen }),
      });
      updateSelected({
        texto_imagen: result.texto_imagen,
        copy_facebook: result.copy_facebook,
      });
      setNotice('Texto generado. Guarda los cambios para conservarlo.');
    } catch (requestError) {
      handleError(requestError);
    } finally {
      setGenerating(false);
    }
  }

  async function changePage(page: number) {
    if (page < 1 || page > 4 || page === historyPage) return;
    setError('');
    setHistoryPage(page);
    try {
      await loadHistory(page);
    } catch (requestError) {
      handleError(requestError);
    }
  }

  async function validateCampaign() {
    if (!window.confirm('Se agendarán las publicaciones aprobadas y se iniciará un lote nuevo de 10 días. ¿Continuar?')) {
      return;
    }
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const result = await adminApi<{ resultado: { aprobadas_agendadas: number } }>(
        '/api/publicaciones',
        token,
        { method: 'POST', body: JSON.stringify({ accion: 'validar_lote' }) }
      );
      await Promise.all([loadBatch(), loadHistory(historyPage)]);
      setNotice(`Lote validado. Se agendaron ${result.resultado.aprobadas_agendadas} publicaciones.`);
    } catch (requestError) {
      handleError(requestError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <a className="admin-brand" href="/" aria-label="Pinturas Diamante, inicio">
          <img src="/img/catalog/LOGO-WEB-DIAMANTE-PNG.png" alt="" />
          <span>Administración</span>
        </a>
        <button className="admin-secondary-button" type="button" onClick={onLogout}>Cerrar sesión</button>
      </header>

      <div className="admin-dashboard-content">
        <section className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">PLANIFICACIÓN EDITORIAL</p>
            <h1>Campañas de Facebook</h1>
            <p>Prepara, revisa y agenda el contenido de los próximos 10 días.</p>
          </div>
          <button
            className="admin-primary-button admin-launch-button"
            type="button"
            onClick={validateCampaign}
            disabled={busy || dirtyIds.size > 0 || batch.length !== 10 || !batch.some(item => item.estado === 'aprobado')}
          >
            🚀 Validar y Lanzar Campaña de 10 Días
          </button>
        </section>

        {error && <p className="admin-error admin-banner-message" role="alert">{error}</p>}
        {notice && <p className="admin-success admin-banner-message" role="status">{notice}</p>}

        <section className="admin-panel">
          <div className="admin-panel-title">
            <div>
              <h2>Lote activo</h2>
              <p>{batch.filter(item => item.estado === 'aprobado').length} de 10 publicaciones aprobadas</p>
            </div>
            {busy && <span className="admin-muted">Actualizando…</span>}
          </div>
          {dirtyIds.size > 0 && (
            <p className="admin-muted">Guarda los cambios pendientes antes de validar la campaña.</p>
          )}

          {batch.length === 0 ? (
            <p className="admin-empty">No hay lote activo. Aplica la migración de Supabase para inicializar los 10 días.</p>
          ) : (
            <div className="admin-workspace">
              <div className="admin-campaign-grid">
                {batch.map(publication => (
                  <button
                    className={`admin-campaign-card${selectedId === publication.id ? ' is-selected' : ''}`}
                    key={publication.id}
                    type="button"
                    onClick={() => setSelectedId(publication.id)}
                  >
                    <ImagePreview token={token} publication={publication} />
                    <span className="admin-card-meta">
                      <strong>Día {publication.dia_campana}</strong>
                      <span className={`admin-status ${publication.estado === 'aprobado' ? 'is-approved' : ''}`}>
                        {publication.estado}
                      </span>
                    </span>
                    <span className="admin-card-text">{publication.texto_imagen}</span>
                  </button>
                ))}
              </div>

              {selected && (
                <form className="admin-editor" onSubmit={saveSelected}>
                  <div className="admin-editor-heading">
                    <div>
                      <p className="admin-eyebrow">EDICIÓN RÁPIDA</p>
                      <h3>Día {selected.dia_campana}</h3>
                    </div>
                    <label className="admin-approval-toggle">
                      <input
                        type="checkbox"
                        checked={selected.estado === 'aprobado'}
                        onChange={event => updateSelected({ estado: event.target.checked ? 'aprobado' : 'borrador' })}
                      />
                      Aprobado
                    </label>
                  </div>

                  <label>
                    Texto para la imagen
                    <input
                      maxLength={120}
                      value={selected.texto_imagen}
                      onChange={event => updateSelected({ texto_imagen: event.target.value })}
                    />
                  </label>
                  <label>
                    Color de fondo
                    <span className="admin-color-input">
                      <input
                        type="color"
                        value={/^#[\da-fA-F]{6}$/.test(selected.color_fondo) ? selected.color_fondo : '#16a34a'}
                        onChange={event => updateSelected({ color_fondo: event.target.value })}
                      />
                      <code>{selected.color_fondo}</code>
                    </span>
                  </label>
                  <label>
                    Copy para Facebook
                    <textarea
                      rows={7}
                      maxLength={5000}
                      value={selected.copy_facebook}
                      onChange={event => updateSelected({ copy_facebook: event.target.value })}
                    />
                  </label>
                  <div className="admin-editor-actions">
                    <button className="admin-secondary-button" type="button" onClick={generateCopy} disabled={generating}>
                      {generating ? 'Redactando…' : '✨ Generar con Gemini'}
                    </button>
                    <button className="admin-primary-button" type="submit" disabled={busy}>
                      Guardar cambios
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>

        <section className="admin-panel admin-history-panel">
          <div className="admin-panel-title">
            <div>
              <h2>Historial permanente</h2>
              <p>Publicaciones archivadas y programadas</p>
            </div>
            <nav className="admin-pagination" aria-label="Paginación del historial">
              {[1, 2, 3, 4].map(page => (
                <button
                  key={page}
                  type="button"
                  className={historyPage === page ? 'is-current' : ''}
                  aria-current={historyPage === page ? 'page' : undefined}
                  onClick={() => changePage(page)}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>

          <div className="admin-table-scroll">
            <table className="admin-history-table">
              <thead>
                <tr>
                  <th>Vista previa</th>
                  <th>Fecha programada</th>
                  <th>Texto de publicación</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {history.map(publication => (
                  <tr key={publication.id}>
                    <td><ImagePreview token={token} publication={publication} /></td>
                    <td>{publication.fecha_programada
                      ? new Date(`${publication.fecha_programada}T12:00:00`).toLocaleDateString('es-MX')
                      : 'Sin fecha'}</td>
                    <td className="admin-history-copy">{publication.copy_facebook}</td>
                    <td><span className={`admin-status ${publication.estado === 'aprobado' ? 'is-approved' : ''}`}>
                      {publication.estado}
                    </span></td>
                  </tr>
                ))}
                {!history.length && (
                  <tr><td className="admin-table-empty" colSpan={4}>No hay publicaciones en esta página.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
