import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  QrCode,
  User,
  RefreshCw,
  KeyRound,
  Coffee,
  Check,
  Trash2,
  X,
  ExternalLink
} from 'lucide-react';
import { initialNotifications } from '../../constants/appConstants';

export default function NotificationDropdown({ isOpen, onClose, onSelectNav }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'unread'
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest('.header-icon-btn')
      ) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleItemClick = (item) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    if (item.actionNav && onSelectNav) {
      onSelectNav(item.actionNav);
      onClose();
    }
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredList = notifications.filter((item) => {
    if (filterTab === 'unread') return item.unread;
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case 'transaction':
        return <QrCode size={16} className="notif-icon-transaction" />;
      case 'cashier':
        return <User size={16} className="notif-icon-cashier" />;
      case 'sync':
        return <RefreshCw size={16} className="notif-icon-sync" />;
      case 'auth':
        return <KeyRound size={16} className="notif-icon-auth" />;
      case 'product':
        return <Coffee size={16} className="notif-icon-product" />;
      default:
        return <Bell size={16} className="notif-icon-default" />;
    }
  };

  return (
    <div className="notification-dropdown-popover animate-fade-in" ref={dropdownRef}>
      {/* Dropdown Header */}
      <div className="notif-header">
        <div className="notif-title-row">
          <div className="notif-title-group">
            <h3 className="notif-title">Notifikasi Sistem</h3>
            {unreadCount > 0 && (
              <span className="notif-badge-pill">{unreadCount} Baru</span>
            )}
          </div>
          <button
            type="button"
            className="notif-close-btn"
            onClick={onClose}
            aria-label="Tutup notifikasi"
          >
            <X size={15} />
          </button>
        </div>

        {/* Filter Tabs & Mark as read */}
        <div className="notif-controls-row">
          <div className="notif-tabs">
            <button
              type="button"
              className={`notif-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTab('all')}
            >
              Semua ({notifications.length})
            </button>
            <button
              type="button"
              className={`notif-tab-btn ${filterTab === 'unread' ? 'active' : ''}`}
              onClick={() => setFilterTab('unread')}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="notif-mark-read-btn"
              onClick={handleMarkAllAsRead}
              title="Tandai semua pesan telah dibaca"
            >
              <Check size={12} strokeWidth={2.5} />
              <span>Tandai Dibaca</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="notif-list-container">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className={`notif-item ${item.unread ? 'unread' : ''}`}
            onClick={() => handleItemClick(item)}
            role="button"
            tabIndex={0}
          >
            <div className="notif-icon-wrapper">{getNotifIcon(item.type)}</div>
            <div className="notif-body">
              <div className="notif-top-line">
                <span className="notif-item-title">{item.title}</span>
                <span className="notif-time">{item.time}</span>
              </div>
              <p className="notif-message">{item.message}</p>
              {item.actionNav && (
                <div className="notif-action-hint">
                  <span>Lihat di menu {item.actionNav}</span>
                  <ExternalLink size={11} />
                </div>
              )}
            </div>
            {item.unread && <span className="notif-unread-dot" />}
          </div>
        ))}

        {filteredList.length === 0 && (
          <div className="notif-empty-state">
            <div className="notif-empty-icon">
              <CheckCircle2 size={28} />
            </div>
            <span className="notif-empty-title">Tidak ada notifikasi baru</span>
            <span className="notif-empty-desc">
              Semua peringatan dan aktivitas kasir operasional telah Anda pantau.
            </span>
          </div>
        )}
      </div>

      {/* Dropdown Footer */}
      {notifications.length > 0 && (
        <div className="notif-footer">
          <button
            type="button"
            className="notif-clear-btn"
            onClick={handleClearAll}
          >
            <Trash2 size={13} />
            <span>Bersihkan Semua</span>
          </button>
        </div>
      )}
    </div>
  );
}
