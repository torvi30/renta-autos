import React from 'react';
import {
  LayoutDashboard,
  Car,
  Calendar,
  Users,
  ExternalLink,
  LogOut,
  ShieldCheck,
  X,
  Sparkles,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export type AdminTab = 'dashboard' | 'fleet' | 'reservations' | 'clients' | 'calendar' | 'analytics';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onNavigateHome: () => void;
  pendingReservationsCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onNavigateHome,
  pendingReservationsCount = 0,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Centro de Control',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'fleet' as AdminTab,
      label: 'Flota Boutique',
      icon: Car,
      badge: null,
    },
    {
      id: 'calendar' as AdminTab,
      label: 'Cronograma & Ocupación',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'reservations' as AdminTab,
      label: 'Gestión de Reservas',
      icon: Calendar,
      badge: pendingReservationsCount > 0 ? pendingReservationsCount : null,
    },
    {
      id: 'clients' as AdminTab,
      label: 'Directorio Clientes KYC',
      icon: Users,
      badge: null,
    },
    {
      id: 'analytics' as AdminTab,
      label: 'Analítica & Finanzas',
      icon: TrendingUp,
      badge: null,
    },
  ];


  return (
    <>
      {/* Backdrop oscuro para versión móvil */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-carbon-950/85 backdrop-blur-md lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Contenedor de la Barra Lateral con mayor ancho y legibilidad */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-carbon-900/98 border-r border-carbon-800/90 backdrop-blur-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-2xl ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Cabecera / Identidad */}
          <div className="p-6 border-b border-carbon-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gold-500/25 to-gold-400/10 border border-gold-500/40 flex items-center justify-center text-gold-400 font-bold shadow-glow-sm flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
                    PORTAL VIP
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                </div>
                <h2 className="text-base font-extrabold text-white font-display tracking-tight mt-0.5">
                  Car Rental Admin
                </h2>
              </div>
            </div>

            {/* Botón Cerrar en móvil */}
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-xl text-silver-400 hover:text-white hover:bg-carbon-800 lg:hidden transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navegación Principal */}
          <nav className="p-4 space-y-2">
            <div className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-silver-400 flex items-center justify-between font-bold">
              <span>Módulos Operativos</span>
              <span className="w-2 h-2 rounded-full bg-gold-400/80 animate-pulse" />
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-500/20 via-gold-500/10 to-transparent text-gold-400 border-l-4 border-gold-400 shadow-md translate-x-1'
                      : 'text-silver-300 hover:text-white hover:bg-carbon-850/90 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-gold-400' : 'text-silver-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/25 text-amber-400 border border-amber-500/40 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sección Inferior: Ir al Showroom Público y Perfil de Usuario */}
        <div className="p-4 border-t border-carbon-800/80 space-y-3">
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-silver-300 hover:text-gold-400 hover:bg-carbon-850 transition-all border border-carbon-800 hover:border-gold-500/40 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-gold-400" />
              <span>Ver Showroom Público</span>
            </div>
            <span className="text-xs font-mono text-silver-400 font-bold">↗</span>
          </button>

          {/* Perfil del Usuario / Director */}
          <div className="p-3.5 rounded-2xl bg-carbon-850 border border-carbon-750 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                  alt={user?.name || 'Usuario'}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-gold-500/50 shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-carbon-850 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate font-display">
                  {user?.name || 'Víctor Tamayo'}
                </div>
                <div className="text-xs font-mono text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <span>DIRECTOR GENERAL</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Cerrar sesión"
              className="p-2 rounded-xl text-silver-400 hover:text-rose-400 hover:bg-carbon-800 transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
