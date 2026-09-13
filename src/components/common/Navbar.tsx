import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Sparkles, Compass, Lock, Globe } from 'lucide-react';
import { Button } from './Button';
import { useCurrency, CurrencyCode } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';

interface NavbarProps {
  currentRoute?: 'home' | 'catalog';
  onNavigateHome?: () => void;
  onNavigateToCatalog?: () => void;
  onNavigateToFleet?: () => void;
  onNavigateToBooking?: () => void;
  onNavigateToAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute = 'home',
  onNavigateHome,
  onNavigateToCatalog,
  onNavigateToFleet,
  onNavigateToBooking,
  onNavigateToAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'fleet' | 'experience' | 'how-it-works' | 'faq'>('fleet');

  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t } = useLanguage();
  const { settings, getWhatsAppLink } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (currentRoute === 'home') {
        const sections: Array<{ id: string; key: 'fleet' | 'experience' | 'how-it-works' | 'faq' }> = [
          { id: 'faq', key: 'faq' },
          { id: 'how-it-works', key: 'how-it-works' },
          { id: 'experience', key: 'experience' },
          { id: 'showroom', key: 'fleet' },
        ];

        const scrollPosition = window.scrollY + 220; // Offset visual para compensar la barra superior

        for (const sec of sections) {
          const el = document.getElementById(sec.id);
          if (el) {
            const top = el.offsetTop;
            if (scrollPosition >= top) {
              setActiveSection(sec.key);
              return;
            }
          }
        }

        // Si está en el Hero superior
        setActiveSection('fleet');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentRoute]);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);

    // Actualizar estado de sección activa inmediatamente al hacer clic
    if (id === 'showroom') setActiveSection('fleet');
    else if (id === 'experience') setActiveSection('experience');
    else if (id === 'how-it-works') setActiveSection('how-it-works');
    else if (id === 'faq') setActiveSection('faq');

    if (currentRoute !== 'home' && onNavigateHome) {
      onNavigateHome();
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
    setActiveSection('fleet');
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
    setActiveSection('fleet');
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

  const isFleetActive = currentRoute === 'home' && activeSection === 'fleet';
  const isCatalogActive = currentRoute === 'catalog';
  const isExperienceActive = currentRoute === 'home' && activeSection === 'experience';
  const isHowItWorksActive = currentRoute === 'home' && activeSection === 'how-it-works';
  const isFaqActive = currentRoute === 'home' && activeSection === 'faq';

  const whatsAppLink = getWhatsAppLink();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      
      {/* ========================================================================= */}
      {/* TIER 1: MICRO-TOPBAR VIP (Estándar Oficial Concesionario de Superlujo)   */}
      {/* Aloja utilidades (Divisas, Idioma, Estado Showroom y Portal Staff)        */}
      {/* ========================================================================= */}
      <div className="bg-carbon-950/95 border-b border-carbon-850/80 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-8 text-[11px] font-medium text-silver-400">
            
            {/* Lado Izquierdo: Telemetría de Ubicación & Servicio VIP */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-semibold text-silver-300">
                  {settings.city.includes('Medellín')
                    ? (language === 'ES' ? 'Showroom Medellín' : 'Medellín Showroom')
                    : settings.city}
                </span>
              </div>
              <span className="hidden sm:inline text-carbon-700">•</span>
              <span className="hidden sm:inline text-silver-400">
                {language === 'ES' ? 'Aeropuerto JMC & Domicilio VIP' : 'JMC Airport & Private Delivery'}
              </span>
              <span className="hidden md:inline text-carbon-700">•</span>
              <span className="hidden md:inline text-gold-400/90 font-mono">
                {language === 'ES' ? 'Atención 24/7' : '24/7 Concierge'}
              </span>
            </div>

            {/* Lado Derecho: Utilidades Operativas (Moneda, Idioma, Portal Staff) */}
            <div className="flex items-center gap-3">
              
              {/* Selector de Moneda Satinado */}
              <div className="flex items-center bg-carbon-900 border border-carbon-800 rounded-full p-0.5 text-[10px] font-mono font-bold shadow-inner">
                {(['USD', 'EUR', 'COP'] as CurrencyCode[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-2 py-0.5 rounded-full transition-all ${
                      currency === c
                        ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-carbon-950 font-black shadow-sm'
                        : 'text-silver-400 hover:text-white'
                    }`}
                    title={`Cambiar a ${c}`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="h-3 w-px bg-carbon-800" />

              {/* Selector de Idioma */}
              <button
                onClick={() => setLanguage(language === 'ES' ? 'EN' : 'ES')}
                className="flex items-center gap-1 text-[11px] font-mono text-silver-300 hover:text-gold-400 transition-colors px-1.5 py-0.5 rounded hover:bg-carbon-900"
                title="Cambiar idioma / Switch language"
              >
                <Globe className="w-3 h-3 text-gold-400" />
                <span className="font-bold">{language === 'ES' ? 'ES' : 'EN'}</span>
              </button>

              {/* Acceso a Portal Staff / Director */}
              {onNavigateToAdmin && (
                <>
                  <div className="h-3 w-px bg-carbon-800" />
                  <button
                    onClick={onNavigateToAdmin}
                    className="flex items-center gap-1 text-[11px] text-silver-400 hover:text-gold-400 transition-colors px-2 py-0.5 rounded hover:bg-carbon-900/80 group"
                    title="Acceso exclusivo al Portal Administrativo"
                  >
                    <Lock className="w-3 h-3 text-gold-400/80 group-hover:text-gold-400" />
                    <span className="hidden sm:inline font-medium">{t.nav.adminPortal}</span>
                    <span className="sm:hidden font-medium">Staff</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 2: BARRA PRINCIPAL DE EXHIBICIÓN (Limpia, Espaciosa y Elegante)       */}
      {/* ========================================================================= */}
      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-carbon-950/92 backdrop-blur-2xl border-b border-carbon-800/80 py-3 shadow-2xl shadow-carbon-950/80'
            : 'bg-gradient-to-b from-carbon-950/90 via-carbon-950/40 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* 1. Logotipo Emblemático */}
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-3.5 group focus:outline-none text-left"
              aria-label={`${settings.companyName} - Inicio`}
            >
              {settings.logoUrl ? (
                <div className="h-10 flex items-center">
                  <img
                    src={settings.logoUrl}
                    alt={settings.companyName}
                    className="h-9 w-auto max-w-[140px] object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-carbon-800 to-carbon-900 border border-gold-500/40 flex items-center justify-center group-hover:border-gold-400 transition-all shadow-lg shadow-gold-500/10 group-hover:shadow-gold-500/20">
                  <Sparkles className="w-5 h-5 text-gold-400 group-hover:scale-110 transition-transform" />
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] tracking-[0.28em] text-gold-400 font-bold uppercase leading-none">
                    PREMIUM
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gold-400/80" />
                  <span className="text-[9px] tracking-[0.18em] text-silver-400 uppercase font-mono">
                    VIP
                  </span>
                </div>
                <span className="text-base sm:text-lg tracking-[0.14em] font-black text-silver-100 uppercase leading-tight font-display">
                  {settings.companyName ? settings.companyName.replace(/Premium\s*/i, '') : 'CAR RENTAL'}
                </span>
              </div>
            </button>

            {/* 2. Navegación Principal Despejada con Espaciado Generoso */}
            <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-xs font-bold uppercase tracking-[0.15em] text-silver-300">
              <button
                onClick={handleFleetClick}
                className={`transition-all py-1 relative group ${
                  isFleetActive ? 'text-gold-400 font-black' : 'text-silver-300 hover:text-gold-400'
                }`}
              >
                <span>{t.nav.fleet}</span>
                {isFleetActive && (
                  <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-gradient-to-r from-gold-400 to-amber-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.7)]" />
                )}
              </button>

              <button
                onClick={handleCatalogClick}
                className={`transition-all py-1 relative group flex items-center gap-1.5 ${
                  isCatalogActive ? 'text-gold-400 font-black' : 'text-silver-300 hover:text-gold-400'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-gold-400" />
                <span>{t.nav.catalog}</span>
                {isCatalogActive && (
                  <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-gradient-to-r from-gold-400 to-amber-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.7)]" />
                )}
              </button>

              <button
                onClick={() => scrollToSection('experience')}
                className={`transition-all py-1 relative group ${
                  isExperienceActive ? 'text-gold-400 font-black' : 'text-silver-300 hover:text-gold-400'
                }`}
              >
                <span>{t.nav.experience}</span>
                {isExperienceActive && (
                  <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-gradient-to-r from-gold-400 to-amber-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.7)]" />
                )}
              </button>

              <button
                onClick={() => scrollToSection('how-it-works')}
                className={`transition-all py-1 relative group ${
                  isHowItWorksActive ? 'text-gold-400 font-black' : 'text-silver-300 hover:text-gold-400'
                }`}
              >
                <span>{t.nav.howItWorks}</span>
                {isHowItWorksActive && (
                  <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-gradient-to-r from-gold-400 to-amber-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.7)]" />
                )}
              </button>

              <button
                onClick={() => scrollToSection('faq')}
                className={`transition-all py-1 relative group ${
                  isFaqActive ? 'text-gold-400 font-black' : 'text-silver-300 hover:text-gold-400'
                }`}
              >
                <span>{t.nav.requirements}</span>
                {isFaqActive && (
                  <span className="absolute -bottom-1.5 left-0 w-full h-[2px] bg-gradient-to-r from-gold-400 to-amber-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.7)]" />
                )}
              </button>
            </nav>

            {/* 3. Acciones de Alto Impacto (Solo 2 Botones VIP Pulidos) */}
            <div className="hidden sm:flex items-center gap-3">
              
              {/* Botón WhatsApp Concierge VIP */}
              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold text-silver-300 hover:text-white px-3.5 py-2 rounded-xl border border-carbon-750 hover:border-emerald-500/50 bg-carbon-900/80 hover:bg-carbon-850 transition-all shadow-sm group"
                aria-label="Atención Concierge por WhatsApp"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Concierge VIP</span>
              </a>

              {/* Botón Principal de Reserva con Oro Satinado */}
              <button
                onClick={onNavigateToBooking || (() => scrollToSection('showroom'))}
                className="relative inline-flex items-center justify-center px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-carbon-950 bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500 hover:from-gold-300 hover:via-gold-400 hover:to-amber-400 transition-all shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-carbon-950 fill-carbon-950" />
                <span>{t.cta.bookNow}</span>
              </button>
            </div>

            {/* Botón Hamburguesa para Móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-carbon-900 border border-carbon-800 text-silver-300 hover:text-gold-400 focus:outline-none"
              aria-label="Abrir menú de navegación"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CAJÓN DE NAVEGACIÓN MÓVIL (Responsive & Touch-Friendly)                   */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-carbon-950/98 border-b border-carbon-800 px-6 py-6 space-y-5 shadow-2xl animate-fade-in backdrop-blur-2xl">
          
          {/* Fila de Utilidades en Móvil: Moneda + Idioma */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-carbon-900 border border-carbon-800">
            <div className="flex items-center gap-1 font-mono text-xs">
              {(['USD', 'EUR', 'COP'] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    currency === c
                      ? 'bg-gold-500 text-carbon-950 shadow-sm'
                      : 'text-silver-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              onClick={() => setLanguage(language === 'ES' ? 'EN' : 'ES')}
              className="flex items-center gap-1 text-xs font-mono font-bold px-3 py-1 rounded-lg border border-carbon-700 bg-carbon-800 text-gold-400"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'ES' ? 'Español' : 'English'}</span>
            </button>
          </div>

          {/* Menú de Enlaces */}
          <nav className="flex flex-col space-y-3 text-base font-medium text-silver-200">
            {onNavigateToAdmin && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigateToAdmin();
                }}
                className="text-left py-2.5 px-3.5 rounded-xl bg-carbon-900 border border-gold-500/30 text-gold-400 font-bold flex items-center justify-between text-sm mb-1"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gold-400" />
                  {t.nav.adminPortal}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-gold-500/20 text-gold-300">
                  Acceso VIP
                </span>
              </button>
            )}

            <button
              onClick={handleHomeClick}
              className={`text-left py-2 border-b border-carbon-900 flex items-center justify-between ${
                isFleetActive ? 'text-gold-400 font-bold' : 'hover:text-gold-400 text-silver-300'
              }`}
            >
              <span>{t.nav.fleet}</span>
              {isFleetActive && <span className="w-2 h-2 rounded-full bg-gold-400" />}
            </button>

            <button
              onClick={handleCatalogClick}
              className={`text-left py-2 border-b border-carbon-900 flex items-center justify-between ${
                isCatalogActive ? 'text-gold-400 font-bold' : 'hover:text-gold-400 text-silver-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-gold-400" />
                {t.nav.catalog}
              </span>
              {isCatalogActive && <span className="w-2 h-2 rounded-full bg-gold-400" />}
            </button>

            <button
              onClick={() => scrollToSection('experience')}
              className={`text-left py-2 border-b border-carbon-900 flex items-center justify-between ${
                isExperienceActive ? 'text-gold-400 font-bold' : 'hover:text-gold-400 text-silver-300'
              }`}
            >
              <span>{t.nav.experience}</span>
              {isExperienceActive && <span className="w-2 h-2 rounded-full bg-gold-400" />}
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`text-left py-2 border-b border-carbon-900 flex items-center justify-between ${
                isHowItWorksActive ? 'text-gold-400 font-bold' : 'hover:text-gold-400 text-silver-300'
              }`}
            >
              <span>{t.nav.howItWorks}</span>
              {isHowItWorksActive && <span className="w-2 h-2 rounded-full bg-gold-400" />}
            </button>

            <button
              onClick={() => scrollToSection('faq')}
              className={`text-left py-2 border-b border-carbon-900 flex items-center justify-between ${
                isFaqActive ? 'text-gold-400 font-bold' : 'hover:text-gold-400 text-silver-300'
              }`}
            >
              <span>{t.nav.requirements}</span>
              {isFaqActive && <span className="w-2 h-2 rounded-full bg-gold-400" />}
            </button>
          </nav>

          {/* Acciones Rápidas en Móvil */}
          <div className="pt-3 flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onNavigateToBooking) onNavigateToBooking();
              }}
            >
              {t.cta.bookNow}
            </Button>

            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-carbon-800 text-sm font-medium text-silver-300 hover:text-gold-400 bg-carbon-900"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Concierge</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
