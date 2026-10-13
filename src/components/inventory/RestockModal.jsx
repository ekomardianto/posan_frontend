import React, { useState, useEffect } from 'react';
import { X, Check, PlusCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';

export default function RestockModal({
  isOpen,
  onClose,
  onConfirm,
  ingredient = null,
  isSubmitting = false,
}) {
  const [quantity, setQuantity] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (ingredient) {
      setQuantity('');
      setCostPerUnit(ingredient.costPerUnit ? String(ingredient.costPerUnit) : '');
      setReference(`PO-${new Date().getFullYear()}${String(Date.now()).slice(-4)}`);
      setNotes(`Penerimaan barang masuk dari ${ingredient.supplier || 'supplier'}`);
      setError('');
    }
  }, [ingredient, isOpen]);

  if (!isOpen || !ingredient) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const qtyNum = Number(quantity);
    if (!quantity || isNaN(qtyNum) || qtyNum <= 0) {
      setError('Jumlah stok masuk harus lebih dari 0.');
      return;
    }

    onConfirm({
      ingredientId: ingredient.id,
      quantity: qtyNum,
      costPerUnit: costPerUnit ? Number(costPerUnit) : undefined,
      reference,
      notes,
    });
  };

  const newStockPreview = (Number(ingredient.currentStock) || 0) + (Number(quantity) || 0);

  return (
    <div className="product-delete-modal-backdrop" onClick={onClose}>
      <div
        className="product-delete-modal animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px' }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ArrowDownCircle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 m-0">Restock Bahan Masuk</h3>
              <p className="text-xs text-gray-500 m-0">{ingredient.name}</p>
            </div>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 p-1"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Current Stock vs Preview */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-500 font-semibold uppercase">Stok Saat Ini</span>
              <div className="text-sm font-bold text-gray-800">
                {ingredient.currentStock.toLocaleString('id-ID')} {ingredient.unit}
              </div>
            </div>
            <div className="text-gray-400">➡️</div>
            <div className="text-right">
              <span className="text-[11px] text-emerald-600 font-semibold uppercase">Setelah Restock</span>
              <div className="text-sm font-extrabold text-emerald-700">
                {newStockPreview.toLocaleString('id-ID')} {ingredient.unit}
              </div>
            </div>
          </div>

          {/* Input Quantity */}
          <div className="form-group !mb-1">
            <label className="form-label required">
              Jumlah Stok Masuk ({ingredient.unit})
            </label>
            <input
              type="number"
              step="any"
              className="form-input font-bold text-base"
              placeholder={`Contoh: 5000 ${ingredient.unit}`}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError('');
              }}
              autoFocus
            />
          </div>

          {/* Update Cost per Unit */}
          <div className="form-group !mb-1">
            <label className="form-label">
              Harga Beli Baru per {ingredient.unit} (Rp)
            </label>
            <input
              type="number"
              step="any"
              className="form-input"
              placeholder="Kosongkan jika harga tidak berubah"
              value={costPerUnit}
              onChange={(e) => setCostPerUnit(e.target.value)}
            />
          </div>

          {/* Reference / PO */}
          <div className="form-group !mb-1">
            <label className="form-label">
              Nomor Faktur / No. PO Supplier
            </label>
            <input
              type="text"
              className="form-input font-mono text-xs"
              placeholder="Nomor faktur pembelian"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="form-group !mb-2">
            <label className="form-label">
              Catatan Penerimaan
            </label>
            <input
              type="text"
              className="form-input text-xs"
              placeholder="Catatan kondisi barang saat diterima"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              className="btn-drawer-cancel text-xs"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-add-product !bg-emerald-700 hover:!bg-emerald-800 text-xs py-2 px-4"
              disabled={isSubmitting}
            >
              <Check size={14} />
              <span>{isSubmitting ? 'Menyimpan...' : 'Konfirmasi Stok Masuk'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
