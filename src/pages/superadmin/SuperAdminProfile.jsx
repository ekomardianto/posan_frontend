import React, { useState } from 'react';
import { ShieldCheck, User, Lock, KeyRound, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { updateAdminPassword } from '../../services/authService.js';

export default function SuperAdminProfile() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (title, message, type = 'success') => {
    setFeedback({ title, message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showFeedback('Kata Sandi Lemah', 'Kata sandi baru minimal 6 karakter.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showFeedback('Tidak Cocok', 'Konfirmasi kata sandi baru tidak sesuai.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateAdminPassword(oldPassword, newPassword);
      if (res.success) {
        showFeedback('Kata Sandi Diperbarui', 'Kata sandi akun Super Admin berhasil diubah.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showFeedback('Gagal Mengubah', res.error || 'Kata sandi lama tidak sesuai.', 'error');
      }
    } catch (err) {
      showFeedback('Terjadi Kesalahan', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="superadmin-page-container">
      {feedback && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            backgroundColor: feedback.type === 'error' ? '#7F1D1D' : '#064E3B',
            color: '#FFFFFF',
            padding: '14px 20px',
            borderRadius: 14,
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            border: `1px solid ${feedback.type === 'error' ? '#EF4444' : '#10B981'}`,
          }}
        >
          {feedback.type === 'error' ? <AlertCircle size={20} color="#FCA5A5" /> : <CheckCircle2 size={20} color="#6EE7B7" />}
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.86rem' }}>{feedback.title}</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>{feedback.message}</div>
          </div>
        </div>
      )}

      {/* Profile Overview Card */}
      <section className="superadmin-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 4px 0' }}>
              {user?.name || 'Super Admin POSAN'}
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0, fontFamily: 'monospace' }}>
              superadmin@posan.com &bull; Otoritas Hak Akses Tertinggi
            </p>
          </div>
        </div>
      </section>

      {/* Security & Password Card */}
      <section className="superadmin-card">
        <div className="superadmin-card-header">
          <div>
            <h2 className="superadmin-card-title">Keamanan &amp; Ubah Kata Sandi</h2>
            <p className="superadmin-card-subtitle">
              Pastikan kata sandi akun Super Admin Anda selalu aman dan diperbarui secara berkala
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
              Kata Sandi Saat Ini
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '0.84rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
              Kata Sandi Baru (Minimal 6 Karakter)
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '0.84rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontSize: '0.84rem', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="btn-superadmin-primary"
            style={{ width: 'fit-content', marginTop: 6 }}
          >
            <Save size={16} />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}</span>
          </button>
        </form>
      </section>
    </main>
  );
}
