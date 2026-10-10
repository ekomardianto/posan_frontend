import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import ToastContainer from '../components/ui/ToastContainer';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    type: 'warning',
    icon: null,
    resolve: null,
  });

  const toastIdRef = useRef(0);

  // 1. Show Toast notification
  const showToast = useCallback((message, options = {}) => {
    const id = ++toastIdRef.current;
    const toast = {
      id,
      message,
      title: options.title || '',
      type: options.type || 'info', // 'success' | 'error' | 'warning' | 'info'
      duration: options.duration !== undefined ? options.duration : 4000,
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 2. Shorthand Toast methods
  const success = useCallback((message, title = 'Sukses', duration = 4000) => {
    return showToast(message, { type: 'success', title, duration });
  }, [showToast]);

  const error = useCallback((message, title = 'Terjadi Kesalahan', duration = 5000) => {
    return showToast(message, { type: 'error', title, duration });
  }, [showToast]);

  const warning = useCallback((message, title = 'Perhatian', duration = 4500) => {
    return showToast(message, { type: 'warning', title, duration });
  }, [showToast]);

  const info = useCallback((message, title = 'Informasi', duration = 4000) => {
    return showToast(message, { type: 'info', title, duration });
  }, [showToast]);

  // 3. Confirm Dialog (Returns a Promise<boolean>)
  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title: options.title || 'Konfirmasi Tindakan',
        message: options.message || 'Apakah Anda yakin ingin melanjutkan?',
        confirmText: options.confirmText || 'Ya, Lanjutkan',
        cancelText: options.cancelText !== undefined ? options.cancelText : 'Batal',
        type: options.type || 'warning',
        icon: options.icon || null,
        resolve,
      });
    });
  }, []);

  const handleConfirmAction = useCallback(() => {
    if (confirmDialog.resolve) {
      confirmDialog.resolve(true);
    }
    setConfirmDialog((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [confirmDialog]);

  const handleCancelAction = useCallback(() => {
    if (confirmDialog.resolve) {
      confirmDialog.resolve(false);
    }
    setConfirmDialog((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [confirmDialog]);

  // Simple alert modal (one button)
  const showAlertModal = useCallback((message, title = 'Pemberitahuan', type = 'info') => {
    return confirm({
      title,
      message,
      type,
      confirmText: 'Mengerti',
      cancelText: null,
    });
  }, [confirm]);

  const value = {
    toast: showToast,
    showToast,
    dismissToast,
    success,
    error,
    warning,
    info,
    confirm,
    alert: showAlertModal,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type={confirmDialog.type}
        icon={confirmDialog.icon}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

export default AlertContext;
