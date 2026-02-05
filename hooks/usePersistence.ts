/**
 * Hook para gestionar favicons dinámicamente
 * Útil para cambiar el favicon basado en estado de la app
 */

import { useEffect } from 'react';

export const useFavicon = (faviconPath: string = '/favicon.svg') => {
  useEffect(() => {
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = faviconPath;
    }
  }, [faviconPath]);
};

/**
 * Hook para gestionar la persistencia del carrito en localStorage
 * Sincroniza automáticamente los cambios
 */

import { useEffect } from 'react';

const CART_STORAGE_KEY = 'diamante_cart';

export const useCartPersistence = (cart: any[], onRestore?: (cart: any[]) => void) => {
  // Guardar carrito cuando cambia
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.warn('Error al guardar carrito:', error);
    }
  }, [cart]);

  // Restaurar carrito al montar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart && onRestore) {
        const parsed = JSON.parse(savedCart);
        onRestore(parsed);
      }
    } catch (error) {
      console.warn('Error al restaurar carrito:', error);
    }
  }, [onRestore]);
};

/**
 * Hook para notificar cuando el usuario intenta cerrar la página con carrito
 */

export const useBeforeUnloadWarning = (hasItems: boolean) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasItems) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasItems]);
};

/**
 * Hook para detectar cambios de conexión (online/offline)
 */

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline ?? navigator.onLine;
};
