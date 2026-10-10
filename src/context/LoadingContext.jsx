import React, { createContext, useContext, useState, useCallback } from 'react';
import { LoadingOverlay } from '../components/ui/LoadingPage';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [loadingState, setLoadingState] = useState({
    isOpen: false,
    title: 'Sedang Memproses...',
    message: 'Mohon tunggu sebentar, permintaan Anda sedang diproses.',
  });

  const showLoading = useCallback((options) => {
    if (typeof options === 'string') {
      setLoadingState({
        isOpen: true,
        title: 'Sedang Memproses...',
        message: options,
      });
    } else {
      setLoadingState({
        isOpen: true,
        title: options?.title || 'Sedang Memproses...',
        message: options?.message || 'Mohon tunggu sebentar, permintaan Anda sedang diproses.',
      });
    }
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const withLoading = useCallback(async (asyncFn, options) => {
    showLoading(options);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  const value = {
    isLoading: loadingState.isOpen,
    showLoading,
    hideLoading,
    withLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay
        isOpen={loadingState.isOpen}
        title={loadingState.title}
        message={loadingState.message}
      />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

export default LoadingContext;
