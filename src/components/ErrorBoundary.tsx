import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { handleError, ErrorCategory } from '../services/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error to error handler service
    handleError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    }, ErrorCategory.UNKNOWN);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Report to error tracking service in production
    if (import.meta.env.PROD) {
      this.reportErrorToService(error, errorInfo);
    }
  }

  reportErrorToService(error: Error, errorInfo: ErrorInfo) {
    // In production, you would send this to your error tracking service
    // Example: Sentry, LogRocket, etc.
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Placeholder for actual error reporting
    console.log('Error reported to service:', errorData);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="flex flex-col items-center text-center">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>

              {/* Error Details (Development only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="w-full mb-6 p-4 bg-gray-50 rounded-lg text-left">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Error Details:
                  </p>
                  <p className="text-xs text-red-600 font-mono break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        Component Stack
                      </summary>
                      <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Go Home</span>
                </button>
              </div>

              {/* Reload Option */}
              <button
                onClick={this.handleReload}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Reload the page
              </button>

              {/* Error Count Warning */}
              {this.state.errorCount > 2 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    Multiple errors detected. If the problem persists, please contact support.
                  </p>
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

// Functional component wrapper for easier use with hooks
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: any) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    handleError(error, ErrorCategory.UNKNOWN);
  };
};

export default ErrorBoundary;
