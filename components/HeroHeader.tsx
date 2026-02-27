
import React, { useEffect, useMemo, useState } from 'react';

const HEAD_IMAGES = [
  '/img/heads/head (1).jpg',
  '/img/heads/head (2).jpg',
  '/img/heads/head (3).jpg',
  '/img/heads/head (4).jpg',
];

const HeroHeader: React.FC = () => {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);

  // Selección aleatoria estable durante el ciclo de vida del componente
  const bgImage = useMemo(
    () => HEAD_IMAGES[Math.floor(Math.random() * HEAD_IMAGES.length)],
    []
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative h-[350px] w-full overflow-hidden flex items-center justify-center bg-slate-900">
      {/* Background con imagen aleatoria de /img/heads/ */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: `url("${bgImage}")`,
          transform: `translateY(${offsetY * 0.2}px)`
        }}
      />

      {/* Color overlay - Blue tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-slate-50 z-1" />

      {/* Centered Logo Content */}
      <div
        className="relative z-10 flex flex-col items-center transition-transform duration-300 ease-out"
        style={{ transform: `translateY(${offsetY * -0.05}px)` }}
      >
        <img src="/img/logo.png" alt="Pinturas Diamante Logo" className="w-24 h-24 object-contain mb-4" />
        <h1 className="mt-6 text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-lg text-center uppercase">
          PINTURAS<span className="text-blue-400"> DIAMANTE</span>
        </h1>
        <p className="mt-2 text-blue-100 font-medium tracking-widest uppercase text-[10px] opacity-60">
          Oaxaca: Bienvenido
        </p>
      </div>
    </div>
  );
};

export default HeroHeader;
