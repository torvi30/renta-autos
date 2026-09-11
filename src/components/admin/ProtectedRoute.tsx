import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  onNavigateToLogin: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  onNavigateToLogin,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      onNavigateToLogin();
    }
  }, [isLoading, isAuthenticated, onNavigateToLogin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-carbon-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-carbon-900 border border-carbon-800 flex items-center justify-center mb-4 shadow-showroom">
          <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
        </div>
        <div className="text-sm font-semibold uppercase tracking-widest text-gold-400 mb-1">
          Boutique Security
        </div>
        <p className="text-xs text-silver-400">Verificando credenciales de acceso...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-carbon-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-400 flex items-center justify-center mb-4 shadow-xl">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-silver-100 font-display mb-2">
          Acceso Restringido
        </h2>
        <p className="text-xs text-silver-400 max-w-sm mb-6">
          Tu cuenta ({user.email}) no cuenta con los permisos de rol requeridos para esta sección.
        </p>
        <button
          onClick={onNavigateToLogin}
          className="px-5 py-2.5 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-silver-200 text-xs font-semibold border border-carbon-750 transition-colors"
        >
          Volver a Iniciar Sesión
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
