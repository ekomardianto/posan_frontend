import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useProgressRouter } from '../../context/NavigationProgressContext';
import {
  Users as UsersIcon,
  Shield,
  UserCheck,
  UserX,
  Plus,
  Search,
  Edit2,
  Power,
  Trash2,
  Mail,
  Eye,
  EyeOff,
  Coffee,
  ChefHat,
  Monitor,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Layers,
  Store,
  Building2
} from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

// Tab configuration for User Sub-Menus (Admin, Kasir, Barista, Kitchen)
const USER_TABS = [
  {
    id: 'admin',
    label: 'Admin',
    path: '/superadmin/users/admin',
    icon: Shield,
    description: 'Administrator gerai/outlet dengan hak kelola operasional kafe',
    color: 'indigo',
  },
  {
    id: 'kasir',
    label: 'Kasir',
    path: '/superadmin/users/kasir',
    icon: Monitor,
    description: 'Staf kasir operasional point-of-sale, pemrosesan struk, dan pembayaran pesanan',
    color: 'emerald',
  },
  {
    id: 'barista',
    label: 'Barista',
    path: '/superadmin/users/barista',
    icon: Coffee,
    description: 'Staf stasiun bar minuman untuk pemrosesan tiket pesanan coffee & beverage',
    color: 'amber',
  },
  {
    id: 'kitchen',
    label: 'Kitchen',
    path: '/superadmin/users/kitchen',
    icon: ChefHat,
    description: 'Staf dapur stasiun kitchen untuk penyiapan hidangan & makanan',
    color: 'rose',
  },
];

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin (Admin Outlet)' },
  { value: 'kasir', label: 'Kasir (Point of Sale)' },
  { value: 'barista', label: 'Barista (Bar Station)' },
  { value: 'kitchen', label: 'Kitchen (Dapur / Makanan)' },
  { value: 'super_admin', label: 'Super Admin (System Owner)' },
];

export default function Users() {
  const { role } = useAuth();
  const isSuperAdmin = role === 'super_admin';
  const canManageUsers = role === 'admin';

  const pathname = usePathname();
  const router = useProgressRouter();
  const roleTab = pathname.split('/').filter(Boolean).at(-1);

  // Determine active tab from URL: /superadmin/users/:roleTab
  const activeTabId = useMemo(() => {
    if (!roleTab) {
      const path = pathname.toLowerCase();
      if (path.includes('/admin')) return 'admin';
      if (path.includes('/kasir')) return 'kasir';
      if (path.includes('/barista')) return 'barista';
      if (path.includes('/kitchen')) return 'kitchen';
      return 'admin';
    }
    const clean = roleTab.toLowerCase();
    if (['admin', 'kasir', 'barista', 'kitchen'].includes(clean)) {
      return clean;
    }
    return 'admin';
  }, [roleTab, pathname]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isToggleConfirmOpen, setIsToggleConfirmOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected User
  const [selectedUser, setSelectedUser] = useState(null);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    is_active: true,
  });

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  // Load live users from database
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users from database:', err);
      setErrorMessage(err.message || 'Gagal memuat daftar pengguna dari database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle Tab Switch
  const handleTabChange = (tabId) => {
    setCurrentPage(1);
    setSearchQuery('');
    setStatusFilter('ALL');
    router.push(`/superadmin/users/${tabId}`);
  };

  // Filtered dataset according to active tab + search + status
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter from active tab
      if (u.role !== activeTabId) return false;

      // Status filter
      if (statusFilter !== 'ALL') {
        const isActive = statusFilter === 'ACTIVE';
        if (u.is_active !== isActive) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = (u.name || '').toLowerCase().includes(query);
        const matchEmail = (u.email || '').toLowerCase().includes(query);
        const matchRole = (u.role || '').toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchRole) return false;
      }

      return true;
    });
  }, [users, activeTabId, statusFilter, searchQuery]);

  // Role Counts for Tabs
  const roleCounts = useMemo(() => {
    const counts = {
      admin: 0,
      kasir: 0,
      barista: 0,
      kitchen: 0,
    };
    users.forEach((u) => {
      if (counts[u.role] !== undefined) {
        counts[u.role] += 1;
      }
    });
    return counts;
  }, [users]);

  // Current Active Tab Object
  const currentTab = useMemo(() => {
    return USER_TABS.find((t) => t.id === activeTabId) || USER_TABS[0];
  }, [activeTabId]);

  // Statistics for current tab
  const stats = useMemo(() => {
    const subset = users.filter((u) => u.role === activeTabId);
    const total = subset.length;
    const active = subset.filter((u) => u.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [users, activeTabId]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setErrorMessage('');
    const defaultRole = activeTabId || 'admin';
    setFormData({
      name: '',
      email: '',
      password: '',
      role: defaultRole,
      is_active: true,
    });
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'kasir',
      is_active: user.is_active ?? true,
    });
    setShowPassword(false);
    setIsEditModalOpen(true);
  };

  // Open Toggle Confirm Modal
  const handleOpenToggle = (user, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSelectedUser(user);
    setIsToggleConfirmOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (user, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Submit Add User
  const handleAddSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await userService.createUser(formData);
      setIsAddModalOpen(false);
      showToast(`Pengguna "${formData.name}" (${formData.role.toUpperCase()}) berhasil ditambahkan ke database.`);
      await loadUsers();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menambahkan pengguna baru.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit User
  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedUser || !formData.name.trim() || !formData.email.trim() || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await userService.updateUser(selectedUser.id, formData);
      setIsEditModalOpen(false);
      showToast(`Data akun "${formData.name}" berhasil diperbarui di database.`);
      await loadUsers();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui data pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Toggle Status
  const handleToggleSubmit = async () => {
    if (!selectedUser || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await userService.toggleUserStatus(selectedUser.id, selectedUser.is_active);
      setIsToggleConfirmOpen(false);
      showToast(`Status akun "${selectedUser.name}" berhasil diubah menjadi ${!selectedUser.is_active ? 'AKTIF' : 'NONAKTIF'}.`);
      await loadUsers();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal mengubah status aktif pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete User
  const handleDeleteSubmit = async () => {
    if (!selectedUser || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await userService.deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      showToast(`Akun "${selectedUser.name}" berhasil dihapus dari database.`);
      await loadUsers();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menghapus pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper badge for roles
  const renderRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" />
            Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Shield className="w-3 h-3 text-indigo-600" />
            Admin Café
          </span>
        );
      case 'kasir':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Monitor className="w-3 h-3 text-emerald-600" />
            Kasir POS
          </span>
        );
      case 'barista':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Coffee className="w-3 h-3 text-amber-600" />
            Barista
          </span>
        );
      case 'kitchen':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ChefHat className="w-3 h-3 text-rose-600" />
            Kitchen
          </span>
        );
      default:
        return <Badge variant="neutral">{role}</Badge>;
    }
  };

  // Avatar initials and color helper
  const getAvatarConfig = (user) => {
    const initials = (user.name || 'U')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    let bg = 'bg-slate-100 text-slate-700 border-slate-200';
    if (user.role === 'admin') bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (user.role === 'kasir') bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (user.role === 'barista') bg = 'bg-amber-50 text-amber-700 border-amber-200';
    if (user.role === 'kitchen') bg = 'bg-rose-50 text-rose-700 border-rose-200';
    if (user.role === 'super_admin') bg = 'bg-amber-50 text-amber-800 border-amber-300';

    return { initials, bg };
  };

  // Table Columns
  const columns = useMemo(() => {
    const cols = [
      {
        key: 'name',
        title: 'Nama & Email Pengguna',
        render: (_, row) => {
          const { initials, bg } = getAvatarConfig(row);
          return (
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border shadow-2xs ${bg}`}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{row.name}</p>
                <p className="text-xs text-slate-400 font-mono flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span>{row.email}</span>
                </p>
              </div>
            </div>
          );
        },
      },
      {
        key: 'cafe_origin',
        title: 'Asal Kafe / Gerai',
        render: (_, row) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/70 shadow-2xs shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-800">
                {row.role === 'super_admin' ? 'Kantor Pusat POSAN' : 'POSAN Coffee & Roastery'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Jakarta Selatan</p>
            </div>
          </div>
        ),
      },
      {
        key: 'role',
        title: 'Hak Akses / Role',
        render: (_, row) => renderRoleBadge(row.role),
      },
      {
        key: 'is_active',
        title: 'Status Akun',
        render: (_, row) => (
          <Badge variant={row.is_active ? 'success' : 'neutral'}>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${row.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {row.is_active ? 'Aktif' : 'Nonaktif'}
            </span>
          </Badge>
        ),
      },
      {
        key: 'created_at',
        title: 'Tanggal Dibuat',
        render: (_, row) => {
          const dateStr = row.created_at
            ? new Date(row.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '-';
          return <span className="text-xs text-slate-500 font-mono">{dateStr}</span>;
        },
      },
    ];

    // Tindakan (Edit/Hapus/Toggle) hanya tersedia untuk Admin Cafe, bukan Super Admin
    if (canManageUsers && !isSuperAdmin) {
      cols.push({
        key: 'actions',
        title: 'Tindakan',
        align: 'right',
        render: (_, row) => {
          const isSelf = row.role === 'super_admin';
          return (
            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={(e) => handleOpenEdit(row, e)}
                className="text-slate-600 hover:text-brand-600 hover:border-brand-300"
                title="Edit Data Pengguna"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Power}
                disabled={isSelf}
                onClick={(e) => handleOpenToggle(row, e)}
                className={
                  row.is_active
                    ? 'text-amber-600 hover:bg-amber-50 hover:border-amber-300'
                    : 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300'
                }
                title={row.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
              >
                {row.is_active ? 'Matikan' : 'Aktifkan'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Trash2}
                disabled={isSelf}
                onClick={(e) => handleOpenDelete(row, e)}
                className="text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                title="Hapus Akun"
              >
                Hapus
              </Button>
            </div>
          );
        },
      });
    }

    return cols;
  }, [canManageUsers, isSuperAdmin]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{successToast}</p>
        </div>
      )}

      {/* 1. Header Page */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center">
              <UsersIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Pengguna & Staf
            </h1>
            {isSuperAdmin && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Mode Monitoring (Read-Only)
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {isSuperAdmin
              ? 'Melihat daftar seluruh pengguna, staf kafe, dan asal gerai terdaftar di database.'
              : 'Kelola seluruh akun kasir, admin outlet, barista, dan kitchen yang tersimpan secara terpusat di database.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={loadUsers}
            disabled={loading}
            title="Muat ulang data"
          >
            {loading ? 'Menyinkronkan...' : 'Sinkron'}
          </Button>
          {!isSuperAdmin && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenAdd}
            >
              + Tambah User Baru
            </Button>
          )}
        </div>
      </div>

      {/* 2. Sub-Menu Tabs (Admin, Kasir, Barista, Kitchen) */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-2 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {USER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabId === tab.id;
            const count = roleCounts[tab.id] ?? 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Description Banner */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <currentTab.icon className="w-4 h-4 text-brand-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-800">
              Sub Menu: <span className="text-brand-600 uppercase">{currentTab.label}</span>
            </p>
            <p className="text-[11px] text-slate-500">{currentTab.description}</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-500 font-semibold self-start sm:self-center">
          Tabel: <span className="text-slate-800 font-bold">public.users</span>
        </span>
      </div>

      {/* 3. Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200/70 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Akun ({currentTab.label})</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.total}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Tersimpan di database</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <UsersIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-emerald-50/20">
          <div>
            <p className="text-xs font-semibold text-emerald-700">Akun Aktif</p>
            <p className="text-2xl font-extrabold text-emerald-900 mt-0.5">{stats.active}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">Dapat login ke POS / Panel</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/70 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Akun Nonaktif</p>
            <p className="text-2xl font-extrabold text-slate-700 mt-0.5">{stats.inactive}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Akses login ditangguhkan</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadUsers}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* 4. Table & Filter Controls */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Cari nama, email pada sub menu ${currentTab.label}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Semua Status' },
                { value: 'ACTIVE', label: 'Hanya Aktif' },
                { value: 'INACTIVE', label: 'Hanya Nonaktif' },
              ]}
              className="text-xs"
            />
          </div>
        </div>

        {/* User Table */}
        {loading ? (
          <Table columns={columns} data={[]} isLoading />
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <currentTab.icon className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">Tidak ada data pengguna ditemukan</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Belum ada akun pada sub menu <span className="font-semibold">{currentTab.label}</span> atau pencarian Anda tidak cocok dengan data database.
            </p>
            {!isSuperAdmin && (
              <Button variant="outline" size="sm" icon={Plus} onClick={handleOpenAdd} className="mt-2">
                Tambah Pengguna Sekarang
              </Button>
            )}
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
            pagination={{
              currentPage,
              totalPages: Math.ceil(filteredUsers.length / itemsPerPage) || 1,
              onPageChange: setCurrentPage,
              totalItems: filteredUsers.length,
            }}
          />
        )}
      </div>

      {/* MODAL 1: ADD USER */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !submitting && setIsAddModalOpen(false)}
        title={`Tambah Pengguna Baru (${currentTab.label})`}
        description="Data akun pengguna baru akan diverifikasi dan disimpan langsung ke tabel users database"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
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
              icon={submitting ? Loader2 : Plus}
              disabled={submitting || !formData.name.trim() || !formData.email.trim() || !formData.password.trim()}
              onClick={handleAddSubmit}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Pengguna'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Pengguna <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="Contoh: Budi Santoso"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Email <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="Contoh: kasir@posan.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Email harus unik dan belum terdaftar di sistem.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kata Sandi Awal <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Kata sandi akan di-hash secara aman menggunakan bcrypt di backend.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Role / Hak Akses <span className="text-rose-500">*</span>
              </label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                options={ROLE_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Awal</label>
              <Select
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                options={[
                  { value: 'true', label: 'Aktif' },
                  { value: 'false', label: 'Nonaktif' },
                ]}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT USER */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !submitting && setIsEditModalOpen(false)}
        title="Ubah Data Pengguna"
        description="Perbarui informasi profil atau perbarui kata sandi pengguna di database"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
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
              icon={submitting ? Loader2 : Edit2}
              disabled={submitting || !formData.name.trim() || !formData.email.trim()}
              onClick={handleEditSubmit}
            >
              {submitting ? 'Memperbarui...' : 'Simpan Perubahan'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Email <span className="text-rose-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reset Kata Sandi <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Kosongkan jika tidak ingin mengubah kata sandi"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Isi hanya bila ingin mengatur ulang kata sandi pengguna ini.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role Pengguna</label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                options={ROLE_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Akun</label>
              <Select
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                options={[
                  { value: 'true', label: 'Aktif' },
                  { value: 'false', label: 'Nonaktif' },
                ]}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: TOGGLE STATUS CONFIRM */}
      <Modal
        isOpen={isToggleConfirmOpen}
        onClose={() => !submitting && setIsToggleConfirmOpen(false)}
        title={selectedUser?.is_active ? 'Nonaktifkan Akun Pengguna' : 'Aktifkan Akun Pengguna'}
        description="Konfirmasi perubahan status akses akun di sistem POSAN"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="md"
              disabled={submitting}
              onClick={() => setIsToggleConfirmOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant={selectedUser?.is_active ? 'danger' : 'primary'}
              size="md"
              icon={submitting ? Loader2 : Power}
              disabled={submitting}
              onClick={handleToggleSubmit}
            >
              {submitting ? 'Menyimpan...' : selectedUser?.is_active ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Apakah Anda yakin ingin {selectedUser?.is_active ? 'menonaktifkan' : 'mengaktifkan'} akun{' '}
            <span className="font-bold text-slate-900">{selectedUser?.name}</span> ({selectedUser?.email})?
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-[11px] text-slate-500">
            {selectedUser?.is_active
              ? 'Akun yang dinonaktifkan tidak akan dapat login ke aplikasi POSAN hingga diaktifkan kembali.'
              : 'Akun akan segera dapat login dan menggunakan fitur sesuai role yang ditetapkan.'}
          </div>
        </div>
      </Modal>

      {/* MODAL 4: DELETE CONFIRM */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !submitting && setIsDeleteModalOpen(false)}
        title="Hapus Akun Pengguna"
        description="Tindakan ini akan menghapus data akun dari database"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
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
              icon={submitting ? Loader2 : Trash2}
              disabled={submitting}
              onClick={handleDeleteSubmit}
            >
              {submitting ? 'Menghapus...' : 'Ya, Hapus Akun'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p>
              Data akun <span className="font-bold">{selectedUser?.name}</span> ({selectedUser?.email}) akan dihapus permanen.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Pastikan akun ini tidak memiliki dependensi transaksi kritis yang memerlukan pencatatan riwayat.
          </p>
        </div>
      </Modal>
    </div>
  );
}
