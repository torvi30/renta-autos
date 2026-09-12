import React from 'react';
import {
  Sparkles,
  Shield,
  Clock,
  Phone,
  Mail,
  Award,
  MapPin,
  MessageSquare,
  Instagram,
  Facebook,
  Youtube,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface FooterProps {
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToAdmin }) => {
  const { settings, getWhatsAppLink } = useSettings();
  const whatsAppUrl = getWhatsAppLink();

  return (
    <footer className="bg-carbon-950 border-t border-carbon-800/80 pt-16 pb-12 text-silver-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-carbon-850">
          
          {/* Col 1 & 2: Identidad & Filosofía */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.companyName}
                  className="h-10 w-auto max-w-[150px] object-contain"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-carbon-850 border border-gold-500/30 flex items-center justify-center shadow-md shadow-gold-500/5">
                  <Sparkles className="w-5 h-5 text-gold-400" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs tracking-widest text-gold-400 font-semibold uppercase">
                  PREMIUM
                </span>
                <span className="text-sm tracking-wider font-bold text-silver-100 uppercase font-display">
                  {settings.companyName ? settings.companyName.toUpperCase() : 'CAR RENTAL'}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-silver-400 max-w-sm leading-relaxed">
              {settings.tagline}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-silver-300">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{settings.policies?.coverageText}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-silver-300">
                <Award className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>{settings.policies?.certificationText}</span>
              </div>
            </div>

            {settings.address && (
              <div className="flex items-center gap-2 text-xs text-silver-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                <span>{settings.address} • {settings.city}</span>
              </div>
            )}

            {/* Redes Sociales Oficiales */}
            <div className="flex items-center gap-2.5 pt-2">
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-carbon-900 border border-carbon-800 flex items-center justify-center text-silver-400 hover:text-gold-400 hover:border-gold-500/40 transition-colors shadow-sm"
                  aria-label="Instagram Oficial"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.tiktok && (
                <a
                  href={settings.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-carbon-900 border border-carbon-800 flex items-center justify-center text-silver-400 hover:text-gold-400 hover:border-gold-500/40 transition-colors shadow-sm font-mono text-[10px] font-bold"
                  aria-label="TikTok Oficial"
                >
                  TK
                </a>
              )}
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-carbon-900 border border-carbon-800 flex items-center justify-center text-silver-400 hover:text-gold-400 hover:border-gold-500/40 transition-colors shadow-sm"
                  aria-label="Facebook Oficial"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-carbon-900 border border-carbon-800 flex items-center justify-center text-silver-400 hover:text-gold-400 hover:border-gold-500/40 transition-colors shadow-sm"
                  aria-label="YouTube Oficial"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 3: Navegación Rápida */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-200 mb-4">
              Colección
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#showroom" className="hover:text-gold-400 transition-colors">Superdeportivos</a></li>
              <li><a href="#showroom" className="hover:text-gold-400 transition-colors">SUVs de Lujo</a></li>
              <li><a href="#showroom" className="hover:text-gold-400 transition-colors">Sedanes Ejecutivos</a></li>
              <li><a href="#showroom" className="hover:text-gold-400 transition-colors">Ver Toda la Flota</a></li>
            </ul>
          </div>

          {/* Col 4: Servicios VIP */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-200 mb-4">
              Servicios VIP
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#experience" className="hover:text-gold-400 transition-colors">Entrega en Aeropuerto</a></li>
              <li><a href="#experience" className="hover:text-gold-400 transition-colors">Entrega a Domicilio</a></li>
              <li><a href="#experience" className="hover:text-gold-400 transition-colors">Chófer Privado</a></li>
              <li><a href="#experience" className="hover:text-gold-400 transition-colors">Eventos & Producciones</a></li>
            </ul>
          </div>

          {/* Col 5: Contacto Concierge Dinámico */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-200 mb-4">
              Contacto Concierge
            </h4>
            <ul className="space-y-3 text-sm">
              
              {/* WhatsApp Directo */}
              <li>
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-silver-300 hover:text-emerald-400 transition-colors group"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-xs text-emerald-400 font-semibold">WhatsApp Concierge</span>
                </a>
              </li>

              {/* Teléfono de Llamadas */}
              <li>
                <a
                  href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-2.5 text-silver-300 hover:text-gold-400 transition-colors"
                >
                  <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  <span className="font-mono">{settings.phone}</span>
                </a>
              </li>

              {/* Correo Electrónico */}
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2.5 text-silver-300 hover:text-gold-400 transition-colors truncate"
                >
                  <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  <span className="truncate">{settings.email}</span>
                </a>
              </li>

              {/* Horario de Atención */}
              <li className="flex items-center gap-2.5 text-silver-300">
                <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{settings.businessHours}</span>
              </li>

            </ul>
          </div>

        </div>

        {/* Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-silver-500">
          <p>© {new Date().getFullYear()} {settings.companyName}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-silver-300 transition-colors">Términos del Servicio</a>
            <a href="#" className="hover:text-silver-300 transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-silver-300 transition-colors">Requisitos de Alquiler</a>
            {onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="hover:text-gold-400 transition-colors text-[11px] underline underline-offset-4 decoration-carbon-700"
              >
                Portal Corporativo
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
