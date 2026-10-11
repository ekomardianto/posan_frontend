import React, { useState } from 'react';
import {
  Coffee,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  BarChart3
} from 'lucide-react';
import posanLogo from '../../assets/posan-logo.jpg';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingPage from '../../components/ui/LoadingPage.jsx';

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Memverifikasi Sesi Admin...');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Mohon lengkapi email dan kata sandi admin Anda.');
      return;
    }

    setIsLoading(true);
    setLoadingText('Memverifikasi Kredensial Database...');
    try {
      const res = await login(email, password, rememberMe);
      if (res && res.success) {
        setLoadingText(`Selamat datang, ${res.user.name}! Mengalihkan ke Dashboard...`);
        setSuccessMsg(`Selamat datang, ${res.user.name} (${res.user.role})! Masuk ke sistem...`);
      } else {
        setIsLoading(false);
        setErrorMsg(
          res?.error ||
          res?.message ||
          'Email atau kata sandi tidak sesuai. Silakan periksa kembali email dan password Anda.'
        );
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Gagal masuk. Silakan periksa kembali email dan password Anda.');
    }
  };

  return (
    <>
      {isLoading && (
        <LoadingPage
          title={loadingText}
          message="Menghubungkan ke PostgreSQL Cloud posan_db & memverifikasi akun..."
          tip="Aplikasi POS Mobile & Web Admin terintegrasi realtime."
          fullScreen={true}
        />
      )}
      <div className="auth-page-wrapper">
      <div className="auth-container">
        {/* LEFT COLUMN: Brand Showcase */}
        <section className="auth-brand-column" aria-label="POSAN Brand Pitch">
          {/* Header Logo */}
          <div className="auth-brand-header">
            <div className="auth-brand-logo-box">
              <img src={posanLogo} alt="POSAN Logo" className="auth-brand-logo-img" />
            </div>
            <div>
              <h1 className="auth-brand-title">POSAN</h1>
              <span className="auth-brand-subtitle">POS Mobile Cafe Backoffice</span>
            </div>
          </div>

          {/* Main Pitch */}
          <div className="auth-pitch-content">
            <div className="auth-live-badge">
              <span className="time-live-dot pulse-indicator" style={{ backgroundColor: '#4ADE80' }} />
              <span>PostgreSQL Cloud POS Connected</span>
            </div>

            <h2 className="auth-pitch-title">
              Sistem Kasir &amp; Manajemen <span>Kafe Modern</span>
            </h2>

            <p className="auth-pitch-desc">
              Kelola katalog menu artisan, monitor riwayat pesanan real-time dari mesin kasir, dan pantau performa omzet harian dengan aman di database PostgreSQL posan_db.
            </p>

            {/* Feature Highlights */}
            <div className="auth-features-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <RefreshCw size={18} strokeWidth={2.2} />
                </div>
                <div className="auth-feature-text">
                  <h4>Sinkronisasi Realtime Otomatis</h4>
                  <p>Menerima transaksi instan dari aplikasi kasir POS.</p>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <Layers size={18} strokeWidth={2.2} />
                </div>
                <div className="auth-feature-text">
                  <h4>Katalog Menu &amp; Kategori Langsung</h4>
                  <p>Tambah, ubah harga, dan hapus menu langsung tersimpan ke PostgreSQL.</p>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <BarChart3 size={18} strokeWidth={2.2} />
                </div>
                <div className="auth-feature-text">
                  <h4>Analisis Omzet &amp; Ekspor Laporan</h4>
                  <p>Rekapitulasi penjualan lengkap dengan unduhan Excel, PDF &amp; CSV.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="auth-brand-footer">
            <span>&copy; {new Date().getFullYear()} POSAN Backoffice &middot; All Rights Reserved</span>
            <span>Versi Cloud 2.4</span>
          </div>
        </section>

        {/* RIGHT COLUMN: Authentication Form */}
        <section className="auth-form-column" aria-label="Form Login Admin">
          <div className="auth-card animate-fade-in">
            <div className="auth-card-header">
              <h2 className="auth-card-title">Masuk ke Backoffice</h2>
              <p className="auth-card-desc">
                Masukkan email dan kata sandi akun yang terdaftar di database PostgreSQL.
              </p>
            </div>

            {/* Alert Messages */}
            {errorMsg && (
              <div className="auth-alert-box auth-alert-error" role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="auth-alert-box auth-alert-success" role="status">
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleEmailSubmit}>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="auth-email">
                  Alamat Email
                </label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    id="auth-email"
                    type="email"
                    className="auth-input"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="auth-password">
                  Kata Sandi (Password)
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-options-row">
                <label className="auth-remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Ingat sesi saya</span>
                </label>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="spin-icon" />
                    <span>Memverifikasi Database...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight size={16} strokeWidth={2.4} />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}
