import React from 'react';
import { useInView } from 'react-intersection-observer';
import PropTypes from 'prop-types';
import './OptimizedImage.css'; // Asegúrate de crear este archivo para estilos

const OptimizedImage = ({ src, alt, aspectRatio, className, style }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Carga la imagen solo una vez
    threshold: 0.1,   // Carga cuando el 10% de la imagen sea visible
  });

  return (
    <div
      ref={ref}
      className={`optimized-image-container ${className}`}
      style={{
        ...style,
        position: 'relative',
        paddingBottom: `${aspectRatio * 100}%`, // Mantiene la proporción
        overflow: 'hidden',
      }}
    >
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain', // Mantiene la proporción sin cortar
          }}
        />
      )}
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  aspectRatio: PropTypes.number, // Ejemplo: 16/9 para widescreen
  className: PropTypes.string,
  style: PropTypes.object,
};

OptimizedImage.defaultProps = {
  aspectRatio: 1, // Por defecto cuadrado
  className: '',
  style: {},
};

export default OptimizedImage;