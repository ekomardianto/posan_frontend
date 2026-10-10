import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ProductDeleteModal({
  product,
  onClose,
  onConfirm
}) {
  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card danger-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Konfirmasi Penghapusan</span>
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
          <h3 className="danger-modal-title">Hapus Menu "{product.name}"?</h3>
          <p className="danger-modal-desc">
            Produk ini akan dihapus dari katalog online kasir POSAN. Anda juga dapat memilih opsi <strong>Nonaktifkan</strong> jika hanya ingin menyembunyikannya sementara dari antarmuka kasir.
          </p>
        </div>

        <div className="modal-footer" style={{ gap: 10 }}>
          <button
            type="button"
            className="btn-drawer-cancel"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn-danger-confirm"
            onClick={() => onConfirm(product.id)}
          >
            Ya, Hapus Produk
          </button>
        </div>
      </div>
    </div>
  );
}
