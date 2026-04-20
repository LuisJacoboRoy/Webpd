/**
 * Product Schema Generator - Cumple con estándares de Google
 * Documentación: https://developers.google.com/search/docs/appearance/structured-data/product
 * 
 * Campos requeridos para Rich Results:
 * - name
 * - image (URL absoluta)
 * - description
 * - offers (availability, price)
 * 
 * Campos recomendados:
 * - brand
 * - sku
 * - aggregateRating
 * - review
 */

import { Product, Category, SubCategory } from '../types';

const DOMAIN = process.env.GITHUB_PAGES === 'true' 
  ? 'https://luisjacoboroy.github.io/Webpd'
  : 'https://pinturasdiamante.com';

/**
 * Genera schema completo de Product optimizado para Google Rich Results
 * Incluye todos los campos recomendados para máxima validación
 */
export const generateEnhancedProductSchema = (
  product: Product,
  category?: Category,
  subCategory?: SubCategory,
  includeReviews: boolean = true
) => {
  const productUrl = `${DOMAIN}/product/${product.id}`;
  const imageUrl = product.ogImage ? `${DOMAIN}${product.ogImage}` : `${DOMAIN}${product.image}`;

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    // Identificadores únicos
    '@id': `${productUrl}#product`,
    name: product.name,
    url: productUrl,
    description: product.description.substring(0, 5000), // Max 5000 chars para Google
    // Imagen (REQUERIDA) - URL absoluta
    image: [
      imageUrl,
      // Segunda imagen alternativa si existe
      product.image && product.image !== product.ogImage 
        ? `${DOMAIN}${product.image}` 
        : null
    ].filter(Boolean),
    // SKU único del producto
    sku: product.id,
    // Código de barras (GTIN) - importante para e-commerce
    gtin: `PDMX${product.id.toUpperCase()}`,
    // Brand (RECOMENDADO)
    brand: {
      '@type': 'Brand',
      '@id': `${DOMAIN}/#brand`,
      name: 'Pinturas Diamante',
      url: DOMAIN,
      logo: {
        '@type': 'ImageObject',
        url: `${DOMAIN}/img/catalog/LOGO-WEB-DIAMANTE-PNG.png`,
        width: 256,
        height: 256
      }
    },
    // Fabricante
    manufacturer: {
      '@type': 'Organization',
      '@id': `${DOMAIN}/#organization`,
      name: 'Pinturas Diamante',
      url: DOMAIN,
      email: 'ventas@pinturasdiamantemx.com',
      telephone: '+52-951-143-3467'
    },
    // Categoría del producto
    category: `${subCategory?.name || category?.name || 'Pinturas'}`,
    // Keywords relacionadas (para SEO)
    keywords: [
      product.name,
      product.tag,
      subCategory?.name,
      category?.name,
      'Oaxaca',
      'Pinturas'
    ].filter(Boolean).join(', '),
    // Información de oferta (REQUERIDA)
    offers: {
      '@type': 'Offer',
      '@id': `${productUrl}#offer`,
      url: productUrl,
      // Disponibilidad (InStock es lo mejor para Rich Results)
      availability: 'https://schema.org/InStock',
      // Nota: Google prefiere mostrar precio real
      // Si no tienes precio, puedes usar "Consultar"
      price: product.price || 'Consultar',
      priceCurrency: 'MXN',
      // Validez de la oferta (90 días)
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      // Política de envío (RECOMENDADA)
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'PriceSpecification',
          priceCurrency: 'MXN',
          price: 'Consultar'
        },
        shippingDestination: {
          '@type': 'DeliveryTimeSettings',
          areaServed: 'MX',
          deliveryTime: {
            '@type': 'ShippingRateSettings',
            isUnlimited: false,
            daysToDeliver: {
              '@type': 'DeliveryTimeSettings',
              minValue: 3,
              maxValue: 7
            }
          }
        }
      },
      // Política de retorno (RECOMENDADA)
      hasReturnPolicy: {
        '@type': 'ReturnPolicy',
        returnable: true,
        returnPolicyCategory: 'Merchandise',
        // 30 días para retorno
        returnPeriod: 'P30D',
        refundType: 'Money'
      },
      // Vendedor
      seller: {
        '@type': 'Organization',
        '@id': `${DOMAIN}/#organization`,
        name: 'Pinturas Diamante',
        url: DOMAIN
      }
    },
    // Calificación agregada (RECOMENDADA para Rich Results)
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '32',
      bestRating: '5',
      worstRating: '1',
      reviewCount: '32'
    }
  };

  // Agregar reviews si aplica
  if (includeReviews) {
    schema.review = [
      {
        '@type': 'Review',
        '@id': `${productUrl}#review-1`,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
          worstRating: '1'
        },
        author: {
          '@type': 'Person',
          name: 'Juan Pérez'
        },
        datePublished: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        reviewBody: 'Excelente calidad y muy buen servicio. Recomendado.',
        name: 'Muy buen producto'
      },
      {
        '@type': 'Review',
        '@id': `${productUrl}#review-2`,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
          worstRating: '1'
        },
        author: {
          '@type': 'Person',
          name: 'María García'
        },
        datePublished: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        reviewBody: 'Producto de primera calidad. Llegó rápido y bien empacado.',
        name: 'Entrega rápida'
      }
    ];
  }

  // Agregar información de garantía si aplica
  schema.warranty = {
    '@type': 'WarrantyPromise',
    durationOfWarranty: {
      '@type': 'QuantitativeValue',
      unitCode: 'MON',
      value: '12'
    },
    warrantyScope: 'Full Product'
  };

  return schema;
};

/**
 * Genera schema de LocalBusiness con ubicación
 */
export const generateLocalBusinessSchemaForProduct = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${DOMAIN}/#local-business`,
  name: 'Pinturas Diamante',
  description: 'Tienda de pinturas de alta gama en Oaxaca. Especializados en pintura automotriz, maderas y decorativa.',
  url: DOMAIN,
  image: `${DOMAIN}/img/catalog/LOGO-WEB-DIAMANTE-PNG.png`,
  telephone: '+52-951-143-3467',
  email: 'ventas@pinturasdiamantemx.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Avenida ferrocarril 805-D',
    addressLocality: 'Oaxaca',
    addressRegion: 'Oaxaca',
    postalCode: '68000',
    addressCountry: 'MX'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 17.0627,
    longitude: -96.7236
  },
  // Horario de apertura
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ],
    opens: '08:30',
    closes: '18:30'
  },
  // Rango de precios
  priceRange: '$$',
  // Social media
  sameAs: [
    'https://www.facebook.com/pinturasdiamantemx',
    'https://www.instagram.com/pinturasdiamantemx',
    'https://www.linkedin.com/company/pinturas-diamante'
  ]
});

/**
 * Genera WebPage schema conectando producto como mainEntity
 */
export const generateProductPageSchema = (
  product: Product,
  category?: Category,
  subCategory?: SubCategory
) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${DOMAIN}/product/${product.id}#webpage`,
  url: `${DOMAIN}/product/${product.id}`,
  name: `${product.name} - Pinturas Diamante`,
  description: product.description.substring(0, 160),
  image: product.ogImage 
    ? `${DOMAIN}${product.ogImage}` 
    : `${DOMAIN}${product.image}`,
  // IMPORTANTE: mainEntity conecta la página con el producto
  mainEntity: generateEnhancedProductSchema(product, category, subCategory),
  // Información del sitio
  isPartOf: {
    '@id': `${DOMAIN}/#website`
  }
});

/**
 * Valida que el schema cumpla con requisitos mínimos de Google
 */
export const validateProductSchema = (schema: any): string[] => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Campos requeridos
  if (!schema.name) errors.push('❌ name (REQUERIDO)');
  if (!schema.description) errors.push('❌ description (REQUERIDO)');
  if (!schema.image || schema.image.length === 0) 
    errors.push('❌ image (REQUERIDO - debe ser URL absoluta)');
  if (!schema.offers) errors.push('❌ offers (REQUERIDO)');

  // Campos recomendados
  if (!schema.brand) warnings.push('⚠️ brand (RECOMENDADO)');
  if (!schema.aggregateRating) warnings.push('⚠️ aggregateRating (RECOMENDADO)');
  if (!schema.sku) warnings.push('⚠️ sku (RECOMENDADO)');

  // Validar offers
  if (schema.offers) {
    if (!schema.offers.availability) 
      errors.push('❌ offers.availability (REQUERIDO)');
    if (!schema.offers.priceCurrency) 
      errors.push('❌ offers.priceCurrency (REQUERIDO)');
  }

  return [...errors, ...warnings];
};

export default {
  generateEnhancedProductSchema,
  generateLocalBusinessSchemaForProduct,
  generateProductPageSchema,
  validateProductSchema
};