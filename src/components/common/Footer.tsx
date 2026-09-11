import React from 'react';
import { Sparkles, Shield, Clock, Phone, Mail, Award } from 'lucide-react';

interface FooterProps {
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToAdmin }) => {
  return (
    <footer className="bg-carbon-950 border-t border-carbon-800/80 pt-16 pb-12 text-silver-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-carbon-850">
          
          {/* Col 1 & 2: Identidad & Filosofía */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-carbon-850 border border-gold-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gold-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs tracking-widest text-gold-400 font-semibold uppercase">
                  PREMIUM
                </span>
                <span className="text-sm tracking-wider font-bold text-silver-100 uppercase font-display">
                  CAR RENTAL
                </span>
              </div>
            </div>
            
            <p className="text-sm text-silver-400 max-w-sm leading-relaxed">
              La experiencia definitiva en alquiler de vehículos de alta gama y superdeportivos. Flota seleccionada, entrega personalizada y atención concierge 24/7.
            </p>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-xs text-silver-300">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Póliza de Cobertura Total</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-silver-300">
                <Award className="w-4 h-4 text-gold-400" />
                <span>Flota Certificada</span>
              </div>
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

          {/* Col 5: Contacto Directo */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-silver-200 mb-4">
              Contacto Concierge
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>+1 (800) 773-6486</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>concierge@premiumcarrental.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Atención 24/7 / 365 días</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-silver-500">
          <p>© {new Date().getFullYear()} Premium Car Rental. Todos los derechos reservados.</p>
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
