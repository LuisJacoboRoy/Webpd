/**
 * BreadcrumbSchema Component
 * Genera BreadcrumbList JSON-LD optimizado para CTR
 * Mejora la navegación en Google Search Results
 */

import React, { useMemo } from 'react';
import { useHelmet } from '../hooks/useHelmet';
import { generateBreadcrumbSchema } from '../utils/schemaGenerators';

interface BreadcrumbItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
  ariaLabel?: string;
  showSchema?: boolean; // Control para inyectar JSON-LD
}

/**
 * Componente Breadcrumb con soporte para microformatos
 * 
 * Uso:
 * <BreadcrumbSchema 
 *   items={[
 *     { name: 'Inicio', path: '/' },
 *     { name: 'Catálogo', path: '/catalog' },
 *     { name: 'Automotriz', path: '/catalog/automotriz' }
 *   ]}
 * />
 */
export const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({
  items,
  baseUrl = 'https://pinturasdiamante.com',
  ariaLabel = 'Breadcrumb',
  showSchema = true
}) => {
  // Generar schema JSON-LD
  const breadcrumbSchema = useMemo(() => {
    if (!showSchema) return null;
    
    return generateBreadcrumbSchema(
      items.map((item, index) => ({
        position: index + 1,
        name: item.name,
        url: `${baseUrl}/#${item.path}`
      }))
    );
  }, [items, baseUrl, showSchema]);

  // Inyectar schema si está disponible (requiere hook personalizado)
  // Con Helmet:
  return (
    <nav
      aria-label={ariaLabel}
      className="breadcrumb-container"
      data-testid="breadcrumb-schema"
    >
      <ol className="breadcrumb-list" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, index) => (
          <li
            key={index}
            className="breadcrumb-item"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {index < items.length - 1 ? (
              <>
                <a
                  href={`#${item.path}`}
                  itemProp="item"
                  className="breadcrumb-link"
                  title={`Ir a ${item.name}`}
                >
                  {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                  <span itemProp="name">{item.name}</span>
                </a>
                <span className="breadcrumb-separator" aria-hidden="true"> / </span>
              </>
            ) : (
              <span itemProp="name" className="breadcrumb-current" aria-current="page">
                {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                {item.name}
              </span>
            )}
            <meta itemProp="position" content={String(index + 1)} />
          </li>
        ))}
      </ol>
      
      {/* Inyectar JSON-LD si está disponible */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </nav>
  );
};

export default BreadcrumbSchema;
