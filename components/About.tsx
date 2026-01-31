
import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const regions = [
    "Oaxaca", "Puebla", "Veracruz", "Chiapas", "Guerrero"
  ];

  const expertises = [
    { title: "Arquitectónica", desc: "Soluciones residenciales y decorativas de alta durabilidad." },
    { title: "Automotriz", desc: "Sistemas de repintado profesional y alta gama." },
    { title: "Maderas", desc: "Barnices y tintas que realzan la belleza natural." },
    { title: "Industrial", desc: "Recubrimientos de alto desempeño para máxima protección." }
  ];

  return (
    <section className="flex flex-col items-center px-4 py-16 md:py-24 max-w-7xl mx-auto overflow-hidden">
      {/* Hero Badge */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 flex flex-col items-center text-center">
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-blue-600 text-white mb-8 shadow-lg shadow-blue-200">
          30 Años de Experiencia
        </span>
        
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 mb-8 leading-none uppercase">
          Nuestra <span className="text-blue-600">Empresa</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left mb-20">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight">
              Líderes Mexicanos en Innovación de <span className="text-blue-600">Pinturas y Recubrimientos</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              <strong>Diamante Pinturas</strong> es una empresa orgullosamente mexicana con tres décadas de trayectoria ofreciendo soluciones de recubrimiento de la más alta calidad. Nuestra pasión por la innovación y el compromiso con la excelencia nos permiten satisfacer las demandas más exigentes del mercado nacional.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Desde proyectos residenciales y decorativos, hasta aplicaciones especializadas en maderas, flores, e industrias, proporcionamos productos diseñados para resistir y embellecer. Somos expertos en <strong>pintura automotriz</strong> de alto desempeño.
            </p>
            
            {/* SEO Regions Tag Cloud */}
            <div className="pt-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Presencia Regional Sur-Sureste</h3>
              <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                  <span key={region} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-sm font-bold border border-slate-200">
                    {region}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-blue-600 to-blue-800 p-1 shadow-2xl overflow-hidden group">
              <div className="w-full h-full rounded-[2.8rem] bg-white flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-50 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10 text-center p-10">
                  <span className="text-8xl font-black text-blue-600/20 block mb-2 italic">30</span>
                  <span className="text-xl font-black text-slate-900 uppercase tracking-tighter">Años Transformando México</span>
                  <div className="w-12 h-1 bg-blue-600 mx-auto mt-4 rounded-full" />
                </div>
              </div>
            </div>
            {/* Decorative floaters */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-700" />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {expertises.map((item, idx) => (
            <div key={idx} className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-20 flex flex-col sm:flex-row gap-6 justify-center w-full max-w-2xl">
          <Link 
            to="/catalog" 
            className="flex-1 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 text-center uppercase tracking-widest text-sm"
          >
            Explorar Catálogo
          </Link>
          <Link 
            to="/contact" 
            className="flex-1 px-8 py-4 bg-white text-slate-900 font-black rounded-2xl border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-all text-center uppercase tracking-widest text-sm"
          >
            Nuestras Sucursales
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About;
