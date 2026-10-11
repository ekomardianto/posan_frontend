import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserRound,
  Search,
  Eye,
  Edit2,
  Power,
  Trash2,
  Plus,
  Mail,
  Monitor,
  Calendar,
  Info,
  CheckCircle2,
  Coffee,
  ChefHat,
  Loader2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { cashierService } from '../../services/cashierService';

export default function Cashier() {
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isToggleConfirmOpen, setIsToggleConfirmOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected item
  const [selectedCashier, setSelectedCashier] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'kasir',
    status: 'Active',
  });

  // Load live data from database
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const cashiersData = await cashierService.getCashiers();
      setCashiers(cashiersData);
    } catch (err) {
      console.error('Error loading cashiers page data:', err);
      setErrorMessage(err.message || 'Gagal memuat data staf dari database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered dataset
  const filteredCashiers = useMemo(() => {
    return cashiers.filter((c) => {
      const matchSearch =
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.terminal || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.role || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole = roleFilter === 'ALL' || c.role === roleFilter;
      const matchStatus =
        statusFilter === 'ALL' || (c.status || '').toUpperCase() === statusFilter.toUpperCase();

      return matchSearch && matchRole && matchStatus;
    });
  }, [cashiers, searchQuery, roleFilter, statusFilter]);

  // Paginated dataset
  const totalPages = Math.ceil(filteredCashiers.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCashiers.slice(start, start + itemsPerPage);
  }, [filteredCashiers, currentPage, itemsPerPage]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setErrorMessage('');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'kasir',
      status: 'Active',
    });
    setIsAddModalOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetail = (cashier) => {
    setSelectedCashier(cashier);
    setIsDetailModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cashier, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSelectedCashier(cashier);
    setFormData({
      name: cashier.name,
      email: cashier.email,
      password: '',
      role: cashier.role || 'kasir',
      status: cashier.status,
    });
    setIsEditModalOpen(true);
  };

  // Open Toggle Confirm
  const handleOpenToggleConfirm = (cashier, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSelectedCashier(cashier);
    setIsToggleConfirmOpen(true);
  };

  // Open Delete Confirm
  const handleOpenDeleteConfirm = (cashier, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSelectedCashier(cashier);
    setIsDeleteModalOpen(true);
  };

  // Save New Staff to database
  const handleAddSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await cashierService.createCashier(formData);
      setIsAddModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menambahkan staf baru.');
    } finally {
      setSubmitting(false);
    }
  };

  // Save Edit to database
  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedCashier || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await cashierService.updateCashier(selectedCashier.id, formData);
      setIsEditModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui data staf.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Toggle Status in database
  const handleToggleStatus = async () => {
    if (!selectedCashier || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await cashierService.toggleCashierStatus(selectedCashier.id, selectedCashier.status);
      setIsToggleConfirmOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal mengubah status staf.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete Staff in database
  const handleDeleteSubmit = async () => {
    if (!selectedCashier || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await cashierService.deleteCashier(selectedCashier.id);
      setIsDeleteModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menghapus akun staf.');
    } finally {
      setSubmitting(false);
    }
  };

  // Columns Configuration
  const columns = [
    {
      key: 'no',
      title: 'No',
      width: '50px',
      align: 'center',
      render: (_, __, idx) => (
        <span className="font-medium text-slate-400">
          {(currentPage - 1) * itemsPerPage + idx + 1}
        </span>
      ),
    },
    {
      key: 'name',
      title: 'Nama Staf & Kontak',
      render: (_, row) => {
        const isKasir = row.role === 'kasir';
        const isBarista = row.role === 'barista';

        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border shadow-2xs ${
                isKasir
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : isBarista
                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                  : 'bg-rose-50 text-rose-700 border-rose-100'
              }`}
            >
              {isKasir ? (
                <UserRound className="w-4 h-4" />
              ) : isBarista ? (
                <Coffee className="w-4 h-4" />
              ) : (
                <ChefHat className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {row.name}
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{row.email}</span>
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      title: 'Stasiun & Role',
      render: (val, row) => {
        const roleStyles = {
          kasir: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          barista: 'bg-amber-50 text-amber-800 border-amber-200',
          kitchen: 'bg-rose-50 text-rose-800 border-rose-200',
        };

        return (
          <div>
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg border ${
                roleStyles[row.role] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {row.roleLabel || val}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Monitor className="w-3 h-3 text-slate-400" />
              <span>{row.terminal}</span>
            </p>
          </div>
        );
      },
    },
    {
      key: 'totalTransactions',
      title: 'Riwayat Transaksi',
      align: 'center',
      render: (val, row) => (
        <div>
          {row.role === 'kasir' ? (
            <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
              {val} Transaksi Selesai
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-medium">
              Stasiun {row.role === 'barista' ? 'Minuman' : 'Makanan'}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status Akun',
      render: (val) => <Badge status={val} />,
    },
    {
      key: 'createdAt',
      title: 'Terdaftar',
      render: (val) => (
        <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {val}
        </span>
      ),
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
          {/* Detail Button */}
          <Button
            variant="icon"
            size="sm"
            onClick={() => handleOpenDetail(row)}
            title="Lihat Detail Staf"
          >
            <Eye className="w-4 h-4 text-slate-500 hover:text-slate-800" />
          </Button>

          {/* Edit Button */}
          <Button
            variant="icon"
            size="sm"
            onClick={(e) => handleOpenEdit(row, e)}
            title="Edit Data Staf"
          >
            <Edit2 className="w-4 h-4 text-emerald-600 hover:text-emerald-700" />
          </Button>

          {/* Toggle Active Button */}
          <Button
            variant="icon"
            size="sm"
            onClick={(e) => handleOpenToggleConfirm(row, e)}
            title={row.status === 'Active' ? 'Nonaktifkan Staf' : 'Aktifkan Staf'}
          >
            <Power
              className={`w-4 h-4 ${
                row.status === 'Active'
                  ? 'text-emerald-600 hover:text-rose-600'
                  : 'text-slate-400 hover:text-emerald-600'
              }`}
            />
          </Button>

          {/* Delete Button */}
          <Button
            variant="icon"
            size="sm"
            onClick={(e) => handleOpenDeleteConfirm(row, e)}
            title="Hapus Akun Staf"
          >
            <Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-700" />
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
            Kasir & Staf Operasional
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar petugas Kasir POS, Barista, dan Kitchen Chef yang terdaftar di sistem.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={loadData}
            title="Muat ulang data"
          >
            {loading ? 'Menyinkronkan...' : 'Refresh'}
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Tambah Staf Baru
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
          <Button variant="outline" size="sm" onClick={loadData}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* SaaS Architecture Notice Banner */}
      <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/90 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 space-y-1">
          <p className="font-bold">
            Manajemen Staf 5-Role POSAN (Kasir, Barista, Kitchen Chef)
          </p>
          <p className="text-emerald-800 leading-relaxed">
            Super Admin dapat mendaftarkan, mengedit, dan mengelola hak akses seluruh staf kasir dan stasiun pengerjaan dapur/bar. Setiap staf memiliki stasiun kerja yang terisolasi secara otomatis berdasarkan kategori pesanan menu.
          </p>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full sm:w-80">
          <Input
            placeholder="Cari nama staf, email, stasiun..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'Semua Role Staf' },
              { value: 'kasir', label: 'Kasir POS' },
              { value: 'barista', label: 'Barista (Minuman)' },
              { value: 'kitchen', label: 'Kitchen (Makanan)' },
            ]}
            className="w-44 text-xs"
          />

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'Semua Status' },
              { value: 'ACTIVE', label: 'Active (Aktif)' },
              { value: 'INACTIVE', label: 'Inactive (Nonaktif)' },
            ]}
            className="w-36 text-xs"
          />
        </div>
      </div>

      {/* 3. Table of Cashiers */}
      {loading && cashiers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-slate-700">Mengambil data staf dari database...</p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={paginatedData}
          keyField="id"
          onRowClick={handleOpenDetail}
          emptyMessage="Tidak ada staf ditemukan di database."
          emptySubtext="Silakan periksa filter atau kata kunci pencarian Anda."
          pagination={{
            currentPage,
            totalPages,
            totalItems: filteredCashiers.length,
            itemsPerPage,
            onPageChange: setCurrentPage,
          }}
        />
      )}

      {/* Modal: Tambah Staf Baru */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !submitting && setIsAddModalOpen(false)}
        title="Tambah Akun Staf Baru"
        description="Daftarkan akun staf baru ke database."
        icon={Plus}
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={submitting}
              onClick={() => setIsAddModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={submitting}
              icon={submitting ? Loader2 : null}
              onClick={handleAddSubmit}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Staf ke Database'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-3.5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Nama Lengkap Staf"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Rian Pratama"
          />

          <Input
            label="Email Akun"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="rian@posan.com"
          />

          <Input
            label="Kata Sandi Awal"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Minimal 6 karakter"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Peran / Role Stasiun"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'kasir', label: 'Kasir POS' },
                { value: 'barista', label: 'Barista (Minuman)' },
                { value: 'kitchen', label: 'Kitchen Chef (Makanan)' },
              ]}
            />

            <Select
              label="Status Akun"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'Active', label: 'Active (Aktif)' },
                { value: 'Inactive', label: 'Inactive (Nonaktif)' },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Kasir */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !submitting && setIsEditModalOpen(false)}
        title={`Edit Data Staf - ${selectedCashier?.name}`}
        description="Perbarui informasi akun, role, atau ubah kata sandi di database."
        icon={Edit2}
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={submitting}
              onClick={() => setIsEditModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={submitting}
              icon={submitting ? Loader2 : null}
              onClick={handleEditSubmit}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-3.5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Nama Lengkap Staf"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Email Akun"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Kata Sandi Baru (Opsional)"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Biarkan kosong jika tidak diubah"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Peran / Role Stasiun"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'kasir', label: 'Kasir POS' },
                { value: 'barista', label: 'Barista (Minuman)' },
                { value: 'kitchen', label: 'Kitchen Chef (Makanan)' },
              ]}
            />

            <Select
              label="Status Akun"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'Active', label: 'Active (Aktif)' },
                { value: 'Inactive', label: 'Inactive (Nonaktif)' },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Detail Kasir */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Akun Staf Kafe"
        description="Informasi kredensial terminal, stasiun pengerjaan, dan riwayat transaksi."
        icon={UserRound}
        size="md"
        footer={
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsDetailModalOpen(false)}
          >
            Tutup
          </Button>
        }
      >
        {selectedCashier && (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center shadow-2xs">
                {selectedCashier.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">{selectedCashier.name}</h4>
                  <Badge status={selectedCashier.status} />
                </div>
                <p className="text-xs text-slate-500">
                  Peran: <span className="font-semibold text-slate-800">{selectedCashier.roleLabel}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Alamat Email
                </span>
                <p className="font-semibold text-slate-800 font-mono">{selectedCashier.email}</p>
                <p className="text-slate-400 text-[11px]">Database terhubung</p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Stasiun Pengerjaan
                </span>
                <p className="font-semibold text-emerald-700">{selectedCashier.terminal}</p>
                <p className="text-slate-400 text-[11px]">Shift Reguler Kafe</p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 col-span-2">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Status & Aktivitas
                </span>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-bold text-slate-800">
                    {selectedCashier.totalTransactions} Transaksi Kasir Dicatat
                  </p>
                  <p className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sinkronisasi database aktif</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Confirm Toggle Status */}
      <Modal
        isOpen={isToggleConfirmOpen}
        onClose={() => !submitting && setIsToggleConfirmOpen(false)}
        title={
          selectedCashier?.status === 'Active'
            ? 'Nonaktifkan Akun Staf?'
            : 'Aktifkan Kembali Akun Staf?'
        }
        description={`Konfirmasi perubahan status akses database untuk staf "${selectedCashier?.name}".`}
        icon={Power}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={submitting}
              onClick={() => setIsToggleConfirmOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant={selectedCashier?.status === 'Active' ? 'danger' : 'success'}
              size="md"
              disabled={submitting}
              icon={submitting ? Loader2 : null}
              onClick={handleToggleStatus}
            >
              {submitting ? 'Memproses...' : selectedCashier?.status === 'Active' ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          {selectedCashier?.status === 'Active'
            ? 'Menonaktifkan staf akan memblokir hak login staf ke terminal POS atau layar kitchen/barista sampai diaktifkan kembali.'
            : 'Staf akan segera dapat login kembali dan memproses pesanan di terminal kafe.'}
        </p>
      </Modal>

      {/* Modal: Confirm Delete Staff */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !submitting && setIsDeleteModalOpen(false)}
        title="Hapus Akun Staf?"
        description={`Akun staf "${selectedCashier?.name}" (${selectedCashier?.email}) akan dihapus dari tabel users database.`}
        icon={Trash2}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={submitting}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="md"
              disabled={submitting}
              icon={submitting ? Loader2 : null}
              onClick={handleDeleteSubmit}
            >
              {submitting ? 'Menghapus...' : 'Ya, Hapus Staf'}
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Jika staf ini pernah memproses transaksi penjualan, database akan melindungi integritas riwayat penjualan dan menolak penghapusan. Dalam kasus ini, gunakan fitur nonaktifkan akun.
        </p>
      </Modal>
    </div>
  );
}
