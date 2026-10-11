import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Camera,
  Check,
  Lock,
  Smartphone,
  Calendar,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { defaultAdminProfile as adminProfile } from '../../constants/appConstants';
import { fetchMerchantProfile, updateMerchantProfile } from '../../services/merchantService';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, changeUserPassword, fetchCurrentUser } from '../../services/authService';

const formatJoinedDate = (isoString) => {
  if (!isoString) return '27 September 2026';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '27 September 2026';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

// --- Picker Configuration Constants ---
const DAYS_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const TIMEZONES = ['WIB', 'WITA', 'WIT'];

const SHIFT_PRESETS = [
  { id: 'utama', name: 'Shift Utama', start: '08:00', end: '17:00' },
  { id: 'pagi', name: 'Shift Pagi', start: '07:00', end: '15:00' },
  { id: 'siang', name: 'Shift Siang', start: '11:00', end: '19:00' },
  { id: 'sore', name: 'Shift Sore / Malam', start: '15:00', end: '23:00' },
  { id: 'fullday', name: 'Full Day', start: '08:00', end: '22:00' },
];

const DAY_PRESETS = [
  { label: 'Setiap Hari (Senin - Minggu)', start: 'Senin', end: 'Minggu' },
  { label: 'Senin - Sabtu', start: 'Senin', end: 'Sabtu' },
  { label: 'Senin - Jumat', start: 'Senin', end: 'Jumat' },
  { label: 'Weekend (Sabtu - Minggu)', start: 'Sabtu', end: 'Minggu' },
];

const TIME_PRESETS = [
  { label: '08:00 - 22:00 (Standar)', open: '08:00', close: '22:00' },
  { label: '07:00 - 23:00 (Panjang)', open: '07:00', close: '23:00' },
  { label: '09:00 - 21:00 (Mall/Ruko)', open: '09:00', close: '21:00' },
  { label: '10:00 - 24:00 (Night Cafe)', open: '10:00', close: '00:00' },
];

// Helper: Parse & Format Shift
const parseShiftString = (shiftStr) => {
  if (!shiftStr) {
    return { name: 'Shift Utama', start: '08:00', end: '17:00', tz: 'WIB' };
  }
  const match = shiftStr.match(/^(.*?)(?:\s*\((?:(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2}))(?:\s*(WIB|WITA|WIT))?\))?$/i);
  if (match && match[2] && match[3]) {
    return {
      name: match[1]?.trim() || 'Shift Utama',
      start: match[2].padStart(5, '0'),
      end: match[3].padStart(5, '0'),
      tz: match[4] || 'WIB',
    };
  }
  return { name: shiftStr.trim() || 'Shift Utama', start: '08:00', end: '17:00', tz: 'WIB' };
};

const formatShiftString = ({ name, start, end, tz }) => {
  return `${name || 'Shift Utama'} (${start || '08:00'} - ${end || '17:00'} ${tz || 'WIB'})`;
};

// Helper: Parse & Format Operational Hours
const parseOpHoursString = (opStr) => {
  if (!opStr) {
    return { startDay: 'Senin', endDay: 'Minggu', openTime: '08:00', closeTime: '22:00', tz: 'WIB' };
  }
  const match = opStr.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})(?:\s*(WIB|WITA|WIT))?(?:\s*\((.*?)\))?/i);
  if (match) {
    const openTime = match[1].padStart(5, '0');
    const closeTime = match[2].padStart(5, '0');
    const tz = match[3] || 'WIB';
    const dayPart = match[4] || 'Senin - Minggu';
    const daySplit = dayPart.split('-').map((s) => s.trim());
    return {
      startDay: daySplit[0] || 'Senin',
      endDay: daySplit[1] || daySplit[0] || 'Minggu',
      openTime,
      closeTime,
      tz,
    };
  }
  return { startDay: 'Senin', endDay: 'Minggu', openTime: '08:00', closeTime: '22:00', tz: 'WIB' };
};

const formatOpHoursString = ({ startDay, endDay, openTime, closeTime, tz }) => {
  const days = startDay === endDay ? startDay : `${startDay} - ${endDay}`;
  return `${openTime || '08:00'} - ${closeTime || '22:00'} ${tz || 'WIB'} (${days})`;
};

export default function ProfilePage() {
  const { user, updateUser, updateMerchant, merchant } = useAuth();

  // Profile State
  const [profile, setProfile] = useState(() => ({
    id: user?.id || null,
    name: user?.name || adminProfile.name,
    shortName: user?.name ? user.name.split(' ')[0] : adminProfile.shortName,
    email: user?.email || '',
    phone: user?.phone || merchant?.phone || '081234567890',
    role: user?.role || 'Admin Café',
    employeeId: user?.employeeId || (user?.id ? `ADM-${String(user.id).padStart(4, '0')}` : 'ADM-0001'),
    branch: merchant?.name || user?.merchant?.name || user?.branch || 'POSAN Cafe',
    branchAddress: merchant?.address || user?.merchant?.address || 'Dumai, Riau',
    branchPhone: merchant?.phone || user?.merchant?.phone || '081234567890',
    operationalHours: merchant?.operational_hours || user?.merchant?.operational_hours || '08:00 - 22:00 WIB (Senin - Minggu)',
    joinedDate: '27 September 2026',
    shift: user?.shift || 'Shift Utama (08:00 - 17:00 WIB)',
    authPin: user?.authPin || '889900',
    avatarUrl: user?.avatarUrl || adminProfile.avatarUrl
  }));

  // Dedicated Picker States
  const [shiftState, setShiftState] = useState(() => parseShiftString(profile.shift));
  const [opHoursState, setOpHoursState] = useState(() => parseOpHoursString(profile.operationalHours));

  // Handlers for Shift Picker
  const handleShiftChange = (key, val) => {
    setShiftState((prev) => {
      const next = { ...prev, [key]: val };
      const formatted = formatShiftString(next);
      setProfile((p) => ({ ...p, shift: formatted }));
      return next;
    });
  };

  const handleApplyShiftPreset = (preset) => {
    setShiftState((prev) => {
      const next = { ...prev, name: preset.name, start: preset.start, end: preset.end };
      const formatted = formatShiftString(next);
      setProfile((p) => ({ ...p, shift: formatted }));
      return next;
    });
  };

  // Handlers for Operational Hours Picker
  const handleOpHoursChange = (key, val) => {
    setOpHoursState((prev) => {
      const next = { ...prev, [key]: val };
      const formatted = formatOpHoursString(next);
      setProfile((p) => ({ ...p, operationalHours: formatted }));
      return next;
    });
  };

  const handleApplyDayPreset = (preset) => {
    setOpHoursState((prev) => {
      const next = { ...prev, startDay: preset.start, endDay: preset.end };
      const formatted = formatOpHoursString(next);
      setProfile((p) => ({ ...p, operationalHours: formatted }));
      return next;
    });
  };

  const handleApplyTimePreset = (preset) => {
    setOpHoursState((prev) => {
      const next = { ...prev, openTime: preset.open, closeTime: preset.close };
      const formatted = formatOpHoursString(next);
      setProfile((p) => ({ ...p, operationalHours: formatted }));
      return next;
    });
  };

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (title, message, type = 'success') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadDataFromDatabase = async () => {
    try {
      let freshUser = null;
      try {
        freshUser = await fetchCurrentUser();
      } catch (e) {
        console.warn('fetchCurrentUser error:', e);
      }

      const activeUser = freshUser || user;
      const rawRole = (activeUser?.rawRole || activeUser?.role || 'admin').toLowerCase();
      const roleLabel = rawRole === 'admin' ? 'Admin Café' : rawRole === 'barista' ? 'Barista' : rawRole === 'kitchen' ? 'Kitchen' : rawRole === 'kasir' ? 'Kasir' : (activeUser?.role || 'Admin Café');

      const targetName = activeUser?.name || 'Admin POSAN';
      const targetEmail = activeUser?.email || '';
      const targetPhone = activeUser?.phone || merchant?.phone || '081234567890';
      const targetJoined = formatJoinedDate(activeUser?.created_at);
      const targetId = activeUser?.id ? String(activeUser.id) : '1';
      const targetShift = activeUser?.shift || 'Shift Utama (08:00 - 17:00 WIB)';
      const targetPin = activeUser?.authPin || activeUser?.auth_pin || '889900';
      const targetBranch = merchant?.name || activeUser?.merchant?.name || activeUser?.branch || 'POSAN Cafe';
      const targetBranchAddress = merchant?.address || activeUser?.merchant?.address || 'Dumai, Riau';
      const targetBranchPhone = merchant?.phone || activeUser?.merchant?.phone || '081234567890';
      const targetOpHours = merchant?.operational_hours || activeUser?.merchant?.operational_hours || '08:00 - 22:00 WIB (Senin - Minggu)';

      // Sync picker states
      setShiftState(parseShiftString(targetShift));
      setOpHoursState(parseOpHoursString(targetOpHours));

      setProfile((prev) => ({
        ...prev,
        id: targetId,
        name: targetName,
        shortName: targetName.split(' ')[0] || targetName,
        email: targetEmail,
        phone: targetPhone,
        role: roleLabel,
        employeeId: `ADM-${targetId.padStart(4, '0')}`,
        joinedDate: targetJoined,
        shift: targetShift,
        authPin: targetPin,
        branch: targetBranch,
        branchAddress: targetBranchAddress,
        branchPhone: targetBranchPhone,
        operationalHours: targetOpHours,
      }));
    } catch (err) {
      console.error('Error loading profile from database:', err);
    }
  };

  useEffect(() => {
    loadDataFromDatabase();
  }, [user]);

  // Sync if merchant in AuthContext changes externally or via realtime
  useEffect(() => {
    if (merchant && merchant.name) {
      if (merchant.operational_hours) {
        setOpHoursState(parseOpHoursString(merchant.operational_hours));
      }
      setProfile((prev) => ({
        ...prev,
        branch: merchant.name,
        branchAddress: merchant.address || prev.branchAddress,
        branchPhone: merchant.phone || prev.branchPhone,
        operationalHours: merchant.operational_hours || prev.operationalHours,
      }));
    }
  }, [merchant]);

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Update user profile in PostgreSQL via Backend API
      await updateUserProfile({
        name: profile.name.trim(),
        phone: profile.phone ? profile.phone.trim() : null,
        shift: profile.shift ? profile.shift.trim() : 'Shift Utama (08:00 - 17:00 WIB)',
        auth_pin: profile.authPin ? profile.authPin.trim() : '889900',
      });

      // 2. Update merchant in context & backend
      const merchantPayload = {
        name: profile.branch.trim(),
        address: profile.branchAddress.trim(),
        phone: profile.branchPhone.trim(),
        operational_hours: profile.operationalHours.trim(),
      };

      if (updateMerchant) {
        await updateMerchant(merchantPayload);
      } else {
        await updateMerchantProfile(merchantPayload);
      }

      // 3. Update auth user state in context
      updateUser({
        name: profile.name.trim(),
        email: profile.email.trim().toLowerCase(),
        phone: profile.phone ? profile.phone.trim() : null,
        branch: profile.branch.trim(),
        shift: profile.shift.trim(),
        authPin: profile.authPin.trim(),
      });

      showToast(
        'Profil Berhasil Diperbarui',
        'Data profil pengelola outlet, jadwal shift, dan jam operasional telah tersimpan di PostgreSQL posan_db.'
      );
    } catch (err) {
      console.error('Save profile error:', err);
      showToast('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan ke database.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      showToast('Gagal Menyimpan', 'Konfirmasi password baru tidak cocok.', 'error');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      showToast('Gagal Menyimpan', 'Password baru minimal 6 karakter.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (newPassword) {
        await changeUserPassword(currentPassword, newPassword);
      }

      // Update auth_pin in PostgreSQL database
      if (profile.authPin) {
        await updateUserProfile({
          name: profile.name.trim(),
          phone: profile.phone,
          shift: profile.shift,
          auth_pin: profile.authPin.trim(),
        });
        updateUser({ authPin: profile.authPin.trim() });
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast(
        'Keamanan Diperbarui',
        'Password dan PIN otorisasi supervisor berhasil diperbarui di database PostgreSQL posan_db.'
      );
    } catch (err) {
      showToast('Gagal Memperbarui Keamanan', err.message || 'Gagal mengubah keamanan di database.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    loadDataFromDatabase();
    showToast('Data Direset', 'Formulir profil telah disinkronkan kembali dari database PostgreSQL posan_db.');
  };


  return (
    <main className="profile-page-container" role="main">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`toast-notification ${toastMessage.type === 'error' ? 'toast-error' : ''}`} role="status" aria-live="polite" style={toastMessage.type === 'error' ? { background: '#450A0A', borderColor: '#991B1B' } : undefined}>
          <div className="toast-icon-wrapper" style={toastMessage.type === 'error' ? { background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444' } : undefined}>
            {toastMessage.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <div className="toast-content">
            <span className="toast-title" style={toastMessage.type === 'error' ? { color: '#FCA5A5' } : undefined}>{toastMessage.title}</span>
            <span className="toast-message" style={toastMessage.type === 'error' ? { color: '#FECACA' } : undefined}>{toastMessage.message}</span>
          </div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setToastMessage(null)}
            aria-label="Tutup notifikasi"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. Page Header */}
      <section className="profile-header-card animate-fade-in" aria-label="Header Profil Admin">
        <div className="profile-header-left">
          <div className="profile-breadcrumb-tag">
            <span>POSAN BACKOFFICE</span>
            <span>&bull;</span>
            <span className="profile-active-tag">
              <span className="profile-active-dot pulse-indicator" />
              <span>PostgreSQL posan_db Live</span>
            </span>
          </div>
          <h1 className="profile-page-title">Profil Admin Café</h1>
          <p className="profile-page-subtitle">
            Kelola informasi data pengelola outlet, kredensial keamanan sistem, dan parameter operasional cabang POSAN.
          </p>
        </div>

        <div className="profile-header-actions">
          <button
            type="button"
            className="btn-profile-outline"
            onClick={handleReset}
            title="Kembalikan perubahan formulir"
          >
            <RotateCcw size={15} strokeWidth={2} />
            <span>Reset Data</span>
          </button>

          <button
            type="button"
            className="btn-profile-primary"
            onClick={handleSaveProfile}
            disabled={isSaving}
            title="Simpan seluruh data profil"
          >
            <Save size={15} strokeWidth={2.2} />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Profil'}</span>
          </button>
        </div>
      </section>

      {/* 2. Main Two-Column Layout */}
      <div className="profile-layout-grid">
        {/* LEFT COLUMN: Profile Hero Card + Security Overview */}
        <div className="profile-left-column">
          {/* User Hero Card */}
          <div className="profile-hero-card animate-fade-in">
            <div className="profile-hero-bg-cover" />

            <div className="profile-hero-content">
              <div className="profile-avatar-wrapper">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="profile-hero-avatar"
                />
                <button
                  type="button"
                  className="profile-avatar-edit-btn"
                  title="Ubah Foto Profil"
                  onClick={() => showToast('Ubah Foto', 'Pilih file gambar baru untuk avatar profil.')}
                >
                  <Camera size={14} />
                </button>
              </div>

              <h2 className="profile-hero-name">{profile.name}</h2>
              <span className="profile-hero-role">{profile.role}</span>

              <div className="profile-hero-badges">
                <span className="profile-badge-chip branch-chip-styled">
                  <Building2 size={13} />
                  <span>{profile.branch}</span>
                </span>
                <span className="profile-badge-chip verified-chip-styled">
                  <ShieldCheck size={13} />
                  <span>ID: {profile.employeeId}</span>
                </span>
              </div>

              <div className="profile-divider" />

              {/* Quick Info Grid */}
              <div className="profile-quick-stats">
                <div className="quick-stat-item">
                  <span className="quick-stat-label">STATUS SESI</span>
                  <span className="quick-stat-val text-status-online">
                    <span className="stat-dot-green" />
                    <span>PostgreSQL Live</span>
                  </span>
                </div>
                <div className="quick-stat-item">
                  <span className="quick-stat-label">TERDAFTAR SEJAK</span>
                  <span className="quick-stat-val">{profile.joinedDate}</span>
                </div>
                <div className="quick-stat-item">
                  <span className="quick-stat-label">SHIFT AKTIF</span>
                  <span className="quick-stat-val">{profile.shift}</span>
                </div>
                <div className="quick-stat-item">
                  <span className="quick-stat-label">OTORISASI PIN</span>
                  <span className="quick-stat-val text-pin-active">Aktif (6-Digit)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Privileges & Authority Card */}
          <div className="profile-card animate-fade-in">
            <div className="profile-card-header">
              <div className="profile-card-icon-box">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="profile-card-title">Hak Akses &amp; Kewenangan</h3>
                <p className="profile-card-desc">Tingkat wewenang operasional admin cabang</p>
              </div>
            </div>

            <ul className="profile-permissions-list">
              <li className="permission-item">
                <div className="permission-check-icon">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <div className="permission-text">
                  <strong>Akses Penuh Dashboard &amp; Realtime KPI</strong>
                  <span>Pantau performa omzet dan tiket penjualan harian.</span>
                </div>
              </li>
              <li className="permission-item">
                <div className="permission-check-icon">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <div className="permission-text">
                  <strong>Manajemen Katalog Produk &amp; Menu</strong>
                  <span>Ubah harga, tambah menu baru, dan atur ketersediaan.</span>
                </div>
              </li>
              <li className="permission-item">
                <div className="permission-check-icon">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <div className="permission-text">
                  <strong>Kelola Akun &amp; PIN Staf Kasir</strong>
                  <span>Otorisasi akses login staf kasir operasional cabang.</span>
                </div>
              </li>
              <li className="permission-item">
                <div className="permission-check-icon">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <div className="permission-text">
                  <strong>Ekspor Laporan Bisnis (Excel/PDF/CSV)</strong>
                  <span>Unduh rekapitulasi data penjualan periodik.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: Edit Forms (Personal, Outlet & Security) */}
        <div className="profile-right-column">
          {/* Card 1: Informasi Pengelola */}
          <section className="profile-card animate-fade-in" aria-label="Informasi Pribadi Pengelola">
            <div className="profile-card-header">
              <div className="profile-card-icon-box">
                <User size={16} />
              </div>
              <div>
                <h3 className="profile-card-title">Data Pengelola Outlet</h3>
                <p className="profile-card-desc">Informasi kontak dan identitas akun admin café</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="profile-form-grid">
              <div className="form-group-field">
                <label className="field-label" htmlFor="prof-name">
                  Nama Lengkap Admin <span className="text-required">*</span>
                </label>
                <div className="field-input-box">
                  <User size={15} className="field-icon" />
                  <input
                    id="prof-name"
                    type="text"
                    className="field-input"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nama Lengkap"
                    required
                  />
                </div>
              </div>

              <div className="form-group-field">
                <label className="field-label" htmlFor="prof-shortname">
                  Nama Panggilan / Display Name
                </label>
                <div className="field-input-box">
                  <User size={15} className="field-icon" />
                  <input
                    id="prof-shortname"
                    type="text"
                    className="field-input"
                    value={profile.shortName}
                    onChange={(e) => handleInputChange('shortName', e.target.value)}
                    placeholder="Contoh: Zul"
                  />
                </div>
              </div>

              <div className="form-group-field">
                <label className="field-label" htmlFor="prof-email">
                  Alamat Email Kantor <span className="text-required">*</span>
                </label>
                <div className="field-input-box">
                  <Mail size={15} className="field-icon" />
                  <input
                    id="prof-email"
                    type="email"
                    className="field-input"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="nama@posan.cafe"
                    required
                  />
                </div>
              </div>

              <div className="form-group-field">
                <label className="field-label" htmlFor="prof-phone">
                  Nomor WhatsApp / Telepon <span className="text-required">*</span>
                </label>
                <div className="field-input-box">
                  <Phone size={15} className="field-icon" />
                  <input
                    id="prof-phone"
                    type="text"
                    className="field-input"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+62 8..."
                    required
                  />
                </div>
              </div>

              <div className="form-group-field">
                <label className="field-label" htmlFor="prof-role">
                  Jabatan / Role Operasional
                </label>
                <div className="field-input-box">
                  <ShieldCheck size={15} className="field-icon" />
                  <input
                    id="prof-role"
                    type="text"
                    className="field-input bg-readonly"
                    value={profile.role}
                    readOnly
                    title="Role diatur oleh Super Admin Pusat"
                  />
                </div>
              </div>

              <div className="form-group-field full-col">
                <div className="picker-section-card">
                  <div className="picker-section-header">
                    <span className="picker-section-title">
                      <Clock size={15} />
                      <span>Jadwal Shift Bertugas</span>
                    </span>
                    <span className="picker-preview-badge">
                      <Sparkles size={12} />
                      <span>{profile.shift}</span>
                    </span>
                  </div>

                  {/* Quick Shift Presets */}
                  <div className="picker-preset-row">
                    <span className="picker-preset-label">Pilihan Cepat:</span>
                    {SHIFT_PRESETS.map((preset) => {
                      const isActive = shiftState.name === preset.name && shiftState.start === preset.start && shiftState.end === preset.end;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          className={`picker-preset-chip ${isActive ? 'active' : ''}`}
                          onClick={() => handleApplyShiftPreset(preset)}
                        >
                          {preset.name} ({preset.start} - {preset.end})
                        </button>
                      );
                    })}
                  </div>

                  {/* Detailed Controls */}
                  <div className="picker-controls-grid">
                    <div className="picker-control-item">
                      <label className="picker-control-label">Nama Shift</label>
                      <select
                        className="picker-select"
                        value={shiftState.name}
                        onChange={(e) => handleShiftChange('name', e.target.value)}
                      >
                        <option value="Shift Utama">Shift Utama</option>
                        <option value="Shift Pagi">Shift Pagi</option>
                        <option value="Shift Siang">Shift Siang</option>
                        <option value="Shift Sore / Malam">Shift Sore / Malam</option>
                        <option value="Full Day">Full Day</option>
                      </select>
                    </div>

                    <div className="picker-control-item">
                      <label className="picker-control-label">Jam Mulai</label>
                      <input
                        type="time"
                        className="picker-time-input"
                        value={shiftState.start}
                        onChange={(e) => handleShiftChange('start', e.target.value)}
                      />
                    </div>

                    <div className="picker-control-item">
                      <label className="picker-control-label">Jam Selesai</label>
                      <input
                        type="time"
                        className="picker-time-input"
                        value={shiftState.end}
                        onChange={(e) => handleShiftChange('end', e.target.value)}
                      />
                    </div>

                    <div className="picker-control-item">
                      <label className="picker-control-label">Zona Waktu</label>
                      <select
                        className="picker-select"
                        value={shiftState.tz}
                        onChange={(e) => handleShiftChange('tz', e.target.value)}
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions-row">
                <button type="submit" className="btn-save-section" disabled={isSaving}>
                  <Save size={14} />
                  <span>Simpan Perubahan Data</span>
                </button>
              </div>
            </form>
          </section>

          {/* Card 2: Informasi Cabang Outlet */}
          <section className="profile-card animate-fade-in" aria-label="Informasi Cabang Café">
            <div className="profile-card-header">
              <div className="profile-card-icon-box">
                <Building2 size={16} />
              </div>
              <div>
                <h3 className="profile-card-title">Informasi Outlet Cabang</h3>
                <p className="profile-card-desc">Detail identitas merchant yang terdaftar di database pusat</p>
              </div>
            </div>

            <div className="outlet-details-grid">
              <div className="outlet-detail-box">
                <div className="outlet-box-label">
                  <Building2 size={14} />
                  <span>Nama Outlet POSAN</span>
                </div>
                <input
                  type="text"
                  className="field-input"
                  style={{ marginTop: 6, padding: '6px 10px', fontSize: '0.88rem' }}
                  value={profile.branch}
                  onChange={(e) => handleInputChange('branch', e.target.value)}
                />
              </div>

              <div className="outlet-detail-box">
                <div className="outlet-box-label">
                  <Phone size={14} />
                  <span>Kontak Telepon Outlet</span>
                </div>
                <input
                  type="text"
                  className="field-input"
                  style={{ marginTop: 6, padding: '6px 10px', fontSize: '0.88rem' }}
                  value={profile.branchPhone}
                  onChange={(e) => handleInputChange('branchPhone', e.target.value)}
                />
              </div>

              <div className="outlet-detail-box full-col">
                <div className="outlet-box-label">
                  <MapPin size={14} />
                  <span>Alamat Lengkap Cabang</span>
                </div>
                <input
                  type="text"
                  className="field-input"
                  style={{ marginTop: 6, padding: '6px 10px', fontSize: '0.88rem' }}
                  value={profile.branchAddress}
                  onChange={(e) => handleInputChange('branchAddress', e.target.value)}
                />
              </div>

              {/* Interactive Day & Operational Hours Picker */}
              <div className="outlet-detail-box full-col" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                <div className="picker-section-card" style={{ width: '100%', marginTop: 0 }}>
                  <div className="picker-section-header">
                    <span className="picker-section-title">
                      <Calendar size={15} />
                      <span>Hari &amp; Jam Operasional Outlet</span>
                    </span>
                    <span className="picker-preview-badge">
                      <Sparkles size={12} />
                      <span>{profile.operationalHours}</span>
                    </span>
                  </div>

                  {/* Quick Day Presets */}
                  <div className="picker-preset-row">
                    <span className="picker-preset-label">Pilihan Hari:</span>
                    {DAY_PRESETS.map((preset, idx) => {
                      const isActive = opHoursState.startDay === preset.start && opHoursState.endDay === preset.end;
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`picker-preset-chip ${isActive ? 'active' : ''}`}
                          onClick={() => handleApplyDayPreset(preset)}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Day & Time Selectors Grid */}
                  <div className="picker-controls-grid">
                    <div className="picker-control-item">
                      <label className="picker-control-label">Dari Hari</label>
                      <select
                        className="picker-select"
                        value={opHoursState.startDay}
                        onChange={(e) => handleOpHoursChange('startDay', e.target.value)}
                      >
                        {DAYS_LIST.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="picker-control-item">
                      <label className="picker-control-label">Sampai Hari</label>
                      <select
                        className="picker-select"
                        value={opHoursState.endDay}
                        onChange={(e) => handleOpHoursChange('endDay', e.target.value)}
                      >
                        {DAYS_LIST.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="picker-control-item">
                      <label className="picker-control-label">Jam Buka</label>
                      <input
                        type="time"
                        className="picker-time-input"
                        value={opHoursState.openTime}
                        onChange={(e) => handleOpHoursChange('openTime', e.target.value)}
                      />
                    </div>

                    <div className="picker-control-item">
                      <label className="picker-control-label">Jam Tutup</label>
                      <input
                        type="time"
                        className="picker-time-input"
                        value={opHoursState.closeTime}
                        onChange={(e) => handleOpHoursChange('closeTime', e.target.value)}
                      />
                    </div>

                    <div className="picker-control-item">
                      <label className="picker-control-label">Zona Waktu</label>
                      <select
                        className="picker-select"
                        value={opHoursState.tz}
                        onChange={(e) => handleOpHoursChange('tz', e.target.value)}
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quick Time Presets */}
                  <div className="picker-preset-row" style={{ marginTop: 4 }}>
                    <span className="picker-preset-label">Pilihan Jam:</span>
                    {TIME_PRESETS.map((preset, idx) => {
                      const isActive = opHoursState.openTime === preset.open && opHoursState.closeTime === preset.close;
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`picker-preset-chip ${isActive ? 'active' : ''}`}
                          onClick={() => handleApplyTimePreset(preset)}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions-row" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="btn-save-section"
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                <Save size={14} />
                <span>Simpan Detail Outlet ke Database</span>
              </button>
            </div>
          </section>

          {/* Card 3: Keamanan & Kredensial */}
          <section className="profile-card animate-fade-in" aria-label="Keamanan dan PIN Otorisasi">
            <div className="profile-card-header">
              <div className="profile-card-icon-box">
                <KeyRound size={16} />
              </div>
              <div>
                <h3 className="profile-card-title">Kredensial &amp; PIN Otorisasi</h3>
                <p className="profile-card-desc">Kelola password login dan PIN supervisor untuk kasir</p>
              </div>
            </div>

            <form onSubmit={handleSaveSecurity} className="security-form-container">
              {/* PIN Supervisor */}
              <div className="pin-highlight-box">
                <div className="pin-text-group">
                  <h4 className="pin-title">PIN Otorisasi Supervisor</h4>
                  <p className="pin-desc">
                    PIN ini digunakan di mesin kasir saat staf kasir membutuhkan persetujuan void pesanan atau diskon khusus.
                  </p>
                </div>
                <div className="pin-input-wrapper">
                  <div className="field-input-box pin-field">
                    <Lock size={15} className="field-icon" />
                    <input
                      type="password"
                      maxLength={6}
                      className="field-input"
                      value={profile.authPin}
                      onChange={(e) => handleInputChange('authPin', e.target.value)}
                      placeholder="••••••"
                      title="PIN 6 Digit"
                    />
                  </div>
                </div>
              </div>

              {/* Password Change Grid */}
              <div className="password-change-grid">
                <div className="form-group-field">
                  <label className="field-label" htmlFor="current-pwd">
                    Password Saat Ini
                  </label>
                  <div className="field-input-box">
                    <Lock size={15} className="field-icon" />
                    <input
                      id="current-pwd"
                      type="password"
                      className="field-input"
                      placeholder="Masukkan password saat ini"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group-field">
                  <label className="field-label" htmlFor="new-pwd">
                    Password Baru
                  </label>
                  <div className="field-input-box">
                    <Lock size={15} className="field-icon" />
                    <input
                      id="new-pwd"
                      type="password"
                      className="field-input"
                      placeholder="Minimal 8 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group-field full-col">
                  <label className="field-label" htmlFor="confirm-pwd">
                    Konfirmasi Password Baru
                  </label>
                  <div className="field-input-box">
                    <Lock size={15} className="field-icon" />
                    <input
                      id="confirm-pwd"
                      type="password"
                      className="field-input"
                      placeholder="Ulangi password baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions-row">
                <button type="submit" className="btn-save-section" disabled={isSaving}>
                  <KeyRound size={14} />
                  <span>Perbarui Keamanan &amp; PIN</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
