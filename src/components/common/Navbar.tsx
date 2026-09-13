import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Sparkles, Compass, Globe } from 'lucide-react';
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

  const isManualScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Contador de 3 clics secretos en el logotipo para acceso de administrador
  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const lockActiveSection = (sectionKey: 'fleet' | 'experience' | 'how-it-works' | 'faq') => {
    setActiveSection(sectionKey);
    isManualScrollingRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 1100); // Bloquea la sobreescritura durante el scroll suave
  };

  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t } = useLanguage();
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Si el usuario acaba de hacer clic en un enlace del menú, no sobreescribir con el scroll en tránsito
      if (isManualScrollingRef.current) return;

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
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentRoute]);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);

    // Actualizar y bloquear la sección activa inmediatamente sin saltos durante el desplazamiento suave
    if (id === 'showroom') lockActiveSection('fleet');
    else if (id === 'experience') lockActiveSection('experience');
    else if (id === 'how-it-works') lockActiveSection('how-it-works');
    else if (id === 'faq') lockActiveSection('faq');

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
    lockActiveSection('fleet');
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Puerta secreta: 3 clics rápidos al logotipo activan el portal administrativo
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    logoClickCountRef.current += 1;

    if (logoClickTimerRef.current) {
      clearTimeout(logoClickTimerRef.current);
    }

    if (logoClickCountRef.current >= 3) {
      logoClickCountRef.current = 0;
      setIsMobileMenuOpen(false);
      if (onNavigateToAdmin) {
        onNavigateToAdmin();
      }
      return;
    }

    logoClickTimerRef.current = setTimeout(() => {
      logoClickCountRef.current = 0;
    }, 1000);

    handleHomeClick(e);
  };

  const handleCatalogClick = () => {
    setIsMobileMenuOpen(false);
    if (onNavigateToCatalog) {
      onNavigateToCatalog();
    }
  };

  const handleFleetClick = () => {
    setIsMobileMenuOpen(false);
    lockActiveSection('fleet');
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      
      {/* ========================================================================= */}
      {/* TIER 1: MICRO-TOPBAR VIP (Estándar Oficial Concesionario de Superlujo)   */}
      {/* Aloja utilidades (Divisas, Idioma, Estado Showroom y Portal Staff)        */}
      {/* ========================================================================= */}
      <div className="bg-carbon-950/80 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-7.5 text-[10px] font-medium text-silver-400 tracking-wider">
            
            {/* Lado Izquierdo: Telemetría de Ubicación & Servicio VIP */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="font-semibold text-silver-300 uppercase tracking-widest text-[9.5px]">
                  {settings.city.includes('Medellín')
                    ? (language === 'ES' ? 'Showroom Medellín' : 'Medellín Showroom')
                    : settings.city}
                </span>
              </div>
              <span className="hidden sm:inline text-carbon-700">·</span>
              <span className="hidden sm:inline text-silver-400 font-mono text-[9.5px]">
                {language === 'ES' ? 'Aeropuerto JMC & Entrega VIP' : 'JMC Airport & VIP Delivery'}
              </span>
              <span className="hidden md:inline text-carbon-700">·</span>
              <span className="hidden md:inline text-gold-400/90 font-mono font-semibold text-[9.5px]">
                {language === 'ES' ? 'Atención 24/7' : '24/7 Concierge'}
              </span>
            </div>

            {/* Lado Derecho: Utilidades Operativas (Moneda, Idioma) */}
            <div className="flex items-center gap-2.5">
              
              {/* Selector de Moneda Satinado */}
              <div className="flex items-center bg-carbon-900/90 border border-carbon-800/80 rounded-full p-0.5 text-[9.5px] font-mono font-bold shadow-inner">
                {(['USD', 'EUR', 'COP'] as CurrencyCode[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-2 py-0.5 rounded-full transition-all ${
                      currency === c
                        ? 'bg-gradient-to-r from-gold-400 to-gold-300 text-carbon-950 font-black shadow-sm'
                        : 'text-silver-400 hover:text-white'
                    }`}
                    title={`Cambiar a ${c}`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="h-2.5 w-px bg-carbon-800" />

              {/* Selector de Idioma */}
              <button
                onClick={() => setLanguage(language === 'ES' ? 'EN' : 'ES')}
                className="flex items-center gap-1 text-[10px] font-mono text-silver-300 hover:text-gold-300 transition-colors px-1.5 py-0.5 rounded hover:bg-carbon-900/80"
                title="Cambiar idioma / Switch language"
              >
                <Globe className="w-3 h-3 text-gold-400" />
                <span className="font-bold">{language === 'ES' ? 'ES' : 'EN'}</span>
              </button>
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
            ? 'bg-carbon-950/90 backdrop-blur-2xl py-3 shadow-[0_16px_40px_rgba(0,0,0,0.9)]'
            : 'bg-gradient-to-b from-carbon-950/95 via-carbon-950/60 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* 1. Logotipo Emblemático con Puerta Secreta de 3 Clics */}
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-3.5 group focus:outline-none text-left select-none"
              aria-label={`${settings.companyName} - Inicio`}
            >
              {settings.logoUrl ? (
                <div className="h-10 flex items-center">
                  <img
                    src={settings.logoUrl}
                    alt={settings.companyName}
                    className="h-9 w-auto max-w-[140px] object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-carbon-800 to-carbon-900 border border-gold-400/30 flex items-center justify-center group-hover:border-gold-300/70 transition-all duration-300 shadow-md shadow-black/60 group-hover:shadow-gold-500/10">
                  <Sparkles className="w-5 h-5 text-gold-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] tracking-[0.32em] text-gold-400 font-bold uppercase leading-none">
                    PREMIUM
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gold-400/80" />
                  <span className="text-[8.5px] tracking-[0.24em] text-silver-400 uppercase font-mono">
                    VIP
                  </span>
                </div>
                <span className="text-base sm:text-lg tracking-[0.16em] font-black text-silver-100 uppercase leading-tight font-display">
                  {settings.companyName ? settings.companyName.replace(/Premium\s*/i, '') : 'CAR RENTAL'}
                </span>
              </div>
            </button>

            {/* 2. Navegación Principal Despejada con Espaciado Generoso y Micro-Puntos Joya */}
            <nav className="hidden lg:flex items-center gap-7 xl:gap-9 text-[11px] font-semibold uppercase tracking-[0.2em]">
              <button
                onClick={handleFleetClick}
                className={`transition-all duration-300 py-1.5 relative flex items-center gap-1.5 ${
                  isFleetActive
                    ? 'text-gold-300 font-bold drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                    : 'text-silver-400 hover:text-silver-100'
                }`}
              >
                <span>{t.nav.fleet}</span>
                {isFleetActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-400 shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                )}
              </button>

              <button
                onClick={handleCatalogClick}
                className={`transition-all duration-300 py-1.5 relative flex items-center gap-1.5 ${
                  isCatalogActive
                    ? 'text-gold-300 font-bold drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                    : 'text-silver-400 hover:text-silver-100'
                }`}
              >
                <Compass className="w-3 h-3 text-gold-400/90" />
                <span>{t.nav.catalog}</span>
                {isCatalogActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-400 shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                )}
              </button>

              <button
                onClick={() => scrollToSection('experience')}
                className={`transition-all duration-300 py-1.5 relative flex items-center gap-1.5 ${
                  isExperienceActive
                    ? 'text-gold-300 font-bold drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                    : 'text-silver-400 hover:text-silver-100'
                }`}
              >
                <span>{t.nav.experience}</span>
                {isExperienceActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-400 shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                )}
              </button>

              <button
                onClick={() => scrollToSection('how-it-works')}
                className={`transition-all duration-300 py-1.5 relative flex items-center gap-1.5 ${
                  isHowItWorksActive
                    ? 'text-gold-300 font-bold drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                    : 'text-silver-400 hover:text-silver-100'
                }`}
              >
                <span>{t.nav.howItWorks}</span>
                {isHowItWorksActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-400 shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                )}
              </button>

              <button
                onClick={() => scrollToSection('faq')}
                className={`transition-all duration-300 py-1.5 relative flex items-center gap-1.5 ${
                  isFaqActive
                    ? 'text-gold-300 font-bold drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                    : 'text-silver-400 hover:text-silver-100'
                }`}
              >
                <span>{t.nav.requirements}</span>
                {isFaqActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-400 shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                )}
              </button>
            </nav>

            {/* 3. Acción Principal de Reserva (Oro Champán Satinado con Shimmer Líquido) */}
            <div className="hidden sm:flex items-center">
              <button
                onClick={onNavigateToBooking || (() => scrollToSection('showroom'))}
                className="relative group overflow-hidden inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] text-carbon-950 bg-gradient-to-r from-gold-400 via-gold-300 to-amber-400 hover:from-gold-300 hover:via-gold-200 hover:to-gold-400 border border-gold-200/50 shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_28px_rgba(212,175,55,0.45)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Reflejo Shimmer líquido en hover */}
                <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-carbon-950 fill-carbon-950 group-hover:rotate-12 transition-transform duration-300" />
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
          </div>
        </div>
      )}
    </header>
  );
};
