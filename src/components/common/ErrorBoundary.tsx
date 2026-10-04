import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, MessageSquare, Trash2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    showDetails: false,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error crítico:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.href = '/';
  };

  private handleClearCacheAndReload = () => {
    try {
      // Limpiar cachés de vehículos y reservas que pudieran tener formatos obsoletos
      const keysToClear = [
        'PREMIUM_RENTAL_VEHICLES_COLOMBIA_V10',
        'PREMIUM_RENTAL_RESERVATIONS_V2',
        'PREMIUM_RENTAL_RESERVATIONS_COLOMBIA_VIP_V1',
        'elite_wheels_inspections_v2',
        'elite_wheels_inspections_cache',
      ];
      keysToClear.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Error al limpiar caché local:', e);
    }
    window.location.href = '/';
  };

  private handleCopyError = () => {
    if (this.state.error && navigator.clipboard) {
      navigator.clipboard.writeText(this.state.error.stack || this.state.error.toString());
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Error desconocido';

      return (
        <div className="min-h-screen bg-carbon-950 text-silver-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-carbon-900/90 border border-gold-500/30 shadow-2xl backdrop-blur-xl text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-5 text-gold-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wider text-silver-100 mb-2">
              Experiencia en Pausa
            </h1>

            <p className="text-xs sm:text-sm text-silver-400 mb-6 leading-relaxed">
              Ocurrió un contratiempo temporal al procesar la exhibición digital. Pulsa el botón inferior para restaurar el Showroom.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 px-6 rounded-xl bg-gold-500 hover:bg-gold-400 text-carbon-950 font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reanudar Showroom</span>
              </button>

              <button
                onClick={this.handleClearCacheAndReload}
                className="w-full py-3 px-6 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-gold-400 hover:text-gold-300 font-bold text-xs tracking-wider transition-colors flex items-center justify-center gap-2 border border-carbon-700 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Restablecer y Limpiar Caché Local</span>
              </button>

              <a
                href="https://wa.me/573009115898?text=Hola,%20necesito%20asistencia%20con%20el%20showroom%20digital"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-6 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-silver-400 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 border border-carbon-800"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Contactar Asistente VIP</span>
              </a>
            </div>

            {/* Acordeón de diagnóstico para soporte técnico */}
            <div className="mt-5 pt-4 border-t border-carbon-800/80 text-left">
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="w-full flex items-center justify-between text-[11px] text-silver-500 hover:text-silver-300 font-mono transition-colors"
              >
                <span>Diagnóstico del Sistema</span>
                {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {this.state.showDetails && (
                <div className="mt-2.5 p-3 rounded-xl bg-carbon-950 border border-carbon-800 text-[11px] font-mono text-silver-400 space-y-2">
                  <div className="flex items-center justify-between text-rose-400 font-bold">
                    <span className="truncate">{errorMessage}</span>
                    <button
                      type="button"
                      onClick={this.handleCopyError}
                      className="ml-2 p-1 hover:text-white transition-colors"
                      title="Copiar error"
                    >
                      {this.state.copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  {this.state.error?.stack && (
                    <pre className="max-h-28 overflow-auto text-[10px] text-silver-500 whitespace-pre-wrap scrollbar-thin">
                      {this.state.error.stack.slice(0, 500)}
                    </pre>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
