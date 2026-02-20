import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useHelmetJsonLd } from '../hooks/useHelmet';
import { BUSINESS_INFO, BUSINESS_LOCATIONS } from '../data/seo';

/**
 * About Component - Ejemplo de página de inicio con Helmet
 * 
 * Mejoras:
 * - Reemplazo de useMetaTags/useJsonLd con Helmet
 * - useMemo para esquemas JSON-LD
 * - React.memo en exportación
 * - Meta tags dinámicos
 */
const AboutComponent: React.FC = () => {
  const regions = [
    "Oaxaca", "Puebla", "Veracruz", "Chiapas", "Guerrero"
  ];

  const expertises = [
    { title: "Arquitectónica", desc: "Soluciones residenciales y decorativas de alta durabilidad." },
    { title: "Automotriz", desc: "Sistemas de repintado profesional y alta gama." },
    { title: "Maderas", desc: "Barnices y tintas que realzan la belleza natural." },
    { title: "Industrial", desc: "Recubrimientos de alto desempeño para máxima protección." }
  ];

  // Keywords optimizados (máximo 5)
  const keywords = useMemo(() =>
    "pinturas, diamante, oaxaca, 30 años, premium",
    []
  );

  // Schema LocalBusiness memoizado
  const localBusinessSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': BUSINESS_INFO.name,
    'description': 'Empresa mexicana con 30 años de experiencia en soluciones de pintura y recubrimientos',
    'url': BUSINESS_INFO.url,
    'logo': BUSINESS_INFO.logo,
    'foundingDate': '1996',
    'areaServed': regions,
    'sameAs': BUSINESS_INFO.sameAs,
    'location': BUSINESS_LOCATIONS.map(loc => ({
      '@type': 'PostalAddress',
      'streetAddress': loc.address,
      'addressCity': loc.city,
      'addressCountry': 'MX'
    }))
  }), []);

  // Schema BreadcrumbList
  const breadcrumbSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Inicio',
        'item': `${BUSINESS_INFO.url}/#/`
      }
    ]
  }), []);

  // JSON-LD retornado como JSX — se incluye en el return del componente
  const localBusinessJsonLd = useHelmetJsonLd(localBusinessSchema);
  const breadcrumbJsonLd = useHelmetJsonLd(breadcrumbSchema);

  return (
    <>
      {localBusinessJsonLd}
      {breadcrumbJsonLd}
      <Helmet>
        <title>Pinturas Diamante | Líderes en Recubrimientos Mexicanos</title>
        <meta name="description" content="30 años de experiencia en pinturas de calidad premium. Soluciones automotriz, maderas y decorativo. Presencia en Oaxaca, Puebla, Veracruz y más." />
        <meta name="keywords" content={keywords} />

        {/* Open Graph */}
        <meta property="og:title" content="Pinturas Diamante | 30 Años de Excelencia" />
        <meta property="og:description" content="Empresa mexicana líder en soluciones de pintura y recubrimientos de alta gama" />
        <meta property="og:image" content={BUSINESS_INFO.logo} />
        <meta property="og:url" content={BUSINESS_INFO.url} />
        <meta property="og:type" content="business.business" />

        {/* Canonical */}
        <link rel="canonical" href={BUSINESS_INFO.url} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="mb-24">
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-none">
            30 Años de <span className="text-blue-600">Excelencia</span> en Pintura
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl font-medium">
            Desde 1996, Pinturas Diamante es sinónimo de calidad, durabilidad y confianza en México.
            Sirviendo a profesionales y empresas con soluciones de recubrimiento de clase mundial.
          </p>
        </div>

        {/* Timeline / History */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8">
            <div className="text-5xl font-black text-blue-600 mb-2">30+</div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Años en el Mercado</h3>
            <p className="text-sm text-slate-600">Desde 1996, construyendo confianza y calidad</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-8">
            <div className="text-5xl font-black text-emerald-600 mb-2">5+</div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Regiones Servidas</h3>
            <p className="text-sm text-slate-600">Cobertura en todo México central y sur</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8">
            <div className="text-5xl font-black text-orange-600 mb-2">66+</div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Productos</h3>
            <p className="text-sm text-slate-600">Soluciones especializadas para cada aplicación</p>
          </div>
        </div>

        {/* Expertise Areas */}
        <div className="mb-24">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-12">Nuestras Especialidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {expertises.map((exp, i) => (
              <div key={i} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black mb-4">
                  {i + 1}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{exp.title}</h3>
                <p className="text-sm text-slate-600">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Presence */}
        <div className="mb-24">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-12">Presencia Regional</h2>
          <div className="flex flex-wrap gap-4">
            {regions.map((region, i) => (
              <div key={i} className="px-6 py-3 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                {region}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-black text-white mb-6">¿Necesitas Soluciones de Pintura?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Contáctanos para conocer nuestras líneas de productos especializados
            y soluciones personalizadas para tu negocio.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/catalog"
              className="px-8 py-4 bg-white text-blue-600 font-black rounded-2xl hover:bg-slate-50 transition-all text-sm uppercase tracking-widest"
            >
              Ver Catálogo
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-blue-800 text-white font-black rounded-2xl hover:bg-blue-900 transition-all text-sm uppercase tracking-widest"
            >
              Contactar Ahora
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

// Exportar con React.memo para optimizar re-renders
export default React.memo(AboutComponent);
