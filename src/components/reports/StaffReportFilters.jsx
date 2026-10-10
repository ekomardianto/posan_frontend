import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, SlidersHorizontal, Users, Shield, Search, X, Coffee, Utensils, Receipt } from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import { formatStaffName } from '../../services/staffReportService';

const getPeriodPresets = () => {
  const now = new Date();
  const formatDateStr = (d) => {
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const todayStr = formatDateStr(now);
  const start7 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  const start30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);

  return [
    { id: 'today', label: 'Harian (Hari Ini)', rangeText: todayStr },
    { id: '7days', label: 'Seminggu (7 Hari)', rangeText: `${formatDateStr(start7)} s/d ${todayStr}` },
    { id: '30days', label: '1 Bulan (30 Hari)', rangeText: `${formatDateStr(start30)} s/d ${todayStr}` },
    { id: 'thisMonth', label: 'Bulan Ini', rangeText: 'Bulan Berjalan' },
  ];
};

const roleOptions = [
  { id: 'all', label: 'Semua Peran / Stasiun' },
  { id: 'barista', label: '☕ Barista (Minuman)' },
  { id: 'kitchen', label: '🍳 Kitchen / Koki (Makanan)' },
  { id: 'kasir', label: '💳 Kasir (POS & Kasir)' },
];

export default function StaffReportFilters({
  activePeriod,
  onPeriodChange,
  dateRangeText,
  onDateRangeChange,
  selectedStaff,
  onStaffChange,
  selectedRole,
  onRoleChange,
  searchKeyword,
  onSearchChange,
  onApplyFilters,
  isApplying = false,
  availableStaffList = [],
}) {
  const periodPresets = getPeriodPresets();
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  const todayIso = new Date().toISOString().split('T')[0];
  const sevenDaysAgoIso = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [customStartDate, setCustomStartDate] = useState(sevenDaysAgoIso);
  const [customEndDate, setCustomEndDate] = useState(todayIso);
  const [staffOptions, setStaffOptions] = useState([{ id: 'all', label: '👤 Semua Staf' }]);
  const datePickerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStaffOptions() {
      try {
        const staffMap = new Map();
        staffMap.set('all', '👤 Semua Staf');

        // 1. If availableStaffList passed from props
        if (availableStaffList && availableStaffList.length > 0) {
          availableStaffList.forEach((s) => {
            if (s.name && s.name.trim()) {
              const formatted = formatStaffName(s.name);
              const icon = s.role === 'kitchen' ? '🍳' : s.role === 'kasir' ? '💳' : '☕';
              const roleTag = s.role ? ` (${s.role.toUpperCase()})` : '';
              staffMap.set(formatted, `${icon} ${formatted}${roleTag}`);
            }
          });
        }

        // 2. Fetch active users from API
        try {
          const usersRes = await apiRequest('/users', { method: 'GET' });
          const users = Array.isArray(usersRes) ? usersRes : (usersRes.data || []);
          users.forEach((u) => {
            if (u.name && u.name.trim() && u.role !== 'super_admin') {
              const formatted = formatStaffName(u.name);
              const icon = u.role === 'kitchen' ? '🍳' : u.role === 'kasir' ? '💳' : '☕';
              const roleTag = ` (${u.role.toUpperCase()})`;
              staffMap.set(formatted, `${icon} ${formatted}${roleTag}`);
            }
          });
        } catch {
          // silently handle fallback
        }

        if (isMounted) {
          const list = Array.from(staffMap.entries()).map(([id, label]) => ({ id, label }));
          setStaffOptions(list);
        }
      } catch (err) {
        console.error('Error loading staff list for filter:', err);
      }
    }

    loadStaffOptions();

    return () => {
      isMounted = false;
    };
  }, [availableStaffList]);

  // Click outside to close custom date picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePickerModal(false);
      }
    }
    if (showDatePickerModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePickerModal]);

  const handleApplyCustomDates = () => {
    if (customStartDate && customEndDate) {
      const formatDateStr = (dStr) => {
        const d = new Date(dStr);
        const day = String(d.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
      };
      const formatted = `${formatDateStr(customStartDate)} s/d ${formatDateStr(customEndDate)}`;
      onDateRangeChange(formatted);
      onPeriodChange('custom');
      setShowDatePickerModal(false);
      onApplyFilters('custom', customStartDate, customEndDate, selectedStaff, selectedRole);
    }
  };

  const handleStaffSelect = (e) => {
    const val = e.target.value;
    onStaffChange(val);
    onApplyFilters(activePeriod, null, null, val, selectedRole);
  };

  const handleRoleSelect = (e) => {
    const val = e.target.value;
    onRoleChange(val);
    onApplyFilters(activePeriod, null, null, selectedStaff, val);
  };

  return (
    <section className="report-filter-bar animate-fade-in" aria-label="Filter Laporan Staf">
      {/* 1. Quick Period Tabs */}
      <div className="report-period-tabs" role="tablist">
        {periodPresets.map((preset) => {
          const isActive = activePeriod === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`report-period-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                onPeriodChange(preset.id);
                onDateRangeChange(preset.rangeText);
                onApplyFilters(preset.id, null, null, selectedStaff, selectedRole);
              }}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* 2. Controls Row */}
      <div className="report-filter-controls">
        {/* Custom Date Range Picker */}
        <div className="report-date-range-wrapper" ref={datePickerRef}>
          <button
            type="button"
            className={`report-date-range-btn ${showDatePickerModal ? 'active' : ''}`}
            onClick={() => setShowDatePickerModal(!showDatePickerModal)}
            title="Pilih rentang tanggal kustom"
            aria-expanded={showDatePickerModal}
          >
            <Calendar size={15} className="filter-icon" />
            <span className="date-range-label">{dateRangeText}</span>
          </button>

          {showDatePickerModal && (
            <div className="report-date-modal-popover animate-fade-in" role="dialog" aria-label="Pilih Rentang Tanggal">
              <div className="popover-title">Pilih Hari / Rentang Tanggal</div>
              <div className="popover-date-inputs">
                <div className="date-input-group">
                  <label htmlFor="staff-start-date">Dari Tanggal:</label>
                  <input
                    id="staff-start-date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="date-input-group">
                  <label htmlFor="staff-end-date">Sampai Tanggal:</label>
                  <input
                    id="staff-end-date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="popover-actions">
                <button
                  type="button"
                  className="btn-cancel-sm"
                  onClick={() => setShowDatePickerModal(false)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn-apply-sm"
                  onClick={handleApplyCustomDates}
                >
                  Terapkan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Staff Selector */}
        <div className="report-select-wrapper">
          <select
            className="report-select-input"
            value={selectedStaff}
            onChange={handleStaffSelect}
            aria-label="Filter Staf"
          >
            {staffOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="select-chevron" />
        </div>

        {/* Role Selector */}
        <div className="report-select-wrapper">
          <select
            className="report-select-input"
            value={selectedRole}
            onChange={handleRoleSelect}
            aria-label="Filter Peran Staf"
          >
            {roleOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="select-chevron" />
        </div>

        {/* Search Keyword */}
        <div className="report-search-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="report-search-input"
            placeholder="Cari nama staf / menu..."
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchKeyword && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Hapus pencarian"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Submit / Refresh Button */}
        <button
          type="button"
          className="btn-submit-report"
          onClick={() => onApplyFilters(activePeriod, null, null, selectedStaff, selectedRole)}
          disabled={isApplying}
        >
          <SlidersHorizontal size={14} strokeWidth={2.2} />
          <span>{isApplying ? 'Memuat...' : 'Terapkan'}</span>
        </button>
      </div>
    </section>
  );
}
