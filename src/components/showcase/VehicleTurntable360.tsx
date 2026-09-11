import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Compass, Play, Pause, Hand, Sliders, ExternalLink, Sparkles } from 'lucide-react';
import { Vehicle } from '../../types/vehicle';

interface VehicleTurntable360Props {
  vehicle: Vehicle;
  className?: string;
  onOpenDetail?: (vehicle: Vehicle) => void;
}

export const VehicleTurntable360: React.FC<VehicleTurntable360Props> = ({
  vehicle,
  className = '',
  onOpenDetail,
}) => {
  const [isAutoSpinning, setIsAutoSpinning] = useState(true);
  const [rotationAngle, setRotationAngle] = useState(0); // 0 a 359.9 grados
  const [isHovered, setIsHovered] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Variables para distinguir clic de arrastre
  const dragStartXRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  // Velocidad de rotación en segundos por vuelta de 360°
  const secondsPerRotation = useMemo(() => {
    switch (speed) {
      case 'slow': return 18;   // Rotación majestuosa lenta
      case 'normal': return 10; // Rotación de showroom estándar
      case 'fast': return 6;    // Rotación dinámica
    }
  }, [speed]);

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

  // Control interactivo con mouse o touch (Scrubbing / Rotación 360)
  const handleScrub = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetAngle = relativeX * 360;

    setRotationAngle(targetAngle);
    setIsHovered(true);

    // Reanudar el giro suave después de 2.5 segundos sin interacción
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsAutoSpinning(true);
    }, 2500);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartXRef.current = e.clientX;
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragStartXRef.current !== null) {
      const diff = Math.abs(e.clientX - dragStartXRef.current);
      if (diff > 6) {
        isDraggingRef.current = true;
      }
    }
    if (isDraggingRef.current) {
      handleScrub(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current && onOpenDetail) {
      // Si no hubo arrastre significativo, es un clic limpio para abrir detalles
      onOpenDetail(vehicle);
    }
    dragStartXRef.current = null;
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      dragStartXRef.current = e.touches[0].clientX;
      isDraggingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0 && dragStartXRef.current !== null) {
      const diff = Math.abs(e.touches[0].clientX - dragStartXRef.current);
      if (diff > 8) {
        isDraggingRef.current = true;
      }
      handleScrub(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current && onOpenDetail) {
      onOpenDetail(vehicle);
    }
    dragStartXRef.current = null;
    isDraggingRef.current = false;
  };

  const handleSnapTo = (angle: number) => {
    setRotationAngle(angle);
    setIsHovered(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsAutoSpinning(true);
    }, 3000);
  };

  const toggleAutoSpin = () => {
    setIsAutoSpinning((prev) => !prev);
    setIsHovered(false);
  };

  // Cálculo de inclinación 3D y brillo de estudio cinemático según el ángulo
  const angleRad = (rotationAngle * Math.PI) / 180;
  const yawDegrees = Math.sin(angleRad) * 11; // Giro 3D suave de ±11 grados
  const pitchDegrees = Math.cos(angleRad) * 2; // Inclinación sutil de ±2 grados
  const lightPositionPercent = ((rotationAngle % 360) / 360) * 100;

  // Perspectiva visual según el ángulo
  const perspectiveLabel = useMemo(() => {
    const deg = Math.round(((rotationAngle % 360) + 360) % 360);
    if (deg >= 335 || deg < 25) return 'Frente Frontal';
    if (deg >= 25 && deg < 70) return '3/4 Frontal Derecho';
    if (deg >= 70 && deg < 115) return 'Perfil Lateral Derecho';
    if (deg >= 115 && deg < 160) return '3/4 Trasero Derecho';
    if (deg >= 160 && deg < 205) return 'Vista Trasera & Difusor';
    if (deg >= 205 && deg < 250) return '3/4 Trasero Izquierdo';
    if (deg >= 250 && deg < 295) return 'Perfil Lateral Izquierdo';
    return '3/4 Frontal Izquierdo';
  }, [rotationAngle]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        dragStartXRef.current = null;
        isDraggingRef.current = false;
      }}
      className={`relative w-full overflow-hidden rounded-3xl bg-carbon-950 border border-carbon-800 shadow-2xl select-none group cursor-pointer ${className}`}
      title="Clic para ver detalles y galería completa · Desliza para girar 360°"
    >
      {/* 1. ILUMINACIÓN CENITAL DE ESTUDIO SHOWROOM */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-gold-500/20 via-gold-500/5 to-transparent rounded-full blur-3xl pointer-events-none z-10" />

      {/* 2. PLATAFORMA GIRATORIA 3D ILUMINADA EN EL SUELO */}
      <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 w-[92%] sm:w-[78%] h-40 pointer-events-none z-10">
        <div
          className="w-full h-full rounded-[100%] border-2 border-gold-500/40 shadow-showroom-glow transition-all duration-300"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.22) 0%, rgba(20, 23, 31, 0.8) 60%, transparent 100%)',
            transform: 'rotateX(74deg)',
            boxShadow: '0 0 70px rgba(212, 175, 55, 0.35), inset 0 0 40px rgba(212, 175, 55, 0.25)',
          }}
        >
          {/* Marcadores radiales que giran en tiempo real con el ángulo exacto */}
          <div
            className="w-full h-full rounded-full border border-dashed border-gold-400/50"
            style={{ transform: `rotate(${rotationAngle}deg)` }}
          />

          {/* Anillo interior concéntrico */}
          <div
            className="absolute inset-4 rounded-full border border-gold-400/20"
            style={{ transform: `rotate(${-rotationAngle * 0.5}deg)` }}
          />
        </div>
      </div>

      {/* 3. FOTO PRINCIPAL DEL AUTO EN GIRO 3D PRO */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full flex items-center justify-center overflow-hidden z-20">
        
        {/* Contenedor del vehículo con perspectiva 3D realista y reflejo de estudio */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
          style={{
            perspective: '1200px',
            transform: `perspective(1200px) rotateY(${yawDegrees}deg) rotateX(${pitchDegrees}deg) scale(1.02)`,
          }}
        >
          {/* FOTO PRINCIPAL DEL VEHÍCULO (Nítida, fiel al modelo, sin deformaciones) */}
          <img
            src={vehicle.mainImage}
            alt={`${vehicle.brand} ${vehicle.model} - Foto Oficial`}
            className="w-full h-full object-cover object-center select-none filter contrast-[1.03] brightness-[0.98] group-hover:brightness-105 transition-all duration-500"
            draggable={false}
          />

          {/* Destello de luz especular dinámica que barre la carrocería al girar el plato */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay transition-all duration-75"
            style={{
              background: `linear-gradient(105deg, transparent ${lightPositionPercent - 25}%, rgba(255,255,255,0.45) ${lightPositionPercent}%, rgba(212,175,55,0.3) ${lightPositionPercent + 10}%, transparent ${lightPositionPercent + 25}%)`,
            }}
          />

          {/* Sombra de contacto suave en las ruedas */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-14 bg-black/60 blur-xl rounded-full pointer-events-none" />
        </div>

        {/* Reflejo difuso en el suelo de cristal negro */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-carbon-950 via-carbon-950/70 to-transparent pointer-events-none" />

        {/* Overlay CTA interactivo flotante en Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none bg-black/30 backdrop-blur-[2px]">
          <div className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-carbon-950/90 border border-gold-500/60 shadow-2xl text-gold-300 text-xs sm:text-sm font-bold tracking-wider uppercase backdrop-blur-xl animate-bounce-gentle">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>Clic para ver Ficha Técnica y Galería Completa</span>
            <ExternalLink className="w-4 h-4 text-gold-400 ml-1" />
          </div>
        </div>

      </div>

      {/* 4. HUD SUPERIOR: ESTADO DEL GIRO Y BRÚJULA */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        
        {/* Dial 360° interactivo con grados */}
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
                {Math.round(rotationAngle)}° 360° SHOWROOM
              </span>
              <span className={`w-2 h-2 rounded-full ${isAutoSpinning && !isHovered ? 'bg-emerald-400 animate-ping' : 'bg-gold-400'}`} />
            </div>
            <span className="text-[11px] font-semibold text-silver-100">
              {perspectiveLabel}
            </span>
          </div>
        </div>

        {/* Indicador de ayuda al usuario */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-carbon-950/80 border border-white/10 text-xs text-silver-300 backdrop-blur-md">
          {isHovered ? (
            <>
              <Hand className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
              <span className="text-gold-300">Arrastra para girar · Clic para explorar</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Giro automático continuo de showroom</span>
            </>
          )}
        </div>

        {/* Controles de Velocidad y Pausa */}
        <div className="flex items-center gap-1.5 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          {/* Selector de velocidad */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-carbon-950/80 border border-white/10 backdrop-blur-md">
            <Sliders className="w-3 h-3 text-silver-400 ml-1 mr-1.5" />
            <button
              onClick={() => setSpeed('slow')}
              className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-colors ${speed === 'slow' ? 'bg-gold-500 text-carbon-950' : 'text-silver-400 hover:text-silver-200'}`}
              title="Giro lento majestuoso (18s)"
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
            title={isAutoSpinning ? 'Pausar auto-giro' : 'Reanudar auto-giro'}
            aria-label="Alternar giro automático"
          >
            {isAutoSpinning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

      </div>

      {/* 5. BARRA INFERIOR DE PERSPECTIVAS RÁPIDAS Y ENLACE DIRECTO */}
      <div className="absolute bottom-4 inset-x-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Botones de Ángulos Clave */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-carbon-950/90 border border-white/10 backdrop-blur-md pointer-events-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
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

        {/* Indicador de Acción y Giro Activo */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onOpenDetail && (
            <button
              onClick={() => onOpenDetail(vehicle)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500 hover:bg-gold-400 text-carbon-950 text-[10px] font-bold tracking-widest uppercase shadow-lg transition-colors"
            >
              <span>Ver Ficha & Galería</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-carbon-900/90 border border-gold-500/30 text-[10px] text-gold-400 font-semibold tracking-widest uppercase shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>360° PRO SHOWROOM</span>
          </div>
        </div>

      </div>

    </div>
  );
};
