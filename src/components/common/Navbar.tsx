import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Sparkles, Compass } from 'lucide-react';
import { Button } from './Button';
import { generateWhatsAppLink } from '../../utils/formatters';

interface NavbarProps {
  currentRoute?: 'home' | 'catalog';
  onNavigateHome?: () => void;
  onNavigateToCatalog?: () => void;
  onNavigateToFleet?: () => void;
  onNavigateToBooking?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute = 'home',
  onNavigateHome,
  onNavigateToCatalog,
  onNavigateToFleet,
  onNavigateToBooking,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (currentRoute !== 'home' && onNavigateHome) {
      onNavigateHome();
      // Pequeño retardo para dar tiempo a renderizar la vista home si no estaba activa
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCatalogClick = () => {
    setIsMobileMenuOpen(false);
    if (onNavigateToCatalog) {
      onNavigateToCatalog();
    }
  };

  const handleFleetClick = () => {
    setIsMobileMenuOpen(false);
    if (currentRoute !== 'home' && onNavigateHome) {
      onNavigateHome();
      setTimeout(() => {
        const element = document.getElementById('showroom');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    if (onNavigateToFleet) {
      onNavigateToFleet();
    } else {
      scrollToSection('showroom');
    }
  };

  const whatsAppLink = generateWhatsAppLink({});

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-carbon-950/90 backdrop-blur-xl border-b border-carbon-800/80 py-3.5 shadow-2xl'
          : 'bg-gradient-to-b from-carbon-950/90 via-carbon-950/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <button
            onClick={handleHomeClick}
            className="flex items-center gap-3 group focus:outline-none text-left"
            aria-label="Premium Car Rental - Inicio"
          >
            <div className="w-10 h-10 rounded-lg bg-carbon-850 border border-gold-500/30 flex items-center justify-center group-hover:border-gold-500/70 transition-colors shadow-lg shadow-gold-500/5">
              <Sparkles className="w-5 h-5 text-gold-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm tracking-widest text-gold-400 font-semibold uppercase leading-none">
                PREMIUM
              </span>
              <span className="text-base tracking-wider font-bold text-silver-100 uppercase leading-tight font-display">
                CAR RENTAL
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-silver-300">
            <button
              onClick={handleFleetClick}
              className={`transition-colors py-1 relative group ${
                currentRoute === 'home' ? 'text-gold-400 font-semibold' : 'hover:text-gold-400'
              }`}
            >
              Showroom 360
              <span className={`absolute bottom-0 left-0 h-0.5 bg-gold-400 transition-all ${
                currentRoute === 'home' ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </button>

            <button
              onClick={handleCatalogClick}
              className={`transition-colors py-1 relative group flex items-center gap-1.5 ${
                currentRoute === 'catalog' ? 'text-gold-400 font-semibold' : 'hover:text-gold-400'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-gold-400" />
              <span>Catálogo Flota</span>
              <span className={`absolute bottom-0 left-0 h-0.5 bg-gold-400 transition-all ${
                currentRoute === 'catalog' ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </button>

            <button
              onClick={() => scrollToSection('experience')}
              className="hover:text-gold-400 transition-colors py-1 relative group"
            >
              Experiencia VIP
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold-400 transition-all group-hover:w-full" />
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-gold-400 transition-colors py-1 relative group"
            >
              Cómo Funciona
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold-400 transition-all group-hover:w-full" />
            </button>

            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-gold-400 transition-colors py-1 relative group"
            >
              Preguntas
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold-400 transition-all group-hover:w-full" />
            </button>
          </nav>

          {/* Actions & WhatsApp Contact */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-medium text-silver-400 hover:text-gold-400 px-3 py-2 rounded-lg border border-carbon-800 hover:border-carbon-750 bg-carbon-900/60 transition-colors"
              aria-label="Atención Concierge por WhatsApp"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Concierge VIP</span>
            </a>

            <Button
              variant="primary"
              size="sm"
              onClick={onNavigateToBooking || (() => scrollToSection('showroom'))}
            >
              Reservar Ahora
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-carbon-900 border border-carbon-800 text-silver-300 hover:text-gold-400 focus:outline-none"
            aria-label="Abrir menú de navegación"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Regla 10: óptimo en móvil) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-carbon-950/98 border-b border-carbon-800 px-6 py-6 mt-3 space-y-4 shadow-2xl animate-fade-in backdrop-blur-2xl">
          <nav className="flex flex-col space-y-3 text-base font-medium text-silver-200">
            <button
              onClick={handleHomeClick}
              className={`text-left py-2 border-b border-carbon-900 flex items-center justify-between ${
                currentRoute === 'home' ? 'text-gold-400 font-bold' : 'hover:text-gold-400'
              }`}
            >
              <span>Showroom 360</span>
              {currentRoute === 'home' && <span className="w-2 h-2 rounded-full bg-gold-400" />}
            </button>

            <button
              onClick={handleCatalogClick}
              className={`text-left py-2 border-b border-carbon-900 flex items-center justify-between ${
                currentRoute === 'catalog' ? 'text-gold-400 font-bold' : 'hover:text-gold-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-gold-400" />
                Catálogo Completo
              </span>
              {currentRoute === 'catalog' && <span className="w-2 h-2 rounded-full bg-gold-400" />}
            </button>

            <button
              onClick={() => scrollToSection('experience')}
              className="text-left py-2 border-b border-carbon-900 hover:text-gold-400"
            >
              Experiencia VIP
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left py-2 border-b border-carbon-900 hover:text-gold-400"
            >
              Cómo Funciona
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-left py-2 border-b border-carbon-900 hover:text-gold-400"
            >
              Preguntas Frecuentes
            </button>
          </nav>

          <div className="pt-4 flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onNavigateToBooking) onNavigateToBooking();
              }}
            >
              Reservar Ahora
            </Button>

            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-lg border border-carbon-800 text-sm font-medium text-silver-300 hover:text-gold-400"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Contactar por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
