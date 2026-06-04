import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-pastel-cream p-6">
          <div className="flex flex-col items-center gap-4 text-center max-w-sm">
            <div className="w-16 h-16 bg-pastel-pink/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-pastel-pink" />
            </div>
            <h2 className="font-display font-bold text-xl text-ink">
              Something went wrong
            </h2>
            <p className="text-ink-light font-sans text-sm leading-relaxed">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={this.handleReset}
              className="mt-2 bg-pastel-pink text-white font-display font-bold px-6 py-3 rounded-2xl shadow-lg shadow-pastel-pink/20 flex items-center gap-2 hover:shadow-pastel-pink/40 transition-shadow active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
