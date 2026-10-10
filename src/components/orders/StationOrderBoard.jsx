import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  RefreshCw,
  Search,
  Flame,
  Coffee,
  Receipt,
  User,
  MessageSquare,
  Loader2,
  Lock,
  Volume2,
  VolumeX,
  Bell,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateOrderItemStatus } from '../../services/orderService.js';
import '../../styles/dashboard.css';

// Web Audio API chime player
function playChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.15); // G5
    gain2.gain.setValueAtTime(0.3, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.65);
  } catch (e) {
    console.debug('Audio chime error:', e);
  }
}

export default function StationOrderBoard({
  station = 'barista', // 'barista' | 'kitchen'
  fetchOrdersFunction,
  title = 'Pesanan Masuk',
  subtitle = 'Monitor dan kelola antrean pesanan secara langsung.',
  stationIcon: StationIcon = Coffee,
}) {
  const { user, role } = useAuth();
  const currentUserName = user?.name || (role === 'barista' ? 'Barista' : role === 'kitchen' ? 'Koki' : 'Kasir');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'processing' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [pushNotification, setPushNotification] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const knownIdsRef = useRef(new Set());
  const initialLoadDoneRef = useRef(false);
  const pollingRef = useRef(null);

  // Load orders from backend
  const loadOrders = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setRefreshing(true);
      const data = await fetchOrdersFunction(statusFilter);
      const orderList = Array.isArray(data) ? data : [];

      // Deteksi pesanan baru untuk Push Notifikasi & Bunyi Audio
      if (initialLoadDoneRef.current) {
        const newPending = orderList.filter(
          (o) => o.item_status === 'pending' && !knownIdsRef.current.has(o.item_id || o.id)
        );

        if (newPending.length > 0) {
          if (soundEnabled) {
            playChimeSound();
          }

          const firstItem = newPending[0];
          setPushNotification({
            id: Date.now(),
            title: `🔔 Pesanan Baru Masuk! (${newPending.length} item)`,
            desc: `${firstItem.quantity}x ${firstItem.product_name} (#${firstItem.receipt_number})`,
          });
          setTimeout(() => setPushNotification(null), 5000);
        }
      }

      // Update known IDs
      orderList.forEach((o) => knownIdsRef.current.add(o.item_id || o.id));
      initialLoadDoneRef.current = true;

      setOrders(orderList);
      setLastSyncTime(new Date());
      setErrorMessage(null);
    } catch (err) {
      console.error(`Error loading ${station} orders:`, err);
      if (!isSilent) {
        setErrorMessage(err.message || 'Gagal menyinkronkan daftar pesanan dari server.');
      }
    } finally {
      setLoading(false);
      if (!isSilent) setRefreshing(false);
    }
  }, [fetchOrdersFunction, statusFilter, station, soundEnabled]);

  // Initial fetch and polling setup (every 5 seconds)
  useEffect(() => {
    loadOrders(false);

    pollingRef.current = setInterval(() => {
      loadOrders(true);
    }, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [loadOrders]);

  // Handle status transition
  const handleStatusChange = async (item, nextStatus) => {
    if (updatingId) return; // Prevent concurrent double clicks

    const targetId = item.item_id || item.id;
    const isLockedByOther =
      item.item_status === 'processing' &&
      item.processed_by &&
      item.processed_by.toLowerCase().trim() !== currentUserName.toLowerCase().trim() &&
      !['admin', 'super_admin', 'kasir'].includes(role);

    if (isLockedByOther) {
      setErrorMessage(`Item ini sedang dikerjakan oleh "${item.processed_by}". Staf lain tidak dapat menyelesaikan maupun membatalkan pesanan ini.`);
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    setUpdatingId(targetId);
    setErrorMessage(null);

    try {
      const processor = nextStatus === 'processing' ? currentUserName : null;
      const res = await updateOrderItemStatus(targetId, nextStatus, processor);

      if (!res.success) {
        setErrorMessage(res.error || 'Gagal mengubah status pesanan.');
        return;
      }

      const label =
        nextStatus === 'processing'
          ? `sedang diproses oleh ${currentUserName}`
          : nextStatus === 'completed'
          ? 'selesai dibuat'
          : 'dikembalikan ke antrean';

      setSuccessToast(`Pesanan "${item.product_name}" (${item.receipt_number}) ${label}.`);
      setTimeout(() => setSuccessToast(null), 3500);

      // Refresh list immediately from backend
      await loadOrders(true);
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi gangguan jaringan saat memperbarui pesanan.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Format order timestamp
  const formatTime = (isoString) => {
    if (!isoString) return 'Baru saja';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Baru saja';
    const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    return `${dateStr} • ${timeStr} WIB`;
  };

  // Filter dataset by search
  const filteredOrders = orders.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (item.product_name || '').toLowerCase().includes(q) ||
      (item.receipt_number || '').toLowerCase().includes(q) ||
      (item.customer_name || '').toLowerCase().includes(q) ||
      (item.processed_by || '').toLowerCase().includes(q) ||
      (item.item_notes || '').toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || item.item_status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Calculate stats
  const pendingCount = orders.filter((o) => o.item_status === 'pending').length;
  const processingCount = orders.filter((o) => o.item_status === 'processing').length;
  const completedCount = orders.filter((o) => o.item_status === 'completed').length;

  return (
    <div className="dashboard-content" style={{ padding: '24px 28px', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      {/* Push Notification Banner */}
      {pushNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 9999,
          background: '#1E1712',
          color: '#FFFFFF',
          padding: '14px 20px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          border: '1.5px solid #F59E0B',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          animation: 'slideIn 0.3s ease-out',
          maxWidth: '420px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1E1712',
            flexShrink: 0
          }}>
            <Bell size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FDE68A' }}>
              {pushNotification.title}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#E5E7EB', marginTop: '2px' }}>
              {pushNotification.desc}
            </div>
          </div>
          <button
            onClick={() => setPushNotification(null)}
            style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header Board */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px',
        background: '#FFFFFF',
        padding: '20px 24px',
        borderRadius: '18px',
        border: '1px solid rgba(212, 163, 115, 0.25)',
        boxShadow: '0 4px 20px rgba(74, 55, 40, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #8C5E3C 0%, #D4A373 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 8px 16px rgba(140, 94, 60, 0.25)'
          }}>
            <StationIcon size={26} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {title}
              </h1>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '3px 9px',
                borderRadius: '20px',
                backgroundColor: station === 'barista' ? '#EFF6FF' : '#FEF3C7',
                color: station === 'barista' ? '#1D4ED8' : '#B45309',
                border: `1px solid ${station === 'barista' ? '#BFDBFE' : '#FDE68A'}`
              }}>
                {station === 'barista' ? 'Stasiun Minuman' : 'Stasiun Makanan'}
              </span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Petugas: <strong>{currentUserName}</strong> • {subtitle}
            </p>
          </div>
        </div>

        {/* Live sync & Sound toggle actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              background: soundEnabled ? '#FEF3C7' : '#F3F4F6',
              color: soundEnabled ? '#B45309' : '#6B7280',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title={soundEnabled ? 'Bunyi Notifikasi: Aktif' : 'Bunyi Notifikasi: Mati'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? 'Suara ON' : 'Suara OFF'}</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#059669',
            background: '#ECFDF5',
            padding: '6px 14px',
            borderRadius: '30px',
            border: '1px solid #A7F3D0'
          }}>
            <span className="pulse-indicator" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span>Polling Aktif ({lastSyncTime.toLocaleTimeString('id-ID')})</span>
          </div>

          <button
            type="button"
            className="btn-view-all"
            onClick={() => loadOrders(false)}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
            <span>{refreshing ? 'Memperbarui...' : 'Sinkronkan'}</span>
          </button>
        </div>
      </div>

      {/* 2. Toast & Error Messages */}
      {errorMessage && (
        <div style={{
          padding: '14px 18px',
          marginBottom: '20px',
          backgroundColor: '#FFF1F2',
          border: '1px solid #FECDD3',
          borderRadius: '12px',
          color: '#BE123C',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successToast && (
        <div style={{
          padding: '14px 18px',
          marginBottom: '20px',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '12px',
          color: '#047857',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* 3. KPI Status Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Pending Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          style={{
            background: statusFilter === 'pending' ? '#FEF3C7' : '#FFFFFF',
            border: `2px solid ${statusFilter === 'pending' ? '#F59E0B' : 'rgba(212, 163, 115, 0.2)'}`,
            borderRadius: '16px',
            padding: '18px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: statusFilter === 'pending' ? '0 6px 18px rgba(245, 158, 11, 0.2)' : 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>
              Menunggu Pengerjaan
            </span>
            <Clock size={18} color="#D97706" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#78350F', marginTop: '6px' }}>
            {pendingCount}
          </div>
          <span style={{ fontSize: '0.76rem', color: '#92400E' }}>Perlu segera diproses</span>
        </div>

        {/* Processing Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'processing' ? 'all' : 'processing')}
          style={{
            background: statusFilter === 'processing' ? '#EFF6FF' : '#FFFFFF',
            border: `2px solid ${statusFilter === 'processing' ? '#3B82F6' : 'rgba(212, 163, 115, 0.2)'}`,
            borderRadius: '16px',
            padding: '18px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: statusFilter === 'processing' ? '0 6px 18px rgba(59, 130, 246, 0.2)' : 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase' }}>
              Sedang Dibuat
            </span>
            <Flame size={18} color="#2563EB" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1E3A8A', marginTop: '6px' }}>
            {processingCount}
          </div>
          <span style={{ fontSize: '0.76rem', color: '#1E40AF' }}>Dalam proses pengerjaan</span>
        </div>

        {/* Completed Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          style={{
            background: statusFilter === 'completed' ? '#ECFDF5' : '#FFFFFF',
            border: `2px solid ${statusFilter === 'completed' ? '#10B981' : 'rgba(212, 163, 115, 0.2)'}`,
            borderRadius: '16px',
            padding: '18px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: statusFilter === 'completed' ? '0 6px 18px rgba(16, 185, 129, 0.2)' : 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
              Selesai Hari Ini
            </span>
            <CheckCircle2 size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#064E3B', marginTop: '6px' }}>
            {completedCount}
          </div>
          <span style={{ fontSize: '0.76rem', color: '#065F46' }}>Siap disajikan ke tamu</span>
        </div>
      </div>

      {/* 4. Filter & Search Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Status Tab Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Semua Pesanan', count: orders.length },
            { id: 'pending', label: 'Menunggu', count: pendingCount },
            { id: 'processing', label: 'Sedang Dibuat', count: processingCount },
            { id: 'completed', label: 'Selesai', count: completedCount },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: isActive ? '#8C5E3C' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#6B7280',
                  boxShadow: isActive ? '0 4px 12px rgba(140, 94, 60, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  padding: '2px 7px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#F3F4F6',
                  color: isActive ? '#FFFFFF' : '#374151'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#FFFFFF',
          padding: '8px 14px',
          borderRadius: '10px',
          border: '1px solid rgba(212, 163, 115, 0.3)',
          width: '280px'
        }}>
          <Search size={16} color="#9CA3AF" />
          <input
            type="text"
            placeholder="Cari menu / no. struk / staf..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '0.86rem',
              width: '100%',
              background: 'transparent'
            }}
          />
        </div>
      </div>

      {/* 5. Orders Grid List */}
      {loading && orders.length === 0 ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          padding: '60px 20px',
          textAlign: 'center',
          border: '1px solid rgba(212, 163, 115, 0.2)'
        }}>
          <Loader2 size={36} className="spin-icon" color="#8C5E3C" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Memuat Daftar Pesanan Stasiun...
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
            Mengambil data transaksi pesanan langsung dari server backend.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          padding: '50px 20px',
          textAlign: 'center',
          border: '1px dashed rgba(212, 163, 115, 0.4)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#FDF8F3',
            color: '#8C5E3C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px'
          }}>
            <StationIcon size={28} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Tidak Ada Pesanan Pada Antrean
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: '400px', margin: '0 auto' }}>
            {statusFilter !== 'all'
              ? `Tidak ada pesanan dengan filter status "${statusFilter}".`
              : 'Semua pesanan saat ini sudah terselesaikan atau belum ada transaksi baru dari kasir.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '18px'
        }}>
          {filteredOrders.map((item) => {
            const isItemUpdating = updatingId === (item.item_id || item.id);
            const isPending = item.item_status === 'pending';
            const isProcessing = item.item_status === 'processing';
            const isCompleted = item.item_status === 'completed';

            const isLockedByOther =
              isProcessing &&
              item.processed_by &&
              item.processed_by.toLowerCase().trim() !== currentUserName.toLowerCase().trim() &&
              !['admin', 'super_admin', 'kasir'].includes(role);

            const isProcessedByMe =
              isProcessing &&
              (!item.processed_by || item.processed_by.toLowerCase().trim() === currentUserName.toLowerCase().trim());

            return (
              <div
                key={item.item_id || item.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  border: isLockedByOther
                    ? '2px solid #F59E0B'
                    : isPending
                    ? '2px solid #FDE68A'
                    : isProcessing
                    ? '2px solid #BFDBFE'
                    : '1px solid #E5E7EB',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isLockedByOther
                    ? '0 8px 24px rgba(245, 158, 11, 0.15)'
                    : isProcessing
                    ? '0 8px 24px rgba(59, 130, 246, 0.12)'
                    : isPending
                    ? '0 8px 24px rgba(245, 158, 11, 0.1)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Top strip indicator */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  backgroundColor: isLockedByOther ? '#F59E0B' : isPending ? '#F59E0B' : isProcessing ? '#3B82F6' : '#10B981'
                }} />

                <div>
                  {/* Header: Receipt number & Time */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Receipt size={15} color="#8C5E3C" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1F2937', letterSpacing: '0.3px' }}>
                        {item.receipt_number}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 500 }}>
                      {formatTime(item.order_time)}
                    </span>
                  </div>

                  {/* Customer info (if available) */}
                  {item.customer_name && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#4B5563',
                      backgroundColor: '#F3F4F6',
                      padding: '3px 9px',
                      borderRadius: '8px',
                      marginBottom: '10px'
                    }}>
                      <User size={13} color="#6B7280" />
                      <span>{item.customer_name}</span>
                    </div>
                  )}

                  {/* Product Title with Quantity */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    margin: '8px 0 12px 0'
                  }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: isPending ? '#FEF3C7' : isProcessing ? '#EFF6FF' : '#ECFDF5',
                      color: isPending ? '#B45309' : isProcessing ? '#1D4ED8' : '#047857',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                      flexShrink: 0
                    }}>
                      {item.quantity}x
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: '#111827',
                        margin: 0,
                        lineHeight: 1.35
                      }}>
                        {item.product_name}
                      </h4>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#6B7280',
                        textTransform: 'uppercase'
                      }}>
                        Stasiun {item.station}
                      </span>
                    </div>
                  </div>

                  {/* Processed By Info Box */}
                  {isProcessing && item.processed_by && (
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: isLockedByOther ? '#FEF3C7' : '#EFF6FF',
                      border: `1px solid ${isLockedByOther ? '#FDE68A' : '#BFDBFE'}`,
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8rem',
                      color: isLockedByOther ? '#92400E' : '#1E40AF',
                      fontWeight: 700
                    }}>
                      {isLockedByOther ? <Lock size={14} color="#B45309" /> : <User size={14} color="#2563EB" />}
                      <span>
                        {isLockedByOther
                          ? `Sedang diproses oleh: ${item.processed_by} (Terkunci)`
                          : `Sedang Anda proses (${item.processed_by})`}
                      </span>
                    </div>
                  )}

                  {/* Customer Notes Box */}
                  {(item.item_notes || item.transaction_notes) && (
                    <div style={{
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      marginTop: '8px',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}>
                      <MessageSquare size={15} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.8rem', color: '#92400E', lineHeight: 1.4 }}>
                        <strong>Catatan:</strong><br />
                        {item.item_notes || item.transaction_notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer: Status Badge and Action Button */}
                <div style={{
                  borderTop: '1px solid #F3F4F6',
                  paddingTop: '14px',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}>
                  {/* Status Badge */}
                  <div>
                    {isPending && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 11px',
                        borderRadius: '20px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        backgroundColor: '#FEF3C7',
                        color: '#B45309'
                      }}>
                        <Clock size={13} />
                        <span>Menunggu</span>
                      </span>
                    )}

                    {isProcessing && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 11px',
                        borderRadius: '20px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        backgroundColor: isLockedByOther ? '#FEF3C7' : '#EFF6FF',
                        color: isLockedByOther ? '#B45309' : '#1D4ED8',
                        border: isLockedByOther ? '1px solid #FDE68A' : 'none'
                      }}>
                        {isLockedByOther ? <Lock size={13} /> : <Flame size={13} />}
                        <span>{isLockedByOther ? `Terkunci (${item.processed_by})` : 'Diproses'}</span>
                      </span>
                    )}

                    {isCompleted && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 11px',
                        borderRadius: '20px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        backgroundColor: '#ECFDF5',
                        color: '#047857'
                      }}>
                        <CheckCircle2 size={13} />
                        <span>Selesai</span>
                      </span>
                    )}
                  </div>

                  {/* Interactive Action Button */}
                  <div>
                    {isPending && (
                      <button
                        type="button"
                        disabled={isItemUpdating}
                        onClick={() => handleStatusChange(item, 'processing')}
                        style={{
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '10px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: isItemUpdating ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isItemUpdating ? (
                          <>
                            <Loader2 size={14} className="spin-icon" />
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          <>
                            <Play size={13} fill="#FFFFFF" />
                            <span>Mulai Proses</span>
                          </>
                        )}
                      </button>
                    )}

                    {isProcessing && (
                      <>
                        {isLockedByOther ? (
                          <button
                            type="button"
                            disabled={true}
                            style={{
                              backgroundColor: '#E5E7EB',
                              color: '#9CA3AF',
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '10px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'not-allowed',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            title={`Sedang dikerjakan oleh ${item.processed_by}. Anda tidak dapat mengubah pesanan ini.`}
                          >
                            <Lock size={13} />
                            <span>Terkunci ({item.processed_by})</span>
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              disabled={isItemUpdating}
                              onClick={() => handleStatusChange(item, 'pending')}
                              style={{
                                backgroundColor: '#F3F4F6',
                                color: '#4B5563',
                                border: '1px solid #D1D5DB',
                                padding: '8px 10px',
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: isItemUpdating ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                              title="Lepas / Kembalikan ke antrean masuk"
                            >
                              <RotateCcw size={13} />
                            </button>

                            <button
                              type="button"
                              disabled={isItemUpdating}
                              onClick={() => handleStatusChange(item, 'completed')}
                              style={{
                                backgroundColor: '#059669',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '10px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: isItemUpdating ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {isItemUpdating ? (
                                <>
                                  <Loader2 size={14} className="spin-icon" />
                                  <span>Menyimpan...</span>
                                </>
                              ) : (
                                <>
                                  <Check size={14} strokeWidth={2.5} />
                                  <span>Tandai Selesai</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {isCompleted && (
                      <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>
                        Siap Disajikan ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
