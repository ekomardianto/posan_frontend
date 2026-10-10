import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Clock, ChevronRight, Loader2, Coffee, Utensils, PackageX } from 'lucide-react';
import { quickCategorySuggestions } from '../../constants/appConstants';

export default function CategoryForm({
  initialCategory = null,
  registeredCategories = [],
  isSaving = false,
  onBack,
  onSave
}) {
  const isEditing = Boolean(initialCategory);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [station, setStation] = useState('barista');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name || '');
      setDescription(initialCategory.description || '');
      setStation(initialCategory.station || 'barista');
    } else {
      setName('');
      setDescription('');
      setStation('barista');
    }
    setError('');
  }, [initialCategory]);

  const handleSuggestionClick = (suggestion) => {
    setName(suggestion.value);
    setDescription(suggestion.description);
    if (suggestion.station) {
      setStation(suggestion.station);
    }
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama kategori wajib diisi.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || `Kategori menu ${name.trim()}`,
      station: station,
      iconType: name.toLowerCase().includes('kopi') || name.toLowerCase().includes('coffee')
        ? 'coffee'
        : name.toLowerCase().includes('tea') || name.toLowerCase().includes('mocktail') || name.toLowerCase().includes('beverage')
        ? 'beverage'
        : name.toLowerCase().includes('snack') || name.toLowerCase().includes('makanan') || name.toLowerCase().includes('food')
        ? 'food'
        : name.toLowerCase().includes('pastry') || name.toLowerCase().includes('bakery') || name.toLowerCase().includes('dessert')
        ? 'dessert'
        : 'other',
      status: initialCategory ? initialCategory.status : 'Aktif',
      productCount: initialCategory ? initialCategory.productCount : 0,
      updatedAt: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };

    onSave(payload);
  };

  return (
    <div className="category-form-page-container animate-fade-in" role="region" aria-label="Form Tambah Kategori">
      {/* Top Bar with Breadcrumb and Back Button */}
      <div className="category-form-top-bar">
        <div>
          <div className="products-breadcrumb-overline" style={{ marginBottom: 4 }}>
            <span>Kategori</span>
            <ChevronRight size={12} />
            <span>{isEditing ? 'Edit Kategori' : 'Tambah Kategori'}</span>
          </div>
          <h1 className="products-page-title">{isEditing ? 'Edit Kategori' : 'Tambah Kategori'}</h1>
        </div>

        <button
          type="button"
          className="btn-back-to-list"
          onClick={onBack}
          disabled={isSaving}
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Daftar</span>
        </button>
      </div>

      {/* Main Centered Form Card */}
      <div className="category-form-card">
        {/* Card Header */}
        <div className="category-form-header">
          <div className="form-icon-circle">
            <Plus size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="form-header-title">{isEditing ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
            <p className="form-header-sub">
              {isEditing
                ? 'Perbarui nama atau deskripsi pengelompokan menu café.'
                : 'Tambahkan kategori baru untuk mengelompokkan menu café.'}
            </p>
          </div>
        </div>

        {/* Form Elements */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Field 1: Nama Kategori */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="catNameInput">
                Nama Kategori <span className="required-star">*</span>
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Wajib diisi</span>
            </div>

            <input
              id="catNameInput"
              type="text"
              className="form-input"
              placeholder="Masukkan nama kategori"
              value={name}
              disabled={isSaving}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              style={{ padding: '12px 16px', fontSize: '0.88rem' }}
            />

            <span className="form-helper-text">
              Gunakan nama kategori yang mudah dikenali, misalnya Kopi, Minuman, atau Makanan.
            </span>
            {error && <span style={{ color: '#DC2626', fontSize: '0.74rem', fontWeight: 600 }}>{error}</span>}
          </div>

          {/* Field 2: Deskripsi Kategori */}
          <div className="form-group">
            <label className="form-label" htmlFor="catDescInput">
              Deskripsi Kategori <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Opsional)</span>
            </label>
            <input
              id="catDescInput"
              type="text"
              className="form-input"
              placeholder="Contoh: Kategori minuman POSAN"
              value={description}
              disabled={isSaving}
              onChange={(e) => setDescription(e.target.value)}
              style={{ padding: '12px 16px', fontSize: '0.88rem' }}
            />
          </div>

          {/* Field 3: Alur Masuk Dapur / Stasiun Pembuatan */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>
                Alur Masuk Dapur / Stasiun Pembuatan <span className="required-star">*</span>
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pilih tujuan proses pesanan</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {/* Option 1: Barista */}
              <div
                onClick={() => !isSaving && setStation('barista')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: station === 'barista' ? '2px solid #BA6A34' : '1px solid #E2D9CC',
                  backgroundColor: station === 'barista' ? '#FFF8F3' : '#FFFFFF',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  boxShadow: station === 'barista' ? '0 4px 14px rgba(186, 106, 52, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: station === 'barista' ? '#BA6A34' : '#F4ECE1', color: station === 'barista' ? '#FFFFFF' : '#8C5E3C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Coffee size={18} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#1E1712' }}>Barista</span>
                  </div>
                  <input
                    type="radio"
                    name="category_station"
                    checked={station === 'barista'}
                    onChange={() => setStation('barista')}
                    disabled={isSaving}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.73rem', color: '#7E7569', lineHeight: 1.35 }}>
                  Minuman racikan, kopi, teh, jus &amp; mocktail.
                </p>
              </div>

              {/* Option 2: Kitchen / Dapur */}
              <div
                onClick={() => !isSaving && setStation('kitchen')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: station === 'kitchen' ? '2px solid #D97706' : '1px solid #E2D9CC',
                  backgroundColor: station === 'kitchen' ? '#FFFBEB' : '#FFFFFF',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  boxShadow: station === 'kitchen' ? '0 4px 14px rgba(217, 119, 6, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: station === 'kitchen' ? '#D97706' : '#FEF3C7', color: station === 'kitchen' ? '#FFFFFF' : '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Utensils size={18} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#1E1712' }}>Kitchen (Dapur)</span>
                  </div>
                  <input
                    type="radio"
                    name="category_station"
                    checked={station === 'kitchen'}
                    onChange={() => setStation('kitchen')}
                    disabled={isSaving}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.73rem', color: '#7E7569', lineHeight: 1.35 }}>
                  Makanan utama, snack goreng, nasi, mie &amp; pastry.
                </p>
              </div>

              {/* Option 3: Tidak Masuk Dapur */}
              <div
                onClick={() => !isSaving && setStation('none')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: station === 'none' ? '2px solid #4B5563' : '1px solid #E2D9CC',
                  backgroundColor: station === 'none' ? '#F9FAFB' : '#FFFFFF',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  boxShadow: station === 'none' ? '0 4px 14px rgba(75, 85, 99, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: station === 'none' ? '#4B5563' : '#F3F4F6', color: station === 'none' ? '#FFFFFF' : '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PackageX size={18} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#1E1712' }}>Tidak Masuk Dapur</span>
                  </div>
                  <input
                    type="radio"
                    name="category_station"
                    checked={station === 'none'}
                    onChange={() => setStation('none')}
                    disabled={isSaving}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.73rem', color: '#7E7569', lineHeight: 1.35 }}>
                  Merchandise, rokok, snack kemasan &amp; retail.
                </p>
              </div>
            </div>
            <span className="form-helper-text" style={{ marginTop: '8px', display: 'block' }}>
              💡 Pengaturan ini menentukan apakah pesanan otomatis dikirim ke Layar/Tiket Barista, Layar Dapur, atau langsung selesai di kasir.
            </span>
          </div>

          {/* Quick Suggestions */}
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>
              Saran cepat:
            </div>
            <div className="quick-suggestions-row">
              {quickCategorySuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-suggestion-chip"
                  disabled={isSaving}
                  onClick={() => handleSuggestionClick(sug)}
                >
                  {sug.label}
                </button>
              ))}
            </div>
          </div>

          {/* Registered Categories Reference Box */}
          <div className="registered-categories-box">
            <div className="registered-header">
              <span>Kategori yang sudah terdaftar:</span>
              <span>{registeredCategories.length} Kategori</span>
            </div>
            <div className="registered-chips-list">
              {registeredCategories.map((cat) => (
                <span key={cat.id} className="registered-chip">
                  {cat.name}
                </span>
              ))}
              {registeredCategories.length === 0 && (
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Belum ada kategori lain.</span>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-row">
            <button
              type="button"
              className="btn-drawer-cancel"
              onClick={onBack}
              disabled={isSaving}
            >
              Batal
            </button>

            <button
              type="submit"
              className="btn-add-product"
              style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              disabled={isSaving}
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Kategori'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Information Guide Banner */}
      <div className="guide-note-banner">
        <Clock size={16} color="#8C5E3C" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>Petunjuk Admin Café:</strong> Kategori baru yang disimpan akan langsung tersedia saat mengatur menu makanan atau minuman pada modul Produk.
        </div>
      </div>
    </div>
  );
}
