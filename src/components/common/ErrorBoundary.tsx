import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error crítico:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-carbon-950 text-silver-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-carbon-900/90 border border-gold-500/30 shadow-2xl backdrop-blur-xl text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-6 text-gold-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wider text-silver-100 mb-2">
              Experiencia en Pausa
            </h1>

            <p className="text-sm text-silver-400 mb-8 leading-relaxed">
              Ocurrió un contratiempo temporal al procesar la exhibición digital. Pulse el botón inferior para sincronizar nuevamente el Showroom.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 px-6 rounded-xl bg-gold-500 hover:bg-gold-400 text-carbon-950 font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 active:scale-98"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reanudar Showroom</span>
              </button>

              <a
                href="https://wa.me/573000000000?text=Hola,%20necesito%20asistencia%20con%20el%20showroom%20digital"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-silver-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-carbon-700"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Contactar Asistente VIP</span>
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 text-left p-3 rounded-lg bg-carbon-950 border border-red-500/30 text-red-400 text-[11px] font-mono overflow-auto max-h-36">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
