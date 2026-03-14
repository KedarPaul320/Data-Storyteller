import { Component, type ReactNode } from 'react';

interface ChartErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
}

export class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  state: ChartErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Chart rendering failed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-6 text-center">
          <p className="text-sm font-semibold text-amber-900">
            {this.props.fallbackTitle ?? 'Chart failed to render with the current settings.'}
          </p>
          <p className="text-xs text-amber-800/80">
            Try a different chart type or axis combination.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
