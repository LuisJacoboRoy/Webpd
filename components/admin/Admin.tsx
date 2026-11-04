import React, { useCallback, useEffect, useState } from 'react';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';
import { AdminApiError, adminApi } from './adminApi';
import './admin.css';

type AuthState = 'checking' | 'signed-out' | 'signed-in' | 'password-change';

const Admin: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const storedToken = window.localStorage.getItem('webpd-admin-token');
    if (!storedToken) {
      setAuthState('signed-out');
      return;
    }

    adminApi<{ forzarCambio: boolean }>('/api/auth', storedToken)
      .then(result => {
        setToken(storedToken);
        setAuthState(result.forzarCambio ? 'password-change' : 'signed-in');
      })
      .catch(error => {
        window.localStorage.removeItem('webpd-admin-token');
        setAuthError(error instanceof AdminApiError && error.status === 500
          ? error.message
          : '');
        setAuthState('signed-out');
      });
  }, []);

  const authenticate = useCallback((nextToken: string, forceChange: boolean) => {
    window.localStorage.setItem('webpd-admin-token', nextToken);
    setToken(nextToken);
    setAuthState(forceChange ? 'password-change' : 'signed-in');
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem('webpd-admin-token');
    setToken(null);
    setAuthState('signed-out');
  }, []);

  if (authState === 'checking') {
    return <main className="admin-login-page"><p className="admin-loading">Verificando sesión…</p></main>;
  }
  if (authState === 'signed-out' || authState === 'password-change') {
    return (
      <>
        {authError && <p className="admin-error admin-auth-error" role="alert">{authError}</p>}
        <AdminLogin
          token={token}
          forceChange={authState === 'password-change'}
          onAuthenticated={authenticate}
        />
      </>
    );
  }
  if (!token) return null;

  return (
    <AdminDashboard
      token={token}
      onLogout={logout}
      onSessionExpired={logout}
    />
  );
};

export default Admin;
