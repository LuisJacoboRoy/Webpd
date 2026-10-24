import React, { useContext } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ReviewRedirectContext } from '../context/ReviewRedirectContext';

const PaginaResena: React.FC = () => {
  const { secondsRemaining } = useContext(ReviewRedirectContext);

  return (
    <>
      <Helmet>
        <title>Comparte tu experiencia | Pinturas Diamante</title>
        <meta
          name="description"
          content="Tu opinión ayuda a Pinturas Diamante a seguir mejorando. Déjanos una reseña en Google."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 text-slate-900">
        <section
          aria-labelledby="review-title"
          className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-xl shadow-slate-900/10 sm:p-8"
        >
          <img
            src="https://pinturasdiamante.com/img/catalog/LOGO-WEB-DIAMANTE-PNG.png"
            alt="Pinturas Diamante"
            className="mx-auto mb-6 h-16 w-auto object-contain"
          />
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-700">
            Gracias por visitarnos
          </p>
          <h1 id="review-title" className="mb-3 text-3xl font-bold leading-tight">
            Tu opinión nos ayuda a mejorar
          </h1>
          <p className="mb-7 text-base leading-relaxed text-slate-600">
            Comparte tu experiencia con Pinturas Diamante. Solo te tomará un momento.
          </p>

          <ol className="mb-7 space-y-4 text-left">
            <li className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 font-bold text-white">
                1
              </span>
              <span className="pt-1 leading-relaxed">
                <strong>Paso 1:</strong> Déjanos tu reseña en Google.
              </span>
            </li>
            <li className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 font-bold text-white">
                2
              </span>
              <span className="pt-1 leading-relaxed">
                <strong>Paso 2:</strong> Regresa a esta pestaña para seguirnos en Facebook.
              </span>
            </li>
          </ol>

          <a
            href="https://google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-emerald-700 px-5 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-700/20 transition-colors hover:bg-emerald-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Dejar reseña en Google
          </a>
          <p className="mt-4 text-sm text-slate-500">
            Esta pestaña te llevará a Facebook en {secondsRemaining} segundos.
          </p>
        </section>
      </main>
    </>
  );
};

export default PaginaResena;
