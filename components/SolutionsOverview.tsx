import React from 'react';
import { Link } from 'react-router-dom';

const solutionLines = [
  [
    { label: 'Vinílicas', categoryId: 'decorativo' },
    { label: 'Esmaltes', categoryId: 'decorativo' },
    { label: 'Impermeabilizantes', categoryId: 'decorativo' },
    { label: 'Aerosoles', categoryId: 'decorativo' }
  ],
  [
    { label: 'Barnices para madera', categoryId: 'maderas' },
    { label: 'Repintado automotriz', categoryId: 'automotriz' }
  ]
];

const SolutionsOverview: React.FC = () => (
  <section
    aria-label="Nuestras soluciones de pintura"
    className="mb-24 bg-white py-2"
    data-scroll-animate
  >
    <div className="mb-5 flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
      <img
        src="/img/soluciones-titulo.png"
        alt="Nuestras Soluciones"
        width="532"
        height="150"
        className="h-auto w-full max-w-[535px] object-contain object-left"
      />
      <img
        src="/img/diamante-pinturas-logo.png"
        alt="Diamante Pinturas"
        width="318"
        height="86"
        className="h-auto w-3/4 max-w-[310px] object-contain sm:mt-5 sm:w-[30%]"
      />
    </div>

    <p className="text-lg leading-[1.35] text-[#6b6b6b] sm:text-xl">
      En Diamante Pinturas, nos apasiona ofrecer soluciones completas para todas sus necesidades de pintura.
      Somos su aliado de confianza, brindándole una amplia gama de productos de alta calidad para proyectos
      tanto interiores como exteriores.
    </p>

    <div className="mt-7 space-y-1 text-center uppercase tracking-[0.18em] text-[#7eaa91] sm:text-xl sm:tracking-[0.22em]">
      {solutionLines.map((line, lineIndex) => (
        <ul key={lineIndex} className="flex flex-wrap justify-center gap-x-3">
          {line.map((item, itemIndex) => (
            <li key={item.label} className="flex items-center gap-3">
              <Link
                to={`/catalog/${item.categoryId}`}
                className="transition-colors hover:text-[#168345] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#168345]"
              >
                {item.label}
              </Link>
              {itemIndex < line.length - 1 && <span aria-hidden="true">-</span>}
            </li>
          ))}
        </ul>
      ))}
    </div>
  </section>
);

export default SolutionsOverview;
