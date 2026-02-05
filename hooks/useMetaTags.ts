import { useEffect } from 'react';

interface MetaTagsConfig {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
}

export const useMetaTags = (config: MetaTagsConfig) => {
  useEffect(() => {
    // Actualizar título
    if (config.title) {
      document.title = config.title;
    }

    // Helper para actualizar meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Meta tags estándar
    if (config.description) {
      updateMetaTag('description', config.description);
    }

    // Open Graph meta tags
    if (config.ogTitle) {
      updateMetaTag('og:title', config.ogTitle, true);
    }
    if (config.ogDescription) {
      updateMetaTag('og:description', config.ogDescription, true);
    }
    if (config.ogImage) {
      updateMetaTag('og:image', config.ogImage, true);
    }
    if (config.ogType) {
      updateMetaTag('og:type', config.ogType, true);
    }

    // URL canónica
    if (config.canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = config.canonicalUrl;
    }
  }, [config]);
};
