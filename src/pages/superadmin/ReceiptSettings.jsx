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
  HeartHandshake,
  Sparkles,
  Info,
  Calendar,
  User,
  Coffee,
  Check,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { receiptSettingService } from '../../services/receiptSettingService';

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
          dimensions: `${width}x${height}px`,
        });
      };
      img.onerror = () => reject(new Error('Gagal membaca format gambar logo.'));
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export default function ReceiptSettings() {
  const [settings, setSettings] = useState({
    store_name: 'CIP Coffee',
    header_title: 'CIP Coffee',
    header_subtitle: '',
    store_address: '',
    store_phone: '',
    show_logo: true,
    logo_url: '',
    show_order_type: true,
    show_cashier_name: true,
    show_date_time: true,
    bank_info: 'BRK : 165-27-00044\nBCA : 034-392-4680\nA.N Nacha Soraya',
    thank_you_message: 'Terimakasih Kak.',
    footer_note: 'Powered by POSAN POS',
    paper_size: '58mm',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressInfo, setCompressInfo] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Sample receipt data for live preview (matching photo)
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
      const data = await receiptSettingService.getReceiptSettings();
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
      showToast('Gagal memuat pengaturan struk: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
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
      showToast('Harap pilih file gambar (JPG, PNG, atau WebP).', 'error');
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
        showToast(
          `Logo berhasil diupload & dikompres otomatis (${result.originalSizeKb}KB ➔ ${result.compressedSizeKb}KB, Hemat ${result.savingsPercent}%)!`
        );
      }
    } catch (err) {
      showToast('Gagal mengompres gambar logo: ' + err.message, 'error');
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
    showToast('Foto logo struk dihapus (menggunakan ikon bawaan).');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await receiptSettingService.updateReceiptSettings(settings);
      showToast('Pengaturan struk transaksi berhasil disimpan dan disinkronkan ke POS!');
    } catch (err) {
      showToast('Gagal menyimpan pengaturan: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset pengaturan struk ke template standar CIP Coffee?')) {
      setIsSaving(true);
      try {
        const res = await receiptSettingService.resetReceiptSettings();
        if (res.settings) {
          setSettings(res.settings);
        }
        showToast('Pengaturan struk berhasil di-reset ke template standar!');
      } catch (err) {
        showToast('Gagal mereset pengaturan: ' + err.message, 'error');
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === 'error'
              ? 'bg-rose-900/95 text-rose-100 border-rose-700 shadow-rose-950/40'
              : 'bg-emerald-900/95 text-emerald-100 border-emerald-700 shadow-emerald-950/40'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Printer className="w-3.5 h-3.5" />
              <span>Printer & Struk Transaksi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pengaturan Header & Footer Struk
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Atur format tampilan struk cetak kasir (nama toko, info rekening bank, ucapan terima kasih, dan ukuran kertas thermal 58mm/80mm) secara terpusat untuk seluruh gerai.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Reset Template</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form & Live Thermal Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Configuration Forms (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. Header Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Header Struk (Bagian Atas)</h2>
                  <p className="text-xs text-slate-500">Nama brand cafe, alamat, kontak, dan opsi metadata</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Logo Uploader with Auto Compression */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-slate-900">
                        Foto / Logo Cafe Struk
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Mendukung JPG, PNG, WebP. Dikompres otomatis agar hemat memori & print lancar.
                      </span>
                    </div>
                    {compressInfo && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                        Hemat {compressInfo.savingsPercent}% ({compressInfo.compressedSizeKb} KB)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Thumbnail Preview */}
                    <div className="w-16 h-16 rounded-xl bg-white border-2 border-dashed border-amber-300 flex items-center justify-center shrink-0 overflow-hidden shadow-xs relative">
                      {isCompressing ? (
                        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                      ) : settings.logo_url ? (
                        <img
                          src={settings.logo_url}
                          alt="Logo Preview"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <Coffee className="w-7 h-7 text-amber-400" />
                      )}
                    </div>

                    {/* Actions & File Input */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs cursor-pointer transition">
                          <UploadCloud className="w-4 h-4" />
                          <span>{isCompressing ? 'Mengompres...' : settings.logo_url ? 'Ganti Foto Logo' : 'Upload Foto Logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={isCompressing}
                            className="hidden"
                          />
                        </label>

                        {settings.logo_url && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            disabled={isCompressing}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 cursor-pointer transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Logo</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        ⚡ Otomatis di-resize (max 280px) & dikompresi ke format thermal (&lt; 30 KB) saat file dipilih.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Subtitle / Slogan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={settings.header_subtitle}
                      onChange={(e) => handleChange('header_subtitle', e.target.value)}
                      placeholder="Contoh: Specialty Coffee & Roastery"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={settings.store_phone}
                      onChange={(e) => handleChange('store_phone', e.target.value)}
                      placeholder="Contoh: 0812-3456-7890"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alamat Outlet / Gerai (Opsional)
                  </label>
                  <input
                    type="text"
                    value={settings.store_address}
                    onChange={(e) => handleChange('store_address', e.target.value)}
                    placeholder="Contoh: Jl. Sudirman No. 45, Pekanbaru"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                {/* Header Toggles */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 block mb-2">Opsi Tampilan Metadata Struk</span>
                  
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer border border-slate-200/60 transition">
                    <div className="flex items-center gap-2.5">
                      <Coffee className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Tampilkan Logo Cafe di Atas Header</p>
                        <p className="text-[11px] text-slate-500">Mencetak logo / ikon brand cafe di paling atas struk</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.show_logo !== false}
                      onChange={(e) => handleChange('show_logo', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer border border-slate-200/60 transition">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Tampilkan Waktu & Tanggal</p>
                        <p className="text-[11px] text-slate-500">Mencetak baris "Waktu : 28 Sep 2026 17:49"</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.show_date_time}
                      onChange={(e) => handleChange('show_date_time', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer border border-slate-200/60 transition">
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Tampilkan Nama Kasir</p>
                        <p className="text-[11px] text-slate-500">Mencetak baris "Kasir : [Nama Kasir]"</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.show_cashier_name}
                      onChange={(e) => handleChange('show_cashier_name', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer border border-slate-200/60 transition">
                    <div className="flex items-center gap-2.5">
                      <Coffee className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Tampilkan Tipe Layanan (DINE-IN / TAKE-AWAY)</p>
                        <p className="text-[11px] text-slate-500">Mencetak banner pemisah tipe pesanan meja</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.show_order_type}
                      onChange={(e) => handleChange('show_order_type', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 2. Footer Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Footer Struk (Bagian Bawah)</h2>
                  <p className="text-xs text-slate-500">Informasi rekening transfer, ucapan terima kasih, dan branding</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Informasi Rekening Bank / Pembayaran Transfer (Bisa Multi-Baris)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.bank_info}
                    onChange={(e) => handleChange('bank_info', e.target.value)}
                    placeholder="Contoh:&#10;BRK : 165-27-00044&#10;BCA : 034-392-4680&#10;A.N Nacha Soraya"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Gunakan enter untuk baris baru (misal no. rekening bank BCA, Mandiri, QRIS, dll).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ucapan Terima Kasih / Pesan Penutup
                  </label>
                  <input
                    type="text"
                    value={settings.thank_you_message}
                    onChange={(e) => handleChange('thank_you_message', e.target.value)}
                    placeholder="Contoh: Terimakasih Kak."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Catatan Kaki / Powered by Branding
                  </label>
                  <input
                    type="text"
                    value={settings.footer_note}
                    onChange={(e) => handleChange('footer_note', e.target.value)}
                    placeholder="Contoh: Powered by POSAN POS"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                {/* Paper Size Selector */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Ukuran Lebar Kertas Thermal Printer
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        settings.paper_size === '58mm'
                          ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-amber-600" />
                        <span className="text-xs">58 mm (Standar Mobile)</span>
                      </div>
                      <input
                        type="radio"
                        name="paper_size"
                        value="58mm"
                        checked={settings.paper_size === '58mm'}
                        onChange={(e) => handleChange('paper_size', e.target.value)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                    </label>

                    <label
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        settings.paper_size === '80mm'
                          ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-amber-600" />
                        <span className="text-xs">80 mm (Desktop POS)</span>
                      </div>
                      <input
                        type="radio"
                        name="paper_size"
                        value="80mm"
                        checked={settings.paper_size === '80mm'}
                        onChange={(e) => handleChange('paper_size', e.target.value)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Reset ke Standar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi Struk'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Live Thermal Receipt Preview (5 Cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">Live Thermal Receipt Preview</h3>
              </div>
              <span className="text-[11px] font-mono bg-slate-800 px-2.5 py-1 rounded-full text-amber-400 border border-slate-700">
                {settings.paper_size}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Tampilan struk di bawah ini persis seperti yang akan dicetak oleh printer thermal Bluetooth kasir:
            </p>

            {/* Thermal Paper Realistic Mockup */}
            <div className="bg-[#FFFFFE] text-[#111111] p-5 sm:p-6 rounded-xl shadow-inner font-mono text-xs border border-slate-300 select-none max-w-[340px] mx-auto transition-all">
              {/* Header Logo / Store Name */}
              <div className="text-center space-y-1 pb-3">
                {settings.show_logo !== false && (
                  <div className="flex justify-center items-center pb-1">
                    {settings.logo_url ? (
                      <img
                        src={settings.logo_url}
                        alt="Logo Cafe"
                        className="w-14 h-14 object-contain grayscale contrast-150"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl border-2 border-slate-900 flex items-center justify-center bg-slate-50 shadow-xs">
                        <Coffee className="w-6 h-6 text-slate-900 stroke-[2.4]" />
                      </div>
                    )}
                  </div>
                )}
                {settings.header_subtitle && (
                  <p className="text-[11px] text-gray-700 font-bold">{settings.header_subtitle}</p>
                )}
                {settings.store_address && (
                  <p className="text-[10px] text-gray-600 leading-tight">{settings.store_address}</p>
                )}
              </div>

              {/* Header Metadata */}
              <div className="py-2 border-t border-dashed border-gray-400 space-y-1 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>No. Struk :</span>
                  <span>#RAB-071026-3633</span>
                </div>
                {settings.show_date_time && (
                  <div className="flex justify-between">
                    <span>Waktu :</span>
                    <span>28 Sep 2026 17:49</span>
                  </div>
                )}
                {settings.show_cashier_name && (
                  <div className="flex justify-between">
                    <span>Kasir :</span>
                    <span>Raya</span>
                  </div>
                )}
                {settings.store_phone && settings.store_phone.trim() && (
                  <div className="flex justify-between">
                    <span>No. HP :</span>
                    <span>{settings.store_phone}</span>
                  </div>
                )}
              </div>

              {/* Order Type Banner */}
              {settings.show_order_type && (
                <div className="py-1.5 border-t border-b border-dashed border-gray-400 text-center font-black tracking-widest text-[11px]">
                  DINE-IN
                </div>
              )}

              {/* Item List */}
              <div className="py-3 space-y-3">
                {sampleItems.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold text-[12px]">{item.name}</div>
                    <div className="text-[10px] text-gray-600 italic">{item.options}</div>
                    <div className="flex justify-between text-[11px]">
                      <span>{formatRupiah(item.unitPrice)} x{item.qty}</span>
                      <span className="font-semibold">{formatRupiah(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals & Payment */}
              <div className="py-2 border-t border-dashed border-gray-400 space-y-1 text-[12px]">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>Rp {formatRupiah(totalAmount)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>QRIS</span>
                  <span>Rp {formatRupiah(totalAmount)}</span>
                </div>
              </div>

              {/* Footer Section */}
              <div className="pt-3 border-t border-dashed border-gray-400 space-y-3 text-center">
                {/* Bank Info */}
                {settings.bank_info && (
                  <div className="text-[10.5px] text-gray-800 whitespace-pre-line font-medium leading-relaxed">
                    {settings.bank_info}
                  </div>
                )}

                {/* Thank You Note */}
                {settings.thank_you_message && (
                  <div className="text-[11.5px] font-bold text-black">
                    {settings.thank_you_message}
                  </div>
                )}

                {/* Branding Footer */}
                {settings.footer_note && (
                  <div className="text-[9.5px] text-gray-500 pt-1 tracking-wider uppercase">
                    {settings.footer_note}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Format struk sinkron otomatis ke aplikasi kasir smartphone.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
