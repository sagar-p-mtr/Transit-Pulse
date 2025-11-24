import { useCallback, useEffect, useState } from 'react';
import {
  handleError,
  handleNetworkError,
  handleApiError,
  handleValidationError,
  handleStorageError,
  subscribeToErrors,
  getErrors,
  clearErrors,
  ErrorCategory,
  ErrorSeverity,
  AppError
} from '../services/errorHandler';
import toast from 'react-hot-toast';

interface UseErrorHandlerOptions {
  autoToast?: boolean;
  logToConsole?: boolean;
  onError?: (error: AppError) => void;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    autoToast = true,
    logToConsole = import.meta.env.DEV,
    onError
  } = options;

  const [errors, setErrors] = useState<AppError[]>([]);
  const [latestError, setLatestError] = useState<AppError | null>(null);

  useEffect(() => {
    // Subscribe to error updates
    const unsubscribe = subscribeToErrors((error) => {
      setLatestError(error);
      setErrors(getErrors());

      if (logToConsole) {
        console.error('[useErrorHandler]', error);
      }

      if (onError) {
        onError(error);
      }

      if (autoToast && !error.retryable) {
        // Show toast for non-retryable errors (retryable errors are handled by errorHandler)
        const toastMessage = error.message;
        
        switch (error.severity) {
          case ErrorSeverity.LOW:
            toast(toastMessage);
            break;
          case ErrorSeverity.MEDIUM:
            toast.error(toastMessage);
            break;
          case ErrorSeverity.HIGH:
          case ErrorSeverity.CRITICAL:
            toast.error(toastMessage, {
              duration: 8000,
              style: {
                background: error.severity === ErrorSeverity.CRITICAL ? '#dc2626' : '#ea580c',
                color: 'white',
              }
            });
            break;
        }
      }
    });

    // Load initial errors
    setErrors(getErrors());

    return () => {
      unsubscribe();
    };
  }, [autoToast, logToConsole, onError]);

  // Handle generic errors
  const handleGenericError = useCallback((error: any) => {
    return handleError(error, ErrorCategory.UNKNOWN);
  }, []);

  // Handle network errors
  const handleNetworkErr = useCallback((error: any) => {
    return handleNetworkError(error);
  }, []);

  // Handle API errors
  const handleApiErr = useCallback((error: any) => {
    return handleApiError(error);
  }, []);

  // Handle validation errors
  const handleValidationErr = useCallback((error: any) => {
    return handleValidationError(error);
  }, []);

  // Handle storage errors
  const handleStorageErr = useCallback((error: any) => {
    return handleStorageError(error);
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    clearErrors();
    setErrors([]);
    setLatestError(null);
  }, []);

  // Clear specific error
  const clearError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
    if (latestError?.id === errorId) {
      setLatestError(null);
    }
  }, [latestError]);

  // Get errors by category
  const getErrorsByCategory = useCallback((category: ErrorCategory) => {
    return errors.filter(error => error.category === category);
  }, [errors]);

  // Get errors by severity
  const getErrorsBySeverity = useCallback((severity: ErrorSeverity) => {
    return errors.filter(error => error.severity === severity);
  }, [errors]);

  // Check if there are critical errors
  const hasCriticalErrors = useCallback(() => {
    return errors.some(error => error.severity === ErrorSeverity.CRITICAL);
  }, [errors]);

  return {
    errors,
    latestError,
    handleError: handleGenericError,
    handleNetworkError: handleNetworkErr,
    handleApiError: handleApiErr,
    handleValidationError: handleValidationErr,
    handleStorageError: handleStorageErr,
    clearAllErrors,
    clearError,
    getErrorsByCategory,
    getErrorsBySeverity,
    hasCriticalErrors,
    errorCount: errors.length
  };
};

// Hook for async error handling
export const useAsyncError = () => {
  const { handleError } = useErrorHandler({ autoToast: true });

  return useCallback((error: any) => {
    handleError(error);
  }, [handleError]);
};

// Hook for form validation errors
export const useValidationErrors = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const setFieldError = useCallback((field: string, message: string) => {
    setValidationErrors(prev => ({
      ...prev,
      [field]: message
    }));
    
    handleValidationError({
      field,
      message
    });
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllFieldErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  const hasErrors = Object.keys(validationErrors).length > 0;

  return {
    errors: validationErrors,
    setFieldError,
    clearFieldError,
    clearAllFieldErrors,
    hasErrors
  };
};

// Hook for API error handling with retry
export const useApiErrorHandler = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleApiErrorWithRetry = useCallback(async (
    error: any,
    retryFn: () => Promise<any>
  ): Promise<any> => {
    const appError = handleApiError(error);

    if (appError.retryable && retryCount < maxRetries) {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);

      try {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        
        const result = await retryFn();
        
        // Reset on success
        setRetryCount(0);
        setIsRetrying(false);
        toast.success('Request successful after retry');
        
        return result;
      } catch (retryError) {
        setIsRetrying(false);
        
        if (retryCount >= maxRetries - 1) {
          toast.error('Maximum retry attempts reached');
          setRetryCount(0);
          throw retryError;
        }
        
        // Recursive retry
        return handleApiErrorWithRetry(retryError, retryFn);
      }
    }

    throw error;
  }, [retryCount]);

  const resetRetryCount = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    handleApiErrorWithRetry,
    isRetrying,
    retryCount,
    resetRetryCount
  };
};

export default useErrorHandler;
