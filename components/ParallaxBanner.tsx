import React, { useEffect, useRef, useState } from 'react';

interface ParallaxBannerProps {
  src?: string;
  alt?: string;
  inverted?: boolean;
}

const ParallaxBanner: React.FC<ParallaxBannerProps> = ({
  src = '/img/colorplus.png',
  alt = 'Color Plus, sistema tintométrico Diamante',
  inverted = true
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrame = 0;
    const updateOffset = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const { top, height } = container.getBoundingClientRect();
        const progress = (window.innerHeight - top) / (window.innerHeight + height);
        const direction = inverted ? -1 : 1;
        setOffset((Math.min(1, Math.max(0, progress)) - 0.5) * 140 * direction);
      });
    };

    updateOffset();
    window.addEventListener('scroll', updateOffset, { passive: true });
    window.addEventListener('resize', updateOffset);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', updateOffset);
      window.removeEventListener('resize', updateOffset);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      aria-label={alt}
      className="relative mb-24 h-[300px] w-full overflow-hidden"
    >
      <img
        src={src}
        alt={alt}
        className="absolute -inset-y-20 left-0 h-[calc(100%+10rem)] w-full object-cover"
        style={{ transform: `translateY(${offset}px)` }}
        loading="lazy"
      />
    </section>
  );
};

export default ParallaxBanner;
