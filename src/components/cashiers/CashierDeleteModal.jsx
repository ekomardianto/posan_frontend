import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function CashierDeleteModal({
  cashier,
  onClose,
  onConfirm
}) {
  if (!cashier) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card danger-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Konfirmasi Hapus Kasir</span>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Tutup Dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="danger-modal-body">
          <div className="danger-icon-circle">
            <AlertTriangle size={24} />
          </div>
          <h3 className="danger-modal-title">Hapus Akun Kasir "{cashier.name}"?</h3>
          <p className="danger-modal-desc">
            Akun ini tidak akan dapat lagi melakukan login pada aplikasi kasir POSAN. Riwayat transaksi kasir yang telah dicatat sebelumnya tetap aman tersimpan pada basis data.
          </p>
        </div>

        <div className="modal-footer" style={{ gap: 10 }}>
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn-danger-confirm"
            onClick={() => onConfirm(cashier.id)}
          >
            Ya, Hapus Kasir
          </button>
        </div>
      </div>
    </div>
  );
}
