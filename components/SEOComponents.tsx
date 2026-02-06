/**
 * Componente SEO Wrapper
 * Integración fácil de SEO en componentes de producto y categoría
 * Sin afectar código existente
 */

import React, { useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useSEOProduct, useSEOCategory, SEOHelmet } from '../hooks/useSEOPrerender';

/**
 * Wrapper para ProductDetail con SEO automático
 */
export const ProductDetailWithSEO: React.FC<{
  productId: string;
  children: React.ReactNode;
}> = ({ productId, children }) => {
  const seoData = useSEOProduct(productId);

  return (
    <>
      {seoData && <SEOHelmet seoData={seoData} />}
      {children}
    </>
  );
};

/**
 * Wrapper para CategoryView con SEO automático
 */
export const CategoryViewWithSEO: React.FC<{
  categoryId: string;
  children: React.ReactNode;
}> = ({ categoryId, children }) => {
  const seoData = useSEOCategory(categoryId);

  return (
    <>
      {seoData && <SEOHelmet seoData={seoData} />}
      {children}
    </>
  );
};

/**
 * Componente SEO Status Debug
 * Para desarrollo: muestra estado SEO actual
 */
export const SEOStatusDebug: React.FC<{ seoData: any }> = ({ seoData }) => {
  if (process.env.NODE_ENV !== 'development' || !seoData) return null;

  const issues = [];

  if (!seoData.title || seoData.title.length < 30) {
    issues.push('Title < 30 chars');
  }
  if (seoData.title && seoData.title.length > 60) {
    issues.push('Title > 60 chars');
  }
  if (!seoData.description || seoData.description.length < 120) {
    issues.push('Description < 120 chars');
  }
  if (seoData.description && seoData.description.length > 160) {
    issues.push('Description > 160 chars');
  }
  if (!seoData.ogImage) {
    issues.push('Missing OG Image');
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '15px',
        backgroundColor: issues.length > 0 ? '#fee' : '#efe',
        border: `2px solid ${issues.length > 0 ? '#f00' : '#0f0'}`,
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        maxWidth: '300px',
        zIndex: 9999,
        maxHeight: '200px',
        overflowY: 'auto'
      }}
    >
      <strong>SEO Status</strong>
      <div style={{ marginTop: '10px' }}>
        {issues.length === 0 ? (
          <span style={{ color: 'green' }}>✅ OK</span>
        ) : (
          <>
            {issues.map((issue, i) => (
              <div key={i} style={{ color: 'red' }}>
                ⚠️ {issue}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Meta Tag Preview para desenvolvimento
 * Mostra como se vería en buscadores y redes sociales
 */
export const MetaTagPreview: React.FC<{ seoData: any }> = ({ seoData }) => {
  if (!seoData) return null;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h3>🔍 Google Search Preview</h3>
      <div style={{ fontSize: '14px', marginBottom: '20px' }}>
        <div style={{ color: '#1a73e8', fontSize: '16px', marginBottom: '5px' }}>
          {seoData.title}
        </div>
        <div style={{ color: '#006621', fontSize: '14px', marginBottom: '5px' }}>
          {seoData.canonical}
        </div>
        <div style={{ color: '#666', fontSize: '13px' }}>
          {seoData.description}
        </div>
      </div>

      <h3>📱 Facebook Preview</h3>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '20px'
        }}
      >
        <img
          src={seoData.ogImage}
          alt="OG Image"
          style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'cover' }}
        />
        <div style={{ padding: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
            {seoData.openGraphTags['og:title']}
          </div>
          <div style={{ color: '#666', fontSize: '13px' }}>
            {seoData.openGraphTags['og:description']?.substring(0, 100)}...
          </div>
        </div>
      </div>

      <h3>🐦 Twitter Preview</h3>
      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: '#fff'
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>
          {seoData.twitterCard['twitter:title']}
        </div>
        <img
          src={seoData.twitterCard['twitter:image']}
          alt="Twitter Image"
          style={{ width: '100%', borderRadius: '8px', marginBottom: '8px' }}
        />
        <div style={{ color: '#666', fontSize: '13px' }}>
          {seoData.twitterCard['twitter:description']?.substring(0, 100)}...
        </div>
      </div>
    </div>
  );
};

/**
 * JSON-LD Viewer
 * Para inspeccionar datos estructurados
 */
export const JSONLDViewer: React.FC<{ seoData: any }> = ({ seoData }) => {
  const [expanded, setExpanded] = React.useState(false);

  if (!seoData?.structuredData) return null;

  return (
    <div
      style={{
        padding: '15px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        marginTop: '20px'
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '8px 12px',
          marginBottom: '10px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        {expanded ? '▼' : '▶'} JSON-LD Structured Data
      </button>

      {expanded && (
        <pre
          style={{
            overflow: 'auto',
            backgroundColor: '#fff',
            padding: '10px',
            borderRadius: '4px',
            maxHeight: '400px'
          }}
        >
          {JSON.stringify(seoData.structuredData, null, 2)}
        </pre>
      )}
    </div>
  );
};
