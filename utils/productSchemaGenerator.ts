/**
 * Product-page structured data without Product rich-result markup.
 * Add Product only when genuine offer, review, or aggregate-rating data exists.
 */

import { Product, Category, SubCategory } from '../types';

const DOMAIN = process.env.GITHUB_PAGES === 'true' 
  ? 'https://luisjacoboroy.github.io/Webpd'
  : 'https://pinturasdiamante.com';
const productPageUrl = (productId: string) => `${DOMAIN}/product/${productId}/`;
const absoluteProductImageUrl = (image: string) =>
  image.startsWith('http') ? image : `${DOMAIN}${image.startsWith('/') ? '' : '/'}${image}`;
const productImageSchema = (product: Product) => ({
  '@type': 'ImageObject',
  contentUrl: absoluteProductImageUrl(product.ogImage || product.image || ''),
  name: product.name,
  description: product.ogDescription || product.description,
  creator: { '@id': `${DOMAIN}/#organization` },
  creditText: 'Diamante Pinturas',
  copyrightHolder: { '@id': `${DOMAIN}/#organization` },
  copyrightNotice: '© Diamante Pinturas'
});

/**
 * Describes the catalog item as a generic Thing so it cannot trigger
 * Product rich-result errors when no genuine offer or review data is available.
 */
export const generateEnhancedProductSchema = (
  product: Product,
  _category?: Category,
  _subCategory?: SubCategory,
  _includeReviews: boolean = true
) => {
  const productUrl = productPageUrl(product.id);

  return {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    '@id': `${productUrl}#item`,
    name: product.name,
    url: productUrl,
    description: product.description.substring(0, 5000),
    image: [productImageSchema(product)]
  };
};

/**
 * Genera schema de LocalBusiness con ubicación
 */
export const generateLocalBusinessSchemaForProduct = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${DOMAIN}/#local-business`,
  name: 'Pinturas Diamante',
  brand: {
    '@type': 'Brand',
    '@id': `${DOMAIN}/#brand`,
    name: 'Diamante Pinturas'
  },
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
  '@id': `${productPageUrl(product.id)}#webpage`,
  url: productPageUrl(product.id),
  name: `${product.name} - Pinturas Diamante`,
  description: product.description.substring(0, 160),
  image: productImageSchema(product),
  // Generic Thing avoids claiming Product rich-result eligibility.
  mainEntity: generateEnhancedProductSchema(product, category, subCategory),
  // Información del sitio
  isPartOf: {
    '@id': `${DOMAIN}/#website`
  }
});

/**
 * Confirms the product page uses descriptive markup rather than unsupported Product markup.
 */
export const validateProductSchema = (schema: Record<string, unknown>): string[] => {
  const errors: string[] = [];

  if (schema['@type'] !== 'Thing') errors.push('El elemento descriptivo debe usar @type Thing');
  if (typeof schema.name !== 'string' || !schema.name) errors.push('Falta name');
  if (typeof schema.description !== 'string' || !schema.description) errors.push('Falta description');
  if (!Array.isArray(schema.image) || schema.image.length === 0) errors.push('Falta image');
  if ('offers' in schema || 'review' in schema || 'aggregateRating' in schema) {
    errors.push('El marcado descriptivo no debe incluir datos comerciales o reseñas no verificados');
  }

  return errors;
};

export default {
  generateEnhancedProductSchema,
  generateLocalBusinessSchemaForProduct,
  generateProductPageSchema,
  validateProductSchema
};