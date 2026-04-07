/**
 * ENHANCED BREADCRUMB SCHEMA CON ÁRBOL HTML
 * Estructura de navegación mejorada con <ul><li>
 * Compatible con microformatos y accesibilidad
 */

import React, { useMemo } from 'react';
import { useHelmet } from '../hooks/useHelmet';
import { generateBreadcrumbSchema } from '../utils/schemaGenerators';

interface BreadcrumbItem {
  name: string;
  path?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  ariaLabel?: string;
}

interface EnhancedBreadcrumbProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
  showSchema?: boolean;
  compactMode?: boolean; // Para mostrar solo últimos 3 items en mobile
  className?: string;
}

/**
 * BreadcrumbList ENHANCED con estructura <ul><li>
 * - Semántica correcta
 * - Microformatos JSON-LD
 * - Accesibilidad ARIA
 * - Responsive para móvil
 */
export const EnhancedBreadcrumbList: React.FC<EnhancedBreadcrumbProps> = ({
  items,
  baseUrl = 'https://pinturasdiamante.com',
  showSchema = true,
  compactMode = false,
  className = ''
}) => {
  // Generar schema JSON-LD
  const breadcrumbSchema = useMemo(() => {
    if (!showSchema || !items.length) return null;

    return generateBreadcrumbSchema(
      items
        .filter(item => item.path)
        .map((item, index) => ({
          position: index + 1,
          name: item.name,
          url: `${baseUrl}/#${item.path}`
        }))
    );
  }, [items, baseUrl, showSchema]);

  // En mobile, mostrar solo últimos 3 items
  const displayItems = useMemo(() => {
    if (!compactMode || typeof window === 'undefined') return items;
    if (window.innerWidth >= 768) return items;
    return items.slice(-3);
  }, [items, compactMode]);

  return (
    <>
      {/* Schema JSON-LD */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Estructura HTML Semántica */}
      <nav
        aria-label="Breadcrumb Navigation"
        className={`breadcrumb-nav ${className}`}
        data-testid="enhanced-breadcrumb"
        role="navigation"
      >
        <ol
          className="breadcrumb-list"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
          role="list"
        >
          {displayItems.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="breadcrumb-item"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              role="listitem"
              aria-current={item.isActive ? 'page' : undefined}
            >
              {/* Posición en schema */}
              <meta itemProp="position" content={String(index + 1)} />

              {/* Item anterior (con enlace) */}
              {index < displayItems.length - 1 && item.path ? (
                <>
                  <a
                    href={`#${item.path}`}
                    itemProp="item"
                    className="breadcrumb-link"
                    aria-label={item.ariaLabel || `Ir a ${item.name}`}
                    title={`Navegar a ${item.name}`}
                  >
                    {item.icon && (
                      <span className="breadcrumb-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span itemProp="name" className="breadcrumb-text">
                      {item.name}
                    </span>
                  </a>
                  <span className="breadcrumb-separator" aria-hidden="true">
                    {' / '}
                  </span>
                </>
              ) : (
                /* Item actual (sin enlace) */
                <span
                  itemProp="name"
                  className="breadcrumb-current"
                  aria-current="page"
                >
                  {item.icon && (
                    <span className="breadcrumb-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="breadcrumb-text">{item.name}</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* CSS Estilos */}
      <style>{`
        .breadcrumb-nav {
          margin: 1rem 0;
          padding: 0.75rem 1rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
          border: 1px solid #e5e7eb;
        }

        .breadcrumb-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.25rem;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .breadcrumb-link {
          color: #2563eb;
          text-decoration: none;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .breadcrumb-link:hover {
          background-color: #dbeafe;
          color: #1d4ed8;
          text-decoration: underline;
        }

        .breadcrumb-link:focus {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }

        .breadcrumb-current {
          color: #4b5563;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
        }

        .breadcrumb-separator {
          color: #9ca3af;
          margin: 0 0.25rem;
        }

        .breadcrumb-icon {
          font-size: 0.875rem;
          display: inline-flex;
          align-items: center;
        }

        .breadcrumb-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .breadcrumb-nav {
            padding: 0.5rem;
            margin: 0.5rem 0;
          }

          .breadcrumb-list {
            gap: 0.125rem;
            font-size: 0.875rem;
          }

          .breadcrumb-text {
            max-width: 100px;
          }

          .breadcrumb-separator {
            margin: 0 0.125rem;
          }
        }

        /* Accesibilidad - Focus visible */
        .breadcrumb-link:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }

        /* Print styles */
        @media print {
          .breadcrumb-nav {
            border: none;
            background-color: transparent;
            padding: 0;
          }
        }
      `}</style>
    </>
  );
};

/**
 * Hook para generar breadcrumbs desde categorías
 */
export const useBreadcrumbsFromRoute = (
  categoryId?: string,
  subCategoryId?: string,
  productName?: string
) => {
  return useMemo(() => {
    const items: BreadcrumbItem[] = [
      {
        name: '🏠 Inicio',
        path: '/',
        ariaLabel: 'Ir a página principal'
      },
      {
        name: '📋 Catálogo',
        path: '/catalog',
        ariaLabel: 'Ver catálogo completo'
      }
    ];

    if (categoryId) {
      items.push({
        name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
        path: `/catalog/${categoryId}`,
        ariaLabel: `Ver categoría ${categoryId}`
      });
    }

    if (subCategoryId) {
      items.push({
        name: subCategoryId
          .replace(/-/g, ' ')
          .charAt(0)
          .toUpperCase() +
          subCategoryId.replace(/-/g, ' ').slice(1),
        path: `/catalog/${categoryId}/${subCategoryId}`,
        ariaLabel: `Ver subcategoría`
      });
    }

    if (productName) {
      items.push({
        name: productName,
        isActive: true,
        ariaLabel: 'Producto actual'
      });
    }

    return items;
  }, [categoryId, subCategoryId, productName]);
};

export default EnhancedBreadcrumbList;
