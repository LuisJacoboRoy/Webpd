/**
 * Utilidades para SEO
 * Funciones helper para mejorar SEO del sitio
 */

import { PRODUCTS, CATEGORIES, SUB_CATEGORIES } from '../data/products';
import { BUSINESS_INFO } from '../data/seo';
import { CATALOG_PATH, categoryPath, productPath } from './routes';

/**
 * Genera un sitemap.xml dinámico
 * Úsalo en una ruta /sitemap.xml si lo requieres
 */
export const generateSitemap = (): string => {
  const baseUrl = BUSINESS_INFO.url.replace(/\/+$/, '');
  const urls = [
    {
      loc: `${baseUrl}/`
    },
    {
      loc: `${baseUrl}${CATALOG_PATH}`
    },
    ...CATEGORIES.map(cat => ({
      loc: `${baseUrl}${categoryPath(cat.id)}`
    })),
    ...SUB_CATEGORIES.map(sub => ({
      loc: `${baseUrl}${categoryPath(sub.categoryId, sub.id)}`
    })),
    ...PRODUCTS.map(product => ({
      loc: `${baseUrl}${productPath(product)}`
    })),
    {
      loc: `${baseUrl}/contact/`
    }
  ];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
  </url>
`).join('')}
</urlset>`;

  return xmlContent;
};

/**
 * Genera robots.txt para optimizar crawling
 */
export const generateRobotsTxt = (): string => {
  const baseUrl = BUSINESS_INFO.url.replace(/\/+$/, '');
  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-products.xml
Sitemap: ${baseUrl}/sitemap-categories.xml
Sitemap: ${baseUrl}/sitemap-images.xml
`;
};

/**
 * Estructura JSON-LD para FAQPage (opcional para futuras implementaciones)
 */
export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

/**
 * Estructura JSON-LD para Review (Testimonio)
 */
export const generateReviewSchema = (
  productName: string,
  author: string,
  rating: number,
  reviewText: string
) => {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Review',
    '@id': `${BUSINESS_INFO.url}#review-${author}`,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: rating.toString(),
      bestRating: '5',
      worstRating: '1'
    },
    name: `Reseña de ${productName}`,
    text: reviewText,
    reviewAspect: 'Calidad del Producto',
    author: {
      '@type': 'Person',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name
    }
  };
};

/**
 * Validación de palabras clave (máximo 5)
 */
export const validateKeywords = (keywords: string): boolean => {
  const keywordArray = keywords.split(',').map(k => k.trim());
  return keywordArray.length <= 5;
};

/**
 * Truncar descripción para meta tags (recomendado 155-160 caracteres)
 */
export const truncateDescription = (text: string, length: number = 160): string => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
};
