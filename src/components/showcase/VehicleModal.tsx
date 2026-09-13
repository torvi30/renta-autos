import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, Gauge, Flame, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { Vehicle } from '../../types/vehicle';
import { VehicleShowcase } from './VehicleShowcase';
import { StatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { generateWhatsAppLink } from '../../utils/formatters';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';

interface VehicleModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onBook: (vehicle: Vehicle) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  vehicle,
  onClose,
  onBook,
}) => {
  const { formatPrice } = useCurrency();
  const { t, language } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  if (!vehicle) return null;

  // Recopilar hasta 12 fotos respetando la Regla 8
  const allPhotos = [
    ...(vehicle.gallery?.exteriorImages || []),
    ...(vehicle.gallery?.interiorImages || []),
    ...(vehicle.gallery?.detailImages || []),
  ].slice(0, 12);

  const whatsAppLink = generateWhatsAppLink({
    vehicleName: `${vehicle.brand} ${vehicle.model} (${vehicle.year})`,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-carbon-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalles de ${vehicle.brand} ${vehicle.model}`}
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-carbon-900 border border-carbon-750 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Cabecera del Modal con Botón Cerrar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-carbon-800 bg-carbon-900/90 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              {vehicle.brand}
            </span>
            <div className="h-4 w-px bg-carbon-750" />
            <span className="text-base sm:text-lg font-bold text-silver-100 font-display">
              {vehicle.model}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-carbon-800 text-silver-400 font-mono">
              {vehicle.year}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-carbon-850 hover:bg-carbon-800 text-silver-400 hover:text-white transition-colors"
            aria-label={t.cta.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Protagonista: VehicleShowcase */}
          <div className="rounded-xl overflow-hidden shadow-showroom">
            <VehicleShowcase
              videoUrl={vehicle.videoUrl}
              imageUrl={
                activeImageIndex !== null
                  ? allPhotos[activeImageIndex]
                  : vehicle.mainImage
              }
              altText={`${vehicle.brand} ${vehicle.model}`}
              aspectRatio="16/9"
              autoPlay={true}
              showControls={true}
              priority={true}
            />
          </div>

          {/* Galería rápida de hasta 12 fotos (Regla 8) */}
          {allPhotos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-silver-400 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-gold-400" />
                  {language === 'EN' ? `Official Gallery (${allPhotos.length} / 12 photos)` : `Galería Oficial (${allPhotos.length} / 12 fotografías)`}
                </span>
                {activeImageIndex !== null && (
                  <button
                    onClick={() => setActiveImageIndex(null)}
                    className="text-[11px] text-gold-400 hover:underline"
                  >
                    {language === 'EN' ? 'Back to Video / Cover' : 'Volver al Video / Portada'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {allPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-video rounded-lg overflow-hidden border transition-all ${
                      activeImageIndex === idx
                        ? 'border-gold-400 ring-2 ring-gold-400/40'
                        : 'border-carbon-800 opacity-70 hover:opacity-100 hover:border-carbon-600'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`${vehicle.model} foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ficha Técnica & Prestaciones */}
          {vehicle.specs && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-carbon-850 p-4 rounded-xl border border-carbon-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-gold-400" />
                <div>
                  <div className="text-[10px] text-silver-400">{t.specs.acceleration}</div>
                  <div className="text-sm font-bold text-silver-100">{vehicle.specs.acceleration0to100 || '3.4 s'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-gold-400" />
                <div>
                  <div className="text-[10px] text-silver-400">{t.specs.horsepower}</div>
                  <div className="text-sm font-bold text-silver-100">{vehicle.specs.horsepower} HP</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-gold-400" />
                <div>
                  <div className="text-[10px] text-silver-400">{t.specs.topSpeed}</div>
                  <div className="text-sm font-bold text-silver-100">{vehicle.specs.topSpeed} km/h</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[10px] text-silver-400">{language === 'EN' ? 'Status' : 'Estado'}</div>
                  <StatusBadge status={vehicle.status} />
                </div>
              </div>
            </div>
          )}

          {/* Descripción y Equipamiento */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-400 mb-2">
              {language === 'EN' ? 'Vehicle Description' : 'Descripción del Vehículo'}
            </h4>
            <p className="text-sm text-silver-300 leading-relaxed">
              {vehicle.description}
            </p>
          </div>

          {/* Características destacadas */}
          {vehicle.features.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-400 mb-3">
                {t.detail.equipmentTitle}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {vehicle.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-silver-200 bg-carbon-850 px-3 py-2 rounded-lg border border-carbon-800"
                  >
                    <Check className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Barra de acción inferior fijada */}
        <div className="p-4 sm:p-6 border-t border-carbon-800 bg-carbon-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-silver-400">{t.detail.officialRate}:</span>
            <span className="text-2xl font-bold text-silver-100 font-mono">
              {formatPrice(vehicle.pricePerDay)}
            </span>
            <span className="text-xs text-silver-400">/ {t.detail.day}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.hero.vipWhatsApp}</span>
            </a>

            <Button
              variant="primary"
              size="md"
              className="flex-1 sm:flex-none"
              onClick={() => onBook(vehicle)}
            >
              {t.detail.requestBooking}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
