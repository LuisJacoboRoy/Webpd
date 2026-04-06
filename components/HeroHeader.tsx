
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
      {/* Color overlay - Green tint oscuro */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/40 via-transparent to-slate-50 z-1" />

      {/* Centered Logo Content */}
      <div
        className="relative z-10 flex flex-col items-center transition-transform duration-300 ease-out"
        style={{ transform: `translateY(${offsetY * -0.05}px)` }}
      >
        <img src="https://pinturasdiamante.com/img/logo.png" alt="Pinturas Diamante Logo" className="w-64 h-64 object-contain" />
        <p className="mt-6 text-black font-black tracking-widest uppercase text-lg">
          Oaxaca: Bienvenido
        </p>
      </div>
    </div>
  );
};

export default HeroHeader;
