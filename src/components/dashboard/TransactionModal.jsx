import React from 'react';
import { X, User, Clock, CreditCard, ShoppingBag } from 'lucide-react';

export default function TransactionModal({ transaction, onClose, onOpenFullTransaction }) {
  if (!transaction) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 className="modal-title">Rincian Transaksi {transaction.id}</h3>
            <span className="status-badge">{transaction.status}</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Tutup Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <div className="modal-row">
            <span className="modal-row-label">
              <User size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
              Kasir Bertugas
            </span>
            <span className="modal-row-value">{transaction.cashierName}</span>
          </div>

          <div className="modal-row">
            <span className="modal-row-label">
              <Clock size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
              Waktu Transaksi
            </span>
            <span className="modal-row-value">{transaction.time}</span>
          </div>

          <div className="modal-row">
            <span className="modal-row-label">
              <CreditCard size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
              Metode Pembayaran
            </span>
            <span className="modal-row-value">{transaction.paymentMethod}</span>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <ShoppingBag size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
              Daftar Item Pesanan
            </div>
            <div className="modal-items-list">
              {transaction.items && transaction.items.map((item, idx) => (
                <div key={idx} className="modal-item-row">
                  <span>{item.qty}x {item.name}</span>
                  <span style={{ fontWeight: 600 }}>Rp {(item.qty * item.price).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-row" style={{ paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>Total Pembayaran</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{transaction.formattedNominal}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn-modal-cancel" onClick={onClose}>
            Tutup
          </button>
          {onOpenFullTransaction && (
            <button
              type="button"
              className="btn-primary-dark"
              onClick={onOpenFullTransaction}
            >
              Buka di Transaksi →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
