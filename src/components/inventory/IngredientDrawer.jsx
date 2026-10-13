import React, { useState, useEffect } from 'react';
import { X, Check, Package, AlertCircle, Info, ShieldAlert, Sparkles } from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Biji Kopi & Espresso',
  'Susu & Dairy',
  'Sirup & Perisa',
  'Powder & Bubuk',
  'Pemanis & Gula',
  'Packaging & Kemasan',
  'Topping & Garnis',
  'Bahan Makanan & Dapur',
  'Bahan Umum',
];

const UNIT_OPTIONS = [
  { value: 'gram', label: 'Gram (g) - Bubuk, Kopi, Biji' },
  { value: 'ml', label: 'Mililiter (ml) - Susu, Sirup, Cairan' },
  { value: 'pcs', label: 'Pieces (pcs) - Cup, Sedotan, Tutup' },
  { value: 'kg', label: 'Kilogram (kg) - Karung, Tepung' },
  { value: 'liter', label: 'Liter (L) - Minyak, Galon, Susu' },
  { value: 'shot', label: 'Shot - Espresso shot' },
  { value: 'portion', label: 'Porsi - Takaran saji' },
  { value: 'pack', label: 'Pack / Kotak' },
];

export default function IngredientDrawer({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  isSaving = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: CATEGORY_OPTIONS[0],
    unit: 'gram',
    currentStock: '',
    minimumStock: '',
    costPerUnit: '',
    supplier: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        category: initialData.category || CATEGORY_OPTIONS[0],
        unit: initialData.unit || 'gram',
        currentStock: initialData.currentStock !== undefined ? String(initialData.currentStock) : '',
        minimumStock: initialData.minimumStock !== undefined ? String(initialData.minimumStock) : '',
        costPerUnit: initialData.costPerUnit !== undefined ? String(initialData.costPerUnit) : '',
        supplier: initialData.supplier || '',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: CATEGORY_OPTIONS[0],
        unit: 'gram',
        currentStock: '0',
        minimumStock: '100',
        costPerUnit: '0',
        supplier: '',
        description: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Nama bahan baku wajib diisi.';
    }

    const curStock = Number(formData.currentStock);
    if (formData.currentStock === '' || isNaN(curStock) || curStock < 0) {
      errs.currentStock = 'Stok saat ini harus berupa angka >= 0.';
    }

    const minStock = Number(formData.minimumStock);
    if (formData.minimumStock === '' || isNaN(minStock) || minStock < 0) {
      errs.minimumStock = 'Toleransi minimum stok harus berupa angka valid (>= 0).';
    }

    const cost = Number(formData.costPerUnit);
    if (formData.costPerUnit === '' || isNaN(cost) || cost < 0) {
      errs.costPerUnit = 'Biaya per satuan harus berupa angka (>= 0).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...formData,
      currentStock: Number(formData.currentStock),
      minimumStock: Number(formData.minimumStock),
      costPerUnit: Number(formData.costPerUnit),
    });
  };

  const isEditing = Boolean(initialData);

  return (
    <div className="product-drawer-backdrop" onClick={onClose}>
      <div
        className="product-drawer animate-slide-left"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F5EBE1] text-[#8C5E3C] flex items-center justify-center font-bold">
              <Package size={20} />
            </div>
            <div>
              <h2 id="drawer-title" className="drawer-title">
                {isEditing ? 'Edit Bahan Baku' : 'Daftarkan Bahan Baku Baru'}
              </h2>
              <p className="drawer-subtitle">
                {isEditing
                  ? `Perbarui stok, harga beli, atau toleransi stok "${initialData?.name}"`
                  : 'Tambahkan bahan baku atau kemasan baru untuk katalog resep kafe.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Tutup panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body Form */}
        <form onSubmit={handleSubmit} className="drawer-form">
          <div className="drawer-body">
            {/* 1. Nama Bahan Baku */}
            <div className="form-group">
              <label htmlFor="ing-name" className="form-label required">
                Nama Bahan Baku
              </label>
              <input
                id="ing-name"
                type="text"
                className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Contoh: Biji Kopi Arabika House Blend, Fresh Milk"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoFocus
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* 2. SKU & Kategori */}
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label htmlFor="ing-sku" className="form-label">
                  Kode SKU / Barcode
                </label>
                <input
                  id="ing-sku"
                  type="text"
                  className="form-input font-mono"
                  placeholder="Auto jika kosong (BHK-xxx)"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ing-category" className="form-label required">
                  Kategori Bahan
                </label>
                <select
                  id="ing-category"
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Satuan Ukur & Stok Saat Ini */}
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label htmlFor="ing-unit" className="form-label required">
                  Satuan Ukur Standar
                </label>
                <select
                  id="ing-unit"
                  className="form-select"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ing-stock" className="form-label required">
                  Stok Fisik Saat Ini ({formData.unit})
                </label>
                <input
                  id="ing-stock"
                  type="number"
                  step="any"
                  className={`form-input ${errors.currentStock ? 'is-invalid' : ''}`}
                  placeholder="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                />
                {errors.currentStock && <span className="form-error">{errors.currentStock}</span>}
              </div>
            </div>

            {/* 4. TOLERANSI MINIMUM STOCK (KEY REQUIREMENT) */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                  <ShieldAlert size={16} className="text-amber-600" />
                  <span>Minimum Toleransi Stock (Safety Stock)</span>
                </div>
                <span className="text-[11px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                  Batas Peringatan
                </span>
              </div>

              <div className="form-group !mb-0">
                <label htmlFor="ing-min-stock" className="text-xs text-amber-950 font-medium">
                  Batas Stok Minimal ({formData.unit}):
                </label>
                <input
                  id="ing-min-stock"
                  type="number"
                  step="any"
                  className={`form-input bg-white !border-amber-300 focus:!border-amber-500 ${
                    errors.minimumStock ? 'is-invalid' : ''
                  }`}
                  placeholder="Contoh: 1000 untuk kopi, 2000 untuk susu"
                  value={formData.minimumStock}
                  onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                />
                {errors.minimumStock && <span className="form-error">{errors.minimumStock}</span>}
              </div>

              <p className="text-[11px] text-amber-800 leading-relaxed m-0">
                <Info size={12} className="inline mr-1 text-amber-700" />
                Ketika sisa stok bahan ini menyentuh atau berada di bawah <strong>{formData.minimumStock || 0} {formData.unit}</strong>,
                sistem otomatis menampilkan status <strong>MENIPIS / REORDER</strong> pada katalog dan dashboard peringatan.
              </p>
            </div>

            {/* 5. Biaya / HPP per Satuan & Supplier */}
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label htmlFor="ing-cost" className="form-label required">
                  Biaya / HPP per {formData.unit} (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    Rp
                  </span>
                  <input
                    id="ing-cost"
                    type="number"
                    step="any"
                    className={`form-input pl-9 ${errors.costPerUnit ? 'is-invalid' : ''}`}
                    placeholder="250"
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                  />
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Misal: Rp 280/gram (Rp 280.000 / kg)
                </span>
                {errors.costPerUnit && <span className="form-error">{errors.costPerUnit}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="ing-supplier" className="form-label">
                  Nama Supplier / Vendor
                </label>
                <input
                  id="ing-supplier"
                  type="text"
                  className="form-input"
                  placeholder="Nama roastery atau toko bahan"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>
            </div>

            {/* 6. Deskripsi / Catatan Tambahan */}
            <div className="form-group">
              <label htmlFor="ing-desc" className="form-label">
                Deskripsi &amp; Catatan Khusus
              </label>
              <textarea
                id="ing-desc"
                className="form-textarea"
                rows={2}
                placeholder="Spesifikasi kemasan, suhu penyimpanan, atau catatan racikan..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* Drawer Footer Buttons */}
          <div className="drawer-footer">
            <button
              type="button"
              className="btn-drawer-cancel"
              onClick={onClose}
              disabled={isSaving}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-drawer-save"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spin-icon">⏳</span>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  <span>{isEditing ? 'Perbarui Bahan' : 'Daftarkan Bahan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
