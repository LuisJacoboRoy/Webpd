import { useEffect } from 'react';

interface JsonLdSchema {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export const useJsonLd = (schema: JsonLdSchema) => {
  useEffect(() => {
    if (!schema) return;

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
