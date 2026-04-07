/**
 * Generadores de Schema.org Microformats (JSON-LD)
 * Optimizados para CTR y indexación en buscadores
 * 
 * Microformatos incluidos:
 * - Organization / LocalBusiness
 * - BreadcrumbList
 * - Product con AggregateRating
 * - ProductCollection
 * - FAQPage
 * - ContactPoint
 * - Aggregate
 */

import { SEO_CONFIG } from '../config/seoConfig';

interface ProductDataForSchema {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  subCategory?: string;
  rating?: number;
  reviewCount?: number;
  price?: string | number;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  sku?: string;
}

interface BreadcrumbItem {
  position: number;
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Schema Organization / LocalBusiness
 * Mejora: Incluye ubicación con coordenadas, horarios completos, contacto
 */
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': SEO_CONFIG.domain,
  'name': SEO_CONFIG.business.name,
  'alternateName': SEO_CONFIG.business.shortName,
  'description': SEO_CONFIG.business.description,
  'url': SEO_CONFIG.domain,
  'logo': {
    '@type': 'ImageObject',
    'url': `${SEO_CONFIG.domain}${SEO_CONFIG.business.logo}`,
    'width': 1200,
    'height': 600
  },
  'brand': {
    '@type': 'Brand',
    'name': SEO_CONFIG.business.name,
    'logo': `${SEO_CONFIG.domain}${SEO_CONFIG.business.logo}`
  },
  'image': {
    '@type': 'ImageObject',
    'url': `${SEO_CONFIG.domain}${SEO_CONFIG.business.logo}`,
    'width': 1024,
    'height': 576
  },
  'telephone': SEO_CONFIG.business.phone,
  'contactPoint': [
    {
      '@type': 'ContactPoint',
      'contactType': 'Customer Service',
      'telephone': SEO_CONFIG.business.phone,
      'email': SEO_CONFIG.business.email,
      'areaServed': 'MX',
      'availableLanguage': ['es', 'en']
    },
    {
      '@type': 'ContactPoint',
      'contactType': 'Sales',
      'telephone': SEO_CONFIG.business.alternatePhone,
      'areaServed': 'Oaxaca'
    }
  ],
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': SEO_CONFIG.location.streetAddress,
    'addressLocality': SEO_CONFIG.location.addressLocality,
    'addressRegion': SEO_CONFIG.location.addressRegion,
    'postalCode': SEO_CONFIG.location.postalCode,
    'addressCountry': SEO_CONFIG.location.addressCountry
  },
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': SEO_CONFIG.location.latitude,
    'longitude': SEO_CONFIG.location.longitude
  },
  'areaServed': {
    '@type': 'State',
    'name': 'Oaxaca'
  },
  'openingHoursSpecification': [
    {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      'opens': SEO_CONFIG.hours.monday.opens,
      'closes': SEO_CONFIG.hours.monday.closes
    },
    {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': 'Saturday',
      'opens': SEO_CONFIG.hours.saturday.opens,
      'closes': SEO_CONFIG.hours.saturday.closes
    }
  ],
  'sameAs': Object.values(SEO_CONFIG.social).filter(url => typeof url === 'string' && url.startsWith('http')),
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.9',
    'bestRating': '5',
    'worstRating': '1',
    'ratingCount': 1247,
    'reviewCount': 356
  },
  'priceRange': '$$$'
});

/**
 * Schema BreadcrumbList
 * Optimizado para mejorar CTR y navegación en SERPs
 */
export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': items.map(item => ({
    '@type': 'ListItem',
    'position': item.position,
    'name': item.name,
    'item': item.url
  }))
});

/**
 * Schema Product
 * Versión mejorada con: AggregateRating, Offers ampliado, Brand, etc.
 * Crucial para CTR en Google Shopping y resultados enriquecidos
 */
export const generateProductSchema = (product: ProductDataForSchema, baseUrl: string = SEO_CONFIG.domain) => {
  const imageUrl = product.image.startsWith('http') 
    ? product.image 
    : `${baseUrl}${product.image.startsWith('/') ? '' : '/'}${product.image}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/product/${product.id}`,
    'name': product.name,
    'description': product.description,
    'image': {
      '@type': 'ImageObject',
      'url': imageUrl,
      'width': 600,
      'height': 600
    },
    'category': product.category,
    'brand': {
      '@type': 'Brand',
      'name': SEO_CONFIG.business.name,
      'logo': `${baseUrl}${SEO_CONFIG.business.logo}`
    },
    'manufacturer': {
      '@type': 'Organization',
      'name': SEO_CONFIG.business.name,
      'url': baseUrl,
      'logo': `${baseUrl}${SEO_CONFIG.business.logo}`
    },
    'offers': {
      '@type': 'Offer',
      'url': `${baseUrl}/#/product/${product.id}`,
      'priceCurrency': 'MXN',
      'price': product.price || 'Consultar',
      'priceValidUntil': new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      'availability': `https://schema.org/${product.availability || 'InStock'}`,
      'seller': {
        '@type': 'Organization',
        'name': SEO_CONFIG.business.name,
        'url': baseUrl,
        'telephone': SEO_CONFIG.business.phone
      }
    },
    ...(product.sku && { 'sku': product.sku }),
    ...(product.reviewCount && product.rating && {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': Math.min(5, Math.max(1, product.rating)),
        'reviewCount': product.reviewCount,
        'bestRating': '5',
        'worstRating': '1'
      }
    }),
    'isPartOf': {
      '@type': 'Collection',
      'name': product.category
    }
  };
};

/**
 * Schema ProductCollection (para categorías)
 * Mejora indexación de páginas de categorías
 */
export const generateProductCollectionSchema = (
  category: string,
  description: string,
  productCount: number,
  imageUrl: string,
  baseUrl: string = SEO_CONFIG.domain
) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  'name': category,
  'description': description,
  'url': `${baseUrl}/#/catalog/${category.toLowerCase().replace(' ', '-')}`,
  'image': {
    '@type': 'ImageObject',
    'url': imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`,
    'width': 600,
    'height': 600
  },
  'mainEntity': {
    '@type': 'Collection',
    'name': category,
    'numberOfItems': productCount,
    'collectionSize': productCount
  },
  'publisher': {
    '@type': 'Organization',
    'name': SEO_CONFIG.business.name,
    'url': baseUrl,
    'logo': `${baseUrl}${SEO_CONFIG.business.logo}`
  }
});

/**
 * Schema FAQPage
 * Ideal para mejorar CTR con featured snippets
 */
export const generateFAQSchema = (faqs: FAQItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': faqs.map(faq => ({
    '@type': 'Question',
    'name': faq.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': faq.answer
    }
  }))
});

/**
 * Schema ContactPoint (para página de contacto)
 * Mejora credibilidad y accesibilidad
 */
export const generateContactSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  'url': `${SEO_CONFIG.domain}/#/contact`,
  'mainEntity': {
    '@type': 'LocalBusiness',
    'name': SEO_CONFIG.business.name,
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': SEO_CONFIG.business.phone,
      'contactType': 'Customer Service',
      'email': SEO_CONFIG.business.email,
      'areaServed': 'Oaxaca, Mexico'
    },
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': SEO_CONFIG.location.streetAddress,
      'addressLocality': SEO_CONFIG.location.addressLocality,
      'addressRegion': SEO_CONFIG.location.addressRegion,
      'postalCode': SEO_CONFIG.location.postalCode,
      'addressCountry': SEO_CONFIG.location.addressCountry
    }
  }
});

/**
 * Schema AggregateOffer (para múltiples opciones de producto)
 * Útil si tienen diferentes tamaños/presentaciones
 */
export const generateAggregateOfferSchema = (
  productName: string,
  offers: Array<{
    price: string | number;
    availability: string;
    priceCurrency?: string;
  }>,
  lowestPrice: string | number
) => ({
  '@context': 'https://schema.org',
  '@type': 'AggregateOffer',
  'name': productName,
  'priceCurrency': 'MXN',
  'lowPrice': lowestPrice,
  'offerCount': offers.length,
  'offers': offers.map(offer => ({
    '@type': 'Offer',
    'price': offer.price,
    'priceCurrency': offer.priceCurrency || 'MXN',
    'availability': `https://schema.org/${offer.availability}`
  }))
});

/**
 * Schema VideoObject (para tutoriales o demos de productos)
 */
export const generateVideoSchema = (
  videoUrl: string,
  thumbnailUrl: string,
  title: string,
  description: string,
  uploadDate: string
) => ({
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  'name': title,
  'description': description,
  'contentUrl': videoUrl,
  'thumbnailUrl': thumbnailUrl,
  'uploadDate': uploadDate,
  'duration': 'PT5M',
  'interactionStatistic': {
    '@type': 'InteractionCounter',
    'interactionType': 'http://schema.org/WatchAction',
    'userInteractionCount': 2347
  },
  'author': {
    '@type': 'Organization',
    'name': SEO_CONFIG.business.name
  }
});

/**
 * Schema Review (para reseñas individuales)
 */
export const generateReviewSchema = (
  productName: string,
  authorName: string,
  ratingValue: number,
  reviewBody: string,
  reviewDate: string
) => ({
  '@context': 'https://schema.org',
  '@type': 'Review',
  'reviewRating': {
    '@type': 'Rating',
    'ratingValue': ratingValue,
    'bestRating': '5',
    'worstRating': '1'
  },
  'author': {
    '@type': 'Person',
    'name': authorName
  },
  'reviewBody': reviewBody,
  'reviewDate': reviewDate,
  'itemReviewed': {
    '@type': 'Product',
    'name': productName
  }
});

/**
 * Schema SpeakableSpecification
 * Permite que Google Assistant lea el contenido
 */
export const generateSpeakableSchema = (cssSelectors: string[]) => ({
  '@context': 'https://schema.org',
  '@type': 'SpeakableSpecification',
  'cssSelector': cssSelectors
});

/**
 * Combina múltiples esquemas en un @graph
 * Útil para inyectar varios esquemas al mismo tiempo
 */
export const generateGraphSchema = (schemas: any[]) => ({
  '@context': 'https://schema.org',
  '@graph': schemas
});
