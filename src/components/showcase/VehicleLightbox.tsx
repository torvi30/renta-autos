import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface VehicleLightboxProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  vehicleTitle: string;
}

export const VehicleLightbox: React.FC<VehicleLightboxProps> = ({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNavigate,
  vehicleTitle,
}) => {
  const handlePrev = useCallback(() => {
    if (images.length === 0) return;
    onNavigate((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (images.length === 0) return;
    onNavigate((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  // Soporte de navegación por teclado y escape (Regla 16: Accesibilidad)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Evitar scroll del fondo mientras el lightbox está abierto
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl animate-fade-in p-4 sm:p-6 select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`Galería a pantalla completa de ${vehicleTitle}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop con captura de clic en toda la pantalla */}
      <div
        className="fixed inset-0 bg-black/95 backdrop-blur-2xl -z-10 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Barra superior de control */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-7xl flex items-center justify-between z-20 pt-2 pb-4"
      >
        <div className="flex items-center gap-3">
          <Maximize2 className="w-4 h-4 text-gold-400" />
          <span className="text-xs sm:text-sm font-bold text-silver-100 uppercase tracking-wider font-display truncate max-w-xs sm:max-w-md">
            {vehicleTitle}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-carbon-850 text-gold-400 border border-carbon-750 font-mono">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-carbon-900/90 hover:bg-gold-500 hover:text-carbon-950 text-silver-300 border border-carbon-800 transition-all shadow-lg cursor-pointer"
          aria-label="Cerrar visor a pantalla completa"
          title="Cerrar (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Contenedor de la Imagen Principal con Flechas */}
      <div className="relative w-full max-w-6xl flex-1 flex items-center justify-center my-auto min-h-0">
        
        {/* Flecha Anterior */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-carbon-900/80 hover:bg-gold-500 hover:text-carbon-950 text-silver-200 border border-carbon-750 transition-all backdrop-blur-md shadow-2xl focus:outline-none cursor-pointer"
          aria-label="Fotografía anterior"
          title="Anterior (Flecha izquierda)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Imagen en gran formato con transición fluida y clic afuera para cerrar */}
        <div 
          onClick={onClose}
          onTouchStart={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="w-full h-full flex items-center justify-center p-2 cursor-pointer"
        >
          <img
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            src={images[currentIndex]}
            alt={`${vehicleTitle} - Fotografía ${currentIndex + 1}`}
            className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-2xl transition-all duration-300 select-none cursor-default"
          />
        </div>

        {/* Flecha Siguiente */}
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-carbon-900/80 hover:bg-gold-500 hover:text-carbon-950 text-silver-200 border border-carbon-750 transition-all backdrop-blur-md shadow-2xl focus:outline-none cursor-pointer"
          aria-label="Fotografía siguiente"
          title="Siguiente (Flecha derecha)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Tira inferior de miniaturas */}
      <div className="w-full max-w-4xl pt-4 pb-2">
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={`thumb-${idx}`}
              onClick={() => onNavigate(idx)}
              className={`relative flex-shrink-0 w-16 sm:w-20 aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? 'border-gold-400 scale-105 shadow-md shadow-gold-500/20'
                  : 'border-carbon-800 opacity-50 hover:opacity-100'
              }`}
              aria-label={`Ver foto ${idx + 1}`}
            >
              <img
                src={img}
                alt={`Miniatura ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
