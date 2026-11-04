import React, { FormEvent, useState } from 'react';
import { adminApi } from './adminApi';

type Props = {
  token: string | null;
  forceChange: boolean;
  onAuthenticated: (token: string, forceChange: boolean) => void;
};

type AuthResponse = {
  token: string;
  forzarCambio: boolean;
};

const AdminLogin: React.FC<Props> = ({ token, forceChange, onAuthenticated }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [setupSecret, setSetupSecret] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      if (forceChange) {
        if (newPassword !== confirmPassword) {
          setError('Las contraseñas nuevas no coinciden.');
          return;
        }
        const result = await adminApi<AuthResponse>('/api/auth', token || undefined, {
          method: 'POST',
          body: JSON.stringify({ action: 'change-password', newPassword }),
        });
        onAuthenticated(result.token, false);
      } else {
        const result = await adminApi<AuthResponse>('/api/auth', undefined, {
          method: 'POST',
          body: JSON.stringify({ action: 'login', usuario: username, password, setupSecret }),
        });
        onAuthenticated(result.token, result.forzarCambio);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <img
          className="admin-login-logo"
          src="/img/catalog/LOGO-WEB-DIAMANTE-PNG.png"
          alt="Pinturas Diamante"
        />
        <p className="admin-eyebrow">PINTURAS DIAMANTE</p>
        <h1 id="admin-login-title">{forceChange ? 'Actualiza tu contraseña' : 'Panel administrativo'}</h1>
        <p className="admin-login-description">
          {forceChange
            ? 'Por seguridad, establece una contraseña nueva para continuar.'
            : 'Inicia sesión para administrar tus publicaciones.'}
        </p>

        <form className="admin-login-form" onSubmit={submit}>
          {!forceChange && (
            <label>
              Usuario
              <input
                autoComplete="username"
                value={username}
                onChange={event => setUsername(event.target.value)}
                required
              />
            </label>
          )}
          {!forceChange && (
            <label>
              Contraseña
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                required
              />
            </label>
          )}
          {!forceChange && (
            <label>
              Clave de primer acceso (solo si la cuenta aún no existe)
              <input
                type="password"
                autoComplete="off"
                value={setupSecret}
                onChange={event => setSetupSecret(event.target.value)}
              />
            </label>
          )}
          {forceChange && (
            <>
              <label>
                Nueva contraseña
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  value={newPassword}
                  onChange={event => setNewPassword(event.target.value)}
                  required
                />
              </label>
              <label>
                Confirma la nueva contraseña
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  required
                />
              </label>
              <small>Usa al menos 12 caracteres.</small>
            </>
          )}

          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="admin-primary-button" type="submit" disabled={busy}>
            {busy ? 'Procesando…' : forceChange ? 'Guardar contraseña' : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default AdminLogin;
