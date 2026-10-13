import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Coffee,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchReceiptSettings } from '../../services/receiptSettingService';

export default function TransactionDetailPanel({
  transaction,
  onClose
}) {
  const { merchant } = useAuth();
  const [receiptSettings, setReceiptSettings] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchReceiptSettings(merchant?.id)
      .then((settings) => {
        if (isMounted && settings) {
          setReceiptSettings(settings);
        }
      })
      .catch((err) => {
        console.warn('Error loading receipt settings in panel:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [merchant?.id]);

  if (!transaction) return null;

  // Resolve Store Branding
  const storeName =
    receiptSettings?.header_title ||
    receiptSettings?.store_name ||
    merchant?.name ||
    'POSAN Coffee';
  const storeSubtitle =
    receiptSettings?.header_subtitle ||
    merchant?.category ||
    '';
  const storeAddress =
    receiptSettings?.store_address ||
    merchant?.address ||
    '';
  const storePhone =
    receiptSettings?.store_phone ||
    merchant?.phone ||
    '';
  const thankYouMsg =
    receiptSettings?.thank_you_message ||
    'Terima kasih atas kunjungan Anda!';
  const footerNote =
    receiptSettings?.footer_note ||
    'POWERED BY POSAN POS';
  const bankInfo = receiptSettings?.bank_info || '';

  // Order Type (Dine In / Take Away)
  const rawNotes = transaction.notes || transaction.orderType || '';
  const isTakeAway =
    rawNotes.toLowerCase().includes('take away') ||
    rawNotes.toLowerCase().includes('bungkus');
  const isDineIn =
    rawNotes.toLowerCase().includes('dine in') ||
    rawNotes.toLowerCase().includes('meja') ||
    (!isTakeAway && rawNotes.length > 0);
  const orderTypeBanner = isTakeAway
    ? 'TAKE AWAY'
    : isDineIn
    ? rawNotes.toUpperCase().includes('DINE')
      ? rawNotes.toUpperCase()
      : 'DINE IN'
    : null;

  const isCash =
    (transaction.paymentMethod || '').toLowerCase().includes('tunai') ||
    (transaction.paymentMethod || '').toLowerCase().includes('cash');

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

  const receiptNo = transaction.receiptNumber?.startsWith('#')
    ? transaction.receiptNumber
    : `#${transaction.receiptNumber || transaction.id}`;

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
          <h3 className="receipt-brand-name">{storeName}</h3>
          {storeSubtitle && <div className="receipt-brand-sub">{storeSubtitle}</div>}
          {(storeAddress || storePhone) && (
            <p className="receipt-store-location">
              {[storeAddress, storePhone ? `Telp: ${storePhone}` : ''].filter(Boolean).join(' • ')}
            </p>
          )}
        </div>

        {/* Dashed Divider */}
        <div className="receipt-dashed-line" />

        {/* Transaction Meta Info */}
        <div className="receipt-meta-grid">
          <div className="receipt-meta-row">
            <span className="receipt-meta-label">Nomor Struk:</span>
            <span className="receipt-meta-val font-bold">{receiptNo}</span>
          </div>
          <div className="receipt-meta-row">
            <span className="receipt-meta-label">Kasir:</span>
            <span className="receipt-meta-val">{transaction.cashierName || 'Kasir'}</span>
          </div>
          <div className="receipt-meta-row">
            <span className="receipt-meta-label">Waktu:</span>
            <span className="receipt-meta-val">{transaction.fullTimestamp || transaction.time}</span>
          </div>
          <div className="receipt-meta-row">
            <span className="receipt-meta-label">Pembayaran:</span>
            <span className="receipt-meta-val">{transaction.paymentMethod || 'Tunai'}</span>
          </div>
          <div className="receipt-meta-row">
            <span className="receipt-meta-label">Status:</span>
            <span className="receipt-status-badge">
              <span className="receipt-status-dot" />
              <span>{transaction.statusLabel || 'LUNAS / SUKSES'}</span>
            </span>
          </div>
        </div>

        {/* Order Type Banner */}
        {orderTypeBanner && (
          <>
            <div className="receipt-dashed-line" />
            <div className="receipt-order-banner">
              {orderTypeBanner}
            </div>
          </>
        )}

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
                  {item.qty}x @ Rp{Number(item.price || 0).toLocaleString('id-ID')}
                </span>
                {renderModifierTag(item.notes)}
              </div>
              <div className="receipt-item-subtotal">
                Rp{Number(item.subtotal || (item.qty * item.price) || 0).toLocaleString('id-ID')}
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
              Rp{Number(transaction.subtotal || transaction.total || 0).toLocaleString('id-ID')}
            </span>
          </div>
          {transaction.discount > 0 && (
            <div className="receipt-total-row">
              <span className="receipt-total-label">Diskon Pesanan</span>
              <span className="receipt-total-val text-discount">
                -Rp{Number(transaction.discount).toLocaleString('id-ID')}
              </span>
            </div>
          )}
          {transaction.tax > 0 && (
            <div className="receipt-total-row">
              <span className="receipt-total-label">Pajak (PB1)</span>
              <span className="receipt-total-val">
                Rp{Number(transaction.tax).toLocaleString('id-ID')}
              </span>
            </div>
          )}

          <div className="receipt-grand-total-row">
            <span className="receipt-grand-total-label">Total Bayar</span>
            <span className="receipt-grand-total-val">
              Rp{Number(transaction.total || 0).toLocaleString('id-ID')}
            </span>
          </div>

          <div className="receipt-payment-ref-row">
            <span className="receipt-ref-label">Metode Pembayaran</span>
            <span className="receipt-ref-val font-bold">
              {transaction.paymentMethod?.toUpperCase() || 'TUNAI'}
            </span>
          </div>

          {/* Cash breakdown: amount received & change */}
          {isCash && Number(transaction.amountPaid) > 0 && (
            <>
              <div className="receipt-total-row" style={{ marginTop: 4 }}>
                <span className="receipt-total-label">Uang Diterima</span>
                <span className="receipt-total-val">
                  Rp{Number(transaction.amountPaid).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="receipt-total-row">
                <span className="receipt-total-label">Kembalian</span>
                <span className="receipt-total-val font-bold">
                  Rp{Number(transaction.changeAmount || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Dashed Divider */}
        <div className="receipt-dashed-line" />

        {/* Bank Info (if set in receipt settings) */}
        {bankInfo && (
          <div className="receipt-bank-info">
            {bankInfo}
          </div>
        )}

        {/* Thank You Note */}
        <div className="receipt-thankyou-box">
          <span>{thankYouMsg}</span>
        </div>

        {/* Powered by footer */}
        {footerNote && (
          <div className="receipt-powered-note">
            <span>{footerNote}</span>
          </div>
        )}

        {/* Close Button Link */}
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            className="btn-receipt-close-main"
            onClick={onClose}
          >
            Tutup Panel Ringkasan
          </button>
        </div>
      </div>
    </aside>
  );
}
