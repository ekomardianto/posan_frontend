import React, { useState, useEffect } from 'react';
import { MapPin, RotateCw, Calendar } from 'lucide-react';
import { defaultAdminProfile as adminProfile, filterRanges } from '../../constants/appConstants';
import { useAuth } from '../../context/AuthContext';
import { fetchMerchantProfile } from '../../services/merchantService';
import CustomDateModal from './CustomDateModal';

export default function WelcomeBanner({
  activePeriod = 'today',
  onPeriodChange,
  customRange,
  onCustomRangeChange,
  onRefresh,
  isRefreshing = false
}) {
  const { user, merchant } = useAuth();
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const handleFilterClick = (filterId) => {
    if (filterId === 'custom') {
      setIsCustomModalOpen(true);
    } else {
      if (onPeriodChange) onPeriodChange(filterId);
    }
  };

  const handleApplyCustomDate = (rangeObj) => {
    if (onCustomRangeChange) onCustomRangeChange(rangeObj);
    if (onPeriodChange) onPeriodChange('custom');
  };

  const displayName = user?.name ? user.name.split(' ')[0] : adminProfile.shortName;
  const displayLocation = merchant?.address || adminProfile.fullLocation;

  return (
    <>
      <section className="welcome-card animate-fade-in" aria-label="Ringkasan Sambutan">
        <div className="welcome-left">
          <div className="welcome-avatar-badge" role="img" aria-label="Waving hand">
            <span>👋</span>
          </div>
          <div className="welcome-text-group">
            <h1 className="welcome-title">
              Selamat Datang Kembali, {displayName}
            </h1>
            <div className="welcome-meta">
              <span>
                <MapPin size={13} style={{ display: 'inline', marginRight: 3, verticalAlign: -1 }} />
                {displayLocation}
              </span>
              <span>•</span>
              <div className="sync-status-pill">
                <span className="sync-dot pulse-indicator" />
                <span>Online Database Sync Terkoneksi</span>
              </div>
            </div>
          </div>
        </div>

        <div className="welcome-controls">
          <div className="filter-pill-group" role="tablist">
            {filterRanges.map((filter) => {
              const isActive = activePeriod === filter.id;
              const isCustom = filter.id === 'custom';
              const displayLabel = isCustom && isActive && customRange?.label
                ? customRange.label
                : filter.label;

              return (
                <button
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`filter-pill-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleFilterClick(filter.id)}
                  title={isCustom ? 'Buka pemilih rentang tanggal kustom' : `Filter ${filter.label}`}
                >
                  {isCustom && <Calendar size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />}
                  <span>{displayLabel}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="btn-refresh"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Segarkan Data"
            title="Segarkan Data Sinkronisasi"
          >
            <RotateCw
              size={13}
              className={`refresh-icon ${isRefreshing ? 'rotate-anim spin-icon' : ''}`}
            />
            <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan'}</span>
          </button>
        </div>
      </section>

      {/* Custom Date Range Modal */}
      <CustomDateModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onApply={handleApplyCustomDate}
        currentRange={customRange}
      />
    </>
  );
}
