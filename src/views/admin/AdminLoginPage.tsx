import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Key,
  Shield,
  Sparkles,
} from 'lucide-react';
import { getDemoCredentials } from '../../services/authService';

interface AdminLoginPageProps {
  onNavigateHome: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigateHome,
  onLoginSuccess,
}) => {
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState<string>('victortamayopine@gmail.com');
  const [password, setPassword] = useState<string>('123456');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Si ya está autenticado, redirigir directamente
  useEffect(() => {
    if (isAuthenticated) {
      onLoginSuccess();
    }
  }, [isAuthenticated, onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await login({
        email,
        password,
        rememberMe,
      });

      if (!response.success) {
        setErrorMessage(response.error || 'Error al iniciar sesión.');
      } else {
        onLoginSuccess();
      }
    } catch {
      setErrorMessage('Ocurrió un error inesperado al conectar con el servicio de autenticación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectDemoLogin = async () => {
    const creds = getDemoCredentials();
    setEmail(creds.email);
    setPassword(creds.password);
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const response = await login({
        email: creds.email,
        password: creds.password,
        rememberMe: true,
      });
      if (!response.success) {
        setErrorMessage(response.error || 'Error al iniciar sesión.');
      } else {
        onLoginSuccess();
      }
    } catch {
      setErrorMessage('Ocurrió un error inesperado al conectar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-gold-500/20 selection:text-gold-400">
      
      {/* Fondo con brillo ambiental Showroom */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-carbon-800/40 rounded-full blur-2xl pointer-events-none" />

      {/* Botón Superior Izquierdo: Volver al Showroom */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-silver-400 hover:text-gold-400 transition-colors py-2 px-3 rounded-lg hover:bg-carbon-900 border border-transparent hover:border-carbon-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Showroom</span>
        </button>

        <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400/80 bg-gold-500/10 px-2.5 py-1 rounded-full border border-gold-500/20">
          Admin Portal v1.0
        </span>
      </div>

      {/* Tarjeta Central de Acceso */}
      <div className="relative w-full max-w-md rounded-2xl bg-carbon-900 border border-carbon-750 shadow-showroom overflow-hidden p-6 sm:p-8">
        
        {/* Cabecera del Formulario */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-carbon-850 border border-carbon-750 flex items-center justify-center mx-auto mb-3 text-gold-400 shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gold-400">
            Centro de Control
          </span>
          <h1 className="text-2xl font-bold text-silver-100 font-display mt-0.5">
            Acceso Corporativo
          </h1>
          <p className="text-xs text-silver-400 mt-1">
            Gestión de flota boutique, reservas y métricas en tiempo real.
          </p>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-2.5 text-rose-300 text-xs animate-shake">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Correo Electrónico */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-[11px] font-medium text-silver-300 mb-1 flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-gold-400" />
              Correo Electrónico Corporativo
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@luxurycars.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-100 text-xs focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-[11px] font-medium text-silver-300 mb-1 flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-gold-400" />
              Contraseña
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-100 text-xs focus:outline-none focus:border-gold-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-400 hover:text-silver-200 transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Recordar Sesión */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-silver-400 hover:text-silver-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-carbon-800 border-carbon-700 text-gold-500 focus:ring-gold-500"
              />
              <span>Mantener sesión iniciada</span>
            </label>

            <span className="text-[11px] text-silver-500 hover:text-silver-400 cursor-default">
              TLS 256-bit
            </span>
          </div>

          {/* Botón Principal de Envío */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-carbon-800 disabled:text-silver-500 text-carbon-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-glow"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>INGRESAR AL PANEL</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Acceso Rápido Directo para Víctor Tamayo */}
        <div className="mt-6 pt-5 border-t border-carbon-800 text-center space-y-2">
          <span className="text-[11px] text-silver-500 block">
            Acceso Rápido de Dirección:
          </span>
          <button
            type="button"
            onClick={handleDirectDemoLogin}
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-gold-500/20 to-gold-400/20 hover:from-gold-500/30 hover:to-gold-400/30 border border-gold-500/40 text-xs font-semibold text-gold-300 hover:text-gold-200 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>⚡ Entrar Directo como Víctor Tamayo (Director)</span>
          </button>
        </div>

      </div>

      {/* Nota de Seguridad Inferior */}
      <div className="mt-6 text-center text-[11px] text-silver-600 max-w-sm">
        Acceso restringido únicamente para directores de operaciones y personal de concierge de Premium Car Rental.
      </div>

    </div>
  );
};
