import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Camera,
  Info,
  Upload,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { defaultProductCategories as defaultCategories } from '../../constants/appConstants';
import { uploadProductImage } from '../../services/productService';

export default function ProductDrawer({
  isOpen,
  onClose,
  onSave,
  initialProduct = null,
  categories = defaultCategories,
  isSaving = false
}) {
  const categoryList = categories && categories.length > 0 ? categories : defaultCategories;
  const filteredCategories = categoryList.filter((c) => c.id !== 'all');

  const [formData, setFormData] = useState({
    name: '',
    category: filteredCategories[0]?.name || 'Coffee',
    categoryId: filteredCategories[0]?.rawId || filteredCategories[0]?.id || undefined,
    price: '',
    imageUrl: '',
    status: 'Aktif'
  });

  const [errors, setErrors] = useState({});
  const [photoTab, setPhotoTab] = useState('upload'); // 'upload' | 'url' | 'preset'
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        category: initialProduct.category || filteredCategories[0]?.name || 'Coffee',
        categoryId: initialProduct.categoryId,
        price: initialProduct.price ? String(initialProduct.price) : '',
        imageUrl: initialProduct.imageUrl || '',
        status: initialProduct.status || 'Aktif'
      });
      setUrlInput(initialProduct.imageUrl || '');
    } else {
      setFormData({
        name: '',
        category: filteredCategories[0]?.name || 'Coffee',
        categoryId: filteredCategories[0]?.rawId || filteredCategories[0]?.id || undefined,
        price: '',
        imageUrl: '',
        status: 'Aktif'
      });
      setUrlInput('');
    }
    setErrors({});
    setUploadError(null);
    setIsUploading(false);
    setPhotoTab('upload');
  }, [initialProduct, isOpen, categories]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Nama produk wajib diisi.';
    }
    const numPrice = Number(formData.price);
    if (!formData.price || isNaN(numPrice) || numPrice < 0) {
      errs.price = 'Harga harus berupa angka valid dan tidak boleh negatif.';
    }
    if (!formData.category) {
      errs.category = 'Kategori wajib dipilih.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formattedPrice = `Rp ${Number(formData.price).toLocaleString('id-ID')}`;
    const productPayload = {
      ...formData,
      price: Number(formData.price),
      formattedPrice,
      updatedAt: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };

    onSave(productPayload);
  };

  // Process selected or dropped file
  const handleProcessFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Hanya berkas gambar (JPG, PNG, WebP, GIF) yang didukung.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal adalah 5MB.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const publicUrl = await uploadProductImage(file);
      if (publicUrl) {
        setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
        setUrlInput(publicUrl);
      } else {
        setUploadError('Gagal memproses gambar. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('File upload error:', err);
      setUploadError('Terjadi kesalahan saat mengunggah foto.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleApplyUrl = (e) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUploadError('Masukkan URL gambar yang valid.');
      return;
    }
    setUploadError(null);
    setFormData(prev => ({ ...prev, imageUrl: trimmed }));
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setUrlInput('');
    setUploadError(null);
  };

  const isEditing = Boolean(initialProduct);

  return (
    <div className="drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-header-text">
            <h2 className="drawer-title">
              {isEditing ? 'Edit Menu Produk' : 'Tambah Produk Baru'}
            </h2>
            <p className="drawer-subtitle">
              {isEditing
                ? 'Perbarui informasi produk, kategori, dan harga jual pada database PostgreSQL.'
                : 'Tambahkan item menu baru ke katalog kasir POSAN pada database PostgreSQL.'}
            </p>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Tutup Form"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form id="productForm" onSubmit={handleSubmit} className="drawer-body">
          {/* 1. Nama Produk */}
          <div className="form-group">
            <label className="form-label" htmlFor="prodName">
              Nama Produk <span className="required-star">*</span>
            </label>
            <input
              id="prodName"
              type="text"
              className="form-input"
              placeholder="Contoh: Kopi Filter V60"
              value={formData.name}
              disabled={isSaving}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: null });
              }}
            />
            <span className="form-helper-text">
              Nama yang akan tertera pada struk pembelian & antarmuka kasir.
            </span>
            {errors.name && <span style={{ color: '#DC2626', fontSize: '0.72rem', fontWeight: 600 }}>{errors.name}</span>}
          </div>

          {/* 2. Kategori & Harga Jual */}
          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label" htmlFor="prodCategory">
                Kategori <span className="required-star">*</span>
              </label>
              <select
                id="prodCategory"
                className="form-input"
                value={formData.category}
                disabled={isSaving}
                onChange={(e) => {
                  const selectedCat = filteredCategories.find(c => c.name === e.target.value);
                  setFormData({
                    ...formData,
                    category: selectedCat ? selectedCat.name : e.target.value,
                    categoryId: selectedCat ? (selectedCat.rawId || selectedCat.id) : undefined
                  });
                  if (errors.category) setErrors({ ...errors, category: null });
                }}
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
                {filteredCategories.length === 0 && (
                  <option value="Umum">Umum</option>
                )}
              </select>
              <span className="form-helper-text">
                Pilihan kategori dari database PostgreSQL.
              </span>
              {errors.category && <span style={{ color: '#DC2626', fontSize: '0.72rem', fontWeight: 600 }}>{errors.category}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prodPrice">
                Harga Jual (Rp) <span className="required-star">*</span>
              </label>
              <input
                id="prodPrice"
                type="number"
                min="0"
                step="500"
                className="form-input"
                placeholder="25000"
                value={formData.price}
                disabled={isSaving}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  if (errors.price) setErrors({ ...errors, price: null });
                }}
              />
              <span className="form-helper-text">
                Nominal harga dasar produk.
              </span>
              {errors.price && <span style={{ color: '#DC2626', fontSize: '0.72rem', fontWeight: 600 }}>{errors.price}</span>}
            </div>
          </div>

          {/* 3. Foto Menu Produk */}
          <div className="form-group">
            <label className="form-label">
              Foto Menu Produk <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 'normal' }}>(Unggah dari perangkat / Link URL)</span>
            </label>

            <div className="photo-uploader-container">
              {/* If a photo is already selected, show ONLY the Preview Box */}
              {formData.imageUrl ? (
                <div className="photo-preview-box">
                  <img src={formData.imageUrl} alt="Pratinjau Foto" className="preview-image" />
                  <div className="preview-overlay-info">
                    <span className="preview-badge">
                      <CheckCircle2 size={12} />
                      Foto Terpilih
                    </span>
                    <button
                      type="button"
                      className="btn-remove-photo"
                      onClick={handleRemovePhoto}
                      title="Ganti atau Hapus Foto"
                    >
                      <Trash2 size={13} />
                      <span>Hapus / Ganti Foto</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Otherwise, show Tab Selector & Upload/URL Inputs */
                <>
                  {/* Tab Selector */}
                  <div className="photo-tab-bar">
                    <button
                      type="button"
                      className={`photo-tab-btn ${photoTab === 'upload' ? 'active' : ''}`}
                      onClick={() => {
                        setPhotoTab('upload');
                        setUploadError(null);
                      }}
                    >
                      <Upload size={13} />
                      <span>Unggah Berkas</span>
                    </button>
                    <button
                      type="button"
                      className={`photo-tab-btn ${photoTab === 'url' ? 'active' : ''}`}
                      onClick={() => {
                        setPhotoTab('url');
                        setUploadError(null);
                      }}
                    >
                      <LinkIcon size={13} />
                      <span>Link URL Web</span>
                    </button>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />

                  {/* Tab 1: File Upload Dropzone */}
                  {photoTab === 'upload' && (
                    <div
                      className={`photo-upload-dropzone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
                      onClick={() => !isUploading && fileInputRef.current && fileInputRef.current.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {isUploading ? (
                        <div className="upload-loading-state">
                          <RefreshCw size={24} className="spin-icon" />
                          <div className="upload-title">Mengunggah Foto...</div>
                          <div className="upload-desc">Menyiapkan pratinjau foto produk</div>
                        </div>
                      ) : (
                        <>
                          <div className="upload-icon-circle">
                            <Camera size={20} />
                          </div>
                          <div className="upload-title">
                            {isDragging ? 'Lepaskan file di sini' : 'Pilih atau Tarik File Foto ke Sini'}
                          </div>
                          <div className="upload-desc">
                            Klik untuk memilih foto dari komputer/HP (JPG, PNG, WebP, Maks 5MB)
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Tab 2: URL Input */}
                  {photoTab === 'url' && (
                    <div className="photo-url-box">
                      <div className="photo-url-input-row">
                        <input
                          type="url"
                          className="form-input photo-url-input"
                          placeholder="https://images.unsplash.com/... atau tautan gambar langsung"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyUrl();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn-apply-url"
                          onClick={handleApplyUrl}
                        >
                          <span>Terapkan</span>
                        </button>
                      </div>
                      <span className="form-helper-text">
                        Masukkan tautan gambar langsung dari internet (Unsplash, Google Drive publik, CDN, dll).
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Error Alert if any */}
              {uploadError && (
                <div className="photo-error-box">
                  <AlertCircle size={14} color="#DC2626" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          </div>

          {/* 5. Status Ketersediaan */}
          <div className="form-group">
            <label className="form-label">
              Status Ketersediaan Menu
            </label>
            <div className="status-radio-grid">
              <div
                className={`status-radio-card ${formData.status === 'Aktif' ? 'selected' : ''}`}
                onClick={() => !isSaving && setFormData({ ...formData, status: 'Aktif' })}
              >
                <div className="radio-dot-outer">
                  {formData.status === 'Aktif' && <div className="radio-dot-inner" />}
                </div>
                <div className="radio-text-box">
                  <span className="radio-title">Aktif</span>
                  <span className="radio-desc">Tampil di layar POS kasir</span>
                </div>
              </div>

              <div
                className={`status-radio-card ${formData.status === 'Nonaktif' ? 'selected' : ''}`}
                onClick={() => !isSaving && setFormData({ ...formData, status: 'Nonaktif' })}
              >
                <div className="radio-dot-outer">
                  {formData.status === 'Nonaktif' && <div className="radio-dot-inner" />}
                </div>
                <div className="radio-text-box">
                  <span className="radio-title">Nonaktif</span>
                  <span className="radio-desc">Sembunyikan dari POS</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Info Alert Box */}
          <div className="artisan-info-box">
            <Info size={16} color="#C2672B" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div className="artisan-info-title">Model Menu Kafe POSAN</div>
              <div>
                Data produk tersimpan di database PostgreSQL dan langsung disinkronkan ke seluruh modul POSAN.
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="drawer-footer">
          <button
            type="button"
            className="btn-drawer-cancel"
            onClick={onClose}
            disabled={isSaving || isUploading}
          >
            Batal
          </button>
          <button
            type="submit"
            form="productForm"
            className="btn-drawer-save"
            disabled={isSaving || isUploading}
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="spin-icon animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : isUploading ? (
              <>
                <RefreshCw size={14} className="spin-icon" />
                <span>Mengunggah...</span>
              </>
            ) : (
              <>
                <Check size={14} strokeWidth={2.5} />
                <span>{isEditing ? 'Perbarui Produk' : 'Simpan Produk'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
