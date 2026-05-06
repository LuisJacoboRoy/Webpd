import React, { useEffect } from 'react';

interface JsonLdSchema {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

interface JsonLdProps {
  data: JsonLdSchema | JsonLdSchema[];
  id?: string;
}

/**
 * Componente JsonLd - Inyecta structured data (JSON-LD) de forma compatible con SSR/CSR
 * 
 * Uso:
 * <JsonLd 
 *   data={{
 *     '@context': 'https://schema.org',
 *     '@type': 'Organization',
 *     name: 'Pinturas Diamante',
 *     ...
 *   }}
 *   id="org-schema"
 * />
 * 
 * - Compatible con Server-Side Rendering (SSR)
 * - Compatible con Client-Side Rendering (CSR)
 * - Soporta múltiples schemas simultáneamente
 * - Previene duplicados usando IDs únicos
 */
export const JsonLd: React.FC<JsonLdProps> = ({ data, id = 'jsonld-schema' }) => {
  // Para SSR: Renderizar como componente para que se incluya en el HTML inicial
  if (typeof window === 'undefined') {
    return (
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        suppressHydrationWarning
      />
    );
  }

  // Para CSR: Usar efecto para inyectar el script en el DOM
  useEffect(() => {
    if (!data) return;

    // Generar ID único basado en el type si no se proporciona
    const scriptId = `${id}-${Array.isArray(data) ? 'array' : data['@type']}`;
    
    // Buscar si ya existe un script con este ID para evitar duplicados
    let scriptElement = document.querySelector(
      `script[type="application/ld+json"][data-jsonld-id="${scriptId}"]`
    ) as HTMLScriptElement | null;
    
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.type = 'application/ld+json';
      scriptElement.setAttribute('data-jsonld-id', scriptId);
      // Agregar al head (Chrome recomienda que esté en head para mejor rendimiento SEO)
      document.head.appendChild(scriptElement);
    }

    // Establecer el contenido del script
    scriptElement.textContent = JSON.stringify(data);

    // Cleanup: Remover el script al desmontar el componente (opcional - comentado por defecto)
    // No remover por defecto para mantener el schema disponible
    return () => {
      // Si quieres remover automáticamente, descomenta:
      // if (scriptElement?.parentNode) {
      //   scriptElement.parentNode.removeChild(scriptElement);
      // }
    };
  }, [data, id]);

  // Para CSR no retornamos nada en el render (el script se inyecta en useEffect)
  return null;
};

export default JsonLd;
