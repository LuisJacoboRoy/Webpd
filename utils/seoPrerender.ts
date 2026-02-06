/**
 * SEO Prerendering System para Static Site Generation (SSG)
 * Implementa mejores prácticas de Google Webmaster
 * 
 * Características:
 * - Schema.org Structured Data (JSON-LD)
 * - Open Graph & Twitter Cards
 * - Meta tags canónicos
 * - Breadcrumb navigation
 * - Product schema para e-commerce
 * - Mobile-friendly markup
 */

import { PRODUCTS, CATEGORIES, SUB_CATEGORIES } from '../data/products';
import { Product, Category, SubCategory } from '../types';

const DOMAIN = 'https://pinturasdiamante.com';

/**
 * Interfaz para datos SEO de producto
 */
export interface ProductSEOData {
  canonical: string;
  title: string;
  description: string;
  ogImage: string;
  structuredData: object;
  openGraphTags: object;
  twitterCard: object;
  breadcrumbs: object;
}

/**
 * Genera Schema.org Organization (Nivel raíz)
 */
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${DOMAIN}/#organization`,
  name: 'Pinturas Diamante',
  url: DOMAIN,
  logo: `${DOMAIN}/img/catalog/LOGO-WEB-DIAMANTE-PNG.png`,
  image: `${DOMAIN}/img/catalog/LOGO-WEB-DIAMANTE-PNG.png`,
  description: 'Pinturas Diamante: Soluciones de pintura de alta gama para automotriz, maderas y decorativo en Oaxaca.',
  sameAs: [
    'https://www.facebook.com/pinturasdiamantemx',
    'https://www.instagram.com/pinturasdiamantemx',
    'https://www.linkedin.com/company/pinturas-diamante'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+52-951-143-3467',
    contactType: 'Customer Service',
    areaServed: 'MX',
    availableLanguage: ['es', 'en']
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Avenida ferrocarril 805-D',
    addressLocality: 'Oaxaca',
    addressRegion: 'Oaxaca',
    postalCode: '68000',
    addressCountry: 'MX'
  }
});

/**
 * Genera Schema.org BreadcrumbList para navegación
 */
export const generateBreadcrumbSchema = (
  product: Product,
  category: Category,
  subCategory: SubCategory
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Inicio',
      item: `${DOMAIN}/#/`
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Catálogo',
      item: `${DOMAIN}/#/catalog`
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: category.name,
      item: `${DOMAIN}/#/catalog/${category.id}`
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: subCategory.name,
      item: `${DOMAIN}/#/catalog/${category.id}/${subCategory.id}`
    },
    {
      '@type': 'ListItem',
      position: 5,
      name: product.name,
      item: `${DOMAIN}/#/product/${product.id}`
    }
  ]
});

/**
 * Genera Schema.org Product con soporte para e-commerce
 * Mejores prácticas: https://developers.google.com/search/docs/appearance/structured-data/product
 */
export const generateProductSchema = (product: Product) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  '@id': `${DOMAIN}/#/product/${product.id}`,
  name: product.name,
  description: product.description,
  image: product.ogImage ? `${DOMAIN}${product.ogImage}` : `${DOMAIN}${product.image}`,
  sku: product.id,
  brand: {
    '@type': 'Brand',
    name: 'Pinturas Diamante'
  },
  manufacturer: {
    '@type': 'Organization',
    name: 'Pinturas Diamante',
    url: DOMAIN
  },
  category: product.tag || 'Pintura',
  url: `${DOMAIN}/#/product/${product.id}`,
  // Agregado: availability y rating son opcionales pero mejoran SEO
  offers: {
    '@type': 'Offer',
    url: `${DOMAIN}/#/product/${product.id}`,
    priceCurrency: 'MXN',
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': 'Organization',
      name: 'Pinturas Diamante'
    }
  }
});

/**
 * Genera data para schema WebPage
 */
export const generateWebPageSchema = (
  product: Product,
  category: Category,
  subCategory: SubCategory
) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${DOMAIN}/#/product/${product.id}`,
  name: product.name,
  description: product.description,
  url: `${DOMAIN}/#/product/${product.id}`,
  mainEntity: {
    '@id': `${DOMAIN}/#/product/${product.id}`,
    '@type': 'Product'
  },
  isPartOf: {
    '@id': DOMAIN
  }
});

/**
 * Genera Open Graph tags optimizados
 * https://ogp.me/
 */
export const generateOpenGraphTags = (product: Product): Record<string, string> => ({
  'og:type': 'product',
  'og:url': `${DOMAIN}/#/product/${product.id}`,
  'og:title': product.ogTitle || `${product.name} - Pinturas Diamante`,
  'og:description': product.ogDescription || product.description,
  'og:image': product.ogImage ? `${DOMAIN}${product.ogImage}` : `${DOMAIN}${product.image}`,
  'og:image:width': '1200',
  'og:image:height': '630',
  'og:image:type': 'image/jpeg',
  'og:site_name': 'Pinturas Diamante Oaxaca',
  'og:locale': 'es_MX'
});

/**
 * Genera Twitter Card tags
 * https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
 */
export const generateTwitterCardTags = (product: Product): Record<string, string> => ({
  'twitter:card': 'summary_large_image',
  'twitter:title': product.ogTitle || `${product.name} - Pinturas Diamante`,
  'twitter:description': product.ogDescription || product.description,
  'twitter:image': product.ogImage ? `${DOMAIN}${product.ogImage}` : `${DOMAIN}${product.image}`,
  'twitter:creator': '@pinturasdiamantemx',
  'twitter:site': '@pinturasdiamantemx'
});

/**
 * Genera meta tags canónicos y de robots
 */
export const generateCanonicalAndRobotsMetaTags = (productId: string): Record<string, string> => ({
  canonical: `${DOMAIN}/#/product/${productId}`,
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  googlebot: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
});

/**
 * Datos SEO completos para un producto
 */
export const generateProductSEOData = (productId: string): ProductSEOData | null => {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return null;

  const category = CATEGORIES.find(c => c.id === product.categoryId);
  const subCategory = SUB_CATEGORIES.find(s => s.id === product.subCategoryId);

  if (!category || !subCategory) return null;

  return {
    canonical: `${DOMAIN}/#/product/${productId}`,
    title: product.ogTitle || `${product.name} - Pinturas Diamante`,
    description: product.ogDescription || product.description,
    ogImage: product.ogImage ? `${DOMAIN}${product.ogImage}` : `${DOMAIN}${product.image}`,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        generateOrganizationSchema(),
        generateProductSchema(product),
        generateWebPageSchema(product, category, subCategory),
        generateBreadcrumbSchema(product, category, subCategory)
      ]
    },
    openGraphTags: generateOpenGraphTags(product),
    twitterCard: generateTwitterCardTags(product),
    breadcrumbs: generateBreadcrumbSchema(product, category, subCategory)
  };
};

/**
 * Genera meta tags para categoría
 */
export const generateCategorySEOData = (categoryId: string) => {
  const category = CATEGORIES.find(c => c.id === categoryId);
  if (!category) return null;

  return {
    canonical: `${DOMAIN}/#/catalog/${categoryId}`,
    title: `${category.name} | Pinturas Diamante Oaxaca`,
    description: category.description,
    ogImage: category.ogImage ? `${DOMAIN}${category.ogImage}` : `${DOMAIN}${category.image}`,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        generateOrganizationSchema(),
        {
          '@type': 'CollectionPage',
          '@id': `${DOMAIN}/#/catalog/${categoryId}`,
          name: category.name,
          description: category.description,
          url: `${DOMAIN}/#/catalog/${categoryId}`,
          image: category.ogImage ? `${DOMAIN}${category.ogImage}` : `${DOMAIN}${category.image}`
        }
      ]
    }
  };
};

/**
 * Genera JSON-LD para LocalBusiness
 * Mejora visibilidad en Google My Business
 */
export const generateLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${DOMAIN}/#local-business`,
  name: 'Pinturas Diamante',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Avenida ferrocarril 805-D',
    addressLocality: 'Oaxaca',
    addressRegion: 'Oaxaca',
    postalCode: '68000',
    addressCountry: 'MX'
  },
  telephone: '+52-951-143-3467',
  image: `${DOMAIN}/img/catalog/LOGO-WEB-DIAMANTE-PNG.png`,
  priceRange: '$',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '08:30',
    closes: '18:30'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 17.0627,
    longitude: -96.7236
  }
});

/**
 * Validador de datos SEO estructurados
 * Reporta problemas comunes
 */
export const validateSEOData = (seoData: ProductSEOData): string[] => {
  const errors: string[] = [];

  if (!seoData.title || seoData.title.length < 30) {
    errors.push('⚠️ Título muy corto: mínimo 30 caracteres');
  }
  if (seoData.title.length > 60) {
    errors.push('⚠️ Título muy largo: máximo 60 caracteres');
  }

  if (!seoData.description || seoData.description.length < 120) {
    errors.push('⚠️ Descripción muy corta: mínimo 120 caracteres');
  }
  if (seoData.description.length > 160) {
    errors.push('⚠️ Descripción muy larga: máximo 160 caracteres');
  }

  if (!seoData.ogImage) {
    errors.push('❌ Falta imagen Open Graph');
  }

  if (!seoData.structuredData) {
    errors.push('❌ Falta structured data JSON-LD');
  }

  return errors;
};

/**
 * Genera sitemap XML actualizado desde productos
 */
export const generateDynamicSitemap = (): string => {
  const baseUrl = DOMAIN;
  const lastmod = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // URLs estáticas principales
  const staticUrls = [
    { url: '#/', priority: '1.0', changefreq: 'weekly' },
    { url: '#/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '#/catalog', priority: '0.9', changefreq: 'weekly' }
  ];

  staticUrls.forEach(({ url, priority, changefreq }) => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/${url}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Categorías
  CATEGORIES.forEach(category => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/#/catalog/${category.id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.85</priority>\n`;
    xml += `  </url>\n`;
  });

  // Subcategorías
  SUB_CATEGORIES.forEach(subCat => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/#/catalog/${subCat.categoryId}/${subCat.id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.80</priority>\n`;
    xml += `  </url>\n`;
  });

  // Productos
  PRODUCTS.forEach(product => {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/#/product/${product.id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.70</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += '</urlset>';
  return xml;
};

/**
 * Genera robots.txt optimizado
 */
export const generateRobotsTxt = (): string => {
  return `# Robots.txt para Pinturas Diamante
# https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt

User-agent: *
Allow: /
Allow: /#/
Disallow: /certs/
Disallow: /.git/
Disallow: /node_modules/
Disallow: /dist/
Disallow: /*.json$

# Delay para bots lentos
Crawl-delay: 1

# Sitemaps
Sitemap: https://pinturasdiamante.com/sitemap.xml
  Sitemap: https://pinturasdiamante.com/sitemap-products.xml

# Google Adsbot
User-agent: AdsBot-Google
Allow: /

# Google Mobile
User-agent: Googlebot-Mobile
Allow: /
`;
};

/**
 * Exportar todos los productos con SEO data para generación estática
 */
export const exportAllProductsSEO = () => {
  return PRODUCTS.map(product => ({
    id: product.id,
    seoData: generateProductSEOData(product.id),
    product
  })).filter(item => item.seoData !== null);
};
