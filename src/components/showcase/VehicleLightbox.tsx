import React, { useEffect, useCallback, useRef } from 'react';
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
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const handlePrev = useCallback(() => {
    if (images.length === 0) return;
    onNavigate((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (images.length === 0) return;
    onNavigate((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  // Gestos táctiles de deslizamiento (Swipe) para dispositivos móviles
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const deltaX = touchStartXRef.current - touchEndXRef.current;
      if (deltaX > 40) {
        // Deslizar izquierda -> siguiente foto
        handleNext();
      } else if (deltaX < -40) {
        // Deslizar derecha -> foto anterior
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl animate-fade-in p-3 sm:p-6 select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`Galería a pantalla completa de ${vehicleTitle}`}
    >
      {/* Backdrop con captura de clic para cerrar afuera */}
      <div
        className="fixed inset-0 bg-black/95 backdrop-blur-2xl -z-10 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Barra superior de control */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-7xl flex items-center justify-between z-20 pt-1 pb-3 sm:py-4"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Maximize2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-silver-100 uppercase tracking-wider font-display truncate max-w-[180px] sm:max-w-md">
            {vehicleTitle}
          </span>
          <span className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-carbon-850 text-gold-400 border border-carbon-750 font-mono flex-shrink-0">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 sm:p-2.5 rounded-xl bg-carbon-900/90 hover:bg-gold-500 hover:text-carbon-950 text-silver-300 border border-carbon-800 transition-all shadow-lg cursor-pointer flex-shrink-0"
          aria-label="Cerrar visor a pantalla completa"
          title="Cerrar (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Contenedor de la Imagen Principal con soporte Swipe táctil */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-6xl flex-1 flex items-center justify-center my-auto min-h-0"
      >
        
        {/* Flecha Anterior (oculta en pantallas muy pequeñas si no se desea, o táctil compacta) */}
        <button
          onClick={handlePrev}
          className="absolute left-1 sm:left-4 z-20 p-2 sm:p-3 rounded-full bg-carbon-900/80 hover:bg-gold-500 hover:text-carbon-950 text-silver-200 border border-carbon-750 transition-all backdrop-blur-md shadow-2xl focus:outline-none cursor-pointer active:scale-95"
          aria-label="Fotografía anterior"
          title="Anterior"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Imagen en gran formato con transición fluida */}
        <div className="w-full h-full flex items-center justify-center p-1 sm:p-2">
          <img
            src={images[currentIndex]}
            alt={`${vehicleTitle} - Fotografía ${currentIndex + 1}`}
            className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-2xl transition-all duration-300 select-none pointer-events-none"
          />
        </div>

        {/* Flecha Siguiente */}
        <button
          onClick={handleNext}
          className="absolute right-1 sm:right-4 z-20 p-2 sm:p-3 rounded-full bg-carbon-900/80 hover:bg-gold-500 hover:text-carbon-950 text-silver-200 border border-carbon-750 transition-all backdrop-blur-md shadow-2xl focus:outline-none cursor-pointer active:scale-95"
          aria-label="Fotografía siguiente"
          title="Siguiente"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Tira inferior de miniaturas scrollable */}
      <div className="w-full max-w-4xl pt-2 sm:pt-4 pb-1">
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-2 px-3 sm:px-0 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={`thumb-${idx}`}
              onClick={() => onNavigate(idx)}
              className={`relative flex-shrink-0 w-14 sm:w-20 aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
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
