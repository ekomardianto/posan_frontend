import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { fetchOnlyCashiers } from '../../services/cashierService';
import { fetchTransactions } from '../../services/transactionService';

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
    { id: "today", label: "Harian (Hari Ini)", rangeText: todayStr },
    { id: "7days", label: "Seminggu (7 Hari)", rangeText: `${formatDateStr(start7)} s/d ${todayStr}` },
    { id: "30days", label: "1 Bulan (30 Hari)", rangeText: `${formatDateStr(start30)} s/d ${todayStr}` },
  ];
};

const paymentMethodOptions = [
  { id: "all", label: "Semua Metode" },
  { id: "cash", label: "Tunai (Cash)" },
  { id: "qris", label: "QRIS" },
  { id: "bank", label: "Bank / Debit" },
];

export default function ReportFilters({
  activePeriod,
  onPeriodChange,
  dateRangeText,
  onDateRangeChange,
  selectedCashier,
  onCashierChange,
  selectedPaymentMethod,
  onPaymentMethodChange,
  onApplyFilters,
  isApplying = false
}) {
  const periodPresets = getPeriodPresets();
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  
  // Default start date = 30 days ago, end date = today
  const todayIso = new Date().toISOString().split('T')[0];
  const thirtyDaysAgoIso = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [customStartDate, setCustomStartDate] = useState(thirtyDaysAgoIso);
  const [customEndDate, setCustomEndDate] = useState(todayIso);
  const [cashierOptions, setCashierOptions] = useState([
    { id: 'all', label: 'Semua Kasir' }
  ]);
  const datePickerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCashiersList() {
      try {
        const users = await fetchOnlyCashiers();

        const cashierMap = new Map();
        cashierMap.set('all', 'Semua Kasir');

        // Only add users who have cashier role
        if (users && users.length > 0) {
          users.forEach((u) => {
            if (u.name && u.name.trim()) {
              cashierMap.set(u.name.trim(), u.name.trim());
            }
          });
        } else {
          // Fallback default cashiers if no cashiers in db
          ['Muhammad Zul Asfi', 'Andi', 'Rina'].forEach((name) => {
            cashierMap.set(name, name);
          });
        }

        if (isMounted) {
          const list = Array.from(cashierMap.entries()).map(([id, label]) => ({ id, label }));
          setCashierOptions(list);
        }
      } catch (err) {
        console.error('Error populating cashier filter options:', err);
      }
    }

    loadCashiersList();

    return () => {
      isMounted = false;
    };
  }, []);

  // Close date picker popup when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePickerModal(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setShowDatePickerModal(false);
      }
    }

    if (showDatePickerModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
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
      onApplyFilters('custom', customStartDate, customEndDate, selectedCashier, selectedPaymentMethod);
    }
  };

  const handleCashierSelect = (e) => {
    const val = e.target.value;
    onCashierChange(val);
    onApplyFilters(activePeriod, null, null, val, selectedPaymentMethod);
  };

  const handlePaymentMethodSelect = (e) => {
    const val = e.target.value;
    onPaymentMethodChange(val);
    onApplyFilters(activePeriod, null, null, selectedCashier, val);
  };

  return (
    <section className="report-filter-bar animate-fade-in" aria-label="Filter Laporan">
      {/* 1. Quick Period Switcher Tabs */}
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
                onApplyFilters(preset.id, null, null, selectedCashier, selectedPaymentMethod);
              }}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* 2. Controls Row: Date Picker, Dropdowns, Action Button */}
      <div className="report-filter-controls">
        {/* Date Range Picker Trigger */}
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

          {/* Custom Date Modal Dropdown */}
          {showDatePickerModal && (
            <div className="report-date-modal-popover animate-fade-in" role="dialog" aria-label="Pilih Rentang Tanggal">
              <div className="popover-title">Pilih Rentang Tanggal</div>
              <div className="popover-date-inputs">
                <div className="date-input-group">
                  <label htmlFor="report-start-date">Dari Tanggal:</label>
                  <input
                    id="report-start-date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="date-input-group">
                  <label htmlFor="report-end-date">Sampai Tanggal:</label>
                  <input
                    id="report-end-date"
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

        {/* Cashier Selector */}
        <div className="report-select-wrapper">
          <select
            className="report-select-input"
            value={selectedCashier}
            onChange={handleCashierSelect}
            aria-label="Filter Kasir"
          >
            {cashierOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="select-chevron" />
        </div>

        {/* Payment Method Selector */}
        <div className="report-select-wrapper">
          <select
            className="report-select-input"
            value={selectedPaymentMethod}
            onChange={handlePaymentMethodSelect}
            aria-label="Filter Metode Pembayaran"
          >
            {paymentMethodOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="select-chevron" />
        </div>

        {/* Submit / Apply Button */}
        <button
          type="button"
          className="btn-submit-report"
          onClick={() => onApplyFilters(activePeriod, null, null, selectedCashier, selectedPaymentMethod)}
          disabled={isApplying}
        >
          <SlidersHorizontal size={14} strokeWidth={2.2} />
          <span>{isApplying ? 'Memuat...' : 'Tampilkan Laporan'}</span>
        </button>
      </div>
    </section>
  );
}
