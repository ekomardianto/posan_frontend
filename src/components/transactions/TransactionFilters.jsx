import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar, User, CreditCard, ChevronDown, Check } from 'lucide-react';
import { fetchOnlyCashiers } from '../../services/cashierService';

const staticPaymentMethods = [
  { value: 'all', label: 'Semua Metode' },
  { value: 'Tunai', label: 'Tunai (Cash)' },
  { value: 'QRIS', label: 'QRIS' },
  { value: 'Bank', label: 'Bank Transfer' },
];

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'PAID', label: 'PAID / Sukses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'VOID', label: 'Void / Batal' },
];

export default function TransactionFilters({
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  selectedCashier,
  onCashierChange,
  selectedPaymentMethod,
  onPaymentMethodChange,
  selectedStatus,
  onStatusChange
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [cashierList, setCashierList] = useState([
    { value: 'all', label: 'Semua Kasir' }
  ]);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchOnlyCashiers().then((users) => {
      if (users && users.length > 0) {
        const list = [
          { value: 'all', label: 'Semua Kasir' },
          ...users.map((u) => ({
            value: u.name,
            label: u.name
          }))
        ];
        const unique = list.filter((item, index, self) =>
          index === self.findIndex((t) => t.label === item.label)
        );
        setCashierList(unique);
      } else {
        setCashierList([
          { value: 'all', label: 'Semua Kasir' },
          { value: 'Diki', label: 'Diki' }
        ]);
      }
    });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const getCashierLabel = () => {
    const found = cashierList.find((c) => c.value === selectedCashier);
    return found ? found.label : 'Semua Kasir';
  };

  const getPaymentMethodLabel = () => {
    const found = staticPaymentMethods.find((p) => p.value === selectedPaymentMethod);
    return found ? found.label : 'Semua Metode';
  };

  const getStatusLabel = () => {
    const found = statusOptions.find((s) => s.value === selectedStatus);
    return found ? found.label : 'Semua Status';
  };

  return (
    <section className="trx-filter-bar animate-fade-in" ref={containerRef} aria-label="Pencarian dan Filter Transaksi">
      {/* Search Input on Left */}
      <div className="trx-search-box">
        <Search size={16} className="trx-search-icon" />
        <input
          type="text"
          placeholder="Cari nomor transaksi (#TRX...), nama kasir, atau meja..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="trx-search-input"
          aria-label="Pencarian Transaksi"
        />
        {searchQuery && (
          <button
            type="button"
            className="trx-search-clear-btn"
            onClick={() => onSearchChange('')}
            title="Hapus pencarian"
          >
            &times;
          </button>
        )}
      </div>

      {/* Filter Buttons / Dropdowns on Right */}
      <div className="trx-filters-group">
        {/* 1. Date Range Filter */}
        <div className="trx-dropdown-wrapper">
          <button
            type="button"
            className={`trx-filter-btn ${openDropdown === 'date' ? 'active' : ''}`}
            onClick={() => toggleDropdown('date')}
            aria-expanded={openDropdown === 'date'}
          >
            <Calendar size={14} className="trx-filter-icon" />
            <span className="trx-filter-btn-text">{dateRange || '27 Sep 2026 - 27 Sep 2026'}</span>
            <ChevronDown size={13} className="trx-chevron" />
          </button>

          {openDropdown === 'date' && (
            <div className="trx-dropdown-menu">
              <div className="trx-dropdown-header">Rentang Tanggal</div>
              <button
                type="button"
                className={`trx-dropdown-item ${dateRange === '27 Sep 2026 - 27 Sep 2026' ? 'selected' : ''}`}
                onClick={() => {
                  onDateRangeChange('27 Sep 2026 - 27 Sep 2026');
                  setOpenDropdown(null);
                }}
              >
                <span>Hari Ini (27 Sep 2026)</span>
                {dateRange === '27 Sep 2026 - 27 Sep 2026' && <Check size={14} />}
              </button>
              <button
                type="button"
                className={`trx-dropdown-item ${dateRange === '21 Sep 2026 - 27 Sep 2026' ? 'selected' : ''}`}
                onClick={() => {
                  onDateRangeChange('21 Sep 2026 - 27 Sep 2026');
                  setOpenDropdown(null);
                }}
              >
                <span>7 Hari Terakhir</span>
                {dateRange === '21 Sep 2026 - 27 Sep 2026' && <Check size={14} />}
              </button>
              <button
                type="button"
                className={`trx-dropdown-item ${dateRange === '01 Sep 2026 - 27 Sep 2026' ? 'selected' : ''}`}
                onClick={() => {
                  onDateRangeChange('01 Sep 2026 - 27 Sep 2026');
                  setOpenDropdown(null);
                }}
              >
                <span>Bulan Ini (September 2026)</span>
                {dateRange === '01 Sep 2026 - 27 Sep 2026' && <Check size={14} />}
              </button>
            </div>
          )}
        </div>

        {/* 2. Cashier Filter */}
        <div className="trx-dropdown-wrapper">
          <button
            type="button"
            className={`trx-filter-btn ${openDropdown === 'cashier' ? 'active' : ''}`}
            onClick={() => toggleDropdown('cashier')}
            aria-expanded={openDropdown === 'cashier'}
          >
            <User size={14} className="trx-filter-icon" />
            <span className="trx-filter-btn-text">{getCashierLabel()}</span>
            <ChevronDown size={13} className="trx-chevron" />
          </button>

          {openDropdown === 'cashier' && (
            <div className="trx-dropdown-menu">
              <div className="trx-dropdown-header">Filter Kasir Bertugas</div>
              {cashierList.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`trx-dropdown-item ${selectedCashier === opt.value ? 'selected' : ''}`}
                  onClick={() => {
                    onCashierChange(opt.value);
                    setOpenDropdown(null);
                  }}
                >
                  <span>{opt.label}</span>
                  {selectedCashier === opt.value && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Payment Method Filter */}
        <div className="trx-dropdown-wrapper">
          <button
            type="button"
            className={`trx-filter-btn ${openDropdown === 'method' ? 'active' : ''}`}
            onClick={() => toggleDropdown('method')}
            aria-expanded={openDropdown === 'method'}
          >
            <CreditCard size={14} className="trx-filter-icon" />
            <span className="trx-filter-btn-text">{getPaymentMethodLabel()}</span>
            <ChevronDown size={13} className="trx-chevron" />
          </button>

          {openDropdown === 'method' && (
            <div className="trx-dropdown-menu">
              <div className="trx-dropdown-header">Metode Pembayaran</div>
              {staticPaymentMethods.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`trx-dropdown-item ${selectedPaymentMethod === opt.value ? 'selected' : ''}`}
                  onClick={() => {
                    onPaymentMethodChange(opt.value);
                    setOpenDropdown(null);
                  }}
                >
                  <span>{opt.label}</span>
                  {selectedPaymentMethod === opt.value && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. Status Filter */}
        <div className="trx-dropdown-wrapper">
          <button
            type="button"
            className={`trx-filter-btn ${openDropdown === 'status' ? 'active' : ''}`}
            onClick={() => toggleDropdown('status')}
            aria-expanded={openDropdown === 'status'}
          >
            <span className="trx-status-indicator-dot" />
            <span className="trx-filter-btn-text">{getStatusLabel()}</span>
            <ChevronDown size={13} className="trx-chevron" />
          </button>

          {openDropdown === 'status' && (
            <div className="trx-dropdown-menu">
              <div className="trx-dropdown-header">Status Transaksi</div>
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`trx-dropdown-item ${selectedStatus === opt.value ? 'selected' : ''}`}
                  onClick={() => {
                    onStatusChange(opt.value);
                    setOpenDropdown(null);
                  }}
                >
                  <span>{opt.label}</span>
                  {selectedStatus === opt.value && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
