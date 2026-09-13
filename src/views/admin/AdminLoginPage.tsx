import React, { useState, useEffect, useRef } from 'react';
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
  User,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { onEmailTokenDispatched, EmailDispatchPayload } from '../../services/authService';

interface AdminLoginPageProps {
  onNavigateHome: () => void;
  onLoginSuccess: () => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'VERIFY_OTP' | 'RESET_PASSWORD';

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigateHome,
  onLoginSuccess,
}) => {
  const {
    user,
    isAuthenticated,
    login,
    requestRegistration,
    verifyRegistration,
    resendRegistration,
    requestReset,
    resetPassword,
  } = useAuth();

  // Modo actual de la pantalla de autenticación
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');

  // Campos de Iniciar Sesión (inician vacíos por seguridad real)
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Campos de Registro Corporativo
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);

  // Campos de Token OTP (6 dígitos segmentados)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timerSeconds, setTimerSeconds] = useState<number>(600); // 10 minutos
  const [isResending, setIsResending] = useState<boolean>(false);

  // Campos de Recuperación de Contraseña
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetStep, setResetStep] = useState<'REQUEST' | 'CONFIRM'>('REQUEST');
  const [resetNewPassword, setResetNewPassword] = useState<string>('');
  const [resetConfirmNewPassword, setResetConfirmNewPassword] = useState<string>('');

  // Estados de interfaz y feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Simulación de Correo Corporativo en Pantalla (Floating Dispatch Toast)
  const [dispatchedEmail, setDispatchedEmail] = useState<EmailDispatchPayload | null>(null);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Escuchar eventos de despacho de correos corporativos con Token
  useEffect(() => {
    const unsubscribe = onEmailTokenDispatched((payload) => {
      setDispatchedEmail(payload);
    });
    return () => unsubscribe();
  }, []);

  // Redirigir de inmediato al panel si ya hay sesión activa (sin esperas ni pantallas intermedias)
  useEffect(() => {
    if (isAuthenticated && user) {
      onLoginSuccess();
    }
  }, [isAuthenticated, user, onLoginSuccess]);

  // Temporizador regresivo para el código OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (authMode === 'VERIFY_OTP' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authMode, timerSeconds]);

  // Manejador de Login Maestro (Acceso directo e inmediato al Centro de Control)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await login({
        email: loginEmail,
        password: loginPassword,
        rememberMe,
      });

      if (!response.success) {
        setErrorMessage(response.error || 'Credenciales no autorizadas.');
      } else {
        // Ingresar inmediatamente al panel de control sin demoras
        onLoginSuccess();
      }
    } catch {
      setErrorMessage('Error al verificar credenciales con el servidor corporativo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejador de Registro - Paso 1: Solicitar Token OTP al correo
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Verifica la confirmación.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('La contraseña debe contener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestRegistration({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: 'ADMIN',
        rememberMe,
      });

      if (!response.success) {
        setErrorMessage(response.error || 'No fue posible iniciar el registro corporativo.');
      } else {
        setAuthMode('VERIFY_OTP');
        setTimerSeconds(600);
        setOtpDigits(['', '', '', '', '', '']);
        setSuccessMessage(`Token emitido para ${regEmail}. Por favor confirma el código de 6 dígitos.`);
        // Auto enfocar primera casilla
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 200);
      }
    } catch {
      setErrorMessage('Error al conectar con el servicio de verificación por correo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejador de Input de Token OTP (6 Casillas)
  const handleOtpDigitChange = (index: number, value: string) => {
    const cleanDigit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanDigit;
    setOtpDigits(newDigits);

    // Auto avanzar a la siguiente casilla
    if (cleanDigit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);

    // Enfocar última casilla modificada
    const targetIdx = Math.min(pastedData.length, 5);
    otpInputRefs.current[targetIdx]?.focus();
  };

  // Manejador de Registro - Paso 2: Verificar Token OTP
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullToken = otpDigits.join('');
    if (fullToken.length !== 6) {
      setErrorMessage('Por favor introduce los 6 dígitos completos del token de seguridad.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await verifyRegistration(regEmail, fullToken);
      if (!response.success) {
        setErrorMessage(response.error || 'Código de seguridad no válido.');
      } else {
        onLoginSuccess();
      }
    } catch {
      setErrorMessage('Error al validar el token de activación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reenviar Token OTP
  const handleResendOtp = async () => {
    if (timerSeconds > 540) return; // Esperar al menos 60s antes de reenviar
    setIsResending(true);
    setErrorMessage(null);
    try {
      const response = await resendRegistration(regEmail);
      if (response.success) {
        setTimerSeconds(600);
        setOtpDigits(['', '', '', '', '', '']);
        setSuccessMessage('Se ha enviado un nuevo código token al correo corporativo.');
        otpInputRefs.current[0]?.focus();
      } else {
        setErrorMessage(response.error || 'No se pudo reenviar el código.');
      }
    } catch {
      setErrorMessage('Error al solicitar reenvío de token.');
    } finally {
      setIsResending(false);
    }
  };

  // Autocompletar desde el mensaje de correo corporativo
  const handleApplyDispatchedToken = (token: string) => {
    const digits = token.slice(0, 6).split('');
    const padded = [...digits, '', '', '', '', '', ''].slice(0, 6);
    setOtpDigits(padded);
    otpInputRefs.current[5]?.focus();
  };

  // Copiar Token al portapapeles
  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Manejo de Recuperación de Contraseña
  const handleResetRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await requestReset(resetEmail);
      if (!response.success) {
        setErrorMessage(response.error || 'No se pudo generar el código de recuperación.');
      } else {
        setResetStep('CONFIRM');
        setSuccessMessage(`Código emitido para ${resetEmail}. Revisa la notificación de correo corporativo.`);
      }
    } catch {
      setErrorMessage('Error al solicitar recuperación de clave.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const token = otpDigits.join('');
    if (token.length !== 6) {
      setErrorMessage('Introduce el código de 6 dígitos recibido.');
      return;
    }

    if (resetNewPassword !== resetConfirmNewPassword) {
      setErrorMessage('Las nuevas contraseñas no coinciden.');
      return;
    }

    if (resetNewPassword.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword(resetEmail, token, resetNewPassword);
      if (!response.success) {
        setErrorMessage(response.error || 'No fue posible actualizar la contraseña.');
      } else {
        setSuccessMessage('¡Contraseña actualizada con éxito! Ingresando al Centro de Control...');
        setTimeout(() => {
          onLoginSuccess();
        }, 800);
      }
    } catch {
      setErrorMessage('Error al confirmar actualización de contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formato MM:SS para el temporizador
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Medidor visual de fuerza de contraseña
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-carbon-700' };
    if (pass.length < 6) return { score: 1, text: 'Débil (mínimo 6 caracteres)', color: 'bg-rose-500' };
    const hasNumbers = /\d/.test(pass);
    const hasSymbols = /[^A-Za-z0-9]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);

    if (pass.length >= 8 && (hasNumbers && (hasSymbols || hasUpper))) {
      return { score: 3, text: 'Nivel Ejecutivo Fuerte', color: 'bg-emerald-500' };
    }
    return { score: 2, text: 'Media', color: 'bg-amber-500' };
  };

  const regPassStrength = getPasswordStrength(regPassword);

  return (
    <div className="min-h-screen bg-carbon-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-gold-500/20 selection:text-gold-400">
      
      {/* Fondo ambiental con gradiente Showroom */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-carbon-800/40 rounded-full blur-2xl pointer-events-none" />

      {/* Barra Superior: Volver al Showroom */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center z-10">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-silver-400 hover:text-gold-400 transition-colors py-2 px-3 rounded-lg hover:bg-carbon-900 border border-transparent hover:border-carbon-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Showroom</span>
        </button>

        <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400/80 bg-gold-500/10 px-2.5 py-1 rounded-full border border-gold-500/20 flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-gold-400" />
          Portal Seguro 256-bit
        </span>
      </div>

      {/* Tarjeta Principal de Autenticación / Registro / OTP */}
      <div className="relative w-full max-w-md rounded-2xl bg-carbon-900 border border-carbon-750 shadow-showroom overflow-hidden p-6 sm:p-8 z-10 animate-fade-in">
          
          {/* Selector de Pestañas de Modo */}
          {authMode !== 'VERIFY_OTP' && (
            <div className="flex rounded-xl bg-carbon-950 p-1 mb-6 border border-carbon-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('LOGIN');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                  authMode === 'LOGIN'
                    ? 'bg-carbon-800 text-gold-400 shadow-sm border border-carbon-700'
                    : 'text-silver-400 hover:text-silver-200'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('REGISTER');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                  authMode === 'REGISTER'
                    ? 'bg-carbon-800 text-gold-400 shadow-sm border border-carbon-700'
                    : 'text-silver-400 hover:text-silver-200'
                }`}
              >
                Crear Cuenta
              </button>
            </div>
          )}

          {/* Cabecera Dinámica según Modo */}
          <div className="text-center mb-6">
            <div className="w-13 h-13 rounded-2xl bg-carbon-850 border border-carbon-750 flex items-center justify-center mx-auto mb-3 text-gold-400 shadow-md">
              {authMode === 'VERIFY_OTP' ? (
                <ShieldCheck className="w-7 h-7 text-emerald-400 animate-pulse" />
              ) : authMode === 'REGISTER' ? (
                <Sparkles className="w-6 h-6 text-gold-400" />
              ) : authMode === 'RESET_PASSWORD' ? (
                <Key className="w-6 h-6 text-gold-400" />
              ) : (
                <Lock className="w-6 h-6 text-gold-400" />
              )}
            </div>

            <span className="text-[11px] font-semibold uppercase tracking-widest text-gold-400">
              {authMode === 'VERIFY_OTP'
                ? 'Verificación en Dos Pasos'
                : authMode === 'REGISTER'
                ? 'Registro de Dirección'
                : authMode === 'RESET_PASSWORD'
                ? 'Recuperación Segura'
                : 'Acceso Corporativo'}
            </span>
            <h1 className="text-2xl font-bold text-silver-100 font-display mt-0.5">
              {authMode === 'VERIFY_OTP'
                ? 'Confirmar Token OTP'
                : authMode === 'REGISTER'
                ? 'Nueva Cuenta Ejecutiva'
                : authMode === 'RESET_PASSWORD'
                ? 'Restablecer Clave'
                : 'Centro de Control'}
            </h1>
            <p className="text-xs text-silver-400 mt-1 max-w-xs mx-auto">
              {authMode === 'VERIFY_OTP'
                ? `Ingresa los 6 dígitos enviados al correo ${regEmail}`
                : authMode === 'REGISTER'
                ? 'Crea tu perfil con validación de Token al correo corporativo.'
                : authMode === 'RESET_PASSWORD'
                ? 'Recibe un código de seguridad para restaurar tu acceso.'
                : 'Ingresa tus credenciales autorizadas de director.'}
            </p>
          </div>

          {/* Mensajes de Alerta y Éxito */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-2.5 text-rose-300 text-xs animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 flex items-start gap-2.5 text-emerald-300 text-xs animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{successMessage}</span>
            </div>
          )}

          {/* MODO 1: INICIAR SESIÓN (Sin accesos directos inseguros) */}
          {authMode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-login-email"
                  className="block text-[11px] font-medium text-silver-300 mb-1 flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-gold-400" />
                  Correo Electrónico Corporativo
                </label>
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  autoFocus
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="victortamayopine@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-100 text-xs focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="admin-login-password"
                    className="block text-[11px] font-medium text-silver-300 flex items-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5 text-gold-400" />
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('RESET_PASSWORD');
                      setResetStep('REQUEST');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="admin-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
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

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-silver-400 hover:text-silver-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-carbon-800 border-carbon-700 text-gold-500 focus:ring-gold-500"
                  />
                  <span>Mantener sesión activa</span>
                </label>
                <span className="text-[11px] text-silver-500 font-mono">TLS 256-bit</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-carbon-800 disabled:text-silver-500 text-carbon-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando Credenciales...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>INGRESAR AL CENTRO DE CONTROL</span>
                    </>
                  )}
                </button>
              </div>

              {/* Guía sutil para acceso de dirección */}
              <div className="pt-3 border-t border-carbon-800/80 text-center">
                <p className="text-[11px] text-silver-500">
                  ¿Aún no tienes acceso?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('REGISTER');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-gold-400 hover:underline font-semibold"
                  >
                    Crea tu cuenta con confirmación de Token
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODO 2: REGISTRO - PASO 1 (Datos Básicos y Envío de Token) */}
          {authMode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-silver-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold-400" />
                  Nombre Completo del Director / Administrador
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Víctor Tamayo"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-100 text-xs focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-silver-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gold-400" />
                  Correo Electrónico para Verificación
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="victor@luxurycars.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-100 text-xs focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-silver-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-gold-400" />
                  Contraseña Corporativa
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-100 text-xs focus:outline-none focus:border-gold-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-400 hover:text-silver-200 transition-colors"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Indicador visual de seguridad de contraseña */}
                {regPassword && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex gap-1 flex-1 h-1 bg-carbon-800 rounded-full overflow-hidden">
                      <div className={`h-full ${regPassStrength.color} ${regPassStrength.score >= 1 ? 'w-1/3' : 'w-0'}`} />
                      <div className={`h-full ${regPassStrength.color} ${regPassStrength.score >= 2 ? 'w-1/3' : 'w-0'}`} />
                      <div className={`h-full ${regPassStrength.color} ${regPassStrength.score >= 3 ? 'w-1/3' : 'w-0'}`} />
                    </div>
                    <span className="text-[10px] text-silver-400">{regPassStrength.text}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-silver-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-gold-400" />
                  Confirmar Contraseña
                </label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-100 text-xs focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-carbon-800 disabled:text-silver-500 text-carbon-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generando Token Cifrado...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>SOLICITAR TOKEN DE VERIFICACIÓN</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* MODO 3: VALIDAR TOKEN OTP (6 Casillas Segmentadas) */}
          {authMode === 'VERIFY_OTP' && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
              <div className="text-center">
                <div className="flex justify-center items-center gap-2 mb-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <React.Fragment key={idx}>
                      <input
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-11 h-13 text-center text-lg font-mono font-bold rounded-xl bg-carbon-850 border transition-all ${
                          digit
                            ? 'border-gold-500 text-gold-300 shadow-sm shadow-gold-500/20'
                            : 'border-carbon-700 text-silver-100 focus:border-gold-400'
                        }`}
                      />
                      {idx === 2 && <span className="text-silver-600 font-bold">-</span>}
                    </React.Fragment>
                  ))}
                </div>
                <p className="text-[11px] text-silver-500">
                  Pega el código recibido o ingrésalo dígito a dígito
                </p>
              </div>

              {/* Temporizador y Reenvío */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-carbon-850/80 border border-carbon-800 text-xs">
                <div className="flex items-center gap-1.5 text-silver-300">
                  <Clock className="w-3.5 h-3.5 text-gold-400" />
                  <span>Vigencia:</span>
                  <span className={`font-mono font-bold ${timerSeconds < 60 ? 'text-rose-400' : 'text-gold-400'}`}>
                    {formatTimer(timerSeconds)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending || timerSeconds > 540}
                  className="inline-flex items-center gap-1 text-[11px] text-gold-400 hover:text-gold-300 disabled:text-silver-600 font-medium transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                  <span>Reenviar código</span>
                </button>
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting || otpDigits.join('').length !== 6}
                  className="w-full py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-carbon-800 disabled:text-silver-500 text-carbon-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validando Token...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>VERIFICAR TOKEN Y ACTIVAR CUENTA</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('REGISTER');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="w-full py-2 text-[11px] text-silver-400 hover:text-silver-200 transition-colors"
                >
                  Cambiar correo o contraseña
                </button>
              </div>
            </form>
          )}

          {/* MODO 4: RECUPERACIÓN DE CONTRASEÑA */}
          {authMode === 'RESET_PASSWORD' && (
            <>
              {resetStep === 'REQUEST' ? (
                <form onSubmit={handleResetRequestSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-silver-300 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gold-400" />
                      Ingresa tu Correo Registrado
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="victortamayopine@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-100 text-xs focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:bg-carbon-800 disabled:text-silver-500 text-carbon-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando Token...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>ENVIAR CÓDIGO DE RECUPERACIÓN</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('LOGIN')}
                      className="text-xs text-silver-400 hover:text-gold-400 transition-colors"
                    >
                      ← Volver a Iniciar Sesión
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetConfirmSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-silver-300 mb-1">
                      Código de 6 dígitos recibido
                    </label>
                    <div className="flex justify-center items-center gap-1.5 mb-1" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-10 h-11 text-center font-mono font-bold rounded-lg bg-carbon-850 border border-carbon-700 text-gold-300 focus:border-gold-500"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-silver-300 mb-1">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-100 text-xs focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-silver-300 mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      value={resetConfirmNewPassword}
                      onChange={(e) => setResetConfirmNewPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-carbon-850 border border-carbon-700 text-silver-100 text-xs focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 text-carbon-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-glow cursor-pointer"
                  >
                    <span>ACTUALIZAR CONTRASEÑA</span>
                  </button>
                </form>
              )}
            </>
          )}

        </div>

      {/* NOTIFICACIÓN FLOTANTE EJECUTIVA: SERVIDOR DE CORREO CORPORATIVO (Showroom Mail Relay) */}
      {dispatchedEmail && (
        <aside
          aria-label="Servidor de Correo Corporativo"
          className="fixed bottom-4 right-4 max-w-sm w-full bg-carbon-900/95 backdrop-blur-md border border-gold-500/40 rounded-2xl p-4 shadow-2xl z-50 animate-slide-up border-l-4 border-l-gold-400"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-gold-400 block font-semibold">
                  Servidor de Correo Showroom
                </span>
                <span className="text-xs font-semibold text-silver-100 block">
                  {dispatchedEmail.type === 'REGISTRATION' ? 'Token de Activación' : 'Recuperación de Acceso'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setDispatchedEmail(null)}
              className="text-silver-500 hover:text-silver-300 text-xs p-1"
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-carbon-950/80 border border-carbon-800 mb-3 space-y-1 text-left font-mono text-[11px]">
            <div className="flex justify-between text-silver-400">
              <span>Para:</span>
              <span className="text-silver-200 font-semibold">{dispatchedEmail.to}</span>
            </div>
            <div className="flex justify-between text-silver-400">
              <span>Remitente:</span>
              <span className="text-silver-400">seguridad@premiumcarrental.com</span>
            </div>
            <div className="flex justify-between text-silver-400">
              <span>Hora:</span>
              <span className="text-silver-500">{dispatchedEmail.dispatchedAt}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 mb-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gold-400/80 block">
                CÓDIGO DE SEGURIDAD (6 DÍGITOS)
              </span>
              <span className="text-lg font-mono font-extrabold text-gold-300 tracking-widest">
                {dispatchedEmail.token.slice(0, 3)} - {dispatchedEmail.token.slice(3)}
              </span>
            </div>

            <button
              onClick={() => handleCopyToken(dispatchedEmail.token)}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 text-xs font-semibold border border-gold-500/30 transition-colors"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToken ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          {authMode === 'VERIFY_OTP' && (
            <button
              onClick={() => handleApplyDispatchedToken(dispatchedEmail.token)}
              className="w-full py-1.5 px-3 rounded-lg bg-carbon-850 hover:bg-carbon-800 text-silver-200 text-xs font-semibold border border-carbon-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Autocompletar en las 6 casillas</span>
            </button>
          )}
        </aside>
      )}

      {/* Nota de Seguridad Pie */}
      <div className="mt-6 text-center text-[11px] text-silver-600 max-w-sm z-10">
        Acceso restringido bajo cifrado bancario. Los intentos de acceso no autorizados son monitoreados y registrados en auditoría.
      </div>

    </div>
  );
};
