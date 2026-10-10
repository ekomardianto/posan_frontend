import React, { useState, useEffect } from 'react';
import {
  Printer,
  Receipt,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Store,
  CreditCard,
  Calendar,
  User,
  Coffee,
  Info,
  Lock,
  ShieldCheck,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAlert } from '../../context/AlertContext.jsx';
import {
  fetchReceiptSettings,
  updateReceiptSettings,
  resetReceiptSettings,
} from '../../services/receiptSettingService.js';

/**
 * Automatically resizes and compresses an image for thermal receipts using HTML Canvas.
 */
export async function compressReceiptLogo(file, maxDimension = 280, quality = 0.82) {
  if (!file) return null;
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const compressedBytes = Math.round((dataUrl.length * 3) / 4);
        const compressedSizeKb = Math.round(compressedBytes / 1024);
        const savingsPercent = originalSizeKb > 0 ? Math.max(0, Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100)) : 0;

        resolve({
          dataUrl,
          originalSizeKb,
          compressedSizeKb,
          savingsPercent,
          width,
          height,
        });
      };
      img.onerror = () => reject(new Error('Gagal membaca format gambar logo.'));
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export default function ReceiptSettingsPage() {
  const { user } = useAuth();
  const alert = useAlert();
  const rawRole = (user?.rawRole || user?.role || '').toLowerCase();
  const isSuperAdmin = rawRole === 'super_admin' || rawRole === 'superadmin';
  const canEdit = rawRole === 'admin' || isSuperAdmin;

  const [settings, setSettings] = useState({
    store_name: 'POSAN Coffee',
    header_title: 'POSAN Coffee',
    header_subtitle: '',
    store_address: '',
    store_phone: '',
    show_logo: true,
    logo_url: '',
    show_order_type: true,
    show_cashier_name: true,
    show_date_time: true,
    bank_info: 'BCA : 034-392-4680\nA.N Nacha Soraya',
    thank_you_message: 'Terimakasih Kak.',
    footer_note: 'Powered by POSAN POS',
    paper_size: '58mm',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressInfo, setCompressInfo] = useState(null);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: 'success' });

  // Sample items matching uploaded thermal receipt photo
  const sampleItems = [
    {
      name: 'Coffeematcha',
      options: 'Cold,Dine in',
      qty: 1,
      unitPrice: 25000,
      subtotal: 25000,
    },
    {
      name: 'Saltedcaramel',
      options: 'Cold,Takeaway',
      qty: 1,
      unitPrice: 23000,
      subtotal: 23000,
    },
    {
      name: 'MIX PLATTER',
      options: 'DINE IN',
      qty: 1,
      unitPrice: 28000,
      subtotal: 28000,
    },
  ];

  const totalAmount = sampleItems.reduce((sum, it) => sum + it.subtotal, 0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchReceiptSettings();
      if (data) {
        setSettings({
          store_name: data.store_name || 'CIP Coffee',
          header_title: data.header_title || data.store_name || 'CIP Coffee',
          header_subtitle: data.header_subtitle || '',
          store_address: data.store_address || '',
          store_phone: data.store_phone || '',
          show_logo: data.show_logo ?? true,
          logo_url: data.logo_url || '',
          show_order_type: data.show_order_type ?? true,
          show_cashier_name: data.show_cashier_name ?? true,
          show_date_time: data.show_date_time ?? true,
          bank_info: data.bank_info || 'BRK : 165-27-00044\nBCA : 034-392-4680\nA.N Nacha Soraya',
          thank_you_message: data.thank_you_message || 'Terimakasih Kak.',
          footer_note: data.footer_note || 'Powered by POSAN POS',
          paper_size: data.paper_size || '58mm',
        });
      }
    } catch (err) {
      showFeedback('Gagal memuat pengaturan struk: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showFeedback = (message, type = 'success') => {
    setFeedback({ show: true, message, type });
    setTimeout(() => {
      setFeedback({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('Harap pilih file gambar (JPG, PNG, atau WebP).', 'error');
      return;
    }

    setIsCompressing(true);
    try {
      const result = await compressReceiptLogo(file, 280, 0.82);
      if (result) {
        setSettings((prev) => ({
          ...prev,
          logo_url: result.dataUrl,
        }));
        setCompressInfo({
          originalSizeKb: result.originalSizeKb,
          compressedSizeKb: result.compressedSizeKb,
          savingsPercent: result.savingsPercent,
          dimensions: `${result.width}x${result.height}px`,
        });
        showFeedback(
          `Logo berhasil diupload & dikompres otomatis (${result.originalSizeKb}KB ➔ ${result.compressedSizeKb}KB, Hemat ${result.savingsPercent}%)!`
        );
      }
    } catch (err) {
      showFeedback('Gagal mengompres gambar logo: ' + err.message, 'error');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setSettings((prev) => ({
      ...prev,
      logo_url: '',
    }));
    setCompressInfo(null);
    showFeedback('Foto logo struk dihapus (menggunakan ikon bawaan).');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateReceiptSettings(settings);
      showFeedback('Pengaturan header & footer struk berhasil disimpan!');
    } catch (err) {
      showFeedback('Gagal menyimpan pengaturan: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed = await alert.confirm({
      title: 'Reset Template Struk',
      message: 'Apakah Anda yakin ingin mereset pengaturan struk ke template standar CIP Coffee?',
      confirmText: 'Ya, Reset',
      cancelText: 'Batal',
      type: 'warning',
      icon: RotateCcw,
    });

    if (confirmed) {
      setIsSaving(true);
      try {
        const res = await resetReceiptSettings();
        if (res.settings) {
          setSettings(res.settings);
        }
        showFeedback('Pengaturan struk berhasil di-reset ke template standar!');
      } catch (err) {
        showFeedback('Gagal mereset pengaturan: ' + err.message, 'error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div style={{ padding: '24px 32px 48px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast Feedback */}
      {feedback.show && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 20px',
            borderRadius: 14,
            backgroundColor: feedback.type === 'error' ? '#881337' : '#064E3B',
            color: '#FFFFFF',
            fontSize: '0.88rem',
            fontWeight: 700,
            boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
            border: `1px solid ${feedback.type === 'error' ? '#BE123C' : '#059669'}`,
          }}
        >
          {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E1712 0%, #2A1E17 50%, #43281C 100%)',
          borderRadius: 24,
          padding: '28px 32px',
          color: '#FFFFFF',
          marginBottom: 28,
          boxShadow: '0 10px 30px rgba(42, 30, 23, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              borderRadius: 20,
              backgroundColor: 'rgba(212, 163, 115, 0.2)',
              color: '#D4A373',
              fontSize: '0.78rem',
              fontWeight: 700,
              marginBottom: 10,
              border: '1px solid rgba(212, 163, 115, 0.3)',
            }}
          >
            <Printer size={14} />
            <span>Kustomisasi Struk Thermal</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Pengaturan Header & Footer Struk
          </h1>
          <p style={{ margin: '6px 0 0 0', color: '#D5C7B8', fontSize: '0.88rem', maxWidth: 650 }}>
            Konfigurasi teks judul struk, info transfer bank, ucapan terima kasih, serta ukuran kertas thermal Bluetooth (58mm/80mm).
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {canEdit ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving || isLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#FAF6F0',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.18)',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={15} color="#D4A373" />
                <span>Reset Standar</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || isLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 22px',
                  borderRadius: 12,
                  backgroundColor: '#BA6A34',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(186, 106, 52, 0.4)',
                  cursor: 'pointer',
                }}
              >
                <Save size={15} />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#FEF3C7',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: '1px solid rgba(254, 243, 199, 0.25)',
              }}
            >
              <Lock size={15} className="text-amber-300" />
              <span>Khusus Admin Outlet (Read-Only)</span>
            </div>
          )}
        </div>
      </div>

      {/* Non-Admin Notice Banner */}
      {!canEdit && (
        <div
          style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706',
              flexShrink: 0,
            }}
          >
            <Lock size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#92400E', marginBottom: 2 }}>
              Akses Terbatas: Hanya Admin Outlet Yang Dapat Mengubah
            </div>
            <div style={{ fontSize: '0.8rem', color: '#B45309', lineHeight: 1.45 }}>
              Konfigurasi Header dan Footer struk thermal printer hanya dapat diubah dan disimpan oleh akun <strong>Admin Outlet</strong>. Anda saat ini melihat pratinjau struk dalam mode <em>Read-Only</em>.
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout: Form & Thermal Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(360px, 0.9fr)', gap: 28, alignItems: 'start' }}>
        {/* Left Side: Setting Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #ECE4D9',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid #F1EBE2', marginBottom: 18 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#C2410C',
                }}
              >
                <Store size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1E1712' }}>
                  Header Struk (Bagian Atas)
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#7E7569' }}>
                  Judul cafe, alamat, telepon, dan opsi waktu/kasir
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Foto / Logo Cafe Uploader with Auto-Compression */}
              <div
                style={{
                  backgroundColor: '#FAF7F2',
                  border: '1px solid #ECE4D9',
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#2A1E17', margin: 0 }}>
                      Foto / Logo Cafe Struk
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#7E7569' }}>
                      Mendukung JPG, PNG, WebP. Dikompres otomatis agar hemat memori & print lancar.
                    </span>
                  </div>
                  {compressInfo && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#047857',
                        backgroundColor: '#D1FAE5',
                        border: '1px solid #A7F3D0',
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      Hemat {compressInfo.savingsPercent}% ({compressInfo.compressedSizeKb} KB)
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Thumbnail Preview */}
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 14,
                      backgroundColor: '#FFFFFF',
                      border: '2px dashed #D8CEBE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    {isCompressing ? (
                      <Loader2 size={24} className="animate-spin text-amber-600" />
                    ) : settings.logo_url ? (
                      <img
                        src={settings.logo_url}
                        alt="Preview Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
                      />
                    ) : (
                      <Coffee size={28} color="#A89989" />
                    )}
                  </div>

                  {/* Actions & File Input */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 14px',
                          borderRadius: 10,
                          backgroundColor: canEdit ? '#BA6A34' : '#E2D9CC',
                          color: '#FFFFFF',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: canEdit && !isCompressing ? 'pointer' : 'not-allowed',
                          boxShadow: '0 2px 6px rgba(186, 106, 52, 0.25)',
                        }}
                      >
                        <UploadCloud size={15} />
                        <span>{isCompressing ? 'Mengompres...' : settings.logo_url ? 'Ganti Foto Logo' : 'Upload Foto Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={!canEdit || isCompressing}
                          style={{ display: 'none' }}
                        />
                      </label>

                      {settings.logo_url && canEdit && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          disabled={isCompressing}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 12px',
                            borderRadius: 10,
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Hapus Logo</span>
                        </button>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.71rem', color: '#8C7E72', lineHeight: 1.35 }}>
                      ⚡ Otomatis di-resize (max 280px) & dikompresi ke format thermal (&lt; 30 KB) saat file dipilih.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B3F35', marginBottom: 6 }}>
                    Subtitle / Slogan
                  </label>
                  <input
                    type="text"
                    value={settings.header_subtitle}
                    onChange={(e) => handleChange('header_subtitle', e.target.value)}
                    disabled={!canEdit}
                    placeholder="Contoh: Coffee & Eatery"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: '1px solid #D8CEBE',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: !canEdit ? '#F9F6F0' : '#FFFFFF',
                      cursor: !canEdit ? 'not-allowed' : 'text',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B3F35', marginBottom: 6 }}>
                    No. Telepon / WA
                  </label>
                  <input
                    type="text"
                    value={settings.store_phone}
                    onChange={(e) => handleChange('store_phone', e.target.value)}
                    disabled={!canEdit}
                    placeholder="0812-3456-7890"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: '1px solid #D8CEBE',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: !canEdit ? '#F9F6F0' : '#FFFFFF',
                      cursor: !canEdit ? 'not-allowed' : 'text',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B3F35', marginBottom: 6 }}>
                  Alamat Gerai / Outlet
                </label>
                <input
                  type="text"
                  value={settings.store_address}
                  onChange={(e) => handleChange('store_address', e.target.value)}
                  disabled={!canEdit}
                  placeholder="Jl. Raya No. 12, Pekanbaru"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid #D8CEBE',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: !canEdit ? '#F9F6F0' : '#FFFFFF',
                    cursor: !canEdit ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              {/* Toggles */}
              <div style={{ paddingTop: 12, borderTop: '1px solid #F1EBE2', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, backgroundColor: '#FAF7F2', border: '1px solid #ECE4D9', cursor: !canEdit ? 'not-allowed' : 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Coffee size={16} color="#7E7569" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E1712' }}>Tampilkan Logo Cafe di Atas Header</div>
                      <div style={{ fontSize: '0.72rem', color: '#7E7569' }}>Cetak logo / ikon brand cafe di bagian paling atas struk</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.show_logo !== false}
                    disabled={!canEdit}
                    onChange={(e) => handleChange('show_logo', e.target.checked)}
                    style={{ width: 16, height: 16, cursor: !canEdit ? 'not-allowed' : 'pointer' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, backgroundColor: '#FAF7F2', border: '1px solid #ECE4D9', cursor: !canEdit ? 'not-allowed' : 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Calendar size={16} color="#7E7569" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E1712' }}>Tampilkan Waktu Transaksi</div>
                      <div style={{ fontSize: '0.72rem', color: '#7E7569' }}>Cetak baris "Waktu : 28 Sep 2026 17:49"</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.show_date_time}
                    disabled={!canEdit}
                    onChange={(e) => handleChange('show_date_time', e.target.checked)}
                    style={{ width: 16, height: 16, cursor: !canEdit ? 'not-allowed' : 'pointer' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, backgroundColor: '#FAF7F2', border: '1px solid #ECE4D9', cursor: !canEdit ? 'not-allowed' : 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <User size={16} color="#7E7569" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E1712' }}>Tampilkan Nama Kasir</div>
                      <div style={{ fontSize: '0.72rem', color: '#7E7569' }}>Cetak baris "Kasir : Raya"</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.show_cashier_name}
                    disabled={!canEdit}
                    onChange={(e) => handleChange('show_cashier_name', e.target.checked)}
                    style={{ width: 16, height: 16, cursor: !canEdit ? 'not-allowed' : 'pointer' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, backgroundColor: '#FAF7F2', border: '1px solid #ECE4D9', cursor: !canEdit ? 'not-allowed' : 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Coffee size={16} color="#7E7569" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E1712' }}>Tampilkan Tipe Layanan (DINE-IN)</div>
                      <div style={{ fontSize: '0.72rem', color: '#7E7569' }}>Cetak banner pemisah DINE-IN / TAKE-AWAY</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.show_order_type}
                    disabled={!canEdit}
                    onChange={(e) => handleChange('show_order_type', e.target.checked)}
                    style={{ width: 16, height: 16, cursor: !canEdit ? 'not-allowed' : 'pointer' }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Footer Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #ECE4D9',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid #F1EBE2', marginBottom: 18 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #D1FAE5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669',
                }}
              >
                <CreditCard size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1E1712' }}>
                  Footer Struk (Bagian Bawah)
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#7E7569' }}>
                  Rekening transfer bank, ucapan penutup, dan ukuran kertas
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B3F35', marginBottom: 6 }}>
                  Informasi Rekening Bank / Transfer (Bisa Multi-Baris)
                </label>
                <textarea
                  rows={4}
                  value={settings.bank_info}
                  onChange={(e) => handleChange('bank_info', e.target.value)}
                  disabled={!canEdit}
                  placeholder="BRK : 165-27-00044&#10;BCA : 034-392-4680&#10;A.N Nacha Soraya"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid #D8CEBE',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    lineHeight: 1.5,
                    backgroundColor: !canEdit ? '#F9F6F0' : '#FFFFFF',
                    cursor: !canEdit ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#4B3F35', marginBottom: 6 }}>
                  Ucapan Terima Kasih
                </label>
                <input
                  type="text"
                  value={settings.thank_you_message}
                  onChange={(e) => handleChange('thank_you_message', e.target.value)}
                  disabled={!canEdit}
                  placeholder="Terimakasih Kak."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid #D8CEBE',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: !canEdit ? '#F9F6F0' : '#FFFFFF',
                    cursor: !canEdit ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4B3F35', margin: 0 }}>
                    Catatan Kaki / Powered by Branding
                  </label>
                  {!isSuperAdmin ? (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#B45309',
                        backgroundColor: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        padding: '2px 8px',
                        borderRadius: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Lock size={12} />
                      <span>Khusus Super Admin</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#047857',
                        backgroundColor: '#D1FAE5',
                        border: '1px solid #A7F3D0',
                        padding: '2px 8px',
                        borderRadius: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <ShieldCheck size={12} />
                      <span>Akses Super Admin</span>
                    </span>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={settings.footer_note}
                    onChange={(e) => handleChange('footer_note', e.target.value)}
                    disabled={!isSuperAdmin}
                    placeholder="Powered by POSAN POS"
                    style={{
                      width: '100%',
                      padding: !isSuperAdmin ? '10px 14px 10px 38px' : '10px 14px',
                      borderRadius: 12,
                      border: !isSuperAdmin ? '1px solid #E2D9CC' : '1px solid #D8CEBE',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: !isSuperAdmin ? '#F5EFE6' : '#FFFFFF',
                      color: !isSuperAdmin ? '#786A5E' : '#2C221E',
                      cursor: !isSuperAdmin ? 'not-allowed' : 'text',
                      fontWeight: !isSuperAdmin ? 600 : 400,
                    }}
                  />
                  {!isSuperAdmin && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#A89989',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Lock size={16} />
                    </div>
                  )}
                </div>
                {!isSuperAdmin && (
                  <p style={{ fontSize: '0.72rem', color: '#8C7E72', margin: '5px 0 0 0', lineHeight: 1.35 }}>
                    Branding platform sistem dikunci dan hanya dapat diubah melalui portal Super Admin.
                  </p>
                )}
              </div>

              {/* Paper Size Radio */}
              <div style={{ paddingTop: 12, borderTop: '1px solid #F1EBE2' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4B3F35', margin: 0 }}>
                    Pratinjau &amp; Default Lebar Kertas Struk
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600, backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: 6, border: '1px solid #A7F3D0' }}>
                    ✨ Auto-detect di Kasir
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#786A5E', marginBottom: 10, lineHeight: 1.4 }}>
                  Aplikasi Kasir POSAN mendeteksi ukuran kertas (58mm/80mm) secara otomatis saat terhubung ke printer Bluetooth. Pengaturan di bawah digunakan sebagai format pratinjau dan nilai bawaan.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: settings.paper_size === '58mm' ? '2px solid #BA6A34' : '1px solid #D8CEBE',
                      backgroundColor: settings.paper_size === '58mm' ? '#FFF8F3' : '#FFFFFF',
                      cursor: !canEdit ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Printer size={16} color="#BA6A34" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>58 mm (Mobile POS)</span>
                    </div>
                    <input
                      type="radio"
                      name="paper_size"
                      value="58mm"
                      disabled={!canEdit}
                      checked={settings.paper_size === '58mm'}
                      onChange={(e) => handleChange('paper_size', e.target.value)}
                    />
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: settings.paper_size === '80mm' ? '2px solid #BA6A34' : '1px solid #D8CEBE',
                      backgroundColor: settings.paper_size === '80mm' ? '#FFF8F3' : '#FFFFFF',
                      cursor: !canEdit ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Printer size={16} color="#BA6A34" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>80 mm (Desktop POS)</span>
                    </div>
                    <input
                      type="radio"
                      name="paper_size"
                      value="80mm"
                      disabled={!canEdit}
                      checked={settings.paper_size === '80mm'}
                      onChange={(e) => handleChange('paper_size', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Right Side: Thermal Live Preview Mockup */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div
            style={{
              backgroundColor: '#1E1712',
              borderRadius: 24,
              padding: 24,
              color: '#FAF6F0',
              boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
              border: '1px solid #362920',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid #362920', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={16} color="#D4A373" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Live Thermal Preview</span>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  padding: '3px 8px',
                  borderRadius: 6,
                  backgroundColor: '#2A1E17',
                  color: '#D4A373',
                  border: '1px solid #43281C',
                }}
              >
                {settings.paper_size}
              </span>
            </div>

            {/* Realistic Thermal Receipt Paper */}
            <div
              style={{
                backgroundColor: '#FFFFFE',
                color: '#111111',
                borderRadius: 14,
                padding: '20px 20px 24px 20px',
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '0.78rem',
                lineHeight: 1.4,
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.2)',
                border: '1px solid #DDD6CD',
                maxWidth: 320,
                margin: '0 auto',
              }}
            >
              {/* Header: Store Logo & Name */}
              <div style={{ textAlign: 'center', paddingBottom: 10 }}>
                {settings.show_logo !== false && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                    {settings.logo_url ? (
                      <img
                        src={settings.logo_url}
                        alt="Logo Cafe"
                        style={{ width: 56, height: 56, objectFit: 'contain', filter: 'grayscale(100%) contrast(150%)' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          border: '2px solid #1E1712',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#FAF7F2',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        }}
                      >
                        <Coffee size={24} color="#1E1712" strokeWidth={2.4} />
                      </div>
                    )}
                  </div>
                )}
                {settings.header_subtitle && (
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#333' }}>
                    {settings.header_subtitle}
                  </div>
                )}
                {settings.store_address && (
                  <div style={{ fontSize: '0.68rem', color: '#555' }}>
                    {settings.store_address}
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div style={{ borderTop: '1px dashed #777', padding: '6px 0', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>No. Struk :</span>
                  <span style={{ fontWeight: 800 }}>#RAB-071026-3633</span>
                </div>
                {settings.show_date_time && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Waktu :</span>
                    <span>28 Sep 2026 17:49</span>
                  </div>
                )}
                {settings.show_cashier_name && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Kasir :</span>
                    <span>Raya</span>
                  </div>
                )}
                {settings.store_phone && settings.store_phone.trim() && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>No. HP :</span>
                    <span>{settings.store_phone}</span>
                  </div>
                )}
              </div>

              {/* Order Type Banner */}
              {settings.show_order_type && (
                <div style={{ borderTop: '1px dashed #777', borderBottom: '1px dashed #777', padding: '4px 0', textAlign: 'center', fontWeight: 900, letterSpacing: '0.1em', fontSize: '0.75rem' }}>
                  DINE-IN
                </div>
              )}

              {/* Items List */}
              <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sampleItems.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ fontWeight: 800, fontSize: '0.78rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#555', fontStyle: 'italic' }}>{item.options}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span>{formatRupiah(item.unitPrice)} x{item.qty}</span>
                      <span style={{ fontWeight: 700 }}>{formatRupiah(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1px dashed #777', padding: '6px 0', display: 'flex', flexDirection: 'column', gap: 3, fontSize: '0.78rem', fontWeight: 800 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total</span>
                  <span>Rp {formatRupiah(totalAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>QRIS</span>
                  <span>Rp {formatRupiah(totalAmount)}</span>
                </div>
              </div>

              {/* Footer Note & Bank Info */}
              <div style={{ borderTop: '1px dashed #777', paddingTop: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {settings.bank_info && (
                  <div style={{ fontSize: '0.7rem', color: '#222', whiteSpace: 'pre-line', lineHeight: 1.4, fontWeight: 600 }}>
                    {settings.bank_info}
                  </div>
                )}
                {settings.thank_you_message && (
                  <div style={{ fontSize: '0.76rem', fontWeight: 800 }}>
                    {settings.thank_you_message}
                  </div>
                )}
                {settings.footer_note && (
                  <div style={{ fontSize: '0.65rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', paddingTop: 2 }}>
                    {settings.footer_note}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.74rem', color: '#A89F91' }}>
              <Info size={13} color="#D4A373" />
              <span>Format struk sinkron otomatis ke smartphone kasir & printer thermal.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
