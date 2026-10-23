/**
 * Legacy product-page schema helpers.
 * They intentionally emit descriptive markup only; Product rich results
 * require genuine offer, review, or aggregate-rating data.
 */

import { SEO_CONFIG } from '../config/seoConfig';
import { categoryPath, productPathForId } from './routes';

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  image: string;
  categoryId?: string;
  subCategoryId?: string;
  categoryName?: string;
  subCategoryName?: string;
}

const absoluteImageUrl = (image: string, baseUrl: string) =>
  image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;

const generateCatalogItem = (product: CatalogItem, baseUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Thing',
  '@id': `${baseUrl}${productPathForId(product.id)}#item`,
  name: product.name,
  description: product.description,
  image: absoluteImageUrl(product.image, baseUrl),
  url: `${baseUrl}${productPathForId(product.id)}`
});

export const generateEnhancedProductSchema = (product: CatalogItem) =>
  generateCatalogItem(product, SEO_CONFIG.domain);

export const generateProductSnippetSchema = (
  product: CatalogItem,
  baseUrl: string = SEO_CONFIG.domain
) => generateCatalogItem(product, baseUrl);

export const generateProductSitelinksSchema = (
  productId: string,
  categoryId: string,
  baseUrl: string = SEO_CONFIG.domain
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Inicio',
      item: `${baseUrl}/`
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Categoría',
      item: `${baseUrl}${categoryPath(categoryId)}`
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Producto',
      item: `${baseUrl}${productPathForId(productId)}`
    }
  ]
});

export const generateProductISOBoostSchema = (product: CatalogItem) =>
  generateCatalogItem(product, SEO_CONFIG.domain);
