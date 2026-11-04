import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, AdminApiError, Publication } from './adminApi';

type Props = {
  token: string;
  onLogout: () => void;
  onSessionExpired: () => void;
};

type PublicationsResponse = { publicaciones: Publication[] };
type TextResponse = { texto_imagen: string; copy_facebook: string };
type EditorialSettings = { custom_instructions: string; updated_at: string };
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
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageGenerationError, setImageGenerationError] = useState('');
  const [imageGenerationNotice, setImageGenerationNotice] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [editorialInstructions, setEditorialInstructions] = useState('');
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsNotice, setSettingsNotice] = useState('');

  const selected = useMemo(
    () => batch.find(publication => publication.id === selectedId) || null,
    [batch, selectedId]
  );

  useEffect(() => {
    if (!selected) return;
    setImagePrompt(
      `Fotografía publicitaria realista en Oaxaca sobre ${(selected.copy_facebook || selected.texto_imagen).slice(0, 1400)}. Escena auténtica de aplicación de pintura, composición profesional y luz natural.`
    );
    setImageGenerationError('');
    setImageGenerationNotice('');
    setGeneratedImageUrl('');
  }, [selected?.id]);

  useEffect(() => () => {
    if (generatedImageUrl) URL.revokeObjectURL(generatedImageUrl);
  }, [generatedImageUrl]);

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

  useEffect(() => {
    let active = true;
    adminApi<{ settings: EditorialSettings }>('/api/admin-settings', token)
      .then(({ settings }) => {
        if (!active) return;
        setEditorialInstructions(settings.custom_instructions);
        setSettingsLoaded(true);
      })
      .catch(requestError => {
        if (!active) return;
        if (requestError instanceof AdminApiError && requestError.status === 401) {
          onSessionExpired();
          return;
        }
        setSettingsError(requestError instanceof Error
          ? requestError.message
          : 'No se pudo cargar la configuración editorial.');
      })
      .finally(() => {
        if (active) setSettingsLoading(false);
      });
    return () => { active = false; };
  }, [token, onSessionExpired]);

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

  async function generateImage(event: FormEvent) {
    event.preventDefault();
    setImageGenerationError('');
    setImageGenerationNotice('');
    setGeneratingImage(true);
    try {
      const response = await fetch('/api/generar-fondo', {
        method: 'POST',
        headers: {
          Authorization: `******`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        if (response.status === 401) {
          onSessionExpired();
          return;
        }
        throw new Error(typeof payload.error === 'string'
          ? payload.error
          : 'No se pudo generar la imagen');
      }

      const imageBlob = await response.blob();
      if (!imageBlob.type.startsWith('image/')) {
        throw new Error('Gemini no devolvió un archivo de imagen válido');
      }
      setGeneratedImageUrl(URL.createObjectURL(imageBlob));
      setImageGenerationNotice(`Imagen generada con ${response.headers.get('X-Image-Model') || 'Gemini'}.`);
    } catch (requestError) {
      setImageGenerationError(requestError instanceof Error
        ? requestError.message
        : 'No se pudo generar la imagen');
    } finally {
      setGeneratingImage(false);
    }
  }

  async function saveEditorialSettings(event: FormEvent) {
    event.preventDefault();
    setSettingsError('');
    setSettingsNotice('');
    setSettingsSaving(true);
    try {
      const result = await adminApi<{ settings: EditorialSettings }>('/api/admin-settings', token, {
        method: 'POST',
        body: JSON.stringify({ custom_instructions: editorialInstructions }),
      });
      setEditorialInstructions(result.settings.custom_instructions);
      setSettingsDirty(false);
      setSettingsNotice('Instrucciones guardadas. Se aplicarán a las próximas redacciones.');
    } catch (requestError) {
      if (requestError instanceof AdminApiError && requestError.status === 401) {
        onSessionExpired();
      } else {
        setSettingsError(requestError instanceof Error
          ? requestError.message
          : 'No se pudo guardar la configuración editorial.');
      }
    } finally {
      setSettingsSaving(false);
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

        <section className="admin-panel" aria-labelledby="image-generator-title">
          <div className="admin-panel-title">
            <div>
              <h2 id="image-generator-title">Generador de imágenes con Gemini</h2>
              <p>Genera una escena visual desde una descripción. Cada generación consume cuota del proyecto de Google.</p>
            </div>
          </div>
          <form className="admin-editor" onSubmit={generateImage}>
            <label htmlFor="image-generation-prompt">
              Describe la imagen
              <textarea
                id="image-generation-prompt"
                name="image_prompt"
                rows={4}
                maxLength={2000}
                required
                value={imagePrompt}
                onChange={event => setImagePrompt(event.target.value)}
                disabled={!selected || generatingImage}
              />
            </label>
            <p className="admin-muted">
              La clave se usa únicamente en el servidor. Esta primera versión genera una imagen independiente: no la guarda en Supabase ni incorpora automáticamente el PNG del catálogo.
            </p>
            {imageGenerationError && <p className="admin-error" role="alert">{imageGenerationError}</p>}
            {imageGenerationNotice && <p className="admin-success" role="status">{imageGenerationNotice}</p>}
            <div className="admin-editor-actions">
              <button
                className="admin-primary-button"
                type="submit"
                disabled={!selected || !imagePrompt.trim() || generatingImage}
              >
                {generatingImage ? 'Generando imagen…' : 'Generar imagen con Gemini'}
              </button>
              {generatedImageUrl && (
                <a
                  className="admin-secondary-button"
                  href={generatedImageUrl}
                  download={`pinturas-diamante-gemini-${selected?.id || 'imagen'}.png`}
                >
                  Descargar imagen
                </a>
              )}
            </div>
            {generatedImageUrl && (
              <figure className="admin-generated-image">
                <img src={generatedImageUrl} alt="Imagen generada por Gemini para revisión" />
                <figcaption>Vista previa generada. Revísala antes de usarla en una publicación.</figcaption>
              </figure>
            )}
          </form>
        </section>

        <section className="admin-panel" aria-labelledby="editorial-settings-title">
          <div className="admin-panel-title">
            <div>
              <h2 id="editorial-settings-title">Instrucciones de Gemini</h2>
              <p>Define el tono y las pautas permanentes para redactar textos.</p>
            </div>
            {settingsLoading && <span className="admin-muted">Cargando…</span>}
          </div>
          {settingsError && <p className="admin-error" role="alert">{settingsError}</p>}
          {settingsNotice && <p className="admin-success" role="status">{settingsNotice}</p>}
          <form className="admin-editor" onSubmit={saveEditorialSettings}>
            <label htmlFor="editorial-instructions">
              Instrucciones adicionales
              <textarea
                id="editorial-instructions"
                name="custom_instructions"
                rows={8}
                maxLength={8000}
                aria-describedby="editorial-instructions-help editorial-instructions-count"
                value={editorialInstructions}
                onChange={event => {
                  setEditorialInstructions(event.target.value);
                  setSettingsDirty(true);
                  setSettingsNotice('');
                }}
                disabled={!settingsLoaded || settingsSaving}
              />
            </label>
            <div className="admin-panel-title">
              <p id="editorial-instructions-help">
                Se combina con las reglas fijas de formato y veracidad. Por ahora afecta el texto generado; no activa la selección de productos, imágenes, Stories ni publicaciones web o Meta.
              </p>
              <span id="editorial-instructions-count" className="admin-muted">
                {editorialInstructions.length}/8000
              </span>
            </div>
            <div className="admin-editor-actions">
              <button
                className="admin-secondary-button"
                type="button"
                onClick={() => {
                  setEditorialInstructions('');
                  setSettingsDirty(true);
                  setSettingsNotice('');
                }}
                disabled={!settingsLoaded || settingsSaving || editorialInstructions.length === 0}
              >
                Quitar instrucciones adicionales
              </button>
              <button
                className="admin-primary-button"
                type="submit"
                disabled={!settingsLoaded || settingsSaving || !settingsDirty}
              >
                {settingsSaving ? 'Guardando…' : 'Guardar instrucciones'}
              </button>
            </div>
          </form>
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
