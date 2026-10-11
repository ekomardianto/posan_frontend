import React, { useState, useEffect } from 'react';
import { ChevronRight, Building2, Bell } from 'lucide-react';
import { defaultAdminProfile as adminProfile } from '../../constants/appConstants.js';
import { fetchMerchantProfile } from '../../services/merchantService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import NotificationDropdown from './NotificationDropdown';

const getIndonesianRealtimeClock = () => {
  const now = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayName = days[now.getDay()];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${dayName}, ${hours}:${minutes}:${seconds} WIB`;
};

export default function Header({ onSelectNav }) {
  const { user, merchant } = useAuth();
  const [currentTime, setCurrentTime] = useState(getIndonesianRealtimeClock);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getIndonesianRealtimeClock());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const branchName = merchant?.name || user?.branch || 'POSAN Cafe';
  const displayName = user?.name || adminProfile.name;
  const displayRole = user?.role || adminProfile.role;
  const displayAvatar = user?.avatarUrl || adminProfile.avatarUrl;

  return (
    <header className="header" role="banner">
      {/* Left Breadcrumb & Branch Pill */}
      <div className="header-left">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <span className="breadcrumb-main">POSAN Backoffice</span>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span>Panel Operasional</span>
        </nav>

        <div className="branch-chip" title="Merchant terhubung ke database">
          <Building2 size={13} strokeWidth={2} />
          <span>{branchName}</span>
        </div>
      </div>

      {/* Right Time, Notification & User Profile */}
      <div className="header-right">
        <div className="system-time-box">
          <div className="system-time-header">
            <span className="time-live-dot pulse-indicator" />
            <span className="time-label">Sinkronisasi database aktif</span>
          </div>
          <span className="time-val">{currentTime}</span>
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="notification-btn-wrapper">
          <button
            type="button"
            className={`header-icon-btn ${isNotifOpen ? 'active' : ''}`}
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifikasi Sistem"
            title="Pusat Notifikasi Operasional"
          >
            <Bell size={18} strokeWidth={1.8} />
            {hasUnread && <span className="notification-badge" />}
          </button>

          <NotificationDropdown
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            onSelectNav={onSelectNav}
          />
        </div>

        <div
          className="user-profile-chip clickable"
          onClick={() => onSelectNav && onSelectNav('profil')}
          title="Buka Halaman Profil Admin"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onSelectNav && onSelectNav('profil');
            }
          }}
        >
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-role">{displayRole}</span>
          </div>
          <img
            src={displayAvatar}
            alt={displayName}
            className="avatar-img"
          />
        </div>
      </div>
    </header>
  );
}
