/**
 * Utilidades para SEO
 * Funciones helper para mejorar SEO del sitio
 */

import { PRODUCTS, CATEGORIES, SUB_CATEGORIES } from '../data/products';
import { BUSINESS_INFO } from '../data/seo';

/**
 * Genera un sitemap.xml dinámico
 * Úsalo en una ruta /sitemap.xml si lo requieres
 */
export const generateSitemap = (): string => {
  const baseUrl = BUSINESS_INFO.url;
  
  const urls = [
    // Home
    {
      loc: `${baseUrl}/#/`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '1.0'
    },
    // Catálogo
    {
      loc: `${baseUrl}/#/catalog`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.9'
    },
    // Categorías
    ...CATEGORIES.map(cat => ({
      loc: `${baseUrl}/#/catalog/${cat.id}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.8'
    })),
    // Subcategorías
    ...SUB_CATEGORIES.map(sub => ({
      loc: `${baseUrl}/#/catalog/${CATEGORIES.find(c => c.id === sub.categoryId)?.id}/${sub.id}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.7'
    })),
    // Productos
    ...PRODUCTS.map(product => ({
      loc: `${baseUrl}/#/product/${product.id}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.6'
    })),
    // Contacto
    {
      loc: `${baseUrl}/#/contact`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'yearly',
      priority: '0.8'
    }
  ];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>
`).join('')}
</urlset>`;

  return xmlContent;
};

/**
 * Genera robots.txt para optimizar crawling
 */
export const generateRobotsTxt = (): string => {
  return `User-agent: *
Allow: /

# Disallow paths if needed:
# Disallow: /admin/
# Disallow: /private/

Sitemap: ${BUSINESS_INFO.url}/sitemap.xml

# Crawl delay (in seconds)
Crawl-delay: 1

# Comments
# Pinturas Diamante Oaxaca
# SEO Optimized for search engines
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
