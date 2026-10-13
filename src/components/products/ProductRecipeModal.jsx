import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Plus,
  Trash2,
  UtensilsCrossed,
  Info,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  fetchIngredients,
  getRecipeForProduct,
  saveProductRecipe,
  calculateRecipeFinancials,
} from '../../services/inventoryService';

export default function ProductRecipeModal({
  isOpen,
  onClose,
  product = null,
  onRecipeSaved,
}) {
  const [ingredients, setIngredients] = useState([]);
  const [recipeItems, setRecipeItems] = useState([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && product) {
      setIsLoading(true);
      setErrorMessage('');
      Promise.all([
        fetchIngredients(),
        getRecipeForProduct(product.rawId || product.id || product.name),
      ])
        .then(([allIngs, existingRecipe]) => {
          setIngredients(allIngs || []);
          setRecipeItems(existingRecipe || []);
          if (allIngs && allIngs.length > 0) {
            setSelectedIngredientId(allIngs[0].id);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const currentSelectedIngredient = ingredients.find((i) => i.id === selectedIngredientId);

  // Financial calculations
  const financials = calculateRecipeFinancials(
    recipeItems,
    ingredients,
    product.price || 0
  );

  // Handler: Add ingredient to recipe
  const handleAddIngredient = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedIngredientId) {
      setErrorMessage('Pilih bahan baku terlebih dahulu.');
      return;
    }

    const qty = Number(quantityInput);
    if (!quantityInput || isNaN(qty) || qty <= 0) {
      setErrorMessage('Jumlah takaran bahan harus berupa angka lebih dari 0.');
      return;
    }

    // Check if ingredient already in recipe
    const existingIndex = recipeItems.findIndex((r) => r.ingredientId === selectedIngredientId);
    if (existingIndex !== -1) {
      // Update quantity
      const copy = [...recipeItems];
      copy[existingIndex] = {
        ...copy[existingIndex],
        quantity: copy[existingIndex].quantity + qty,
        customNote: customNote || copy[existingIndex].customNote,
      };
      setRecipeItems(copy);
    } else {
      // Add new
      setRecipeItems([
        ...recipeItems,
        {
          ingredientId: selectedIngredientId,
          quantity: qty,
          unit: currentSelectedIngredient?.unit || 'gram',
          customNote: customNote || '',
        },
      ]);
    }

    setQuantityInput('');
    setCustomNote('');
  };

  // Handler: Remove ingredient from recipe
  const handleRemoveIngredient = (index) => {
    setRecipeItems(recipeItems.filter((_, idx) => idx !== index));
  };

  // Handler: Save recipe
  const handleSaveRecipe = async () => {
    setIsSaving(true);
    try {
      const identifier = product.rawId || product.id || product.name;
      const res = await saveProductRecipe(identifier, recipeItems);
      if (res.success) {
        if (onRecipeSaved) onRecipeSaved(identifier, recipeItems, financials);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menyimpan resep produk.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="recipe-modal-backdrop" onClick={onClose}>
      <div
        className="recipe-modal-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="recipe-modal-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F5EBE1] text-[#8C5E3C] flex items-center justify-center font-bold">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-gray-900 m-0">
                  Resep Produk: {product.name}
                </h3>
                <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                  {product.category || 'Minuman'}
                </span>
              </div>
              <p className="text-xs text-gray-500 m-0">
                Atur komposisi bahan baku (Bill of Materials), kalkulasi HPP otomatis, dan margin laba.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="recipe-modal-body">
          {/* 1. Financial Metrics Summary Box */}
          <div className="recipe-summary-box">
            <div className="recipe-summary-metric">
              <span className="recipe-summary-label">Harga Jual Menu</span>
              <span className="recipe-summary-value text-gray-900">
                Rp {Number(product.price || 0).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="recipe-summary-metric">
              <span className="recipe-summary-label">Total HPP / Porsi (BOM)</span>
              <span className="recipe-summary-value highlight-brown">
                Rp {financials.totalHPP.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="recipe-summary-metric">
              <span className="recipe-summary-label">Laba Kotor &amp; Margin</span>
              <div className="flex items-baseline gap-2">
                <span className="recipe-summary-value highlight-green">
                  Rp {financials.grossProfit.toLocaleString('id-ID')}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  {financials.marginPercent}%
                </span>
              </div>
            </div>

            <div className="recipe-summary-metric">
              <span className="recipe-summary-label">Estimasi Porsi Tersedia</span>
              <div className="flex items-center gap-1.5">
                <span className="recipe-summary-value" style={{ color: financials.portionsAvailable <= 10 ? '#DC2626' : '#15803D' }}>
                  ~{financials.portionsAvailable}
                </span>
                <span className="text-xs text-gray-500 font-semibold">Porsi</span>
              </div>
              {financials.bottleneckIngredient && (
                <span className="text-[10px] text-amber-800 line-clamp-1">
                  Dibatasi oleh: {financials.bottleneckIngredient.name}
                </span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 2. Add Ingredient Row */}
          <div className="recipe-add-row flex-wrap gap-2">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[11px] font-bold text-gray-600 block mb-1">
                Pilih Bahan Baku dari Inventori
              </label>
              <select
                className="inventory-select w-full text-xs"
                value={selectedIngredientId}
                onChange={(e) => setSelectedIngredientId(e.target.value)}
              >
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({ing.unit}) - Stok: {ing.currentStock} {ing.unit} (Rp {ing.costPerUnit}/{ing.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-[120px]">
              <label className="text-[11px] font-bold text-gray-600 block mb-1">
                Takaran ({currentSelectedIngredient?.unit || 'satuan'})
              </label>
              <input
                type="number"
                step="any"
                className="inventory-search-input text-xs !py-2"
                placeholder="Misal: 18"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="text-[11px] font-bold text-gray-600 block mb-1">
                Catatan Racikan (Opsional)
              </label>
              <input
                type="text"
                className="inventory-search-input text-xs !py-2"
                placeholder="Misal: Double shot espresso, Sirup dingin"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                className="btn-add-product text-xs py-2 px-3 whitespace-nowrap"
                onClick={handleAddIngredient}
              >
                <Plus size={14} />
                <span>Tambah Bahan</span>
              </button>
            </div>
          </div>

          {/* 3. Recipe Items Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="recipe-items-table">
              <thead>
                <tr>
                  <th>Nama Bahan Baku</th>
                  <th>Takaran / Porsi</th>
                  <th>Biaya Satuan</th>
                  <th>Subtotal HPP</th>
                  <th>Stok Gudang</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recipeItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400 text-xs">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <UtensilsCrossed size={24} className="text-gray-300" />
                        <span>Belum ada komposisi bahan dalam resep ini.</span>
                        <span className="text-[11px] text-gray-400">
                          Pilih bahan baku di atas lalu klik &quot;Tambah Bahan&quot; untuk menyusun resep produk.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  financials.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="font-bold text-xs text-gray-900">{item.ingredientName}</div>
                        {item.customNote && (
                          <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                            {item.customNote}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="font-extrabold text-xs text-gray-800">
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="text-xs text-gray-600">
                        Rp {item.costPerUnit.toLocaleString('id-ID')} / {item.unit}
                      </td>
                      <td>
                        <span className="font-bold text-xs text-amber-900">
                          Rp {item.itemSubtotal.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold ${item.stockStatus === 'Habis' ? 'text-red-600' : item.stockStatus === 'Menipis' ? 'text-amber-600' : 'text-gray-700'}`}>
                            {item.currentStock.toLocaleString('id-ID')} {item.unit}
                          </span>
                          {item.stockStatus === 'Menipis' && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                              Menipis!
                            </span>
                          )}
                          {item.stockStatus === 'Habis' && (
                            <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded font-bold">
                              Habis!
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-action-icon btn-delete"
                          onClick={() => handleRemoveIngredient(index)}
                          title="Hapus dari resep"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Resep akan tersimpan otomatis dan mempengaruhi estimasi HPP di laporan keuntungan.
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="btn-drawer-cancel text-xs"
              onClick={onClose}
              disabled={isSaving}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn-add-product text-xs"
              onClick={handleSaveRecipe}
              disabled={isSaving}
            >
              <Check size={14} />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Resep Produk'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
