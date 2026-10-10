import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, Lock, Mail, User, Phone, Shield } from 'lucide-react';
import { normalizeRole, getRoleLabel } from '../../services/cashierService.js';

export default function CashierModal({
  isOpen,
  onClose,
  onSave,
  initialCashier = null,
  existingCount = 1
}) {
  const isEditing = Boolean(initialCashier);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('kasir');
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState('Aktif');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialCashier) {
      setName(initialCashier.name || '');
      setEmail(initialCashier.email || '');
      setPhone(initialCashier.phone && initialCashier.phone !== '-' ? initialCashier.phone : '');
      setRole(initialCashier.rawRole || normalizeRole(initialCashier.role) || 'kasir');
      setPin(initialCashier.pin ? String(initialCashier.pin).slice(0, 6) : '');
      setStatus(initialCashier.status || 'Aktif');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setRole('kasir');
      setPin('123456');
      setStatus('Aktif');
    }
    setErrors({});
  }, [initialCashier, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Nama lengkap staf wajib diisi.';
    if (!email.trim()) {
      errs.email = 'Email staf wajib diisi.';
    } else if (!email.includes('@')) {
      errs.email = 'Format email tidak valid.';
    }
    
    // Validasi sandi staf: Maksimal 6 angka
    if (!isEditing) {
      if (!pin.trim()) {
        errs.pin = 'Sandi / PIN staf wajib diisi (maksimal 6 angka).';
      } else if (!/^\d+$/.test(pin.trim())) {
        errs.pin = 'Sandi staf hanya boleh berupa angka (0-9).';
      } else if (pin.trim().length > 6) {
        errs.pin = 'Sandi staf maksimal 6 angka.';
      }
    } else if (isEditing && pin.trim()) {
      if (!/^\d+$/.test(pin.trim())) {
        errs.pin = 'Sandi baru hanya boleh berupa angka (0-9).';
      } else if (pin.trim().length > 6) {
        errs.pin = 'Sandi baru maksimal 6 angka.';
      }
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const initials = name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      role: normalizeRole(role),
      rawRole: normalizeRole(role),
      password: pin.trim() || undefined,
      pin: pin.trim() || undefined,
      status: status,
      avatarInitial: initials,
      avatarBg: isEditing ? initialCashier.avatarBg : '#FDEEE2',
      avatarColor: isEditing ? initialCashier.avatarColor : '#9E5924',
      createdAt: isEditing ? initialCashier.createdAt : 'Hari ini',
      lastLogin: isEditing ? initialCashier.lastLogin : '-'
    };

    onSave(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card cashier-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-circle">
              {isEditing ? <UserCheck size={18} /> : <UserPlus size={18} />}
            </div>
            <div>
              <h2 className="modal-title">{isEditing ? 'Edit Data Staf' : 'Tambah Staf Baru'}</h2>
              <p className="modal-sub">
                {isEditing
                  ? 'Perbarui profil dan hak akses staf operasional cabang (Kasir, Barista, Kitchen, Admin).'
                  : 'Daftarkan akun staf baru untuk akses terminal Kasir, Barista, Kitchen, atau Admin.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Tutup Dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="modal-body-form">
          {/* 1. Nama Lengkap Staf */}
          <div className="form-group">
            <label className="form-label" htmlFor="cashier-name">
              Nama Lengkap Staf <span className="text-required">*</span>
            </label>
            <div className="input-with-icon">
              <User size={15} className="input-field-icon" />
              <input
                id="cashier-name"
                type="text"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="Contoh: Muhammad Zul Asfi"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* 2. Email & Role */}
          <div className="form-row-two-col">
            <div className="form-group">
              <label className="form-label" htmlFor="cashier-email">
                Alamat Email Login <span className="text-required">*</span>
              </label>
              <div className="input-with-icon">
                <Mail size={15} className="input-field-icon" />
                <input
                  id="cashier-email"
                  type="email"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="staf@posan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cashier-role-select">
                Role &amp; Tanggung Jawab <span className="text-required">*</span>
              </label>
              <div className="input-with-icon">
                <Shield size={15} className="input-field-icon" />
                <select
                  id="cashier-role-select"
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="kasir">Kasir (Terminal POS)</option>
                  <option value="barista">Barista (Stasiun Minuman)</option>
                  <option value="kitchen">Kitchen (Stasiun Dapur)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. No Telp & Password / PIN */}
          <div className="form-row-two-col">
            <div className="form-group">
              <label className="form-label" htmlFor="cashier-phone">
                No. Telepon / WA (Opsional)
              </label>
              <div className="input-with-icon">
                <Phone size={15} className="input-field-icon" />
                <input
                  id="cashier-phone"
                  type="tel"
                  className="form-input"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cashier-pin">
                {isEditing ? 'PIN / Sandi Baru (Maks. 6 Angka)' : 'PIN / Sandi Staf (Maks. 6 Angka)'} <span className="text-required">*</span>
              </label>
              <div className="input-with-icon">
                <Lock size={15} className="input-field-icon" />
                <input
                  id="cashier-pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="new-password"
                  className={`form-input ${errors.pin ? 'input-error' : ''}`}
                  placeholder={isEditing ? 'Kosongkan jika tidak diubah (Maks. 6 angka)' : 'Contoh: 123456 (Maks. 6 angka)'}
                  value={pin}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPin(digitsOnly);
                  }}
                />
              </div>
              <span style={{ fontSize: '11px', color: '#888', marginTop: '4px', display: 'block' }}>
                Hanya angka (0-9), maksimal 6 digit untuk login kasir/staf.
              </span>
              {errors.pin && <span className="error-text">{errors.pin}</span>}
            </div>
          </div>

          {/* 4. Status Akses */}
          <div className="form-group">
            <label className="form-label">Status Akses Akun</label>
            <div className="status-radio-group">
              <label className={`status-radio-card ${status === 'Aktif' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="cashier-status"
                  value="Aktif"
                  checked={status === 'Aktif'}
                  onChange={() => setStatus('Aktif')}
                />
                <span className="radio-dot-green" />
                <div className="radio-text">
                  <span className="radio-title">Aktif</span>
                  <span className="radio-desc">Dapat login ke modul stasiun/POS</span>
                </div>
              </label>

              <label className={`status-radio-card ${status === 'Nonaktif' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="cashier-status"
                  value="Nonaktif"
                  checked={status === 'Nonaktif'}
                  onChange={() => setStatus('Nonaktif')}
                />
                <span className="radio-dot-red" />
                <div className="radio-text">
                  <span className="radio-title">Nonaktif</span>
                  <span className="radio-desc">Akses login staf dinonaktifkan</span>
                </div>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-modal-submit"
            >
              {isEditing ? 'Perbarui Data Staf' : 'Simpan Akun Staf'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




