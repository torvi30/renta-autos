import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  Upload,
  Sliders,
  Check,
  RotateCcw,
  HelpCircle,
  ExternalLink,
  Car,
} from 'lucide-react';

interface AdminShowroomCompositorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyImage: (compositeDataUrl: string) => void;
  initialCarImage?: string;
  vehicleName?: string;
}

export const AdminShowroomCompositorModal: React.FC<AdminShowroomCompositorModalProps> = ({
  isOpen,
  onClose,
  onApplyImage,
  initialCarImage,
  vehicleName = 'Vehículo',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Estados de la imagen del carro
  const [carImageSrc, setCarImageSrc] = useState<string>(initialCarImage || '');
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const [carLoaded, setCarLoaded] = useState(false);

  // Referencias a los objetos Image en memoria
  const backdropImgRef = useRef<HTMLImageElement | null>(null);
  const carImgRef = useRef<HTMLImageElement | null>(null);

  // Parámetros de ajuste del carro sobre la plataforma
  const [scale, setScale] = useState<number>(0.92);
  const [posX, setPosX] = useState<number>(0); // Desplazamiento desde el centro (-300 a 300)
  const [posY, setPosY] = useState<number>(35); // Desplazamiento vertical para asentar en el disco (-150 a 150)
  const [shadowOpacity, setShadowOpacity] = useState<number>(0.75); // Sombra bajo neumáticos
  const [shadowSpread, setShadowSpread] = useState<number>(30); // Difuminado de la sombra
  const [brightness, setBrightness] = useState<number>(100); // 70 a 130
  const [contrast, setContrast] = useState<number>(102); // 70 a 130
  const [showReflection, setShowReflection] = useState<boolean>(true); // Reflejo suave en el piso

  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Cargar fondo oficial del Showroom
  useEffect(() => {
    if (!isOpen) return;
    const bg = new Image();
    bg.crossOrigin = 'anonymous';
    bg.src = '/vehicles/showroom-studio-backdrop.jpg';
    bg.onload = () => {
      backdropImgRef.current = bg;
      setBackdropLoaded(true);
    };
    bg.onerror = () => {
      // Fallback si por alguna razón falla el backdrop
      bg.src = '/vehicles/toyota-4runner-blanca-blindada.jpg';
    };
  }, [isOpen]);

  // 2. Cargar imagen del carro si existe
  useEffect(() => {
    if (!carImageSrc) {
      setCarLoaded(false);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = carImageSrc;
    img.onload = () => {
      carImgRef.current = img;
      setCarLoaded(true);
    };
    img.onerror = () => {
      setCarLoaded(false);
    };
  }, [carImageSrc]);

  // 3. Renderizar el lienzo Canvas (Fusión de Fondo + Sombra + Carro + Reflejo)
  const renderComposite = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1376;
    const height = 768;
    canvas.width = width;
    canvas.height = height;

    // Limpiar
    ctx.clearRect(0, 0, width, height);

    // Dibujar Fondo Showroom
    if (backdropImgRef.current && backdropLoaded) {
      ctx.drawImage(backdropImgRef.current, 0, 0, width, height);
    } else {
      // Fondo oscuro degradado de respaldo
      const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 2);
      grad.addColorStop(0, '#1c1e24');
      grad.addColorStop(1, '#0b0c10');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // Si hay carro cargado, dibujarlo con sus efectos
    if (carImgRef.current && carLoaded) {
      const car = carImgRef.current;

      // Calcular dimensiones del carro
      const baseRatio = car.width / car.height;
      const targetWidth = width * 0.72 * scale;
      const targetHeight = targetWidth / baseRatio;

      const drawX = (width - targetWidth) / 2 + posX;
      const drawY = (height - targetHeight) / 2 + posY + 40;

      // A. Dibujar Sombra de Contacto debajo de las llantas
      if (shadowOpacity > 0) {
        ctx.save();
        const shadowY = drawY + targetHeight - 15;
        const shadowWidth = targetWidth * 0.82;
        const shadowHeight = shadowSpread;

        ctx.beginPath();
        ctx.ellipse(
          drawX + targetWidth / 2,
          shadowY,
          shadowWidth / 2,
          shadowHeight / 2,
          0,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
        ctx.filter = `blur(${Math.round(shadowSpread / 2.2)}px)`;
        ctx.fill();
        ctx.restore();

        // Sombra de oclusión focalizada más oscura justo bajo el chasis
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
          drawX + targetWidth / 2,
          shadowY - 5,
          shadowWidth * 0.42,
          8,
          0,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, shadowOpacity * 1.3)})`;
        ctx.filter = 'blur(6px)';
        ctx.fill();
        ctx.restore();
      }

      // B. Dibujar Reflejo Sutil Invertido en las baldosas
      if (showReflection) {
        ctx.save();
        ctx.translate(0, drawY + targetHeight * 2 - 20);
        ctx.scale(1, -1);
        ctx.globalAlpha = 0.12;
        ctx.filter = 'blur(3px)';
        ctx.drawImage(car, drawX, drawY, targetWidth, targetHeight);
        ctx.restore();
      }

      // C. Dibujar el Carro con Filtros de Iluminación
      ctx.save();
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(car, drawX, drawY, targetWidth, targetHeight);
      ctx.restore();
    }
  };

  // Redibujar cada vez que cambien los parámetros
  useEffect(() => {
    renderComposite();
  }, [backdropLoaded, carLoaded, scale, posX, posY, shadowOpacity, shadowSpread, brightness, contrast, showReflection]);

  // Manejador de subida de archivo del carro
  const handleUploadCarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCarImageSrc(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Guardar y exportar la foto final combinada
  const handleExportAndApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    try {
      // Exportar a WebP de alta calidad (0.90)
      const dataUrl = canvas.toDataURL('image/webp', 0.90);
      onApplyImage(dataUrl);
      onClose();
    } catch (err) {
      console.error('Error al exportar canvas:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Resetear controles a valores óptimos
  const handleResetControls = () => {
    setScale(0.92);
    setPosX(0);
    setPosY(35);
    setShadowOpacity(0.75);
    setShadowSpread(30);
    setBrightness(100);
    setContrast(102);
    setShowReflection(true);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-carbon-950/95 backdrop-blur-xl animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl rounded-3xl bg-carbon-900 border border-gold-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* CABECERA */}
        <div className="flex items-center justify-between p-5 border-b border-carbon-800 bg-gradient-to-r from-carbon-900 via-carbon-850 to-carbon-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-white font-display">
                  Taller de Montaje Showroom Oficial (Foto Estática 3/4)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hidden sm:inline-block">
                  Sin giros • 100% Nítido
                </span>
              </div>
              <p className="text-xs text-silver-400 mt-0.5">
                {vehicleName ? <span className="text-gold-400 font-bold">{vehicleName}</span> : 'Vehículo'} · Monta la foto recortada sobre la plataforma de estudio con reflejo y sombra oficial.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-carbon-800 text-silver-400 hover:text-white hover:bg-carbon-750 transition-colors border border-carbon-750"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CUERPO DEL EDITOR */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* LIENZO DE PREVISUALIZACIÓN EN VIVO (7 COLUMNAS) */}
          <div className="lg:col-span-8 flex flex-col space-y-3">
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-carbon-750 bg-carbon-950 shadow-2xl flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />

              {!carLoaded && (
                <div className="absolute inset-0 bg-carbon-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-carbon-800/80 border border-gold-500/30 flex items-center justify-center text-gold-400">
                    <Car className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Sube la foto de tu carro</h4>
                    <p className="text-xs text-silver-400 max-w-sm mt-1">
                      Sube la foto recortada en PNG (la que recortas en 2 segundos desde tu celular manteniendo el dedo presionado) o una foto en JPG.
                    </p>
                  </div>
                  <label className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-carbon-950 font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-transform active:scale-95">
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar Foto de Mi Carro</span>
                    <input
                      type="file"
                      accept="image/png,image/webp,image/jpeg"
                      className="hidden"
                      onChange={handleUploadCarFile}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* BARRA INFORMATIVA DE AYUDA RÁPIDA */}
            <div className="p-3.5 rounded-xl bg-carbon-850 border border-carbon-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-silver-300">
                <HelpCircle className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>
                  <strong>Tip de recorte fácil:</strong> En iPhone o Android, mantén presionado el carro en tu galería de fotos y dale <em>"Guardar imagen recortada"</em>.
                </span>
              </div>
              <a
                href="https://www.photoroom.com/es/herramientas/borrador-de-fondo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 hover:text-gold-300 font-bold inline-flex items-center gap-1 hover:underline whitespace-nowrap text-[11px]"
              >
                <span>Recortar foto online gratis</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* PANEL DE CONTROL LATERAL (4 COLUMNAS) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4 bg-carbon-850 p-4 sm:p-5 rounded-2xl border border-carbon-750">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-carbon-750 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-gold-400" />
                  Calibración de Estudio
                </span>
                <button
                  type="button"
                  onClick={handleResetControls}
                  className="text-[10px] text-silver-400 hover:text-gold-400 flex items-center gap-1 font-mono transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restablecer
                </button>
              </div>

              {/* Botón para cambiar foto */}
              <div>
                <label className="w-full py-2 bg-carbon-800 hover:bg-carbon-750 border border-carbon-700 text-gold-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{carLoaded ? 'Cambiar Foto del Carro' : 'Cargar Foto PNG'}</span>
                  <input
                    type="file"
                    accept="image/png,image/webp,image/jpeg"
                    className="hidden"
                    onChange={handleUploadCarFile}
                  />
                </label>
              </div>

              {/* Controles deslizantes */}
              <div className="space-y-3.5 pt-1">
                {/* Tamaño / Escala */}
                <div>
                  <div className="flex justify-between text-xs text-silver-300 font-medium mb-1">
                    <span>Tamaño del Carro:</span>
                    <span className="font-mono text-gold-400">{Math.round(scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.3"
                    step="0.01"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer h-1.5 bg-carbon-700 rounded-lg"
                  />
                </div>

                {/* Altura / Posición Y (Asentar en el disco) */}
                <div>
                  <div className="flex justify-between text-xs text-silver-300 font-medium mb-1">
                    <span>Apoyar en Plataforma (Y):</span>
                    <span className="font-mono text-gold-400">{posY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="150"
                    step="2"
                    value={posY}
                    onChange={(e) => setPosY(parseInt(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer h-1.5 bg-carbon-700 rounded-lg"
                  />
                </div>

                {/* Centrado Horizontal (X) */}
                <div>
                  <div className="flex justify-between text-xs text-silver-300 font-medium mb-1">
                    <span>Centrado Lateral (X):</span>
                    <span className="font-mono text-gold-400">{posX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="2"
                    value={posX}
                    onChange={(e) => setPosX(parseInt(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer h-1.5 bg-carbon-700 rounded-lg"
                  />
                </div>

                {/* Intensidad de Sombra */}
                <div>
                  <div className="flex justify-between text-xs text-silver-300 font-medium mb-1">
                    <span>Sombra Bajo Llantas:</span>
                    <span className="font-mono text-gold-400">{Math.round(shadowOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={shadowOpacity}
                    onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer h-1.5 bg-carbon-700 rounded-lg"
                  />
                </div>

                {/* Iluminación / Brillo */}
                <div>
                  <div className="flex justify-between text-xs text-silver-300 font-medium mb-1">
                    <span>Brillo del Carro:</span>
                    <span className="font-mono text-gold-400">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="130"
                    step="1"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer h-1.5 bg-carbon-700 rounded-lg"
                  />
                </div>

                {/* Reflejo en Suelo */}
                <div className="pt-2 border-t border-carbon-750 flex items-center justify-between">
                  <span className="text-xs text-silver-300 font-medium">Reflejo en Baldosa:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showReflection}
                      onChange={(e) => setShowReflection(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-carbon-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-carbon-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* BOTÓN FINAL DE APLICAR */}
            <div className="pt-4 border-t border-carbon-750">
              <button
                type="button"
                disabled={!carLoaded || isProcessing}
                onClick={handleExportAndApply}
                className="w-full py-3 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-carbon-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isProcessing ? 'Guardando...' : 'Aplicar como Portada Oficial'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>,
    document.body
  );
};
