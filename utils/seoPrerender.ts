/**
 * SEO Prerendering System para Static Site Generation (SSG)
 * Implementa mejores prácticas de Google Webmaster
 * 
 * Características:
 * - Schema.org Structured Data (JSON-LD)
 * - Open Graph & Twitter Cards
 * - Meta tags canónicos
 * - Breadcrumb navigation
 * - Descriptive WebPage and catalog-item structured data
 * - Mobile-friendly markup
 */

import { PRODUCTS, CATEGORIES, SUB_CATEGORIES } from '../data/products';
import { Product, Category, SubCategory } from '../types';
import { CATALOG_PATH, categoryPath, productPath, slugify } from './routes';

// Determinar el dominio base según el entorno
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const DOMAIN = isGitHubPages ? 'https://luisjacoboroy.github.io/Webpd' : 'https://pinturasdiamante.com';
const pageUrl = (route: string) => {
  const normalizedRoute = route.replace(/^\/+|\/+$/g, '');
  return normalizedRoute ? `${DOMAIN}/${normalizedRoute}/` : `${DOMAIN}/`;
};

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
  brand: {
    '@type': 'Brand',
    '@id': `${DOMAIN}/#brand`,
    name: 'Diamante Pinturas'
  },
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
      item: pageUrl('/')
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Catálogo',
      item: pageUrl(CATALOG_PATH)
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: category.name,
      item: pageUrl(categoryPath(category.id))
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: subCategory.name,
      item: pageUrl(categoryPath(category.id, subCategory.id))
    },
    {
      '@type': 'ListItem',
      position: 5,
      name: product.name,
      item: pageUrl(productPath(product))
    }
  ]
});

/**
 * Describe the catalog item without declaring Product rich-result eligibility.
 */
export const generateProductSchema = (product: Product) => {
  const productUrl = pageUrl(productPath(product));
  return {
    '@context': 'https://schema.org/',
    '@type': 'Thing',
    '@id': `${productUrl}#item`,
    name: product.name,
    description: product.description,
    image: [
      product.ogImage ? `${DOMAIN}${product.ogImage}` : `${DOMAIN}${product.image}`,
      product.image ? `${DOMAIN}${product.image}` : null
    ].filter(Boolean),
    url: productUrl
  };
};

/**
 * Generates WebPage data with a descriptive catalog item as mainEntity.
 */
export const generateWebPageSchema = (
  product: Product,
  _category: Category,
  _subCategory: SubCategory
) => {
  const productSchema = generateProductSchema(product);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl(productPath(product))}#webpage`,
    name: product.name,
    description: product.description,
    url: pageUrl(productPath(product)),
    image: product.ogImage ? `${DOMAIN}${product.ogImage}` : `${DOMAIN}${product.image}`,
    datePublished: new Date().toISOString().split('T')[0],
    inLanguage: 'es-MX',
    isPartOf: {
      '@id': DOMAIN,
      '@type': 'WebSite',
      name: 'Pinturas Diamante'
    },
    // Product rich results require genuine offer or review data that is not provided.
    mainEntity: productSchema,
    breadcrumb: {
      '@id': `${pageUrl(productPath(product))}#breadcrumb`
    }
  };
};

/**
 * Genera Open Graph tags optimizados
 * https://ogp.me/
 */
export const generateOpenGraphTags = (product: Product): Record<string, string> => ({
  'og:type': 'product',
  'og:url': pageUrl(productPath(product)),
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
export const generateCanonicalAndRobotsMetaTags = (productId: string): Record<string, string> => {
  const product = PRODUCTS.find(item => item.id === productId);
  return {
    canonical: pageUrl(product ? productPath(product) : `/producto/${slugify(productId)}`),
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    googlebot: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  };
};

/**
 * Complete SEO data for a product page without unsupported Product rich-result markup
 */
export const generateProductSEOData = (productId: string): ProductSEOData | null => {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return null;

  const category = CATEGORIES.find(c => c.id === product.categoryId);
  const subCategory = SUB_CATEGORIES.find(s => s.id === product.subCategoryId);

  if (!category || !subCategory) return null;

  return {
    canonical: pageUrl(productPath(product)),
    title: product.ogTitle || `${product.name} - Pinturas Diamante`,
    description: product.ogDescription || product.description,
    ogImage: product.ogImage ? `${DOMAIN}${product.ogImage}` : `${DOMAIN}${product.image}`,
    // Product rich-result markup is omitted until genuine commercial or review data exists.
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        // 1. Organization Schema (identidad del negocio)
        generateOrganizationSchema(),

        // 2. WebPage with a descriptive item; no unsupported Product markup
        generateWebPageSchema(product, category, subCategory),

        // 3. BreadcrumbList
        generateBreadcrumbSchema(product, category, subCategory),

        // 4. LocalBusiness
        generateLocalBusinessSchema()
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
    canonical: pageUrl(categoryPath(categoryId)),
    title: `${category.name} | Pinturas Diamante Oaxaca`,
    description: category.description,
    ogImage: category.ogImage ? `${DOMAIN}${category.ogImage}` : `${DOMAIN}${category.image}`,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        generateOrganizationSchema(),
        {
          '@type': 'CollectionPage',
          '@id': pageUrl(categoryPath(categoryId)),
          name: category.name,
          description: category.description,
          url: pageUrl(categoryPath(categoryId)),
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
  brand: {
    '@type': 'Brand',
    '@id': `${DOMAIN}/#brand`,
    name: 'Diamante Pinturas'
  },
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
 * Valida metadatos y estructura JSON-LD básicos.
 * 
 * Verifica que el schema cumpla con:
 * - Longitud apropiada de texto
 * - URLs canónicas correctas
 * - Imágenes válidas
 */
export const validateSEOData = (seoData: ProductSEOData): string[] => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validación de Título
  if (!seoData.title || seoData.title.length < 30) {
    errors.push('❌ Título muy corto: mínimo 30 caracteres requerido para Rich Results');
  }
  if (seoData.title.length > 60) {
    warnings.push('⚠️ Título muy largo: máximo 60 caracteres (se cortará en SERPs)');
  }

  // 2. Validación de Descripción
  if (!seoData.description || seoData.description.length < 120) {
    errors.push('❌ Descripción muy corta: mínimo 120 caracteres requerido');
  }
  if (seoData.description.length > 160) {
    warnings.push('⚠️ Descripción muy larga: máximo 160 caracteres (se cortará en SERPs)');
  }

  // 3. Validación de Imagen (CRÍTICA para Rich Results)
  if (!seoData.ogImage) {
    errors.push('❌ CRÍTICO: Falta imagen Open Graph (requerida para Rich Results)');
  } else if (!seoData.ogImage.startsWith('https://')) {
    errors.push('❌ Imagen debe usar HTTPS (requerido para Rich Results)');
  }

  // 4. Validación de URL Canónica
  if (!seoData.canonical || !seoData.canonical.startsWith(DOMAIN)) {
    errors.push('❌ URL canónica inválida o malformada');
  }

  // 5. Validación de Structured Data
  if (!seoData.structuredData) {
    errors.push('❌ Falta JSON-LD structured data (CRÍTICO para Rich Results)');
  } else {
    // Verificar que existe @graph
    if (!seoData.structuredData['@graph']) {
      errors.push('❌ Structured data debe incluir @graph');
    }

    const graph = seoData.structuredData['@graph'] || [];
    if (!graph.some((schema: any) => schema['@type'] === 'WebPage')) {
      errors.push('❌ Falta WebPage en el JSON-LD');
    }
    if (!graph.some((schema: any) => schema['@type'] === 'BreadcrumbList')) {
      errors.push('❌ Falta BreadcrumbList en el JSON-LD');
    }
  }

  // 6. Validación de OpenGraph tags
  if (!seoData.openGraphTags || Object.keys(seoData.openGraphTags).length === 0) {
    warnings.push('⚠️ Falta Open Graph tags (importante para compartir en redes)');
  }

  // Retornar errores primero, luego warnings
  return [...errors, ...warnings];
};

/**
 * Validates metadata and descriptive structured data for all product pages.
 */
export const validateAllProductsSEO = (): Record<string, string[]> => {
  const report: Record<string, string[]> = {};

  PRODUCTS.forEach(product => {
    const seoData = generateProductSEOData(product.id);
    if (seoData) {
      const issues = validateSEOData(seoData);
      if (issues.length > 0) {
        report[product.id] = issues;
      }
    }
  });

  return report;
};

/**
 * Genera sitemap XML actualizado desde productos
 */
export const generateDynamicSitemap = (): string => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // URLs estáticas principales
  const staticUrls = ['', 'contact', CATALOG_PATH.slice(1, -1)];

  staticUrls.forEach(url => {
    xml += `  <url>\n`;
    xml += `    <loc>${pageUrl(url)}</loc>\n`;
    xml += `  </url>\n`;
  });

  // Categorías
  CATEGORIES.forEach(category => {
    xml += `  <url>\n`;
    xml += `    <loc>${pageUrl(categoryPath(category.id))}</loc>\n`;
    xml += `  </url>\n`;
  });

  // Subcategorías
  SUB_CATEGORIES.forEach(subCat => {
    xml += `  <url>\n`;
    xml += `    <loc>${pageUrl(categoryPath(subCat.categoryId, subCat.id))}</loc>\n`;
    xml += `  </url>\n`;
  });

  // Productos
  PRODUCTS.forEach(product => {
    xml += `  <url>\n`;
    xml += `    <loc>${pageUrl(productPath(product))}</loc>\n`;
    xml += `  </url>\n`;
  });

  xml += '</urlset>';
  return xml;
};

/**
 * Genera robots.txt optimizado
 */
export const generateRobotsTxt = (): string => {
  return `# Reglas de rastreo para Pinturas Diamante
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

# Sitemaps con URLs públicas y canónicas
Sitemap: https://pinturasdiamante.com/sitemap.xml
Sitemap: https://pinturasdiamante.com/sitemap-products.xml
Sitemap: https://pinturasdiamante.com/sitemap-categories.xml
Sitemap: https://pinturasdiamante.com/sitemap-images.xml
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
