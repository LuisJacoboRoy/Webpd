import React from 'react';

const CatalogIntro: React.FC = () => (
  <section
    aria-label="Soluciones integrales en pintura"
    className="mb-[25px] grid max-h-[250px] w-full grid-cols-1 overflow-hidden bg-[#009846] text-white sm:min-h-[210px] sm:grid-cols-[34%_66%]"
  >
    <div className="flex items-center bg-[#686868] px-[10%] py-3 sm:py-5">
      <h2 className="text-xl font-light leading-tight sm:text-2xl lg:text-[30px]">
        Su proveedor integral de soluciones en pintura
      </h2>
    </div>
    <div className="flex items-center px-[10%] py-3 sm:border-l sm:border-white/60 sm:py-5">
      <p className="text-xs leading-[1.35] sm:text-sm lg:text-base">
        Nuestra selección abarca desde pinturas vinílicas de calidad premium, gran cobertura y lavabilidad,
        ideales para paredes y techos, hasta esmaltes anticorrosivos de secado rápido para proteger superficies
        metálicas. También contamos con primarios estructurales para mejorar la adhesión, impermeabilizantes
        para mantener su hogar seco, aerosoles para retoques rápidos, barnices para realzar la madera y pintura
        automotriz para un acabado impecable en su vehículo.
      </p>
    </div>
  </section>
);

export default CatalogIntro;
