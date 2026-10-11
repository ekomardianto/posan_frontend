import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Eye,
  Users,
  UserRound,
  Utensils,
  Receipt,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { merchantService } from '../../services/merchantService';

export default function Merchant() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  // Load merchants from database
  const loadMerchants = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await merchantService.getMerchants();
      setMerchants(data);
    } catch (err) {
      console.error('Error loading merchants:', err);
      setErrorMessage(err.message || 'Gagal memuat profil kafe dari database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  // Filtered dataset
  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      return (
        (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [merchants, searchQuery]);

  // Open Detail Modal
  const handleOpenDetail = (merchant) => {
    setSelectedMerchant(merchant);
    setIsDetailModalOpen(true);
  };

  // Table Columns Configuration
  const columns = [
    {
      key: 'name',
      title: 'Nama Kafe & Kategori',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl ${row.color || 'bg-brand-100 text-brand-700'} font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
          >
            {row.logoText}
          </div>
          <div>
            <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
              {row.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
                {row.category || 'Coffee Shop'}
              </span>
              <span className="text-[11px] text-slate-400">• {row.city}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'adminCount',
      title: 'Admin Café',
      align: 'center',
      render: (val, row) => (
        <div>
          <span className="inline-flex items-center gap-1 text-slate-700 font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-lg text-xs">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            {val} Admin
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'cashierCount',
      title: 'Staf & Kasir',
      align: 'center',
      render: (val) => (
        <span className="inline-flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded-lg text-xs">
          <UserRound className="w-3.5 h-3.5 text-slate-500" />
          {val} Petugas Aktif
        </span>
      ),
    },
    {
      key: 'totalProducts',
      title: 'Katalog Menu',
      align: 'center',
      render: (val) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800">
          <Utensils className="w-3.5 h-3.5 text-amber-600" />
          {val || 0} Menu
        </span>
      ),
    },
    {
      key: 'totalTransactions',
      title: 'Total Transaksi',
      align: 'center',
      render: (val) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800">
          <Receipt className="w-3.5 h-3.5 text-emerald-600" />
          {val || 0} Transaksi
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (val) => <Badge status={val} />,
    },
    {
      key: 'actions',
      title: 'Action',
      align: 'right',
      render: (_, row) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="icon"
            size="sm"
            onClick={() => handleOpenDetail(row)}
            title="Lihat Detail Kafe"
          >
            <Eye className="w-4 h-4 text-blue-600 hover:text-blue-700" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Profil Kafe & Gerai Operasional
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Informasi gerai, lokasi, administrasi, dan ringkasan transaksi kafe tersimpan terpusat.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={loadMerchants}
            title="Muat ulang data"
          >
            {loading ? 'Menyinkronkan...' : 'Refresh'}
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
          <Button variant="outline" size="sm" onClick={loadMerchants}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* 2. Search Bar */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Cari kafe, kota, email..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Table */}
      {loading && merchants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-slate-700">Mengambil data dari database...</p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={filteredMerchants}
          keyField="id"
          onRowClick={handleOpenDetail}
          emptyMessage="Tidak ada data gerai ditemukan."
        />
      )}

      {/* Modal: Detail Kafe */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Kafe & Operasional"
        description="Ringkasan identitas gerai kafe, akun admin, serta statistik menu dan transaksi."
        icon={Building2}
        size="lg"
        footer={
          <Button variant="outline" size="md" onClick={() => setIsDetailModalOpen(false)}>
            Tutup
          </Button>
        }
      >
        {selectedMerchant && (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div
                className={`w-12 h-12 rounded-2xl ${selectedMerchant.color || 'bg-brand-100 text-brand-700'} font-black text-sm flex items-center justify-center shadow-xs`}
              >
                {selectedMerchant.logoText || 'PO'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">{selectedMerchant.name}</h4>
                  <Badge status={selectedMerchant.status} />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-brand-700">{selectedMerchant.category}</span>
                  <span>• {selectedMerchant.city}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">
                  Alamat & Wilayah
                </span>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedMerchant.address}</span>
                </p>
                <p className="text-slate-500">{selectedMerchant.city}</p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">
                  Kontak & Admin Utama
                </span>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-mono">{selectedMerchant.email}</span>
                </p>
                <p className="text-slate-500 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedMerchant.phone}</span>
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">
                  Katalog & Staf
                </span>
                <p className="font-bold text-slate-800">
                  {selectedMerchant.totalProducts} Menu Terdaftar
                </p>
                <p className="text-slate-500">
                  {selectedMerchant.adminCount} Admin • {selectedMerchant.cashierCount} Kasir/Staf
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">
                  Riwayat Penjualan
                </span>
                <p className="font-bold text-slate-800">
                  {selectedMerchant.totalTransactions} Total Transaksi
                </p>
                <p className="text-emerald-600 font-semibold">Tersimpan di database</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
