// ============================================================
// ErrorBoundary — Shows the ACTUAL error so we can debug!
// ============================================================

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔴 NikNote Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // ALWAYS show error — even in production — so we can debug
      const errorMsg = this.state.error?.message || 'Unknown error';
      const errorStack = this.state.error?.stack || '';
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-white">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Don't worry — your notes are safe! This is just a temporary glitch.
            </p>

            {/* ALWAYS show the error message */}
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-left">
              <p className="text-xs font-mono text-red-600 break-words font-bold mb-2">
                {errorMsg}
              </p>
              {componentStack && (
                <details className="mt-2">
                  <summary className="text-[10px] text-red-400 cursor-pointer">Component Stack (click to expand)</summary>
                  <pre className="text-[10px] text-red-400 mt-1 whitespace-pre-wrap break-words">{componentStack}</pre>
                </details>
              )}
              {errorStack && (
                <details className="mt-2">
                  <summary className="text-[10px] text-red-400 cursor-pointer">Error Stack (click to expand)</summary>
                  <pre className="text-[10px] text-red-400 mt-1 whitespace-pre-wrap break-words">{errorStack}</pre>
                </details>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              NikNote will be back in a moment ✍️
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
