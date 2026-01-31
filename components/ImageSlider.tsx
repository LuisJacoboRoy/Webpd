
import React from 'react';
import { Link } from 'react-router-dom';

const ImageSlider: React.FC = () => {
  // Configuración de las 10 imágenes proporcionadas por el usuario
  // Se asume que los archivos están en la carpeta /img/ del proyecto
  const items = [
    { 
      id: 'auto-innova', 
      img: 'img/automotriz.png', 
      label: 'Base Color Innova Plus',
      link: '/catalog/automotriz' 
    },
    { 
      id: 'rodillo-cubriente', 
      img: './img/cubriente.png', 
      label: 'Poder Cubriente',
      link: '/catalog/decorativo' 
    },
    { 
      id: 'brocha-intenso', 
      img: 'img/intenso.png', 
      label: 'Color Intenso',
      link: '/catalog/decorativo' 
    },
    { 
      id: 'diamacril-8', 
      img: 'img/diamacril.png', 
      label: 'Diamacril 8 Años',
      link: '/catalog/decorativo' 
    },
    { 
      id: 'poliuretano-madera', 
      img: 'img/maderas.png', 
      label: 'Sistema de Poliuretano',
      link: '/catalog/maderas' 
    },
    { 
      id: 'cromato-zinc-ind', 
      img: 'img/cromato.png', 
      label: 'Cromato de Zinc',
      link: '/catalog/automotriz' 
    },
    { 
      id: 'ureprix-esmalte', 
      img: 'img/ureprix.png', 
      label: 'Esmalte Ureprix',
      link: '/catalog/automotriz' 
    },
    { 
      id: 'innova-red-base', 
      img: 'img/innovared.png', 
      label: 'Innova Plus Red',
      link: '/catalog/automotriz' 
    },
    { 
      id: 'd500-premium-anti', 
      img: 'img/d500.png', 
      label: 'D500 Anticorrosivo',
      link: '/catalog/decorativo' 
    },
    { 
      id: 'dg-rapido', 
      img: 'img/dg.png', 
      label: 'DG Secado Rápido',
      link: '/catalog/decorativo' 
    },
  ];

  // Duplicamos los items para lograr el efecto de scroll infinito sin saltos
  const displayItems = [...items, ...items];

  return (
    <div className="w-full h-[180px] bg-slate-50 border-y border-slate-200 overflow-hidden relative group">
      <div className="animate-scroll py-4">
        {displayItems.map((item, index) => (
          <Link
            key={`${item.id}-${index}`}
            to={item.link}
            className="block w-[320px] h-[140px] flex-shrink-0 relative px-3 transition-transform hover:scale-105 duration-300"
          >
            <div className="w-full h-full relative overflow-hidden rounded-2xl shadow-md border border-white bg-white group/card">
              <img
                src={item.img}
                alt={item.label}
                className="w-full h-full object-cover transition-all duration-500"
                onError={(e) => {
                  // Fallback visual informativo
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/0284c7/ffffff?text=' + item.label;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-4">
                <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-1 drop-shadow-md">
                  {item.label}
                </span>
                <span className="text-blue-300 text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover/card:opacity-100 transition-opacity">
                  Ver Colección →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
