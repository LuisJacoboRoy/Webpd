import React from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BUSINESS_INFO, BUSINESS_LOCATIONS } from '../data/seo';
import { CATEGORIES } from '../data/products';
import { businessLocationPath, categoryPath } from '../utils/routes';
import { useJsonLd } from '../hooks/useJsonLd';
import { generateBusinessLocationSchema } from '../utils/localBusinessSchema';

const BusinessLocationPage: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const location = BUSINESS_LOCATIONS.find(item => item.id === locationId);

  if (!location) return <Navigate to="/contact" replace />;
  return <BusinessLocationDetails location={location} />;
};

const BusinessLocationDetails: React.FC<{
  location: (typeof BUSINESS_LOCATIONS)[number];
}> = ({ location }) => {

  const pageUrl = `${BUSINESS_INFO.url}${businessLocationPath(location.id)}`;
  useJsonLd(generateBusinessLocationSchema(location));

  const phoneLink = location.phone.replace(/[^\d+]/g, '');
  const mobileLink = location.mobile.replace(/[^\d+]/g, '');

  return (
    <>
      <Helmet>
        <title>{location.seoTitle}</title>
        <meta name="description" content={location.seoDescription} />
        <link rel="canonical" href={pageUrl} />
      </Helmet>
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-20">
        <nav aria-label="Ruta de navegación" className="mb-8 text-sm text-slate-500">
          <Link className="hover:text-blue-700 hover:underline" to="/">
            Inicio
          </Link>
          <span aria-hidden="true"> / </span>
          <Link className="hover:text-blue-700 hover:underline" to="/contact">
            Sucursales
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{location.name}</span>
        </nav>

        <header className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-700">
            Pinturas Diamante · Oaxaca
          </p>
          <h1 className="mb-5 text-3xl font-black leading-tight text-slate-900 sm:text-5xl">
            Pinturas en {location.searchArea}
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-slate-600">
            Visita nuestra sucursal {location.name.toLowerCase()} para conocer las líneas de pintura
            automotriz, para madera y decorativa de Pinturas Diamante. Nuestro equipo puede orientarte
            para encontrar opciones para tu proyecto.
          </p>
        </header>

        <section
          aria-labelledby="location-details-title"
          className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-9 md:grid-cols-2"
        >
          <div>
            <h2 id="location-details-title" className="mb-5 text-2xl font-bold text-slate-900">
              Visítanos
            </h2>
            <h3 className="mb-2 font-semibold text-slate-800">{location.name}</h3>
            <address className="mb-5 not-italic leading-relaxed text-slate-600">
              {location.address}
              <br />
              {location.locality}, Oaxaca, C.P. {location.postalCode}
            </address>
            <p className="mb-2 font-semibold text-slate-800">Horario de atención</p>
            <p className="mb-6 leading-relaxed text-slate-600">{location.hours}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={location.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                Cómo llegar en Google Maps
              </a>
              <a
                href={`tel:${phoneLink}`}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              >
                Llamar {location.phone}
              </a>
              <a
                href={`https://wa.me/${mobileLink.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-green-300 px-5 py-3 font-bold text-green-800 hover:bg-green-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-green-700"
              >
                WhatsApp {location.mobile}
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-6">
            <h2 className="mb-3 text-xl font-bold text-slate-900">Encuentra la pintura adecuada</h2>
            <p className="mb-5 leading-relaxed text-slate-600">
              Explora las líneas disponibles en nuestro catálogo y consulta directamente con la
              sucursal sobre el producto que necesitas.
            </p>
            <ul className="space-y-3">
              {CATEGORIES.map(category => (
                <li key={category.id}>
                  <Link
                    className="font-semibold text-blue-700 underline-offset-2 hover:underline"
                    to={categoryPath(category.id)}
                  >
                    Pinturas {category.name.toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <p className="mt-8 text-sm text-slate-500">
          ¿Buscas otra ubicación?{' '}
          <Link className="font-semibold text-blue-700 hover:underline" to="/contact">
            Consulta todas nuestras sucursales en Oaxaca.
          </Link>
        </p>
      </main>
    </>
  );
};

export default BusinessLocationPage;
