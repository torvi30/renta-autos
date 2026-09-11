import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Compass, Play, Pause, Hand, Sparkles, Sliders } from 'lucide-react';
import { Vehicle } from '../../types/vehicle';

interface VehicleTurntable360Props {
  vehicle: Vehicle;
  className?: string;
}

interface AngleFrame {
  angle: number; // 0 a 360
  name: string;
  image: string;
  isFlipped?: boolean; // Para simular el lateral opuesto si no hay foto espejo
}

export const VehicleTurntable360: React.FC<VehicleTurntable360Props> = ({
  vehicle,
  className = '',
}) => {
  const [isAutoSpinning, setIsAutoSpinning] = useState(true);
  const [rotationAngle, setRotationAngle] = useState(0); // 0 a 359.9 grados continuos
  const [isHovered, setIsHovered] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Velocidad de rotación en segundos por vuelta de 360°
  const secondsPerRotation = useMemo(() => {
    switch (speed) {
      case 'slow': return 16;   // Rotación súper suave y majestuosa
      case 'normal': return 10; // Rotación de showroom estándar
      case 'fast': return 6;    // Rotación dinámica
    }
  }, [speed]);

  // Construir la órbita de 360° a partir de las fotografías exteriores del vehículo (Regla 8)
  const angleFrames: AngleFrame[] = useMemo(() => {
    const ext = vehicle.gallery?.exteriorImages || [];
    const main = vehicle.mainImage;

    const fFront = ext[0] || main;
    const fFrontQuarter = ext[1] || ext[0] || main;
    const fSide = ext[2] || ext[1] || main;
    const fRearQuarter = ext[3] || ext[2] || main;
    const fRear = ext[4] || ext[3] || ext[0] || main;

    // 8 perspectivas que completan los 360 grados de giro continuo
    return [
      { angle: 0,   name: 'Frente Frontal',               image: fFront },
      { angle: 45,  name: 'Tres Cuartos Frontal Derecho', image: fFrontQuarter },
      { angle: 90,  name: 'Perfil Lateral Derecho',       image: fSide },
      { angle: 135, name: 'Tres Cuartos Trasero Derecho', image: fRearQuarter },
      { angle: 180, name: 'Parte Trasera & Difusor',      image: fRear },
      { angle: 225, name: 'Tres Cuartos Trasero Izquierdo', image: fRearQuarter, isFlipped: true },
      { angle: 270, name: 'Perfil Lateral Izquierdo',     image: fSide, isFlipped: true },
      { angle: 315, name: 'Tres Cuartos Frontal Izquierdo', image: fFrontQuarter, isFlipped: true },
    ];
  }, [vehicle]);

  // Calcular el fotograma actual nítido según el ángulo de giro
  const currentFrame = useMemo(() => {
    const totalFrames = angleFrames.length;
    const normalizedAngle = ((rotationAngle % 360) + 360) % 360;
    const step = 360 / totalFrames; // 45 grados por fotograma
    const currentIndex = Math.floor(normalizedAngle / step) % totalFrames;
    return angleFrames[currentIndex];
  }, [rotationAngle, angleFrames]);

  // Bucle continuo de rotación a 60 FPS con requestAnimationFrame
  const animateRotation = useCallback((timestamp: number) => {
    if (lastTimeRef.current !== undefined && isAutoSpinning && !isHovered) {
      const delta = (timestamp - lastTimeRef.current) / 1000;
      const degreesPerSecond = 360 / secondsPerRotation;
      setRotationAngle((prev) => (prev + degreesPerSecond * delta) % 360);
    }
    lastTimeRef.current = timestamp;
    requestRef.current = requestAnimationFrame(animateRotation);
  }, [isAutoSpinning, isHovered, secondsPerRotation]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateRotation);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animateRotation]);

  // Pre-cargar todas las imágenes de la órbita para giro continuo sin parpadeos
  useEffect(() => {
    angleFrames.forEach((frame) => {
      const img = new Image();
      img.src = frame.image;
    });
  }, [angleFrames]);

  // Control interactivo con mouse o touch (Scrubbing de ángulo)
  const handleScrub = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetAngle = relativeX * 360;

    setRotationAngle(targetAngle);
    setIsHovered(true);

    // Reanudar el giro suave después de 1.8 segundos sin interacción
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsAutoSpinning(true);
    }, 1800);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleScrub(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleScrub(e.touches[0].clientX);
    }
  };

  const handleSnapTo = (angle: number) => {
    setRotationAngle(angle);
    setIsHovered(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsAutoSpinning(true);
    }, 2500);
  };

  const toggleAutoSpin = () => {
    setIsAutoSpinning((prev) => !prev);
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsAutoSpinning(true);
      }}
      className={`relative w-full overflow-hidden rounded-2xl bg-carbon-950 border border-carbon-800 shadow-2xl select-none group cursor-ew-resize ${className}`}
    >
      {/* 1. ILUMINACIÓN CENITAL DE ESTUDIO SHOWROOM */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-gradient-to-b from-gold-500/20 via-gold-500/5 to-transparent rounded-full blur-3xl pointer-events-none z-10" />

      {/* 2. PLATAFORMA GIRATORIA 3D ILUMINADA EN EL SUELO */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-[75%] h-36 pointer-events-none z-10">
        <div
          className="w-full h-full rounded-[100%] border-2 border-gold-500/40 shadow-showroom-glow transition-all duration-300"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.18) 0%, rgba(20, 23, 31, 0.7) 65%, transparent 100%)',
            transform: 'rotateX(72deg)',
            boxShadow: '0 0 60px rgba(212, 175, 55, 0.3), inset 0 0 35px rgba(212, 175, 55, 0.2)',
          }}
        >
          {/* Marcadores circulares que rotan en tiempo real con el carro */}
          <div
            className="w-full h-full rounded-full border border-dashed border-gold-400/40"
            style={{ transform: `rotate(${rotationAngle}deg)` }}
          />
        </div>
      </div>

      {/* 3. PROTAGONISTA: FOTOGRAMA NÍTIDO EN GIRO CONTINUO 360 */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full flex items-center justify-center overflow-hidden z-20">
        
        {/* Imagen del vehículo sólida, nítida y en rotación */}
        <img
          key={`frame-${currentFrame.angle}-${currentFrame.isFlipped ? 'flip' : 'normal'}`}
          src={currentFrame.image}
          alt={`${vehicle.brand} ${vehicle.model} - ${currentFrame.name}`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-150"
          style={{
            transform: `scale(1.02) ${currentFrame.isFlipped ? 'scaleX(-1)' : ''}`,
          }}
        />

        {/* Reflejo difuso en el suelo de cristal negro */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-carbon-950 via-carbon-950/60 to-transparent pointer-events-none" />
      </div>

      {/* 4. HUD SUPERIOR: ESTADO DEL GIRO Y BRÚJULA */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        
        {/* Badge 360° activo con dial de grados */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-carbon-950/90 border border-gold-500/40 backdrop-blur-md shadow-xl pointer-events-auto">
          <div className="relative w-4 h-4 flex items-center justify-center">
            <Compass
              className="w-4 h-4 text-gold-400 transition-transform duration-75"
              style={{ transform: `rotate(${rotationAngle}deg)` }}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest font-mono">
                {Math.round(rotationAngle)}° 360° TURNTABLE
              </span>
              <span className={`w-2 h-2 rounded-full ${isAutoSpinning && !isHovered ? 'bg-emerald-400 animate-ping' : 'bg-gold-400'}`} />
            </div>
            <span className="text-[11px] font-semibold text-silver-100">
              {currentFrame.name}
            </span>
          </div>
        </div>

        {/* Indicador de estado de rotación suave */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-carbon-950/80 border border-white/10 text-xs text-silver-300 backdrop-blur-md">
          {isHovered ? (
            <>
              <Hand className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
              <span className="text-gold-300">Control Manual Activo (Desliza el cursor)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>Giro suave continuo automático</span>
            </>
          )}
        </div>

        {/* Controles de Velocidad y Pausa */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Selector de velocidad */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-carbon-950/80 border border-white/10 backdrop-blur-md">
            <Sliders className="w-3 h-3 text-silver-400 ml-1 mr-1.5" />
            <button
              onClick={() => setSpeed('slow')}
              className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-colors ${speed === 'slow' ? 'bg-gold-500 text-carbon-950' : 'text-silver-400 hover:text-silver-200'}`}
              title="Giro lento majestuoso (16s)"
            >
              Lento
            </button>
            <button
              onClick={() => setSpeed('normal')}
              className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-colors ${speed === 'normal' ? 'bg-gold-500 text-carbon-950' : 'text-silver-400 hover:text-silver-200'}`}
              title="Giro estándar (10s)"
            >
              Normal
            </button>
            <button
              onClick={() => setSpeed('fast')}
              className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-colors ${speed === 'fast' ? 'bg-gold-500 text-carbon-950' : 'text-silver-400 hover:text-silver-200'}`}
              title="Giro rápido (6s)"
            >
              Rápido
            </button>
          </div>

          {/* Botón de Pausa / Reanudación */}
          <button
            onClick={toggleAutoSpin}
            className="p-2 rounded-xl bg-carbon-950/90 hover:bg-carbon-900 border border-white/10 text-silver-300 hover:text-gold-400 backdrop-blur-md transition-all active:scale-95 shadow-lg"
            title={isAutoSpinning ? 'Pausar auto-giro' : 'Reanudar auto-giro suave'}
            aria-label="Alternar giro automático"
          >
            {isAutoSpinning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

      </div>

      {/* 5. BARRA INFERIOR DE PERSPECTIVAS RÁPIDAS */}
      <div className="absolute bottom-4 inset-x-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Botones de Ángulos Clave */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-carbon-950/90 border border-white/10 backdrop-blur-md pointer-events-auto shadow-xl">
          {[
            { label: 'Frente', deg: 0 },
            { label: '3/4 Frontal', deg: 45 },
            { label: 'Perfil', deg: 90 },
            { label: '3/4 Trasero', deg: 135 },
            { label: 'Trasera', deg: 180 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleSnapTo(preset.deg)}
              className="px-2.5 sm:px-3 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-lg text-silver-300 hover:text-gold-300 hover:bg-white/5 transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Indicador de Giro Activo */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-carbon-900/90 border border-gold-500/30 text-[10px] text-gold-400 font-semibold tracking-widest uppercase shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>GIRANDO AUTOMÁTICAMENTE</span>
        </div>

      </div>

    </div>
  );
};
