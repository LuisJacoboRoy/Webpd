/**
 * useHelmet - Hooks personalizados para meta tags y JSON-LD
 * Compatible con React 19+ con @dr.pogodin/react-helmet
 *
 * useHelmetJsonLd retorna JSX directamente (sin useEffect/DOM manipulation)
 * para que el JSON-LD sea visible en el HTML renderizado por el componente.
 */

import React, { useMemo } from 'react';
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
 * Hook para gestionar meta tags de forma sencilla.
 * Actualiza el <head> dinámicamente vía DOM (meta tags no-SEO crítico).
 */
export const useHelmetMeta = (props: HelmetMetaProps) => {
  useEffect(() => {
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

    if (props.description) updateMeta('description', props.description);
    if (props.keywords) updateMeta('keywords', props.keywords);
    if (props.author) updateMeta('author', props.author);
    if (props.robots) updateMeta('robots', props.robots);
    if (props.twitterCard) updateMeta('twitter:card', props.twitterCard);
    if (props.twitterImage) updateMeta('twitter:image', props.twitterImage);

    if (props.ogTitle) updateMeta('og:title', props.ogTitle, true);
    if (props.ogDescription) updateMeta('og:description', props.ogDescription, true);
    if (props.ogImage) updateMeta('og:image', props.ogImage, true);
    if (props.ogUrl) updateMeta('og:url', props.ogUrl, true);

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
 * Hook que retorna un elemento JSX <script type="application/ld+json">.
 * NO usa useEffect ni DOM manipulation.
 * El componente que lo use debe incluir el resultado en su return:
 *
 * @example
 * const jsonLd = useHelmetJsonLd({ '@type': 'Product', name: '...' });
 * return <>{jsonLd}<div>...</div></>;
 */
export const useHelmetJsonLd = (schema: Record<string, unknown>): React.ReactElement => {
  const json = useMemo(() => JSON.stringify(schema), [schema]);
  return React.createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: json },
  });
};
