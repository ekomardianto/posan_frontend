import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function CategoryDeleteModal({
  category,
  onClose,
  onConfirm
}) {
  if (!category) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card danger-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Konfirmasi Hapus Kategori</span>
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
          <h3 className="danger-modal-title">Hapus Kategori "{category.name}"?</h3>
          <p className="danger-modal-desc">
            Kategori ini memiliki {category.productCount} produk terdaftar. Menghapus kategori akan memindahkannya dari katalog kasir. Anda juga dapat memilih opsi <strong>Nonaktifkan</strong> jika hanya ingin menyembunyikannya sementara.
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
            onClick={() => onConfirm(category.id)}
          >
            Ya, Hapus Kategori
          </button>
        </div>
      </div>
    </div>
  );
}
