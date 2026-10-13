import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  ChevronDown,
  SlidersHorizontal,
  Users,
  Shield,
  Search,
  X,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Filter,
  Check
} from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import { formatStaffName } from '../../services/attendanceService';

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
    { id: 'today', label: 'Hari Ini', rangeText: todayStr },
    { id: '7days', label: '7 Hari Terakhir', rangeText: `${formatDateStr(start7)} s/d ${todayStr}` },
    { id: '30days', label: '30 Hari Terakhir', rangeText: `${formatDateStr(start30)} s/d ${todayStr}` },
    { id: 'month', label: 'Bulan Berjalan', rangeText: 'Bulan Ini' },
  ];
};

const roleOptions = [
  { id: 'all', label: 'Semua Peran' },
  { id: 'barista', label: '☕ Barista (Minuman)' },
  { id: 'kitchen', label: '🍳 Kitchen (Makanan)' },
  { id: 'kasir', label: '💳 Kasir (POS & Kasir)' },
];

const statusOptions = [
  { id: 'all', label: 'Semua Status' },
  { id: 'working', label: '🟢 Sedang Bekerja' },
  { id: 'completed', label: '✓ Shift Selesai' },
];

export default function AttendanceReportFilters({
  activePeriod,
  onPeriodChange,
  dateRangeText,
  onDateRangeChange,
  selectedStaff,
  onStaffChange,
  selectedRole,
  onRoleChange,
  selectedStatus = 'all',
  onStatusChange,
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

        if (availableStaffList && availableStaffList.length > 0) {
          availableStaffList.forEach((s) => {
            const name = s.userName || s.name;
            const id = s.userId || s.id || name;
            if (name && name.trim()) {
              const formatted = formatStaffName(name);
              const icon = s.role === 'kitchen' ? '🍳' : s.role === 'kasir' ? '💳' : '☕';
              const roleTag = s.role ? ` (${s.role.toUpperCase()})` : '';
              staffMap.set(id, `${icon} ${formatted}${roleTag}`);
            }
          });
        }

        try {
          const usersRes = await apiRequest('/users', { method: 'GET' });
          const users = Array.isArray(usersRes) ? usersRes : (usersRes.data || []);
          users.forEach((u) => {
            if (u.name && u.name.trim() && u.role !== 'super_admin') {
              const formatted = formatStaffName(u.name);
              const icon = u.role === 'kitchen' ? '🍳' : u.role === 'kasir' ? '💳' : '☕';
              const roleTag = ` (${u.role.toUpperCase()})`;
              staffMap.set(String(u.id), `${icon} ${formatted}${roleTag}`);
            }
          });
        } catch {
          // silently handle
        }

        if (isMounted) {
          const list = Array.from(staffMap.entries()).map(([id, label]) => ({ id, label }));
          setStaffOptions(list);
        }
      } catch (err) {
        console.error('Error loading staff list:', err);
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

  const handleSelectPeriod = (preset) => {
    onPeriodChange(preset.id);
    onDateRangeChange(preset.rangeText);
    onApplyFilters(preset.id, null, null, selectedStaff, selectedRole, selectedStatus);
  };

  const handleApplyCustomDate = () => {
    if (!customStartDate || !customEndDate) return;
    const sDate = new Date(customStartDate);
    const eDate = new Date(customEndDate);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const formattedRange = `${sDate.getDate()} ${months[sDate.getMonth()]} ${sDate.getFullYear()} s/d ${eDate.getDate()} ${months[eDate.getMonth()]} ${eDate.getFullYear()}`;

    onPeriodChange('custom');
    onDateRangeChange(formattedRange);
    setShowDatePickerModal(false);
    onApplyFilters('custom', customStartDate, customEndDate, selectedStaff, selectedRole, selectedStatus);
  };

  const handleResetFilters = () => {
    onPeriodChange('7days');
    const defaultPreset = periodPresets.find((p) => p.id === '7days');
    if (defaultPreset) onDateRangeChange(defaultPreset.rangeText);
    onStaffChange('all');
    onRoleChange('all');
    if (onStatusChange) onStatusChange('all');
    if (onSearchChange) onSearchChange('');
    onApplyFilters('7days', null, null, 'all', 'all', 'all');
  };

  const hasActiveFilters =
    selectedStaff !== 'all' ||
    selectedRole !== 'all' ||
    selectedStatus !== 'all' ||
    (searchKeyword && searchKeyword.trim().length > 0) ||
    activePeriod !== '7days';

  return (
    <section className="attendance-filter-cockpit animate-fade-in" aria-label="Filter Laporan Presensi">
      {/* Upper Control Bar */}
      <div className="att-filter-main-bar">
        {/* Left: Quick Period Pills */}
        <div className="att-period-pill-group" role="tablist">
          {periodPresets.map((preset) => {
            const isActive = activePeriod === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`att-period-pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectPeriod(preset)}
              >
                {preset.label}
              </button>
            );
          })}

          {/* Custom Date Trigger */}
          <div className="att-custom-date-box" ref={datePickerRef}>
            <button
              type="button"
              className={`att-period-pill-btn custom-pill ${activePeriod === 'custom' ? 'active' : ''}`}
              onClick={() => setShowDatePickerModal(!showDatePickerModal)}
              title="Pilih tanggal kustom"
            >
              <Calendar size={13} />
              <span>{activePeriod === 'custom' ? dateRangeText : 'Kustom'}</span>
              <ChevronDown size={12} />
            </button>

            {showDatePickerModal && (
              <div className="att-custom-date-popover animate-scale-in" role="dialog">
                <div className="popover-title-row">
                  <span className="popover-title">Rentang Tanggal Presensi</span>
                  <button
                    type="button"
                    className="popover-close-btn"
                    onClick={() => setShowDatePickerModal(false)}
                  >
                    <X size={13} />
                  </button>
                </div>

                <div className="popover-inputs-grid">
                  <div className="popover-field">
                    <label htmlFor="popover-start">Dari Tanggal</label>
                    <input
                      id="popover-start"
                      type="date"
                      value={customStartDate}
                      max={customEndDate || todayIso}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div className="popover-field">
                    <label htmlFor="popover-end">Sampai Tanggal</label>
                    <input
                      id="popover-end"
                      type="date"
                      value={customEndDate}
                      min={customStartDate}
                      max={todayIso}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="popover-actions">
                  <button
                    type="button"
                    className="popover-apply-btn"
                    onClick={handleApplyCustomDate}
                  >
                    Terapkan Rentang
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Dropdowns & Search */}
        <div className="att-filter-dropdowns-group">
          {/* Search Box */}
          <div className="att-search-input-box">
            <Search size={14} className="search-ico" />
            <input
              type="text"
              placeholder="Cari staf atau catatan..."
              value={searchKeyword}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchKeyword && (
              <button
                type="button"
                className="search-clear-ico"
                onClick={() => onSearchChange('')}
                title="Hapus kata kunci"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Staf Dropdown */}
          <div className="att-dropdown-select-box">
            <Users size={13} className="field-icon" />
            <select
              value={selectedStaff}
              onChange={(e) => {
                onStaffChange(e.target.value);
                onApplyFilters(activePeriod, null, null, e.target.value, selectedRole, selectedStatus);
              }}
              title="Pilih Staf"
            >
              {staffOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="arrow-icon" />
          </div>

          {/* Role Dropdown */}
          <div className="att-dropdown-select-box">
            <Shield size={13} className="field-icon" />
            <select
              value={selectedRole}
              onChange={(e) => {
                onRoleChange(e.target.value);
                onApplyFilters(activePeriod, null, null, selectedStaff, e.target.value, selectedStatus);
              }}
              title="Pilih Peran"
            >
              {roleOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="arrow-icon" />
          </div>

          {/* Status Dropdown */}
          <div className="att-dropdown-select-box">
            <CheckCircle2 size={13} className="field-icon" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                if (onStatusChange) onStatusChange(e.target.value);
                onApplyFilters(activePeriod, null, null, selectedStaff, selectedRole, e.target.value);
              }}
              title="Pilih Status"
            >
              {statusOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="arrow-icon" />
          </div>

          {/* Apply Button */}
          <button
            type="button"
            className="att-btn-apply"
            onClick={() => onApplyFilters(activePeriod, null, null, selectedStaff, selectedRole, selectedStatus)}
            disabled={isApplying}
          >
            <SlidersHorizontal size={13} />
            <span>{isApplying ? 'Memproses...' : 'Filter'}</span>
          </button>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              type="button"
              className="att-btn-reset"
              onClick={handleResetFilters}
              title="Reset ke pengaturan default (7 Hari, Semua Staf)"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Tags Ribbon */}
      {hasActiveFilters && (
        <div className="att-active-filters-ribbon">
          <span className="ribbon-label">Filter Aktif:</span>
          {activePeriod !== '7days' && (
            <span className="ribbon-tag">
              <span>Periode: {dateRangeText}</span>
              <button type="button" onClick={() => handleSelectPeriod(periodPresets.find(p => p.id === '7days'))}>
                <X size={11} />
              </button>
            </span>
          )}
          {selectedStaff !== 'all' && (
            <span className="ribbon-tag">
              <span>Staf: {staffOptions.find(s => s.id === selectedStaff)?.label.replace(/^[^\w]+/, '') || selectedStaff}</span>
              <button type="button" onClick={() => { onStaffChange('all'); onApplyFilters(activePeriod, null, null, 'all', selectedRole, selectedStatus); }}>
                <X size={11} />
              </button>
            </span>
          )}
          {selectedRole !== 'all' && (
            <span className="ribbon-tag">
              <span>Peran: {selectedRole.toUpperCase()}</span>
              <button type="button" onClick={() => { onRoleChange('all'); onApplyFilters(activePeriod, null, null, selectedStaff, 'all', selectedStatus); }}>
                <X size={11} />
              </button>
            </span>
          )}
          {selectedStatus !== 'all' && (
            <span className="ribbon-tag">
              <span>Status: {selectedStatus === 'working' ? 'Sedang Bekerja' : 'Shift Selesai'}</span>
              <button type="button" onClick={() => { if (onStatusChange) onStatusChange('all'); onApplyFilters(activePeriod, null, null, selectedStaff, selectedRole, 'all'); }}>
                <X size={11} />
              </button>
            </span>
          )}
          {searchKeyword && (
            <span className="ribbon-tag">
              <span>Cari: "{searchKeyword}"</span>
              <button type="button" onClick={() => onSearchChange('')}>
                <X size={11} />
              </button>
            </span>
          )}
        </div>
      )}
    </section>
  );
}
