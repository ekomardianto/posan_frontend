import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Power,
  Trash2,
  Mail,
  Shield,
  Calendar,
  Zap,
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
import { adminService } from '../../services/adminService';

export default function Admin() {
  const [admins, setAdmins] = useState([]);
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isToggleConfirmOpen, setIsToggleConfirmOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected item
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    status: 'Active',
  });

  // Load data from database
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const adminsData = await adminService.getAdmins();
      setAdmins(adminsData);
    } catch (err) {
      console.error('Error loading admin page data:', err);
      setErrorMessage(err.message || 'Gagal memuat data akun admin dari database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered dataset
  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      const matchSearch =
        (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.role || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'super_admin' && a.rawRole === 'super_admin') ||
        (roleFilter === 'admin' && a.rawRole === 'admin');

      const matchStatus =
        statusFilter === 'ALL' ||
        (a.status || '').toUpperCase() === statusFilter.toUpperCase();

      return matchSearch && matchRole && matchStatus;
    });
  }, [admins, searchQuery, roleFilter, statusFilter]);

  // Paginated dataset
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAdmins.slice(start, start + itemsPerPage);
  }, [filteredAdmins, currentPage, itemsPerPage]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setErrorMessage('');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      status: 'Active',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (adm, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSelectedAdmin(adm);
    setFormData({
      name: adm.name,
      email: adm.email,
      password: '',
      role: adm.rawRole || 'admin',
      status: adm.status,
    });
    setIsEditModalOpen(true);
  };

  // Open Toggle Confirm
  const handleOpenToggleConfirm = (adm, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSelectedAdmin(adm);
    setIsToggleConfirmOpen(true);
  };

  // Open Delete Confirm
  const handleOpenDeleteConfirm = (adm, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSelectedAdmin(adm);
    setIsDeleteModalOpen(true);
  };

  // Save New Admin to database
  const handleAddSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await adminService.createAdmin(formData);
      setIsAddModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menambahkan akun admin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Save Edit Admin to database
  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedAdmin || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await adminService.updateAdmin(selectedAdmin.id, formData);
      setIsEditModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui akun admin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Toggle Status in database
  const handleToggleStatus = async () => {
    if (!selectedAdmin || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await adminService.toggleAdminStatus(selectedAdmin.id, selectedAdmin.status);
      setIsToggleConfirmOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal mengubah status akun admin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete Admin from database
  const handleDeleteSubmit = async () => {
    if (!selectedAdmin || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await adminService.deleteAdmin(selectedAdmin.id);
      setIsDeleteModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menghapus akun admin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Table Columns Configuration
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
      title: 'Nama Admin & Email',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border shadow-2xs ${
              row.rawRole === 'super_admin'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-blue-50 text-blue-700 border-blue-100'
            }`}
          >
            {row.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {row.name}
              </p>
              {row.rawRole === 'super_admin' && (
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-white shadow-2xs">
                  SUPER
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{row.email}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role / Otoritas',
      render: (val, row) => (
        <div>
          <span
            className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg text-xs ${
              row.rawRole === 'super_admin'
                ? 'bg-amber-100/70 text-amber-900 border border-amber-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            {val}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {row.provisionMethod || 'database'}
          </p>
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
          {/* Edit Button */}
          <Button
            variant="icon"
            size="sm"
            onClick={(e) => handleOpenEdit(row, e)}
            title="Edit Data Admin"
          >
            <Edit2 className="w-4 h-4 text-blue-600 hover:text-blue-700" />
          </Button>

          {/* Toggle Active Button */}
          <Button
            variant="icon"
            size="sm"
            onClick={(e) => handleOpenToggleConfirm(row, e)}
            title={row.status === 'Active' ? 'Nonaktifkan Admin' : 'Aktifkan Admin'}
          >
            <Power
              className={`w-4 h-4 ${
                row.status === 'Active'
                  ? 'text-emerald-600 hover:text-rose-600'
                  : 'text-slate-400 hover:text-emerald-600'
              }`}
            />
          </Button>

          {/* Delete Button (Super Admin protected from self deletion) */}
          {row.rawRole !== 'super_admin' && (
            <Button
              variant="icon"
              size="sm"
              onClick={(e) => handleOpenDeleteConfirm(row, e)}
              title="Hapus Akun Admin"
            >
              <Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-700" />
            </Button>
          )}
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
            Manajemen Admin Kafe
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar akun Administrator dan Super Admin terdaftar di tabel database <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">users</code>.
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
            Tambah Admin
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

      {/* Info notice */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center gap-3 text-xs text-blue-900">
        <Zap className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          <strong>Proteksi Keamanan:</strong> Seluruh kata sandi dienkripsi dengan <code>bcrypt</code>. Password hash tidak pernah dikirim ke browser client.
        </span>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full sm:w-80">
          <Input
            placeholder="Cari nama admin, email..."
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
              { value: 'ALL', label: 'Semua Role Admin' },
              { value: 'admin', label: 'Admin Café' },
              { value: 'super_admin', label: 'Super Admin' },
            ]}
            className="w-40 text-xs"
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

      {/* 3. Table of Admins */}
      <Table
          columns={columns}
          data={paginatedData}
          keyField="id"
          isLoading={loading}
          emptyMessage="Tidak ada akun Admin ditemukan di database."
          emptySubtext="Coba ubah kata kunci pencarian atau filter status Anda."
          pagination={{
            currentPage,
            totalPages,
            totalItems: filteredAdmins.length,
            itemsPerPage,
            onPageChange: setCurrentPage,
          }}
        />

      {/* Modal: Tambah Admin */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !submitting && setIsAddModalOpen(false)}
        title="Tambah Akun Admin Baru"
        description="Buat akun administrator baru di database."
        icon={Users}
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
              {submitting ? 'Menyimpan...' : 'Simpan admin'}
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
            label="Nama Lengkap Admin"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Budi Santoso"
          />

          <Input
            label="Alamat Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="budi@posan.com"
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
              label="Peran / Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'admin', label: 'Admin Café' },
                { value: 'super_admin', label: 'Super Admin' },
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

      {/* Modal: Edit Admin */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !submitting && setIsEditModalOpen(false)}
        title={`Edit Akun Admin - ${selectedAdmin?.name}`}
        description="Perbarui informasi akun admin atau ubah kata sandi di database."
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
            label="Nama Lengkap Admin"
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
            placeholder="Biarkan kosong jika tidak ingin mengubah sandi"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Peran / Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'admin', label: 'Admin Café' },
                { value: 'super_admin', label: 'Super Admin' },
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

      {/* Modal: Confirm Toggle Status */}
      <Modal
        isOpen={isToggleConfirmOpen}
        onClose={() => !submitting && setIsToggleConfirmOpen(false)}
        title={
          selectedAdmin?.status === 'Active'
            ? 'Nonaktifkan Akun Admin?'
            : 'Aktifkan Kembali Akun Admin?'
        }
        description={`Konfirmasi perubahan status akses database untuk admin "${selectedAdmin?.name}".`}
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
              variant={selectedAdmin?.status === 'Active' ? 'danger' : 'success'}
              size="md"
              disabled={submitting}
              icon={submitting ? Loader2 : null}
              onClick={handleToggleStatus}
            >
              {submitting ? 'Memproses...' : selectedAdmin?.status === 'Active' ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          {selectedAdmin?.status === 'Active'
            ? 'Admin yang dinonaktifkan tidak akan dapat masuk ke panel Admin sampai diaktifkan kembali.'
            : 'Akun admin akan segera dapat login kembali ke backoffice gerai kafe.'}
        </p>
      </Modal>

      {/* Modal: Confirm Delete Admin */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !submitting && setIsDeleteModalOpen(false)}
        title="Hapus Akun Admin?"
        description={`Akun "${selectedAdmin?.name}" (${selectedAdmin?.email}) akan dihapus dari tabel users database.`}
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
              {submitting ? 'Menghapus...' : 'Ya, Hapus Akun'}
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Jika akun admin ini pernah mencatat transaksi penjualan, sistem akan menolak penghapusan untuk menjaga integritas data riwayat penjualan (disarankan menonaktifkan statusnya).
        </p>
      </Modal>
    </div>
  );
}
