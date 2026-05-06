import React from 'react';
import { JsonLd } from './JsonLd';
import { BUSINESS_INFO, BUSINESS_LOCATIONS, SEO_KEYWORDS, SEO_DESCRIPTIONS } from '../data/seo';

/**
 * SEOSchemaProvider
 * Envuelve tu app para inyectar schemas JSON-LD globales
 * 
 * Uso:
 * <SEOSchemaProvider>
 *   <App />
 * </SEOSchemaProvider>
 */
interface SEOSchemaProviderProps {
  children: React.ReactNode;
  pageType?: 'home' | 'catalog' | 'product' | 'contact' | 'about' | 'custom';
  customSchema?: any;
}

export const SEOSchemaProvider: React.FC<SEOSchemaProviderProps> = ({ 
  children, 
  pageType = 'home',
  customSchema 
}) => {
  // Schema base de Organization con todas las ubicaciones
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BUSINESS_INFO.url}/#organization`,
    name: BUSINESS_INFO.name,
    description: BUSINESS_INFO.description,
    url: BUSINESS_INFO.url,
    logo: {
      '@type': 'ImageObject',
      url: BUSINESS_INFO.logo,
      width: 200,
      height: 200
    },
    email: BUSINESS_INFO.email,
    telephone: BUSINESS_INFO.phone,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BUSINESS_INFO.phone,
      contactType: 'Customer Service',
      email: BUSINESS_INFO.email,
      availableLanguage: ['es', 'es-MX']
    },
    sameAs: BUSINESS_INFO.sameAs,
    address: BUSINESS_LOCATIONS.map(location => ({
      '@type': 'PostalAddress',
      streetAddress: location.address,
      addressLocality: location.city,
      postalCode: location.postalCode,
      addressCountry: 'MX',
      telephone: location.phone
    }))
  };

  // Schema de LocalBusiness (para cada ubicación)
  const localBusinessSchemas = BUSINESS_LOCATIONS.map(location => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BUSINESS_INFO.url}/#business-${location.id}`,
    name: location.name,
    description: `${BUSINESS_INFO.name} - ${location.name}`,
    image: BUSINESS_INFO.logo,
    telephone: location.phone,
    url: BUSINESS_INFO.url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.address,
      addressLocality: location.city,
      postalCode: location.postalCode,
      addressCountry: 'MX'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.latitude,
      longitude: location.longitude
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:30',
      closes: '18:30'
    },
    areaServed: {
      '@type': 'City',
      name: location.city,
      addressCountry: 'MX'
    }
  }));

  // Schema de WebSite para búsquedas
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BUSINESS_INFO.url}/#website`,
    url: BUSINESS_INFO.url,
    name: BUSINESS_INFO.name,
    description: BUSINESS_INFO.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BUSINESS_INFO.url}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  // Schema de BreadcrumbList (dinámico según página)
  const getBreadcrumbSchema = () => {
    const baseUrl = BUSINESS_INFO.url;
    const breadcrumbs: any[] = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: baseUrl
      }
    ];

    if (pageType === 'catalog') {
      breadcrumbs.push({
        '@type': 'ListItem',
        position: 2,
        name: 'Catálogo',
        item: `${baseUrl}/catalog`
      });
    }

    if (pageType === 'product') {
      breadcrumbs.push(
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Catálogo',
          item: `${baseUrl}/catalog`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Producto',
          item: `${baseUrl}/product`
        }
      );
    }

    if (pageType === 'about') {
      breadcrumbs.push({
        '@type': 'ListItem',
        position: 2,
        name: 'Acerca de',
        item: `${baseUrl}/about`
      });
    }

    if (pageType === 'contact') {
      breadcrumbs.push({
        '@type': 'ListItem',
        position: 2,
        name: 'Contacto',
        item: `${baseUrl}/contact`
      });
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${baseUrl}/#breadcrumb-${pageType}`,
      itemListElement: breadcrumbs
    };
  };

  // Schema de FAQPage (para mejorar Rich Results)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${BUSINESS_INFO.url}/#faq`,
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Dónde comprar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Visita nuestras sucursales en ${BUSINESS_LOCATIONS.map(l => l.city).join(' o ')} o contacta directamente.`
        }
      },
      {
        '@type': 'Question',
        name: '¿Cuáles son los horarios?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Lunes a Viernes de 8:30 am a 6:30 pm, Sábados de 8:30 am a 4:30 pm (verificar sucursal específica)`
        }
      },
      {
        '@type': 'Question',
        name: '¿Tienes garantía?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Todos nuestros productos cuentan con garantía de calidad. Consulta condiciones específicas por producto.'
        }
      }
    ]
  };

  return (
    <>
      {/* Schema principal de Organization */}
      <JsonLd data={organizationSchema} id="org-schema" />

      {/* Schemas de LocalBusiness para cada ubicación */}
      {localBusinessSchemas.map((schema, idx) => (
        <JsonLd 
          key={`local-${idx}`}
          data={schema} 
          id={`local-business-${idx}`}
        />
      ))}

      {/* Schema de WebSite */}
      <JsonLd data={websiteSchema} id="website-schema" />

      {/* Schema de BreadcrumbList (dinámico) */}
      <JsonLd data={getBreadcrumbSchema()} id="breadcrumb-schema" />

      {/* Schema de FAQ */}
      <JsonLd data={faqSchema} id="faq-schema" />

      {/* Custom schema si se proporciona */}
      {customSchema && (
        <JsonLd data={customSchema} id="custom-schema" />
      )}

      {/* Contenido de la aplicación */}
      {children}
    </>
  );
};

/**
 * Hook para obtener schemas configurados
 * Útil para componentes específicos
 */
export const useSEOSchemas = (pageType?: 'home' | 'catalog' | 'product' | 'contact' | 'about') => {
  return {
    businessInfo: BUSINESS_INFO,
    businessLocations: BUSINESS_LOCATIONS,
    seoKeywords: SEO_KEYWORDS[pageType || 'home'] || [],
    seoDescription: SEO_DESCRIPTIONS[pageType as keyof typeof SEO_DESCRIPTIONS] || '',
  };
};

export default SEOSchemaProvider;
