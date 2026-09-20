import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, ImageOff, Maximize2 } from 'lucide-react';

interface VehicleShowcaseProps {
  videoUrl?: string;
  imageUrl?: string;
  altText: string;
  aspectRatio?: '16/9' | '21/9' | '4/3' | 'auto';
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
  lazyLoad?: boolean;
  priority?: boolean;
  fitMode?: 'cover' | 'contain';
}

export const VehicleShowcase: React.FC<VehicleShowcaseProps> = ({
  videoUrl,
  imageUrl,
  altText,
  aspectRatio = '16/9',
  autoPlay = true,
  showControls = true,
  className = '',
  lazyLoad = true,
  priority = false,
  fitMode = 'cover',
}) => {
  const [videoError, setVideoError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const [currentFit, setCurrentFit] = useState<'cover' | 'contain'>(fitMode);

  useEffect(() => {
    setCurrentFit(fitMode);
  }, [fitMode]);

  // Resetear estados al cambiar la URL de la imagen
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [imageUrl]);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Lazy loading con IntersectionObserver
  useEffect(() => {
    if (priority || !lazyLoad) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '150px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoad, priority]);

  // Manejo de reproducción automática cuando el video es visible
  useEffect(() => {
    if (!isVisible || !videoRef.current || videoError) return;

    if (autoPlay) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            }
          });
      }
    }
  }, [isVisible, autoPlay, videoError]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  const handleImageLoaded = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (!target.dataset.retried && imageUrl && !imageUrl.startsWith('data:')) {
      target.dataset.retried = 'true';
      target.src = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}retry=${Date.now()}`;
      return;
    }
    setImageError(true);
  };

  const aspectRatioClass = {
    '16/9': 'aspect-[16/9]',
    '21/9': 'aspect-[21/9]',
    '4/3': 'aspect-[4/3]',
    'auto': '',
  }[aspectRatio];

  const isDataSaver = typeof navigator !== 'undefined' &&
    'connection' in navigator &&
    Boolean((navigator as any).connection?.saveData || (navigator as any).connection?.effectiveType === '2g');

  const hasValidVideo = Boolean(videoUrl && !videoError && !isDataSaver);
  const hasValidImage = Boolean(imageUrl && !imageError);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl bg-carbon-950 border border-carbon-750/70 group ${aspectRatioClass} ${className}`}
    >
      {/* Luz ambiente de showroom sutil */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-carbon-950/80 via-transparent to-carbon-950/20" />

      {/* CASO 1: Video disponible y activo */}
      {isVisible && hasValidVideo && (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={imageUrl}
          autoPlay={autoPlay}
          muted={isMuted}
          loop
          playsInline
          onLoadedData={handleVideoLoaded}
          onError={handleVideoError}
          className={`w-full h-full ${currentFit === 'contain' ? 'object-contain p-1 sm:p-2' : 'object-cover'} transition-opacity duration-700 ${
            videoLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label={altText}
        />
      )}

      {/* CASO 2: Fotografía principal del vehículo */}
      {hasValidImage && (
        <img
          src={imageUrl}
          alt={altText}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleImageLoaded}
          onError={handleImageError}
          className={`absolute inset-0 w-full h-full ${
            currentFit === 'contain' ? 'object-contain p-1 sm:p-2' : 'object-cover'
          } transition-opacity duration-500 group-hover:scale-[1.02] ${
            hasValidVideo && videoLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />
      )}

      {/* CASO 3: Fallback si no hay medio */}
      {!hasValidVideo && !hasValidImage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-carbon-850 p-6 text-center text-silver-400">
          <div className="w-16 h-16 mb-3 rounded-full bg-carbon-800 flex items-center justify-center text-gold-500/80 border border-carbon-700">
            <ImageOff className="w-8 h-8" />
          </div>
          <p className="text-sm font-medium text-silver-300">Showroom Digital</p>
          <p className="text-xs text-silver-500 mt-1 max-w-xs">{altText}</p>
        </div>
      )}

      {/* Spinner sutil de primera carga SOLO si la imagen/video aún no han cargado (Sin parpadeo) */}
      {isVisible && !imageLoaded && !videoLoaded && !imageError && (
        <div className="absolute inset-0 bg-carbon-950 flex items-center justify-center pointer-events-none z-10">
          <div className="w-8 h-8 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Badge de "SHOWROOM VIDEO" en esquina superior */}
      {hasValidVideo && videoLoaded && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-carbon-950/70 border border-white/10 text-[11px] font-medium text-gold-400 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
          <span>SHOWROOM VIDEO</span>
        </div>
      )}

      {/* Controles discretos en esquina inferior */}
      {showControls && (
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Botón de alternar ajuste para ver auto completo */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentFit((f) => (f === 'cover' ? 'contain' : 'cover'));
            }}
            aria-label={currentFit === 'cover' ? 'Ver auto completo' : 'Llenar recuadro'}
            title={currentFit === 'cover' ? 'Ver auto completo' : 'Llenar recuadro'}
            className="p-2 rounded-full bg-carbon-950/85 hover:bg-carbon-900 border border-white/10 text-silver-200 hover:text-gold-400 backdrop-blur-md transition-all active:scale-95 shadow-md"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {hasValidVideo && videoLoaded && (
            <>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
                className="p-2 rounded-full bg-carbon-950/85 hover:bg-carbon-900 border border-white/10 text-silver-200 hover:text-gold-400 backdrop-blur-md transition-all active:scale-95 shadow-md"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Activar sonido' : 'Silenciar video'}
                className="p-2 rounded-full bg-carbon-950/85 hover:bg-carbon-900 border border-white/10 text-silver-200 hover:text-gold-400 backdrop-blur-md transition-all active:scale-95 shadow-md"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
