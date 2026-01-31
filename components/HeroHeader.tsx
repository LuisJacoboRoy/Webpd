
import React, { useEffect, useState } from 'react';

const HeroHeader: React.FC = () => {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative h-[350px] w-full overflow-hidden flex items-center justify-center bg-slate-900">
      {/* Background with paint-themed image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1562648508-59b13f07a731?auto=format&fit=crop&q=80&w=2000")',
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
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-xl animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite] group">
          <span className="text-3xl md:text-5xl font-black bg-gradient-to-br from-white to-blue-200 bg-clip-text text-transparent transform group-hover:scale-105 transition-transform">
            D
          </span>
        </div>
        <h1 className="mt-6 text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-lg text-center uppercase">
          PINTURAS<span className="text-blue-400"> DIAMANTE</span>
        </h1>
        <p className="mt-2 text-blue-100 font-medium tracking-widest uppercase text-[10px] opacity-60">
          Oaxaca: Calidad que Transforma
        </p>
      </div>
    </div>
  );
};

export default HeroHeader;
