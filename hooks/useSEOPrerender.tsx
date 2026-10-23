/**
 * Hook para Integración de SEO Prerendering
 * Maneja metadatos dinámicos para productos y categorías
 * Compatible con client-side y server-side rendering
 */

import React, { useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import {
  generateProductSEOData,
  generateCategorySEOData,
  generateOrganizationSchema,
  generateLocalBusinessSchema
} from '../utils/seoPrerender';

/**
 * Hook para aplicar SEO a una página de producto
 * Integra: JSON-LD, Open Graph, Twitter Cards, Meta Tags
 */
export const useSEOProduct = (productId: string) => {
  const seoData = generateProductSEOData(productId);

  useEffect(() => {
    if (seoData) {
      // Inyectar structured data en DOM
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(seoData.structuredData);
      document.head.appendChild(script);

      // Actualizar URL canónica dinámica
      const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]') || 
                          document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = seoData.canonical;
      if (!document.head.contains(canonicalLink)) {
        document.head.appendChild(canonicalLink);
      }

      return () => {
        script.remove();
      };
    }
  }, [productId, seoData]);

  return seoData;
};

/**
 * Hook para aplicar SEO a una página de categoría
 */
export const useSEOCategory = (categoryId: string) => {
  const seoData = generateCategorySEOData(categoryId);

  useEffect(() => {
    if (seoData) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(seoData.structuredData);
      document.head.appendChild(script);

      const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]') || 
                          document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = seoData.canonical;
      if (!document.head.contains(canonicalLink)) {
        document.head.appendChild(canonicalLink);
      }

      return () => script.remove();
    }
  }, [categoryId, seoData]);

  return seoData;
};

/**
 * Componente Helmet wrapper para renderizar metadatos SEO
 * Uso: <SEOHelmet seoData={seoData} />
 */
export const SEOHelmet: React.FC<{
  seoData: any;
  children?: React.ReactNode;
}> = ({ seoData, children }) => {
  if (!seoData) return <>{children}</>;

  return (
    <Helmet>
      {/* Título y Descripción */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />

      {/* Canonical */}
      <link rel="canonical" href={seoData.canonical} />

      {/* Open Graph */}
      {Object.entries(seoData.openGraphTags).map(([key, value]) => (
        <meta key={key} property={key} content={String(value)} />
      ))}

      {/* Twitter Card */}
      {Object.entries(seoData.twitterCard).map(([key, value]) => (
        <meta key={key} name={key} content={String(value)} />
      ))}

      {/* Structured Data Script */}
      <script type="application/ld+json">
        {JSON.stringify(seoData.structuredData)}
      </script>

      {children}
    </Helmet>
  );
};

/**
 * Hook para aplicar Organization Schema a nivel global
 * Ejecutar una sola vez en App.tsx
 */
export const useOrganizationSchema = () => {
  useEffect(() => {
    const schema = generateOrganizationSchema();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => script.remove();
  }, []);
};

/**
 * Hook para aplicar Local Business Schema
 */
export const useLocalBusinessSchema = () => {
  useEffect(() => {
    const schema = generateLocalBusinessSchema();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => script.remove();
  }, []);
};

/**
 * Hook para validar y reportar problemas SEO
 */
export const useSEOValidation = (seoData: any) => {
  useEffect(() => {
    if (!seoData || process.env.NODE_ENV === 'production') return;

    const issues: string[] = [];

    // Validación de título
    if (!seoData.title) {
      issues.push('❌ Falta título SEO');
    } else if (seoData.title.length < 30) {
      issues.push('⚠️ Título muy corto (< 30 caracteres)');
    } else if (seoData.title.length > 60) {
      issues.push('⚠️ Título muy largo (> 60 caracteres)');
    }

    // Validación de descripción
    if (!seoData.description) {
      issues.push('❌ Falta descripción meta');
    } else if (seoData.description.length < 120) {
      issues.push('⚠️ Descripción muy corta (< 120 caracteres)');
    } else if (seoData.description.length > 160) {
      issues.push('⚠️ Descripción muy larga (> 160 caracteres)');
    }

    // Validación de imagen OG
    if (!seoData.ogImage) {
      issues.push('⚠️ Falta imagen Open Graph');
    }

    // Validación de datos estructurados
    if (!seoData.structuredData) {
      issues.push('❌ Falta structured data');
    }

    // Validación de canónica
    if (!seoData.canonical) {
      issues.push('❌ Falta URL canónica');
    }

    if (issues.length > 0) {
      console.group('🔍 SEO Validation Report');
      issues.forEach(issue => console.warn(issue));
      console.groupEnd();
    } else {
      console.log('✅ SEO validation passed');
    }
  }, [seoData]);
};

/**
 * Hook para actualizar meta tags dinámicamente
 */
export const useDynamicMetaTags = (
  title: string,
  description: string,
  image?: string,
  url?: string
) => {
  useEffect(() => {
    // Título
    document.title = title;

    // Meta description
    const descriptionMeta = document.querySelector('meta[name="description"]') ||
                          document.createElement('meta');
    descriptionMeta.setAttribute('name', 'description');
    descriptionMeta.setAttribute('content', description);
    if (!document.head.contains(descriptionMeta)) {
      document.head.appendChild(descriptionMeta);
    }

    // OG Image
    if (image) {
      const ogImage = document.querySelector('meta[property="og:image"]') ||
                     document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      ogImage.setAttribute('content', image);
      if (!document.head.contains(ogImage)) {
        document.head.appendChild(ogImage);
      }
    }

    // Canonical
    if (url) {
      const canonical = document.querySelector('link[rel="canonical"]') ||
                       document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', url);
      if (!document.head.contains(canonical)) {
        document.head.appendChild(canonical);
      }
    }
  }, [title, description, image, url]);
};
