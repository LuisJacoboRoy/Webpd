/**
 * Configuración Centralizada para SEO Prerendering
 * Facilita actualización de datos sin modificar código
 */

export const SEO_CONFIG = {
  // Dominio principal
  domain: 'https://pinturasdiamante.com',
  
  // Información de la empresa
  business: {
    name: 'Pinturas Diamante',
    shortName: 'Diamante',
    description: 'Soluciones de pintura de alta gama para automotriz, maderas y decorativo en Oaxaca.',
    logo: '/img/catalog/LOGO-WEB-DIAMANTE-PNG.png',
    email: 'info@pinturasdiamantemx.com',
    phone: '+52-951-143-3467',
    alternatePhone: '+52-951-235-9585'
  },

  // Ubicación principal
  location: {
    name: 'Sucursal Ferrocarril',
    streetAddress: 'Avenida ferrocarril 805-D',
    addressLocality: 'Oaxaca',
    addressRegion: 'Oaxaca',
    postalCode: '68000',
    addressCountry: 'MX',
    latitude: 17.0627,
    longitude: -96.7236,
    radius: '8km'
  },

  // Redes sociales
  social: {
    facebook: 'https://www.facebook.com/pinturasdiamantemx',
    instagram: 'https://www.instagram.com/pinturasdiamantemx',
    twitter: '@pinturasdiamantemx',
    linkedin: 'https://www.linkedin.com/company/pinturas-diamante',
    youtube: 'https://www.youtube.com/@pinturasdiamantemx'
  },

  // Horario de operación
  hours: {
    monday: { opens: '08:30', closes: '18:30' },
    tuesday: { opens: '08:30', closes: '18:30' },
    wednesday: { opens: '08:30', closes: '18:30' },
    thursday: { opens: '08:30', closes: '18:30' },
    friday: { opens: '08:30', closes: '18:30' },
    saturday: { opens: '08:30', closes: '16:30' },
    sunday: null, // Cerrado
    hoursText: 'Lunes a Viernes 8:30 AM - 6:30 PM, Sábados 8:30 AM - 4:30 PM'
  },

  // Configuración SEO general
  seo: {
    // Parámetros de títulos
    title: {
      template: '%s | Pinturas Diamante Oaxaca',
      default: 'Pinturas Diamante Oaxaca',
      minLength: 30,
      maxLength: 60
    },

    // Parámetros de descripciones
    description: {
      default: 'Pinturas Diamante: Soluciones de pintura de alta gama para automotriz, maderas y decorativo. Calidad premium y durabilidad garantizada.',
      minLength: 120,
      maxLength: 160
    },

    // Parámetros de keywords
    keywords: {
      general: 'pinturas, diamante, oaxaca, automotriz, maderas, decorativo, pintura premium',
      automotriz: 'pinturas automotriz, esmalte poliuretano, repintado, base color, poliuretano',
      maderas: 'pinturas para madera, barniz, laca, nitrocelulosa, poliuretano',
      decorativo: 'pinturas decorativo, vinil acrílica, impermeabilizante, esmalte'
    },

    // Imagen por defecto
    defaultImage: '/img/catalog/LOGO-WEB-DIAMANTE-PNG.png',
    defaultImageWidth: 1200,
    defaultImageHeight: 630,

    // Lenguaje
    language: 'es',
    locale: 'es_MX'
  },

  // Robots.txt configuración
  robots: {
    allowAll: true,
    crawlDelay: 1,
    requestRate: '30/60',
    blockedUserAgents: ['MJ12bot'],
    delayedUserAgents: {
      'AhrefsBot': 10,
      'SemrushBot': 5
    }
  },

  // Sitemap configuración
  sitemap: {
    updateFrequency: 'daily',
    productChangefreq: 'monthly',
    categoryChangefreq: 'weekly',
    priorityMap: {
      home: 1.0,
      category: 0.85,
      subcategory: 0.80,
      product: 0.70,
      contact: 0.8
    }
  },

  // Open Graph configuración
  openGraph: {
    type: 'website',
    siteName: 'Pinturas Diamante Oaxaca',
    imageWidth: 1200,
    imageHeight: 630,
    imageType: 'image/jpeg'
  },

  // Twitter Card configuración
  twitter: {
    card: 'summary_large_image',
    creator: '@pinturasdiamantemx',
    site: '@pinturasdiamantemx'
  },

  // Schema.org configuración
  schema: {
    context: 'https://schema.org',
    includeOrganization: true,
    includeLocalBusiness: true,
    includeBreadcrumbs: true,
    priceRange: '$'
  },

  // Opciones de prerendering
  prerendering: {
    outputDir: 'prerendered',
    generateProductPages: true,
    generateCategoryPages: true,
    generateSitemap: true,
    generateRobots: true,
    generateSchemaIndex: true,
    logVerbose: true
  },

  // URLs especiales
  urls: {
    contact: '#/contact',
    catalog: '#/catalog',
    home: '#/',
    sitemapXml: '/sitemap.xml',
    robotsTxt: '/robots.txt'
  }
};

// Validar configuración
export function validateSEOConfig(): string[] {
  const errors: string[] = [];

  if (!SEO_CONFIG.domain) errors.push('Domain no configurado');
  if (!SEO_CONFIG.business.name) errors.push('Business name no configurado');
  if (!SEO_CONFIG.seo.title.template) errors.push('Title template no configurado');
  if (!SEO_CONFIG.location.streetAddress) errors.push('Location no configurado');

  return errors;
}

// Helper para obtener valores SEO con fallback
export function getSEOValue(
  customValue: string | undefined,
  defaultValue: string
): string {
  return (customValue && customValue.trim().length > 0) ? customValue : defaultValue;
}

// Helper para obtener URL absoluta
export function getAbsoluteUrl(path: string): string {
  const domain = SEO_CONFIG.domain;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${domain}${cleanPath}`;
}

// Helper para obtener imagen absoluta
export function getAbsoluteImageUrl(imagePath: string | undefined): string {
  if (!imagePath) return getAbsoluteUrl(SEO_CONFIG.seo.defaultImage);
  return imagePath.startsWith('http') ? imagePath : getAbsoluteUrl(imagePath);
}
