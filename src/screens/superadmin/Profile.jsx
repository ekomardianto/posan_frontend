import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  KeyRound,
  Lock,
  History,
  Bell,
  Mail,
  Save,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { dashboardService } from '../../services/dashboardService';
import { getApiBaseUrl } from '../../services/apiClient';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'security' | 'activity' | 'preferences'
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    fullName: profile?.name || user?.name || 'Super Administrator POSAN',
    email: profile?.email || user?.email || 'superadmin@posan.com',
    role: 'super_admin',
    timezone: 'Asia/Jakarta (WIB - UTC+7)',
    language: 'Bahasa Indonesia (ID)',
  });

  useEffect(() => {
    if (profile || user) {
      const current = profile || user;
      setProfileData((prev) => ({
        ...prev,
        fullName: current.name || prev.fullName,
        email: current.email || prev.email,
        role: current.role || prev.role,
      }));
    }
  }, [profile, user]);

  // Load live activity logs from database
  const loadLogs = useCallback(async () => {
    try {
      const logs = await dashboardService.getRecentActivities();
      setAuditLogs(logs);
    } catch (e) {
      console.warn('Failed to load audit logs:', e);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Security Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const userId = profile?.id || user?.id;
    if (!userId) return;

    try {
      setLoading(true);
      await userService.updateUser(userId, {
        name: profileData.fullName,
        email: profileData.email,
        role: 'super_admin',
      });

      if (refreshProfile) await refreshProfile();
      triggerToast('Informasi profil Super Admin berhasil disimpan ke database!');
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok dengan kata sandi baru!');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal 6 karakter!');
      return;
    }

    const userId = profile?.id || user?.id;
    if (!userId) return;

    try {
      setLoading(true);
      await userService.updateUser(userId, {
        name: profileData.fullName,
        email: profileData.email,
        role: 'super_admin',
        password: passwordForm.newPassword,
      });

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      triggerToast('Kata sandi Super Admin berhasil diperbarui di database!');
    } catch (err) {
      setErrorMessage(err.message || 'Gagal mengubah kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-5">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Profile Banner */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-md ring-4 ring-slate-100">
              {profileData.fullName
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'SA'}
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center"
              title="Super Admin Online"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {profileData.fullName}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                SUPER ADMIN
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Database terhubung
              </span>
            </div>

            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {profileData.email}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-400">ID: #{profile?.id || user?.id || '3'}</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">Database terhubung</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <Button
            variant="primary"
            size="sm"
            icon={KeyRound}
            onClick={() => setActiveTab('security')}
          >
            Ubah Kata Sandi
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 2. Tabs Navigation */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-1.5 shadow-sm flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'account'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Informasi Akun</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Keamanan & Password</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Log Aktivitas database</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Pengaturan Sistem</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: INFORMASI AKUN */}
      {activeTab === 'account' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-sm">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Profil Super Admin</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Informasi akun master administrator.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                Role: super_admin
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <Input
                label="Nama Lengkap"
                required
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              />

              <Input
                label="Alamat Email (Login)"
                type="email"
                required
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                helperText="Email yang digunakan untuk autentikasi sistem."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Zona Waktu Sistem"
                  value={profileData.timezone}
                  onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                  options={[
                    { value: 'Asia/Jakarta (WIB - UTC+7)', label: 'Asia/Jakarta (WIB - UTC+7)' },
                    { value: 'Asia/Makassar (WITA - UTC+8)', label: 'Asia/Makassar (WITA - UTC+8)' },
                    { value: 'Asia/Jayapura (WIT - UTC+9)', label: 'Asia/Jayapura (WIT - UTC+9)' },
                  ]}
                />
                <Select
                  label="Bahasa Antarmuka"
                  value={profileData.language}
                  onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                  options={[
                    { value: 'Bahasa Indonesia (ID)', label: 'Bahasa Indonesia (ID)' },
                    { value: 'English (US)', label: 'English (US)' },
                  ]}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  icon={loading ? Loader2 : Save}
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </div>

          {/* Quick Info Box */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Status Koneksi Database
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">
                    Status Layanan
                  </span>
                  <p className="font-bold text-emerald-700">Database terhubung</p>
                  <p className="text-slate-500">Layanan aplikasi aktif.</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">
                    Status Otoritas
                  </span>
                  <p className="font-bold text-emerald-700">Full Super Admin Access</p>
                  <p className="text-slate-500">Mencakup Admin, Kasir, Menu, & Transaksi</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">
                    Sinkronisasi Data
                  </span>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Koneksi database aktif</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KEAMANAN & PASSWORD */}
      {activeTab === 'security' && (
        <div className="max-w-2xl bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ubah Kata Sandi Super Admin</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kata sandi baru akan di-hash secara aman menggunakan bcrypt di backend Node.js
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <form onSubmit={handleSavePassword} className="space-y-3.5">
            <div className="relative">
              <Input
                label="Kata Sandi Baru"
                type={showPass.new ? 'text' : 'password'}
                required
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPass.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Konfirmasi Kata Sandi Baru"
                type={showPass.confirm ? 'text' : 'password'}
                required
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="Ulangi kata sandi baru"
              />
              <button
                type="button"
                onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1 border border-slate-100">
              <p className="font-semibold text-slate-700">Kriteria Keamanan:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                <li>Minimal 6 karakter</li>
                <li>Gunakan kombinasi huruf dan angka yang aman</li>
              </ul>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                type="submit"
                icon={loading ? Loader2 : KeyRound}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Menyimpan Kata Sandi...' : 'Perbarui kata sandi'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: LOG AKTIVITAS & AUDIT */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Log Aktivitas & Audit Database</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Catatan aktivitas terkini dari transaksi penjualan dan pengelolaan akun di database
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {auditLogs.length} Catatan
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Aksi / Event</th>
                  <th className="py-3 px-4">Keterangan Detail</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Petugas / Sumber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      Belum ada catatan aktivitas di database.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{log.title}</td>
                      <td className="py-3.5 px-4 text-slate-600">{log.details}</td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono">{log.time}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{log.user}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PENGATURAN SISTEM */}
      {activeTab === 'preferences' && (
        <div className="max-w-2xl bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Pengaturan Sistem POSAN</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Konfigurasi umum integrasi backend dan preferensi sesi Super Admin
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">API Endpoint Backend</p>
                <p className="text-slate-500 font-mono text-[11px]">{getApiBaseUrl()}</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                ONLINE
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Layanan Database</p>
                <p className="text-slate-500 font-mono text-[11px]">Database terhubung</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                AKTIF
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
