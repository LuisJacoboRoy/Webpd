import { useEffect } from 'react';

interface JsonLdSchema {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export const useJsonLd = (schema: JsonLdSchema) => {
  useEffect(() => {
    if (!schema) return;

    const staticRoute = document.querySelector('meta[name="static-seo-route"]')?.getAttribute('content');
    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    const matchesStaticRoute = staticRoute && (
      currentPath === staticRoute ||
      currentPath.endsWith(staticRoute) ||
      (staticRoute === '/' && currentPath.endsWith('/Webpd'))
    );

    if (matchesStaticRoute) return;
    if (staticRoute) {
      document.querySelectorAll('script[data-static-seo="true"]').forEach(script => script.remove());
      document.querySelector('meta[name="static-seo-route"]')?.remove();
    }

    // Crear o actualizar el script JSON-LD
    let scriptElement = document.querySelector('script[type="application/ld+json"][data-type="dynamic"]') as HTMLScriptElement;
    
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.type = 'application/ld+json';
      scriptElement.setAttribute('data-type', 'dynamic');
      document.head.appendChild(scriptElement);
    }

    scriptElement.textContent = JSON.stringify(schema);

    return () => {
      // Limpiar al desmontar
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, [schema]);
};
