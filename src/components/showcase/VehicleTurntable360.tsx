import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Compass, Play, Pause, Hand, Sparkles } from 'lucide-react';
import { Vehicle } from '../../types/vehicle';

interface VehicleTurntable360Props {
  vehicle: Vehicle;
  className?: string;
  autoRotateSpeed?: number; // segundos por vuelta completa (ej. 10s)
}

export const VehicleTurntable360: React.FC<VehicleTurntable360Props> = ({
  vehicle,
  className = '',
  autoRotateSpeed = 12,
}) => {
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0); // 0 a 360 grados
  const [activePreset, setActivePreset] = useState<string>('auto');

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Ángulo a nombre de vista
  const getAnglePerspectiveName = (deg: number): string => {
    const normalized = ((deg % 360) + 360) % 360;
    if (normalized >= 337.5 || normalized < 22.5) return 'Frente Frontal';
    if (normalized >= 22.5 && normalized < 67.5) return 'Tres Cuartos Frontal';
    if (normalized >= 67.5 && normalized < 112.5) return 'Perfil Lateral';
    if (normalized >= 112.5 && normalized < 157.5) return 'Tres Cuartos Posterior';
    if (normalized >= 157.5 && normalized < 202.5) return 'Parte Trasera';
    if (normalized >= 202.5 && normalized < 247.5) return 'Tres Cuartos Posterior';
    if (normalized >= 247.5 && normalized < 292.5) return 'Perfil Lateral Opuesto';
    return 'Tres Cuartos Frontal';
  };

  // Sincronizar video o ángulo con el tiempo de reproducción
  const updateVideoTimeFromAngle = useCallback((angle: number) => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const duration = videoRef.current.duration;
    const targetTime = ((angle % 360) / 360) * duration;
    videoRef.current.currentTime = targetTime;
  }, []);

  // Animación de rotación automática en bucle
  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined && isAutoRotating && !isInteracting) {
      const delta = (time - lastTimeRef.current) / 1000;
      const degreesPerSecond = 360 / autoRotateSpeed;
      setRotationAngle((prev) => {
        const next = (prev + degreesPerSecond * delta) % 360;
        return next;
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [isAutoRotating, isInteracting, autoRotateSpeed]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // Si el video está activo y está en auto-rotación
  useEffect(() => {
    if (!videoRef.current) return;
    if (isAutoRotating && !isInteracting) {
      videoRef.current.play().catch(() => {
        // Autoplay bloqueado, mantener muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    } else {
      videoRef.current.pause();
    }
  }, [isAutoRotating, isInteracting]);

  // Manejo de interacción de arrastre o movimiento del mouse
  const handleScrub = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newAngle = Math.round(relativeX * 360);

    setRotationAngle(newAngle);
    setActivePreset('manual');
    updateVideoTimeFromAngle(newAngle);

    // Cancelar timeout previo y pausar auto-rotación temporalmente
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    setIsInteracting(true);

    // Reanudar suavemente después de 2 segundos sin interacción
    resumeTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
      setIsAutoRotating(true);
      setActivePreset('auto');
    }, 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleScrub(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleScrub(e.touches[0].clientX);
    }
  };

  const handleSnapToAngle = (deg: number, presetName: string) => {
    setRotationAngle(deg);
    setActivePreset(presetName);
    updateVideoTimeFromAngle(deg);
    setIsInteracting(true);

    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
      setIsAutoRotating(true);
      setActivePreset('auto');
    }, 3000);
  };

  const toggleAutoRotate = () => {
    setIsAutoRotating((prev) => !prev);
    setIsInteracting(false);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  // Recopilar galería exterior si existe para fallback o multiángulo
  const exteriorPhotos = vehicle.gallery?.exteriorImages || [vehicle.mainImage];
  const photoIndex = Math.min(
    exteriorPhotos.length - 1,
    Math.floor(((rotationAngle % 360) / 360) * exteriorPhotos.length)
  );
  const currentPhoto = exteriorPhotos[photoIndex] || vehicle.mainImage;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className={`relative w-full overflow-hidden rounded-2xl bg-carbon-950 border border-carbon-800 select-none cursor-ew-resize group shadow-2xl ${className}`}
    >
      {/* 1. ESCENARIO SHOWROOM 3D: Spotlight superior y haz de luz cenital */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-gold-500/20 via-gold-500/5 to-transparent rounded-full blur-3xl pointer-events-none z-10" />

      {/* 2. PEDESTAL GIRATORIO ILUMINADO EN EL SUELO (Efecto 3D Turntable) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] sm:w-[70%] h-32 pointer-events-none z-10">
        <div
          className="w-full h-full rounded-[100%] border border-gold-500/40 shadow-showroom-glow transition-transform duration-300"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.15) 0%, rgba(21, 24, 33, 0.6) 60%, transparent 100%)',
            transform: 'rotateX(72deg)',
            boxShadow: '0 0 50px rgba(212, 175, 55, 0.25), inset 0 0 30px rgba(212, 175, 55, 0.15)',
          }}
        >
          {/* Marcadores circulares del plato giratorio que rotan en tiempo real */}
          <div
            className="w-full h-full rounded-full border border-dashed border-gold-400/30"
            style={{ transform: `rotate(${rotationAngle}deg)` }}
          />
        </div>
      </div>

      {/* 3. PROTAGONISTA: Video 360 o Secuencia Multiángulo */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full flex items-center justify-center overflow-hidden z-20">
        {vehicle.videoUrl ? (
          <video
            ref={videoRef}
            src={vehicle.videoUrl}
            poster={vehicle.mainImage}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-opacity duration-500"
          />
        ) : (
          <img
            src={currentPhoto}
            alt={`${vehicle.brand} ${vehicle.model} vista 360`}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{
              transform: `scale(1.02) rotateY(${Math.sin((rotationAngle * Math.PI) / 180) * 4}deg)`,
            }}
          />
        )}

        {/* Reflejo difuso en el piso de cristal */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-carbon-950 via-carbon-950/60 to-transparent pointer-events-none" />
      </div>

      {/* 4. HUD SUPERIOR: Indicador de Giro 360°, Grados y Perspectiva */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        
        {/* Badge 360 con dial de grados */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-carbon-950/85 border border-gold-500/30 backdrop-blur-md shadow-lg pointer-events-auto">
          <div className="relative w-4 h-4 flex items-center justify-center">
            <Compass
              className="w-4 h-4 text-gold-400 transition-transform duration-100"
              style={{ transform: `rotate(${rotationAngle}deg)` }}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest font-mono">
                {Math.round(rotationAngle)}° 360° TURNTABLE
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${isAutoRotating && !isInteracting ? 'bg-emerald-400 animate-ping' : 'bg-gold-400'}`} />
            </div>
            <span className="text-[11px] font-semibold text-silver-100">
              {getAnglePerspectiveName(rotationAngle)}
            </span>
          </div>
        </div>

        {/* Pistas visuales para el usuario */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-carbon-950/80 border border-white/10 text-xs text-silver-300 backdrop-blur-md">
          <Hand className="w-3.5 h-3.5 text-gold-400 animate-bounce" />
          <span>Mueve el cursor horizontalmente para controlar el ángulo</span>
        </div>

        {/* Botón de Pausar/Reanudar Auto-Giro */}
        <button
          onClick={toggleAutoRotate}
          className="p-2 rounded-xl bg-carbon-950/80 hover:bg-carbon-900 border border-white/10 text-silver-300 hover:text-gold-400 backdrop-blur-md pointer-events-auto transition-all active:scale-95"
          title={isAutoRotating ? 'Pausar auto-giro' : 'Activar auto-giro'}
          aria-label="Alternar auto giro"
        >
          {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* 5. BARRA INFERIOR DE ÁNGULOS RÁPIDOS */}
      <div className="absolute bottom-4 inset-x-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Selector rápido de ángulos clave */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-carbon-950/85 border border-white/10 backdrop-blur-md pointer-events-auto shadow-lg">
          {[
            { label: 'Frente', deg: 0, key: 'frente' },
            { label: '3/4', deg: 45, key: '3/4' },
            { label: 'Perfil', deg: 90, key: 'perfil' },
            { label: 'Trasera', deg: 180, key: 'trasera' },
          ].map((preset) => (
            <button
              key={preset.key}
              onClick={() => handleSnapToAngle(preset.deg, preset.key)}
              className={`px-3 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-lg transition-all ${
                activePreset === preset.key
                  ? 'bg-gold-500 text-carbon-950 font-bold shadow-sm'
                  : 'text-silver-400 hover:text-silver-100 hover:bg-white/5'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Indicador de Modo Showroom Activo */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-carbon-900/90 border border-gold-500/20 text-[10px] text-gold-400 font-semibold tracking-widest uppercase">
          <Sparkles className="w-3 h-3 text-gold-400" />
          <span>ROTACIÓN CONTINUA ACTIVA</span>
        </div>

      </div>

    </div>
  );
};
