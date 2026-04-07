/**
 * OrganizationSchema Hook
 * Inyecta el Schema de Organization/LocalBusiness en el <head>
 * Se debe ejecutar en la página principal para máxima indexación
 */

import { useEffect } from 'react';
import { generateOrganizationSchema } from '../utils/schemaGenerators';

export const useOrganizationSchema = () => {
  useEffect(() => {
    // Crear script si no existe
    let scriptElement = document.querySelector(
      'script[type="application/ld+json"][data-schema-type="organization"]'
    ) as HTMLScriptElement;

    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.type = 'application/ld+json';
      scriptElement.setAttribute('data-schema-type', 'organization');
      document.head.appendChild(scriptElement);
    }

    const schema = generateOrganizationSchema();
    scriptElement.textContent = JSON.stringify(schema);

    return () => {
      // Cleanup opcional - comentado para mantener el schema
      // if (scriptElement?.parentNode) {
      //   scriptElement.parentNode.removeChild(scriptElement);
      // }
    };
  }, []);
};

/**
 * Alternativa: Inyección en tiempo de compilación para Helmet
 * Retorna el componente Helmet con la schema
 */
import { Helmet } from '@dr.pogodin/react-helmet';

export const OrganizationSchemaHelmet = () => {
  const schema = generateOrganizationSchema();

  return (
    <Helmet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </Helmet>
  );
};

export default useOrganizationSchema;
