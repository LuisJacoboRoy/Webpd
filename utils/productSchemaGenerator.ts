/**
 * Product-page structured data without Product rich-result markup.
 * Add Product only when genuine offer, review, or aggregate-rating data exists.
 */

import { Product, Category, SubCategory } from '../types';
import { productPath } from './routes';
import IMAGE_LICENSING from '../data/image-licensing.json';

const DOMAIN = process.env.GITHUB_PAGES === 'true' 
  ? 'https://luisjacoboroy.github.io/Webpd'
  : 'https://pinturasdiamante.com';
const productPageUrl = (product: Product) => `${DOMAIN}${productPath(product)}`;
const absoluteProductImageUrl = (image: string) =>
  image.startsWith('http') ? image : `${DOMAIN}${image.startsWith('/') ? '' : '/'}${image}`;
const productImageSchema = (product: Product) => {
  const image = product.ogImage || product.image;
  if (!image) return undefined;

  return {
    '@type': 'ImageObject',
    contentUrl: absoluteProductImageUrl(image),
    name: product.name,
    description: product.ogDescription || product.description,
    creator: { '@id': `${DOMAIN}/#organization` },
    creditText: 'Diamante Pinturas',
    copyrightHolder: { '@id': `${DOMAIN}/#organization` },
    copyrightNotice: '© Diamante Pinturas',
    license: IMAGE_LICENSING.license,
    acquireLicensePage: IMAGE_LICENSING.acquireLicensePage
  };
};

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
  const productUrl = productPageUrl(product);
  const image = productImageSchema(product);

  return {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    '@id': `${productUrl}#item`,
    name: product.name,
    url: productUrl,
    description: product.description.substring(0, 5000),
    ...(product.sku ? {
      identifier: Array.isArray(product.sku)
        ? product.sku.map(value => ({
          '@type': 'PropertyValue',
          propertyID: 'SKU',
          value
        }))
        : {
          '@type': 'PropertyValue',
          propertyID: 'SKU',
          value: product.sku
        }
    } : {}),
    ...(image ? { image: [image] } : {})
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
) => {
  const image = productImageSchema(product);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${productPageUrl(product)}#webpage`,
    url: productPageUrl(product),
    name: `${product.name} - Pinturas Diamante`,
    description: product.description.substring(0, 160),
    ...(image ? { image } : {}),
    // Generic Thing avoids claiming Product rich-result eligibility.
    mainEntity: generateEnhancedProductSchema(product, category, subCategory),
    // Información del sitio
    isPartOf: {
      '@id': `${DOMAIN}/#website`
    }
  };
};

export const generateProductArticleSchema = (
  product: Product,
  category?: Category,
  subCategory?: SubCategory
) => {
  const productUrl = productPageUrl(product);
  const image = productImageSchema(product);
  const articleBody = [
    product.description,
    ...Object.entries(product.specifications || {}).map(([label, value]) =>
      `${label}: ${Array.isArray(value) ? value.join(', ') : value}`
    )
  ].join('\n\n');

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${productUrl}#article`,
    headline: product.name,
    url: productUrl,
    mainEntityOfPage: { '@id': `${productUrl}#webpage` },
    about: { '@id': `${productUrl}#item` },
    articleSection: [category?.name, subCategory?.name].filter(Boolean).join(' > '),
    description: product.description,
    articleBody,
    ...(product.sku ? {
      identifier: Array.isArray(product.sku)
        ? product.sku.map(value => ({
          '@type': 'PropertyValue',
          propertyID: 'SKU',
          value
        }))
        : {
          '@type': 'PropertyValue',
          propertyID: 'SKU',
          value: product.sku
        }
    } : {}),
    ...(image ? { image: [image] } : {}),
    author: { '@id': `${DOMAIN}/#organization` },
    publisher: { '@id': `${DOMAIN}/#organization` }
  };
};

/**
 * Confirms the product page uses descriptive markup rather than unsupported Product markup.
 */
export const validateProductSchema = (schema: Record<string, unknown>): string[] => {
  const errors: string[] = [];

  if (schema['@type'] !== 'Thing') errors.push('El elemento descriptivo debe usar @type Thing');
  if (typeof schema.name !== 'string' || !schema.name) errors.push('Falta name');
  if (typeof schema.description !== 'string' || !schema.description) errors.push('Falta description');
  if ('image' in schema && (!Array.isArray(schema.image) || schema.image.length === 0)) errors.push('image debe contener al menos una imagen');
  if ('offers' in schema || 'review' in schema || 'aggregateRating' in schema) {
    errors.push('El marcado descriptivo no debe incluir datos comerciales o reseñas no verificados');
  }

  return errors;
};

export default {
  generateEnhancedProductSchema,
  generateLocalBusinessSchemaForProduct,
  generateProductPageSchema,
  generateProductArticleSchema,
  validateProductSchema
};