/**
 * useHelmet - Hook personalizado para Helmet
 * Simplifica el manejo de meta tags y Helmet en componentes
 * Compatible con SSR
 */

import { useEffect } from 'react';

interface HelmetMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  robots?: string;
  author?: string;
  twitterCard?: string;
  twitterImage?: string;
}

/**
 * Hook para gestionar meta tags de forma sencilla
 * Reemplaza useMetaTags personalizado
 * 
 * @example
 * useHelmet({
 *   title: 'Productos',
 *   description: 'Nuestros productos',
 *   ogImage: '/image.jpg'
 * })
 */
export const useHelmetMeta = (props: HelmetMetaProps) => {
  useEffect(() => {
    // Actualizar meta tags dinámicamente
    const updateMeta = (name: string, value: string, property = false) => {
      const attr = property ? 'property' : 'name';
      const selector = property 
        ? `meta[property="${name}"]` 
        : `meta[name="${name}"]`;
      
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', value);
    };

    // Aplicar todos los meta tags
    if (props.description) updateMeta('description', props.description);
    if (props.keywords) updateMeta('keywords', props.keywords);
    if (props.author) updateMeta('author', props.author);
    if (props.robots) updateMeta('robots', props.robots);
    if (props.twitterCard) updateMeta('twitter:card', props.twitterCard);
    if (props.twitterImage) updateMeta('twitter:image', props.twitterImage);
    
    // Open Graph
    if (props.ogTitle) updateMeta('og:title', props.ogTitle, true);
    if (props.ogDescription) updateMeta('og:description', props.ogDescription, true);
    if (props.ogImage) updateMeta('og:image', props.ogImage, true);
    if (props.ogUrl) updateMeta('og:url', props.ogUrl, true);
    
    // Canonical
    if (props.canonical) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = props.canonical;
    }
  }, [props]);
};

/**
 * Hook para inyectar JSON-LD con Helmet
 * Reemplaza useJsonLd personalizado
 * 
 * @example
 * useHelmetJsonLd({
 *   '@type': 'Product',
 *   'name': 'Mi producto'
 * })
 */
export const useHelmetJsonLd = (schema: any) => {
  useEffect(() => {
    // Generar ID único para el script
    const scriptId = `json-ld-${Date.now()}-${Math.random()}`;
    
    // Verificar si el script ya existe
    let script = document.querySelector(
      `script[data-ld-json="${scriptId}"]`
    ) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-ld-json', scriptId);
      document.head.appendChild(script);
    }
    
    // Actualizar contenido
    script.textContent = JSON.stringify(schema);
    
    return () => {
      // Cleanup opcional: comentar si necesitas que persista
      // if (script && document.head.contains(script)) {
      //   document.head.removeChild(script);
      // }
    };
  }, [schema]);
};
