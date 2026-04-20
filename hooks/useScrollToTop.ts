/**
 * Hook para scroll automático al cambiar de ruta
 * Cuando el usuario hace clic en cualquier enlace, la página sube
 * automáticamente al navbar/header
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Hacer scroll al inicio de la página
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Scroll suave
    });
  }, [pathname]); // Se ejecuta cada vez que cambia la ruta
};

export default useScrollToTop;