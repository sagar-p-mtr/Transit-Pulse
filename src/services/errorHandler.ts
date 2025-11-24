import toast from 'react-hot-toast';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  STORAGE = 'storage',
  UNKNOWN = 'unknown'
}

export interface AppError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: Date;
  details?: any;
  stack?: string;
  retryable?: boolean;
  retryAction?: () => Promise<void>;
}

class ErrorHandlerService {
  private errors: Map<string, AppError> = new Map();
  private listeners: Set<(error: AppError) => void> = new Set();
  private maxErrors = 100;
  private retryAttempts: Map<string, number> = new Map();
  private maxRetryAttempts = 3;

  // Handle different types of errors
  handleError(error: any, category: ErrorCategory = ErrorCategory.UNKNOWN): AppError {
    const appError = this.createAppError(error, category);
    this.addError(appError);
    this.notifyListeners(appError);
    this.showErrorNotification(appError);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorHandler]', appError);
    }

    return appError;
  }

  // Create standardized error object
  private createAppError(error: any, category: ErrorCategory): AppError {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let message = 'An unexpected error occurred';
    let details = null;
    let stack = undefined;
    let severity = ErrorSeverity.MEDIUM;
    let retryable = false;

    // Parse error based on type
    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      message = error.message || error.error || JSON.stringify(error);
      details = error;
    }

    // Determine severity and retryability based on category
    switch (category) {
      case ErrorCategory.NETWORK:
        severity = ErrorSeverity.HIGH;
        retryable = true;
        message = this.getNetworkErrorMessage(error);
        break;
      case ErrorCategory.API:
        severity = this.getApiErrorSeverity(error);
        retryable = severity !== ErrorSeverity.CRITICAL;
        message = this.getApiErrorMessage(error);
        break;
      case ErrorCategory.VALIDATION:
        severity = ErrorSeverity.LOW;
        retryable = false;
        break;
      case ErrorCategory.PERMISSION:
        severity = ErrorSeverity.HIGH;
        retryable = false;
        break;
      case ErrorCategory.STORAGE:
        severity = ErrorSeverity.MEDIUM;
        retryable = true;
        break;
    }

    return {
      id,
      message,
      category,
      severity,
      timestamp: new Date(),
      details,
      stack,
      retryable
    };
  }

  // Get user-friendly network error messages
  private getNetworkErrorMessage(error: any): string {
    if (!navigator.onLine) {
      return 'No internet connection. Please check your network.';
    }
    
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    
    if (error?.message?.includes('Network')) {
      return 'Network error. Please check your connection.';
    }
    
    return 'Unable to connect to the server. Please try again later.';
  }

  // Get user-friendly API error messages
  private getApiErrorMessage(error: any): string {
    const status = error?.response?.status || error?.status;
    
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please sign in.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please slow down.';
      case 500:
        return 'Server error. Our team has been notified.';
      case 502:
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return error?.response?.data?.message || 'An error occurred while processing your request.';
    }
  }

  // Determine API error severity
  private getApiErrorSeverity(error: any): ErrorSeverity {
    const status = error?.response?.status || error?.status;
    
    if (status >= 500) return ErrorSeverity.CRITICAL;
    if (status >= 400 && status < 500) return ErrorSeverity.MEDIUM;
    return ErrorSeverity.LOW;
  }

  // Add error to the store
  private addError(error: AppError): void {
    this.errors.set(error.id, error);
    
    // Limit stored errors
    if (this.errors.size > this.maxErrors) {
      const firstKey = this.errors.keys().next().value;
      if (firstKey) {
        this.errors.delete(firstKey);
      }
    }
  }

  // Show error notification to user
  private showErrorNotification(error: AppError): void {
    const options = {
      duration: error.severity === ErrorSeverity.CRITICAL ? 10000 : 5000,
      id: error.id || undefined
    };

    switch (error.severity) {
      case ErrorSeverity.LOW:
        toast(error.message, options);
        break;
      case ErrorSeverity.MEDIUM:
        toast.error(error.message, options);
        break;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        toast.error(error.message, {
          ...options,
          style: {
            background: error.severity === ErrorSeverity.CRITICAL ? '#dc2626' : '#ea580c',
            color: 'white',
          }
        });
        break;
    }

    // Add retry option for retryable errors
    if (error.retryable && error.retryAction) {
      setTimeout(() => {
        toast.error(`${error.message} - Retry available`, {
          id: error.id + '_retry',
          duration: 8000,
          action: {
            label: 'Retry',
            onClick: () => {
              this.retryError(error);
            }
          }
        } as any);
      }, 100);
    }
  }

  // Retry failed operation
  private async retryError(error: AppError): Promise<void> {
    const attempts = this.retryAttempts.get(error.id) || 0;
    
    if (attempts >= this.maxRetryAttempts) {
      toast.error('Maximum retry attempts reached');
      return;
    }

    this.retryAttempts.set(error.id, attempts + 1);

    if (error.retryAction) {
      try {
        await error.retryAction();
        toast.success('Operation successful!');
        this.retryAttempts.delete(error.id);
      } catch (retryError) {
        this.handleError(retryError, error.category);
      }
    }
  }

  // Subscribe to error events
  subscribe(listener: (error: AppError) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners
  private notifyListeners(error: AppError): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  // Get all errors
  getErrors(): AppError[] {
    return Array.from(this.errors.values());
  }

  // Get errors by category
  getErrorsByCategory(category: ErrorCategory): AppError[] {
    return this.getErrors().filter(error => error.category === category);
  }

  // Get errors by severity
  getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.getErrors().filter(error => error.severity === severity);
  }

  // Clear all errors
  clearErrors(): void {
    this.errors.clear();
    this.retryAttempts.clear();
  }

  // Clear specific error
  clearError(errorId: string): void {
    this.errors.delete(errorId);
    this.retryAttempts.delete(errorId);
  }

  // Handle uncaught errors
  setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, ErrorCategory.UNKNOWN);
      event.preventDefault();
    });

    // Handle general errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || event.message, ErrorCategory.UNKNOWN);
      event.preventDefault();
    });
  }
}

// Create singleton instance
const errorHandlerInstance = new ErrorHandlerService();

// Export convenience functions
export const handleError = (error: any, category: ErrorCategory = ErrorCategory.UNKNOWN): AppError => {
  return errorHandlerInstance.handleError(error, category);
};

export const handleNetworkError = (error: any): AppError => {
  return errorHandlerInstance.handleError(error, ErrorCategory.NETWORK);
};

export const handleApiError = (error: any): AppError => {
  return errorHandlerInstance.handleError(error, ErrorCategory.API);
};

export const handleValidationError = (error: any): AppError => {
  return errorHandlerInstance.handleError(error, ErrorCategory.VALIDATION);
};

export const handleStorageError = (error: any): AppError => {
  return errorHandlerInstance.handleError(error, ErrorCategory.STORAGE);
};

export const subscribeToErrors = (listener: (error: AppError) => void): () => void => {
  return errorHandlerInstance.subscribe(listener);
};

export const getErrors = (): AppError[] => {
  return errorHandlerInstance.getErrors();
};

export const clearErrors = (): void => {
  errorHandlerInstance.clearErrors();
};

export const setupGlobalErrorHandlers = (): void => {
  errorHandlerInstance.setupGlobalErrorHandlers();
};

export default errorHandlerInstance;
