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
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export type AdminTab = 'dashboard' | 'fleet' | 'reservations' | 'clients';

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
      label: 'Dashboard',
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
      id: 'reservations' as AdminTab,
      label: 'Gestión de Reservas',
      icon: Calendar,
      badge: pendingReservationsCount > 0 ? pendingReservationsCount : null,
    },
    {
      id: 'clients' as AdminTab,
      label: 'Directorio Clientes',
      icon: Users,
      badge: null,
    },
  ];

  return (
    <>
      {/* Backdrop oscuro para versión móvil */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-carbon-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Contenedor de la Barra Lateral */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-carbon-900 border-r border-carbon-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera / Identidad */}
        <div className="p-5 border-b border-carbon-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-gold-400">
                PORTAL VIP
              </div>
              <h2 className="text-sm font-bold text-silver-100 font-display">
                Car Rental Admin
              </h2>
            </div>
          </div>

          {/* Botón Cerrar en móvil */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-silver-400 hover:text-white hover:bg-carbon-800 lg:hidden transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-silver-500">
            Navegación Operativa
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30 shadow-sm'
                    : 'text-silver-400 hover:text-silver-200 hover:bg-carbon-850 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-silver-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sección Inferior: Ir al Showroom Público y Perfil de Usuario */}
        <div className="p-3 border-t border-carbon-800 space-y-2">
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-silver-400 hover:text-gold-400 hover:bg-carbon-850 transition-colors border border-carbon-800 hover:border-gold-500/30"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Showroom Público</span>
            </div>
            <span className="text-[10px] font-mono text-silver-500">↗</span>
          </button>

          {/* Perfil del Usuario */}
          {user && (
            <div className="p-2.5 rounded-xl bg-carbon-850/80 border border-carbon-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-gold-500/40 flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-carbon-800 flex items-center justify-center text-xs font-bold text-gold-400 flex-shrink-0">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-silver-200 truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] font-mono text-gold-400 uppercase">
                    {user.role}
                  </div>
                </div>
              </div>

              <button
                onClick={() => logout()}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-silver-500 hover:text-rose-400 hover:bg-carbon-800 transition-colors"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
