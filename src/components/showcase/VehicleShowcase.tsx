import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, ImageOff } from 'lucide-react';

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
}) => {
  const [videoError, setVideoError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Lazy loading con IntersectionObserver para ahorrar ancho de banda (Reglas 8, 9, 11)
  useEffect(() => {
    if (priority) {
      setIsVisible(true);
      return;
    }

    if (!lazyLoad) {
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
            // Navegador bloqueó autoplay con sonido o en ahorro de datos; mantener mute
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
    setIsLoaded(true);
  };

  const handleVideoError = () => {
    // Caso 3: Video falla -> Fallback automático a fotografía principal
    setVideoError(true);
    setIsLoaded(true);
  };

  const aspectRatioClass = {
    '16/9': 'aspect-[16/9]',
    '21/9': 'aspect-[21/9]',
    '4/3': 'aspect-[4/3]',
    'auto': '',
  }[aspectRatio];

  const hasValidVideo = Boolean(videoUrl && !videoError);
  const hasValidImage = Boolean(imageUrl && !imageError);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl bg-carbon-900 border border-carbon-750/70 group ${aspectRatioClass} ${className}`}
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
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label={altText}
        />
      )}

      {/* CASO 2 y 3: Fallback a imagen principal */}
      {(!hasValidVideo || !isVisible || !isLoaded) && hasValidImage && (
        <img
          src={imageUrl}
          alt={altText}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setImageError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${
            hasValidVideo && isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />
      )}

      {/* CASO 4: Fallback definitivo si no hay ni video ni imagen (Regla 12) */}
      {!hasValidVideo && !hasValidImage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-carbon-850 p-6 text-center text-silver-400">
          <div className="w-16 h-16 mb-3 rounded-full bg-carbon-800 flex items-center justify-center text-gold-500/80 border border-carbon-700">
            <ImageOff className="w-8 h-8" />
          </div>
          <p className="text-sm font-medium text-silver-300">Showroom Digital</p>
          <p className="text-xs text-silver-500 mt-1 max-w-xs">{altText}</p>
        </div>
      )}

      {/* Skeleton de carga mientras prepara el medio */}
      {!isLoaded && isVisible && (hasValidVideo || hasValidImage) && (
        <div className="absolute inset-0 bg-carbon-900 flex items-center justify-center animate-pulse">
          <div className="w-10 h-10 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Badge de "360° SHOWROOM / VIDEO" en esquina superior */}
      {hasValidVideo && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-carbon-950/70 border border-white/10 text-[11px] font-medium text-gold-400 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
          <span>SHOWROOM VIDEO</span>
        </div>
      )}

      {/* Controles discretos en esquina inferior (Regla 3 & 9: no invasivos) */}
      {showControls && hasValidVideo && isLoaded && (
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
            className="p-2 rounded-full bg-carbon-950/80 hover:bg-carbon-900 border border-white/10 text-silver-200 hover:text-gold-400 backdrop-blur-md transition-all active:scale-95"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar video'}
            className="p-2 rounded-full bg-carbon-950/80 hover:bg-carbon-900 border border-white/10 text-silver-200 hover:text-gold-400 backdrop-blur-md transition-all active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};
