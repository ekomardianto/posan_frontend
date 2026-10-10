import React from 'react';
import {
  FileText,
  X,
  Coffee,
  Printer,
  Mail,
  SlidersHorizontal,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { defaultStoreInfo as storeInfo } from '../../constants/appConstants';

export default function TransactionDetailPanel({
  transaction,
  onClose,
  onPrintReceipt,
  onSendReceipt
}) {
  if (!transaction) return null;

  const renderModifierTag = (notes) => {
    if (!notes) return null;
    const isWarm = notes.toLowerCase().includes('warm') || notes.toLowerCase().includes('toast');
    return (
      <div className="receipt-item-modifier">
        {isWarm ? (
          <Flame size={11} className="modifier-icon" />
        ) : (
          <SlidersHorizontal size={11} className="modifier-icon" />
        )}
        <span>{notes}</span>
      </div>
    );
  };

  return (
    <aside className="trx-detail-sidebar animate-fade-in" aria-label="Panel Detail Transaksi">
      {/* Top Header */}
      <div className="trx-detail-header">
        <div className="trx-detail-title-group">
          <FileText size={18} className="trx-detail-header-icon" />
          <h2 className="trx-detail-title">Detail Transaksi {transaction.id}</h2>
        </div>
        <button
          type="button"
          className="trx-detail-close-btn"
          onClick={onClose}
          aria-label="Tutup panel detail transaksi"
          title="Tutup Detail"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Thermal Receipt Paper */}
      <div className="receipt-paper">
        {/* Receipt Brand Header */}
        <div className="receipt-brand-section">
          <div className="receipt-coffee-icon-box">
            <Coffee size={20} strokeWidth={2.5} />
          </div>
          <h3 className="receipt-brand-name">{storeInfo.brandName}</h3>
          <div className="receipt-brand-sub">{storeInfo.subBrand}</div>
          <p className="receipt-store-location">{storeInfo.fullLocation}</p>
        </div>

        {/* Dashed Divider */}
        <div className="receipt-dashed-line" />

        {/* Transaction Meta Info */}
        <div className="receipt-meta-grid">
          <div className="receipt-meta-row">
            <span className="receipt-meta-label">Nomor Struk:</span>
            <span className="receipt-meta-val font-bold">{transaction.receiptNumber}</span>
          </div>
          <div className="receipt-meta-row">
            <span className="receipt-meta-label">Kasir:</span>
            <span className="receipt-meta-val">{transaction.cashierName}</span>
          </div>
          <div className="receipt-meta-row">
            <span className="receipt-meta-label">Waktu:</span>
            <span className="receipt-meta-val">{transaction.fullTimestamp}</span>
          </div>
          <div className="receipt-meta-row">
            <span className="receipt-meta-label">Pembayaran:</span>
            <span className="receipt-meta-val">{transaction.paymentDetail}</span>
          </div>
          <div className="receipt-meta-row">
            <span className="receipt-meta-label">Status:</span>
            <span className="receipt-status-badge">
              <span className="receipt-status-dot" />
              <span>{transaction.statusLabel}</span>
            </span>
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="receipt-dashed-line" />

        {/* Item Header */}
        <div className="receipt-items-header">
          <span>ITEM MENU</span>
          <span>SUBTOTAL</span>
        </div>

        {/* Items List */}
        <div className="receipt-items-list">
          {transaction.items && transaction.items.map((item, index) => (
            <div key={index} className="receipt-item-row">
              <div className="receipt-item-info">
                <span className="receipt-item-name">{item.name}</span>
                <span className="receipt-item-qty-price">
                  {item.qty}x @ Rp{item.price.toLocaleString('id-ID')}
                </span>
                {renderModifierTag(item.notes)}
              </div>
              <div className="receipt-item-subtotal">
                Rp{item.subtotal.toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </div>

        {/* Dashed Divider */}
        <div className="receipt-dashed-line" />

        {/* Price Breakdown */}
        <div className="receipt-totals-section">
          <div className="receipt-total-row">
            <span className="receipt-total-label">Subtotal</span>
            <span className="receipt-total-val">
              Rp{transaction.subtotal.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="receipt-total-row">
            <span className="receipt-total-label">Diskon Pesanan</span>
            <span className="receipt-total-val">
              Rp{transaction.discount.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="receipt-total-row">
            <span className="receipt-total-label">Pajak (PB1)</span>
            <span className="receipt-total-val">
              Rp{transaction.tax.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="receipt-grand-total-row">
            <span className="receipt-grand-total-label">Total Bayar</span>
            <span className="receipt-grand-total-val">
              {transaction.formattedTotal || `Rp${transaction.total.toLocaleString('id-ID')}`}
            </span>
          </div>

          <div className="receipt-payment-ref-row">
            <span className="receipt-ref-label">Metode Transaksi</span>
            <span className="receipt-ref-val">
              {transaction.paymentMethod} (Reff: {transaction.paymentRef})
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="receipt-actions-group">
          <button
            type="button"
            className="btn-receipt-print"
            onClick={() => onPrintReceipt && onPrintReceipt(transaction)}
          >
            <Printer size={15} strokeWidth={2.2} />
            <span>Cetak Ulang</span>
          </button>

          <button
            type="button"
            className="btn-receipt-send"
            onClick={() => onSendReceipt && onSendReceipt(transaction)}
          >
            <Mail size={15} strokeWidth={2.2} />
            <span>Kirim Bukti</span>
          </button>
        </div>

        {/* Close Button Link */}
        <button
          type="button"
          className="receipt-btn-close-text"
          onClick={onClose}
        >
          Tutup Panel Ringkasan
        </button>

        {/* Thank You Box */}
        <div className="receipt-thankyou-box">
          <span>{storeInfo.receiptFooterMessage}</span>
        </div>
      </div>
    </aside>
  );
}
