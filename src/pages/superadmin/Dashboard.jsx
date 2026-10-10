import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Sparkles, Zap, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import QuickActions from '../../components/dashboard/QuickActions';
import MerchantOverview from '../../components/dashboard/MerchantOverview';
import PaymentMethodOverview from '../../components/dashboard/PaymentMethodOverview';
import RecentActivity from '../../components/dashboard/RecentActivity';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { dashboardService } from '../../services/dashboardService';
import { merchantService } from '../../services/merchantService';
import { userService } from '../../services/userService';
import { useAlert } from '../../context/AlertContext';

export default function Dashboard() {
  const alert = useAlert();
  const [merchantsList, setMerchantsList] = useState([]);
  const [activitiesList, setActivitiesList] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Modal state for Quick Action Onboarding User/Admin
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('admin');

  // Load live data from PostgreSQL via backend API
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, merchantsData, activitiesData] = await Promise.all([
        dashboardService.getSummaryStats(),
        merchantService.getMerchants(),
        dashboardService.getRecentActivities(),
      ]);

      setStats(statsData);
      setMerchantsList(merchantsData);
      setActivitiesList(activitiesData);
    } catch (err) {
      console.error('Error loading dashboard live data:', err);
      setError(err.message || 'Gagal memuat data dari database PostgreSQL.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Add Staff / Admin into PostgreSQL
  const handleAddUserSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || submitting) return;

    try {
      setSubmitting(true);
      await userService.createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword.trim() || 'posan123',
        role: newUserRole,
        is_active: true,
      });

      // Reset form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setIsUserModalOpen(false);

      // Refresh live data
      await loadDashboardData();
      alert.success(`Akun "${newUserName}" berhasil dibuat dan disimpan.`);
    } catch (err) {
      alert.error(`Gagal menyimpan akun ke database: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* 1. Hero / Welcome Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang, Super Admin 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Pantau seluruh operasional sistem POSAN, akun staf kafe, transaksi penjualan, dan gateway pembayaran langsung dari database PostgreSQL <span className="font-mono font-semibold text-slate-700">posan_db</span>.
          </p>
        </div>

        {/* Date, Refresh & System Status Badge */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={loadDashboardData}
            title="Muat Ulang Data Database"
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            {loading ? 'Menyinkronkan...' : 'Sinkron'}
          </Button>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>{todayFormatted}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>PostgreSQL Online</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* 2. Summary Cards (4 Columns Responsive) */}
      {loading && stats.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-xl sm:rounded-2xl p-5 border border-slate-200/70 shadow-sm animate-pulse h-32"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      )}

      {/* 3. Quick Actions */}
      <QuickActions onAddUser={() => setIsUserModalOpen(true)} />

      {/* 4. Section Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Merchant & Outlet Overview (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          <MerchantOverview merchants={merchantsList} loading={loading} />
        </div>

        {/* Right Side: Payment Method Overview & Recent Activity (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          <PaymentMethodOverview onDataChange={loadDashboardData} />
          <RecentActivity activities={activitiesList} loading={loading} />
        </div>
      </div>

      {/* Modal: Tambah Akun Staf / Admin Cepat */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => !submitting && setIsUserModalOpen(false)}
        title="Pendaftaran Akun Pengguna Baru"
        description="Tambahkan akun staf baru (Admin, Kasir, Barista, atau Kitchen) ke database PostgreSQL."
        icon={Sparkles}
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={submitting}
              onClick={() => setIsUserModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={submitting}
              icon={submitting ? Loader2 : null}
              onClick={handleAddUserSubmit}
            >
              {submitting ? 'Menyimpan...' : 'Simpan ke Database'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddUserSubmit} className="space-y-3.5">
          <div className="p-3 bg-brand-50 rounded-xl border border-brand-200/70 text-brand-900 text-xs flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              <strong>Keamanan Akun:</strong> Kata sandi akan di-hash secara aman menggunakan bcrypt di backend Node.js sebelum disimpan ke tabel <code>users</code>.
            </span>
          </div>

          <Input
            label="Nama Lengkap Staf"
            required
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="Contoh: Budi Santoso"
          />

          <Input
            label="Alamat Email"
            type="email"
            required
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            placeholder="budi@posan.com"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Kata Sandi Awal"
              type="password"
              required
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
            />

            <Select
              label="Role / Peran"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              options={[
                { value: 'admin', label: 'Admin Café' },
                { value: 'kasir', label: 'Kasir POS' },
                { value: 'barista', label: 'Barista (Minuman)' },
                { value: 'kitchen', label: 'Kitchen (Makanan)' },
              ]}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
