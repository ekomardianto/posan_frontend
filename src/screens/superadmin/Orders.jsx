import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Coffee,
  ChefHat,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Receipt,
  UserRound,
  FileText,
  Timer,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

export default function Orders() {
  const { role } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const stationType = pathname.split('/').filter(Boolean).at(-1);

  // Determine active station: 'barista' | 'kitchen'
  const activeStation = useMemo(() => {
    if (role === 'barista') return 'barista';
    if (role === 'kitchen') return 'kitchen';

    if (stationType) {
      const lower = stationType.toLowerCase();
      if (['barista', 'kitchen'].includes(lower)) return lower;
    }

    if (pathname.includes('/kitchen')) return 'kitchen';
    return 'barista';
  }, [role, stationType, pathname]);

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    pending_count: 0,
    processing_count: 0,
    completed_count: 0,
    total_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'processing' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Load orders & stats for current station
  const loadOrdersData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const fetchOrders =
        activeStation === 'kitchen'
          ? orderService.getKitchenOrders(statusFilter)
          : orderService.getBaristaOrders(statusFilter);

      const fetchStats = orderService.getOrderStats(activeStation);

      const [ordersData, statsRes] = await Promise.all([fetchOrders, fetchStats]);

      setOrders(ordersData);

      if (statsRes?.stats) {
        setStats({
          pending_count: Number(statsRes.stats.pending_count) || 0,
          processing_count: Number(statsRes.stats.processing_count) || 0,
          completed_count: Number(statsRes.stats.completed_count) || 0,
          total_count: Number(statsRes.stats.total_count) || 0,
        });
      }
    } catch (err) {
      console.error('Error loading station orders:', err);
      setErrorMessage(err.message || 'Gagal memuat daftar pesanan stasiun.');
    } finally {
      setLoading(false);
    }
  }, [activeStation, statusFilter]);

  useEffect(() => {
    loadOrdersData();
  }, [loadOrdersData]);

  // Update item status (Barista or Kitchen staff only)
  const handleUpdateStatus = async (itemId, targetStatus, productName, receiptNumber) => {
    try {
      setActionLoadingId(itemId);
      setErrorMessage('');
      const res = await orderService.updateItemStatus(itemId, targetStatus);
      showToast(
        res.message ||
          `Pesanan "${productName}" (${receiptNumber}) diubah menjadi ${targetStatus}.`
      );
      await loadOrdersData();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui status pesanan.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchSearch =
        (ord.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.receipt_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.item_notes || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || ord.item_status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Station info config
  const isBarista = activeStation === 'barista';
  const StationIcon = isBarista ? Coffee : ChefHat;
  const stationTitle = isBarista ? 'Stasiun Barista (Minuman)' : 'Stasiun Kitchen (Makanan & Pastry)';
  const stationSubtitle = isBarista
    ? 'Tiket pesanan kopi, teh, artisan beverage & minuman segar'
    : 'Tiket pesanan hidangan dapur, makanan utama, pastry & snack';
  const accentColor = isBarista ? 'amber' : 'rose';

  // Can the current user modify the station item status?
  const canUpdateItemStatus =
    (role === 'barista' && isBarista) || (role === 'kitchen' && !isBarista);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isBarista
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}
          >
            <StationIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {stationTitle}
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isBarista
                    ? 'bg-amber-100/70 text-amber-800 border border-amber-200'
                    : 'bg-rose-100/70 text-rose-800 border border-rose-200'
                }`}
              >
                LIVE KDS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">{stationSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={loadOrdersData}
            disabled={loading}
            title="Muat Ulang Pesanan"
          >
            {loading ? 'Menyinkronkan...' : 'Sinkron Antrean'}
          </Button>
        </div>
      </div>

      {/* Station Selector Tab for Admin Cafe */}
      {role === 'admin' && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-2 shadow-sm flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/superadmin/orders/barista')}
            className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeStation === 'barista'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Stasiun Barista (Minuman)</span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/superadmin/orders/kitchen')}
            className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeStation === 'kitchen'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Stasiun Kitchen (Makanan)</span>
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadOrdersData}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-xl border border-slate-200/70 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Tiket Pesanan</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total_count}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Semua status</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-800">Menunggu (Pending)</p>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-900 mt-1">{stats.pending_count}</p>
          <p className="text-[11px] text-amber-700 mt-0.5">Belum diproses staf</p>
        </div>

        {/* Processing Orders */}
        <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-blue-800">Sedang Dibuat (Processing)</p>
            <Timer className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-blue-900 mt-1">{stats.processing_count}</p>
          <p className="text-[11px] text-blue-700 mt-0.5">Sedang dalam pengerjaan</p>
        </div>

        {/* Completed Orders */}
        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-800">Selesai (Completed)</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-900 mt-1">{stats.completed_count}</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Siap disajikan</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="w-full sm:w-80">
          <Input
            placeholder={`Cari menu ${isBarista ? 'minuman' : 'makanan'}, no struk, pelanggan...`}
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'pending', label: 'Menunggu' },
            { id: 'processing', label: 'Sedang Dibuat' },
            { id: 'completed', label: 'Selesai' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Orders Grid Cards */}
      {loading && orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-16 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-slate-700">
            Mengambil antrean tiket pesanan {stationTitle}...
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-16 text-center flex flex-col items-center justify-center gap-3">
          <StationIcon className="w-12 h-12 text-slate-300" />
          <p className="text-base font-bold text-slate-800">
            Tidak ada tiket pesanan {isBarista ? 'minuman' : 'makanan'} ditemukan
          </p>
          <p className="text-xs text-slate-400 max-w-md">
            Pesanan baru yang dimasukkan oleh kasir akan otomatis terdistribusi dan tampil pada stasiun kerja ini.
          </p>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadOrdersData}>
            Muat Ulang Antrean
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((item) => {
            const isPending = item.item_status === 'pending';
            const isProcessing = item.item_status === 'processing';
            const isCompleted = item.item_status === 'completed';
            const isItemLoading = actionLoadingId === item.item_id;

            return (
              <div
                key={item.item_id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${
                  isPending
                    ? 'border-amber-300/90 ring-2 ring-amber-100/50'
                    : isProcessing
                    ? 'border-blue-300 ring-2 ring-blue-100/50'
                    : 'border-slate-200/80 opacity-90'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/60">
                      #{item.receipt_number}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isPending
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : isProcessing
                          ? 'bg-blue-100 text-blue-900 border border-blue-300 animate-pulse'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {item.item_status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <UserRound className="w-3 h-3 text-slate-400" />
                      Pelanggan: <strong className="text-slate-700">{item.customer_name || 'Umum'}</strong>
                    </span>

                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      <Clock className="w-3 h-3" />
                      {item.order_time
                        ? new Date(item.order_time).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }) + ' WIB'
                        : '-'}
                    </span>
                  </div>
                </div>

                {/* Card Body: Product & Notes */}
                <div className="p-4 sm:p-5 space-y-3 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {item.product_name}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Rp {Number(item.unit_price).toLocaleString('id-ID')} / porsi
                      </p>
                    </div>

                    <div
                      className={`w-10 h-10 rounded-xl font-extrabold text-sm flex items-center justify-center shrink-0 border ${
                        isBarista
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {item.quantity}x
                    </div>
                  </div>

                  {/* Customer Custom Notes */}
                  {item.item_notes ? (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[10px] uppercase tracking-wider block text-amber-800">
                          Catatan Pesanan:
                        </span>
                        <p className="font-medium text-xs leading-relaxed">{item.item_notes}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      Tidak ada catatan khusus (Standar resep).
                    </div>
                  )}

                  {item.transaction_notes && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <span className="font-semibold text-slate-700">Catatan Struk: </span>
                      {item.transaction_notes}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 bg-slate-50/40 rounded-b-2xl">
                  {canUpdateItemStatus ? (
                    isPending ? (
                      <button
                        type="button"
                        disabled={isItemLoading}
                        onClick={() =>
                          handleUpdateStatus(
                            item.item_id,
                            'processing',
                            item.product_name,
                            item.receipt_number
                          )
                        }
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isItemLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 fill-white" />
                        )}
                        <span>{isBarista ? 'Mulai Racik Minuman' : 'Mulai Masak'}</span>
                      </button>
                    ) : isProcessing ? (
                      <button
                        type="button"
                        disabled={isItemLoading}
                        onClick={() =>
                          handleUpdateStatus(
                            item.item_id,
                            'completed',
                            item.product_name,
                            item.receipt_number
                          )
                        }
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isItemLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>{isBarista ? 'Minuman Siap Disajikan' : 'Hidangan Siap Saji'}</span>
                      </button>
                    ) : (
                      <div className="py-2 px-3 text-center text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Selesai Diproses Stasiun</span>
                      </div>
                    )
                  ) : (
                    <div className="py-2 px-3 text-center text-xs text-slate-500 bg-slate-100 rounded-xl border border-slate-200/60 font-medium">
                      {isCompleted
                        ? 'Pesanan Selesai'
                        : isProcessing
                        ? 'Sedang Dikerjakan Staf'
                        : 'Menunggu Giliran'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
