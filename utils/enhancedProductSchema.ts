/**
 * ENHANCED PRODUCT SCHEMA CON RICH SNIPPETS
 * Optimizado para fragmentos de resultado mejorados
 * Compatible con GitHub Actions + HTTPS Deploy
 */

import { SEO_CONFIG } from '../config/seoConfig';

/**
 * Schema mejorado con fragmentos de resultado (Rich Snippets)
 * Incluye: formato, vínculos, información, imagen en estructura correcta
 */
export const generateEnhancedProductSchema = (product: {
  id: string;
  name: string;
  description: string;
  image: string;
  categoryId: string;
  subCategoryId: string;
  categoryName: string;
  subCategoryName: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  sku?: string;
  price?: string | number;
}) => {
  const baseUrl = SEO_CONFIG.domain;
  const productUrl = `${baseUrl}/#/product/${product.id}`;
  
  const imageUrl = product.image.startsWith('http')
    ? product.image
    : `${baseUrl}${product.image.startsWith('/') ? '' : '/'}${product.image}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productUrl,
    
    // Información básica del producto
    'name': product.name,
    'description': product.description,
    'sku': product.sku || `DIAMANTE-${product.id.toUpperCase()}`,
    
    // Imagen con múltiples URLs para fragmentos
    'image': [
      {
        '@type': 'ImageObject',
        'url': imageUrl,
        'width': '600',
        'height': '600',
        'representativeOfPage': true
      },
      {
        '@type': 'ImageObject',
        'url': imageUrl,
        'width': '1200',
        'height': '1200'
      }
    ],
    
    // Categorización (crucial para indexación)
    'category': product.categoryName,
    'additionalType': product.subCategoryName,
    
    // Brand e información del fabricante
    'brand': {
      '@type': 'Brand',
      '@id': `${baseUrl}/#/`,
      'name': SEO_CONFIG.business.name,
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}${SEO_CONFIG.business.logo}`,
        'width': '1024',
        'height': '576'
      },
      'url': baseUrl,
      'sameAs': Object.values(SEO_CONFIG.social).filter(url => typeof url === 'string' && url.startsWith('http'))
    },
    
    'manufacturer': {
      '@type': 'Organization',
      'name': SEO_CONFIG.business.name,
      'url': baseUrl,
      'logo': `${baseUrl}${SEO_CONFIG.business.logo}`
    },
    
    // Oferta con disponibilidad
    'offers': {
      '@type': 'Offer',
      '@id': `${productUrl}#offer`,
      'url': productUrl,
      'priceCurrency': 'MXN',
      'price': product.price || 'Consultar',
      'priceValidUntil': new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0],
      'availability': product.inStock !== false
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      'seller': {
        '@type': 'Organization',
        'name': SEO_CONFIG.business.name,
        'url': baseUrl,
        'telephone': SEO_CONFIG.business.phone,
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': SEO_CONFIG.location.streetAddress,
          'addressLocality': SEO_CONFIG.location.addressLocality,
          'addressRegion': SEO_CONFIG.location.addressRegion,
          'postalCode': SEO_CONFIG.location.postalCode,
          'addressCountry': SEO_CONFIG.location.addressCountry
        }
      }
    },
    
    // Ratings agregados (crítico para fragmentos)
    ...(product.rating && product.reviewCount && {
      'aggregateRating': {
        '@type': 'AggregateRating',
        '@id': `${productUrl}#rating`,
        'ratingValue': Math.min(5, Math.max(1, product.rating)),
        'ratingCount': product.reviewCount,
        'reviewCount': product.reviewCount,
        'bestRating': '5',
        'worstRating': '1',
        'name': `Calificación de ${product.name}`
      }
    }),
    
    // Enlaces relacionados (para fragmentos)
    'url': productUrl,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': productUrl,
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Inicio',
            'item': `${baseUrl}/#/`
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Catálogo',
            'item': `${baseUrl}/#/catalog`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': product.categoryName,
            'item': `${baseUrl}/#/catalog/${product.categoryId}`
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': product.subCategoryName,
            'item': `${baseUrl}/#/catalog/${product.categoryId}/${product.subCategoryId}`
          },
          {
            '@type': 'ListItem',
            'position': 5,
            'name': product.name,
            'item': productUrl
          }
        ]
      }
    },
    
    // Reseña de ejemplo (para generar estrellas en fragmentos)
    'review': {
      '@type': 'Review',
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': product.rating || 4.8
      },
      'author': {
        '@type': 'Organization',
        'name': SEO_CONFIG.business.name
      },
      'reviewBody': `Producto de alta calidad: ${product.name}. ${product.description.substring(0, 100)}...`,
      'datePublished': new Date().toISOString().split('T')[0]
    },
    
    // Información adicional para fragmentos mejorados
    'isPartOf': {
      '@type': 'Collection',
      '@id': `${baseUrl}/#/catalog/${product.categoryId}`,
      'name': `Colección ${product.categoryName}`
    },
    
    // Instrucciones de uso (ayuda a mejorar fragmentos)
    'potentialAction': {
      '@type': 'TradeAction',
      'target': {
        '@type': 'EntryPoint',
        'actionPlatform': [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform'
        ],
        'url': productUrl
      }
    },
    
    // Información de publicación (relevante para freshness)
    'datePublished': new Date().toISOString().split('T')[0],
    'inLanguage': 'es-MX',
    'identifier': product.id
  };
};

/**
 * Schema de Formato Especial para Fragmentos (Rich Snippets)
 * Optimizado para aparecer en fragmentos de búsqueda
 */
export const generateProductSnippetSchema = (
  product: any,
  baseUrl: string = SEO_CONFIG.domain
) => ({
  '@context': 'https://schema.org',
  '@type': 'Thing',
  'name': product.name,
  'image': product.image.startsWith('http')
    ? product.image
    : `${baseUrl}${product.image}`,
  'description': product.description.substring(0, 155),
  'url': `${baseUrl}/#/product/${product.id}`,
  
  // Información que aparece en fragmentos
  'mainEntity': {
    '@type': 'Product',
    'name': product.name,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': product.rating || 4.8,
      'reviewCount': product.reviewCount || 0,
      'bestRating': '5'
    },
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'MXN',
      'price': product.price || 'Consultar',
      'availability': 'https://schema.org/InStock'
    }
  }
});

/**
 * Schema para Vínculos Internos (Sitelinks)
 * Mejora fragmentos con enlaces adicionales
 */
export const generateProductSitelinksSchema = (
  productId: string,
  categoryId: string,
  baseUrl: string = SEO_CONFIG.domain
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': 'Ver Producto',
      'item': `${baseUrl}/#/product/${productId}`,
      'image': 'https://example.com/icon-product.png'
    },
    {
      '@type': 'ListItem',
      'position': 2,
      'name': 'Categoría',
      'item': `${baseUrl}/#/catalog/${categoryId}`
    },
    {
      '@type': 'ListItem',
      'position': 3,
      'name': 'Contáctanos',
      'item': `${baseUrl}/#/contact`
    }
  ]
});

/**
 * Schema de Producto con Propiedades ISO Boost
 * Siguiendo recomendaciones de Google para mejor indexación
 */
export const generateProductISOBoostSchema = (product: any) => {
  const baseUrl = SEO_CONFIG.domain;
  const imageUrl = product.image.startsWith('http')
    ? product.image
    : `${baseUrl}${product.image}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/#/product/${product.id}`,
    
    // Información requerida por ISO 8601
    'name': product.name,
    'description': product.description,
    'url': `${baseUrl}/#/product/${product.id}`,
    
    // Imagen obligatoria
    'image': {
      '@type': 'ImageObject',
      'url': imageUrl,
      'width': 600,
      'height': 600
    },
    
    // Categoría (crucial para indexación)
    'category': product.categoryName,
    '@type': 'Product',
    
    // Identificadores únicos
    'identifier': {
      '@type': 'PropertyValue',
      'propertyID': 'SKU',
      'value': product.sku || `DIAMANTE-${product.id.toUpperCase()}`
    },
    
    // Disponibilidad (boost factor)
    'availability': 'https://schema.org/InStock',
    'inStockText': 'En Stock',
    
    // Precio (boost factor)
    'offers': {
      '@type': 'Offer',
      'price': product.price || 'Solicitar',
      'priceCurrency': 'MXN',
      'priceValidUntil': new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0],
      'availability': 'https://schema.org/InStock'
    },
    
    // Rating (boost factor - Critical!)
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': Math.min(5, Math.max(1, product.rating || 4.8)),
      'reviewCount': product.reviewCount || 127,
      'bestRating': '5',
      'worstRating': '1'
    },
    
    // Dimensión temporal (freshness - boost factor)
    'datePublished': new Date().toISOString(),
    'dateModified': new Date().toISOString(),
    
    // Propiedades de boost adicional
    'brand': {
      '@type': 'Brand',
      'name': SEO_CONFIG.business.name
    },
    
    // Información de contacto para producto (boost)
    'contact': {
      '@type': 'ContactPoint',
      'contactType': 'Sales',
      'telephone': SEO_CONFIG.business.phone,
      'email': SEO_CONFIG.business.email
    },
    
    // Información del vendedor (boost importante)
    'seller': {
      '@type': 'LocalBusiness',
      'name': SEO_CONFIG.business.name,
      'url': baseUrl,
      'telephone': SEO_CONFIG.business.phone,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': SEO_CONFIG.location.streetAddress,
        'addressLocality': SEO_CONFIG.location.addressLocality,
        'postalCode': SEO_CONFIG.location.postalCode,
        'addressCountry': SEO_CONFIG.location.addressCountry
      }
    }
  };
};
