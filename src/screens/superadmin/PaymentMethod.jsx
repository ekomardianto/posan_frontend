import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Edit2,
  Power,
  Trash2,
  Banknote,
  QrCode,
  Smartphone,
  Building2,
  Clock,
  LayoutGrid,
  List,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Receipt,
  Layers,
  Sliders,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Key,
  Globe,
  DollarSign,
  Copy,
  Check,
  Lock,
  Unlock,
  Terminal,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { paymentMethodService } from '../../services/paymentMethodService';

const iconLookup = {
  Banknote: Banknote,
  QrCode: QrCode,
  Smartphone: Smartphone,
  CreditCard: CreditCard,
  Building2: Building2,
  Clock: Clock,
};

export default function PaymentMethod() {
  const { role } = useAuth();
  const canManagePayment = true; // Super Admin & Admin can manage global payment methods

  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isToggleConfirmOpen, setIsToggleConfirmOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [configSuccessMsg, setConfigSuccessMsg] = useState('');

  // Selected item
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [configMethod, setConfigMethod] = useState(null);

  // Form states (CRUD)
  const [formData, setFormData] = useState({
    name: '',
    type: 'QRIS',
    provider: '',
    description: '',
    fee: '0.3% MDR',
    status: 'Active',
  });

  // Config Form State
  const [configData, setConfigData] = useState({});
  const [configSubmitting, setConfigSubmitting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Load live data from Backend Node.js Express (database)
  const loadMethods = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentMethodService.getPaymentMethods();
      setMethods(data);
    } catch (err) {
      console.error('Error loading payment methods:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  // Filtered dataset
  const filteredMethods = useMemo(() => {
    return methods.filter((m) => {
      const matchSearch =
        (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.provider || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.type || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = typeFilter === 'ALL' || m.type === typeFilter;
      const matchStatus =
        statusFilter === 'ALL' || (m.status || '').toUpperCase() === statusFilter.toUpperCase();

      return matchSearch && matchType && matchStatus;
    });
  }, [methods, searchQuery, typeFilter, statusFilter]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setErrorMessage('');
    setFormData({
      name: '',
      type: 'QRIS',
      provider: '',
      description: '',
      fee: '0.3% MDR',
      status: 'Active',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (method, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSelectedMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      provider: method.provider,
      description: method.description,
      fee: method.fee || '0%',
      status: method.status,
    });
    setIsEditModalOpen(true);
  };

  // Open Configure Modal
  const handleOpenConfigure = (method, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setConfigSuccessMsg('');
    setShowApiKey(false);
    setCopiedWebhook(false);
    setConfigMethod(method);

    const c = method.config || {};
    const type = method.type || 'Lainnya';

    // Set intelligent defaults per payment type if not yet configured
    if (type === 'QRIS') {
      setConfigData({
        qris_mode: c.qris_mode || 'dynamic',
        gateway_provider: c.gateway_provider || 'QRIS Standar Bank Indonesia',
        mid: c.mid || 'POSAN-QRIS-9921',
        server_key: c.server_key || 'SB-Mid-server-889104A7',
        client_key: c.client_key || 'SB-Mid-client-889104A7',
        auto_verify_webhook: c.auto_verify_webhook !== undefined ? c.auto_verify_webhook : true,
        timeout_minutes: c.timeout_minutes || 15,
        settlement_type: c.settlement_type || 'Instant H+0',
        webhook_url: c.webhook_url || 'https://api.posan.com/api/webhooks/qris',
      });
    } else if (type === 'Tunai') {
      setConfigData({
        rounding_rule: c.rounding_rule || 'Tanpa Pembulatan',
        cash_drawer_auto_open: c.cash_drawer_auto_open !== undefined ? c.cash_drawer_auto_open : true,
        allow_change: c.allow_change !== undefined ? c.allow_change : true,
        max_cash_limit: c.max_cash_limit || '5000000',
        require_receipt_print: c.require_receipt_print !== undefined ? c.require_receipt_print : true,
      });
    } else if (type === 'Kartu' || type === 'Transfer') {
      setConfigData({
        bank_name: c.bank_name || 'BCA / Mandiri / BRI',
        account_number: c.account_number || '8820-1928-3310',
        account_holder: c.account_holder || 'POSAN OPERATIONAL CAFE',
        require_proof_upload: c.require_proof_upload !== undefined ? c.require_proof_upload : true,
        edc_tid: c.edc_tid || 'TID-882910',
        edc_mid: c.edc_mid || 'MID-POSAN-01',
        payment_instructions: c.payment_instructions || 'Tunjukkan bukti transfer atau lakukan pembayaran pada terminal EDC kasir.',
      });
    } else if (type === 'E-Wallet') {
      setConfigData({
        wallet_provider: c.wallet_provider || 'Midtrans / Xendit E-Wallet Gateway',
        channel_id: c.channel_id || 'EW-POSAN-881',
        server_key: c.server_key || 'SB-Mid-server-wallet',
        auto_settle: c.auto_settle !== undefined ? c.auto_settle : true,
        webhook_url: c.webhook_url || 'https://api.posan.com/api/webhooks/ewallet',
      });
    } else {
      setConfigData({
        provider_name: c.provider_name || method.provider || 'Gateway Provider',
        environment: c.environment || 'production',
        api_key: c.api_key || '',
        min_amount: c.min_amount || '10000',
        webhook_url: c.webhook_url || 'https://api.posan.com/api/webhooks/payment',
        auto_verify: c.auto_verify !== undefined ? c.auto_verify : true,
      });
    }

    setIsConfigModalOpen(true);
  };

  // Save Configuration to Backend
  const handleConfigSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!configMethod || configSubmitting) return;

    try {
      setConfigSubmitting(true);
      setErrorMessage('');
      await paymentMethodService.updatePaymentMethodConfig(configMethod.id, configData);
      
      setConfigSuccessMsg('Konfigurasi berhasil disimpan ke database!');
      await loadMethods();
      setTimeout(() => {
        setIsConfigModalOpen(false);
        setConfigSuccessMsg('');
      }, 900);
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menyimpan konfigurasi.');
    } finally {
      setConfigSubmitting(false);
    }
  };

  // Open Toggle Confirm
  const handleOpenToggleConfirm = (method, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSelectedMethod(method);
    setIsToggleConfirmOpen(true);
  };

  // Open Delete Confirm Modal
  const handleOpenDeleteConfirm = (method, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');
    setSelectedMethod(method);
    setIsDeleteModalOpen(true);
  };

  // Save Add to Backend
  const handleAddSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await paymentMethodService.createPaymentMethod(formData);
      setIsAddModalOpen(false);
      await loadMethods();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menambahkan metode pembayaran.');
    } finally {
      setSubmitting(false);
    }
  };

  // Save Edit to Backend
  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedMethod || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await paymentMethodService.updatePaymentMethod(selectedMethod.id, formData);
      setIsEditModalOpen(false);
      await loadMethods();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui metode pembayaran.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Toggle Status in Backend
  const handleToggleStatus = async () => {
    if (!selectedMethod || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      const nextActive = selectedMethod.status !== 'Active';
      await paymentMethodService.togglePaymentMethodStatus(
        selectedMethod.id,
        nextActive
      );
      setIsToggleConfirmOpen(false);
      await loadMethods();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal mengubah status metode pembayaran.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete Payment Method
  const handleDeleteSubmit = async () => {
    if (!selectedMethod || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await paymentMethodService.deletePaymentMethod(selectedMethod.id);
      setIsDeleteModalOpen(false);
      await loadMethods();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menghapus metode pembayaran.');
    } finally {
      setSubmitting(false);
    }
  };

  // Copy Webhook Helper
  const handleCopyWebhook = (url) => {
    if (navigator?.clipboard && url) {
      navigator.clipboard.writeText(url);
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    }
  };

  // Render Config summary snippet for grid cards
  const renderConfigPreview = (method) => {
    const c = method.config || {};
    const type = method.type || '';

    if (type === 'QRIS') {
      return (
        <div className="mt-3 pt-3 border-t border-slate-100/90 text-[11px] text-slate-500 space-y-1 bg-slate-50/70 p-2.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Mode QR:</span>
            <span className="font-semibold text-slate-700 capitalize">{c.qris_mode || 'Dinamis'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Merchant MID:</span>
            <span className="font-mono text-slate-700 font-medium">{c.mid || 'Belum diatur'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Auto Webhook:</span>
            <span className={`font-semibold ${c.auto_verify_webhook !== false ? 'text-emerald-600' : 'text-slate-500'}`}>
              {c.auto_verify_webhook !== false ? 'Aktif (Real-time)' : 'Manual'}
            </span>
          </div>
        </div>
      );
    }

    if (type === 'Tunai') {
      return (
        <div className="mt-3 pt-3 border-t border-slate-100/90 text-[11px] text-slate-500 space-y-1 bg-slate-50/70 p-2.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Cash Drawer:</span>
            <span className={`font-semibold ${c.cash_drawer_auto_open !== false ? 'text-emerald-600' : 'text-slate-500'}`}>
              {c.cash_drawer_auto_open !== false ? 'Otomatis Buka' : 'Manual'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Pembulatan:</span>
            <span className="font-semibold text-slate-700">{c.rounding_rule || 'Tanpa Pembulatan'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Limit Kas Laci:</span>
            <span className="font-mono text-slate-700 font-medium">
              {c.max_cash_limit ? `Rp ${Number(c.max_cash_limit).toLocaleString('id-ID')}` : 'Rp 5.000.000'}
            </span>
          </div>
        </div>
      );
    }

    if (type === 'Kartu' || type === 'Transfer') {
      return (
        <div className="mt-3 pt-3 border-t border-slate-100/90 text-[11px] text-slate-500 space-y-1 bg-slate-50/70 p-2.5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Rekening/EDC:</span>
            <span className="font-mono text-slate-700 font-medium">{c.account_number || c.edc_tid || 'Terdaftar'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Nama Penerima:</span>
            <span className="font-semibold text-slate-700 truncate max-w-[140px]">{c.account_holder || 'POSAN OPERATIONAL'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Bukti Transfer:</span>
            <span className={`font-semibold ${c.require_proof_upload !== false ? 'text-amber-600' : 'text-slate-500'}`}>
              {c.require_proof_upload !== false ? 'Wajib Upload' : 'Opsional'}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-3 pt-3 border-t border-slate-100/90 text-[11px] text-slate-500 space-y-1 bg-slate-50/70 p-2.5 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Status Konfigurasi:</span>
          <span className="font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Terkonfigurasi
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Gateway:</span>
          <span className="font-semibold text-slate-700">{c.provider_name || method.provider || 'Gateway POSAN'}</span>
        </div>
      </div>
    );
  };

  // Table Columns Configuration
  const columns = useMemo(() => {
    const cols = [
      {
        key: 'name',
        title: 'Nama Payment Method',
        render: (_, row) => {
          const Icon = iconLookup[row.iconType] || CreditCard;
          const isActive = row.status === 'Active';
          return (
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 border border-brand-100 shadow-2xs'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {row.name}
                </p>
                <p className="text-[11px] text-slate-400">{row.provider}</p>
              </div>
            </div>
          );
        },
      },
      {
        key: 'type',
        title: 'Tipe',
        render: (val) => (
          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {val}
          </span>
        ),
      },
      {
        key: 'fee',
        title: 'Biaya / MDR',
        render: (val) => <span className="font-mono text-xs text-slate-600">{val || '0%'}</span>,
      },
      {
        key: 'config_status',
        title: 'Konfigurasi Parameter',
        render: (_, row) => {
          const hasConfig = row.config && Object.keys(row.config).length > 0;
          return (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md ${
                hasConfig
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Sliders className="w-3 h-3" />
              {hasConfig ? 'Aktif / Kustom' : 'Default Sistem'}
            </span>
          );
        },
      },
      {
        key: 'transaction_count',
        title: 'Transaksi Terkait',
        render: (val) => (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <Receipt className="w-3.5 h-3.5 text-slate-400" />
            {val !== undefined ? `${val} Transaksi` : '0 Transaksi'}
          </span>
        ),
      },
      {
        key: 'status',
        title: 'Status',
        render: (val) => <Badge status={val} />,
      },
    ];

    if (canManagePayment) {
      cols.push({
        key: 'actions',
        title: 'Action',
        align: 'right',
        render: (_, row) => (
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Configure Button */}
            <Button
              variant="outline"
              size="sm"
              icon={Sliders}
              onClick={(e) => handleOpenConfigure(row, e)}
              className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 border-brand-200 text-xs px-2.5 py-1"
              title="Konfigurasi Parameter & Gateway"
            >
              Configure
            </Button>

            <Button
              variant="icon"
              size="sm"
              onClick={(e) => handleOpenEdit(row, e)}
              title="Edit Data Dasar"
            >
              <Edit2 className="w-4 h-4 text-slate-600 hover:text-slate-800" />
            </Button>

            <Button
              variant="icon"
              size="sm"
              onClick={(e) => handleOpenToggleConfirm(row, e)}
              title={row.status === 'Active' ? 'Nonaktifkan Metode' : 'Aktifkan Metode'}
            >
              <Power
                className={`w-4 h-4 ${
                  row.status === 'Active'
                    ? 'text-emerald-600 hover:text-rose-600'
                    : 'text-slate-400 hover:text-emerald-600'
                }`}
              />
            </Button>

            <Button
              variant="icon"
              size="sm"
              onClick={(e) => handleOpenDeleteConfirm(row, e)}
              title="Hapus Metode Pembayaran"
            >
              <Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-700" />
            </Button>
          </div>
        ),
      });
    }

    return cols;
  }, [canManagePayment]);

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Payment Method
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Master Data Aplikasi
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola kanal dan metode pembayaran resmi (Tunai, QRIS, Kartu/EDC, E-Wallet) beserta konfigurasi teknis gateway yang berlaku secara global untuk seluruh kasir POSAN.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={loadMethods}
            title="Muat ulang data"
          >
            {loading ? 'Menyinkronkan...' : 'Refresh'}
          </Button>

          {canManagePayment && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenAdd}
            >
              Tambah Payment Method
            </Button>
          )}
        </div>
      </div>

      {/* 2. Search, Filter & View Switcher */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full sm:w-80 shrink-0">
          <Input
            placeholder="Cari metode, provider, tipe..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters & View switcher */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="w-40 shrink-0">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Semua Tipe' },
                { value: 'Tunai', label: 'Tunai' },
                { value: 'QRIS', label: 'QRIS' },
                { value: 'E-Wallet', label: 'E-Wallet' },
                { value: 'Kartu', label: 'Kartu (EDC)' },
                { value: 'Transfer', label: 'Transfer VA' },
                { value: 'PayLater', label: 'PayLater' },
              ]}
            />
          </div>

          <div className="w-36 shrink-0">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'Semua Status' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Tampilan Grid Card"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Content: Card Grid View or Table View */}
      {loading && methods.length === 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="Memuat metode pembayaran">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="bg-white rounded-2xl border border-slate-200/70 p-5 space-y-4 animate-pulse" aria-hidden="true">
                <div className="flex justify-between"><div className="w-11 h-11 rounded-2xl bg-slate-100" /><div className="w-16 h-6 rounded-full bg-slate-100" /></div>
                <div className="space-y-2"><div className="h-4 w-2/3 rounded bg-slate-100" /><div className="h-3 w-1/3 rounded bg-slate-100" /><div className="h-3 w-full rounded bg-slate-100" /></div>
                <div className="border-t border-slate-100 pt-4"><div className="h-3 w-1/4 rounded bg-slate-100" /></div>
              </div>
            ))}
          </div>
        ) : (
          <Table columns={columns} data={[]} isLoading />
        )
      ) : filteredMethods.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center flex flex-col items-center justify-center gap-2">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
          <p className="text-sm font-bold text-slate-800">Tidak ada metode pembayaran yang cocok</p>
          <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau reset filter di atas.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMethods.map((method) => {
            const Icon = iconLookup[method.iconType] || CreditCard;
            const isActive = method.status === 'Active';

            return (
              <div
                key={method.id}
                className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${
                        isActive
                          ? 'bg-brand-50 text-brand-600 border border-brand-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge status={method.status} size="xs" />
                      {canManagePayment && (
                        <button
                          type="button"
                          onClick={() => handleOpenToggleConfirm(method)}
                          className={`w-10 h-6 rounded-full transition-colors p-0.5 flex items-center focus:outline-none cursor-pointer ${
                            isActive ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'
                          }`}
                          title="Ubah Status"
                        >
                          <div className="w-5 h-5 rounded-full bg-white shadow-2xs"></div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {method.name}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {method.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      {method.provider}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                      {method.description}
                    </p>
                  </div>

                  {/* Configuration Preview Box */}
                  {renderConfigPreview(method)}
                </div>

                {/* Footer Metrics & Actions */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Biaya / MDR
                    </span>
                    <p className="font-bold text-slate-800 flex items-center gap-1 font-mono">
                      <span>{method.fee || '0%'}</span>
                    </p>
                  </div>

                  {canManagePayment && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Sliders}
                        onClick={(e) => handleOpenConfigure(method, e)}
                        className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 border-brand-200"
                      >
                        Configure
                      </Button>
                      <Button
                        variant="icon"
                        size="sm"
                        onClick={(e) => handleOpenEdit(method, e)}
                        title="Edit Data Dasar"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500 hover:text-slate-700" />
                      </Button>
                      <Button
                        variant="icon"
                        size="sm"
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        onClick={(e) => handleOpenDeleteConfirm(method, e)}
                        title="Hapus Metode"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Table
          columns={columns}
          data={filteredMethods}
          keyField="id"
          emptyMessage="Tidak ada metode pembayaran ditemukan di database."
          emptySubtext="Coba ubah kata kunci pencarian atau filter tipe."
        />
      )}

      {/* Modal: CONFIGURE Payment Method Parameters */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => !configSubmitting && setIsConfigModalOpen(false)}
        title={`Konfigurasi - ${configMethod?.name}`}
        description={`Atur parameter teknis, kredensial gateway, dan aturan alur pembayaran untuk kanal ${configMethod?.name}.`}
        icon={Sliders}
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={configSubmitting}
              onClick={() => setIsConfigModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={configSubmitting}
              icon={configSubmitting ? Loader2 : Check}
              onClick={handleConfigSubmit}
            >
              {configSubmitting ? 'Menyimpan Parameter...' : 'Simpan Konfigurasi'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfigSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {configSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{configSuccessMsg}</span>
            </div>
          )}

          {/* DYNAMIC FORM ACCORDING TO PAYMENT METHOD TYPE */}

          {/* 1. TYPE === 'QRIS' */}
          {configMethod?.type === 'QRIS' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-brand-50/60 border border-brand-100 rounded-xl flex items-start gap-3">
                <QrCode className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div className="text-xs text-brand-900 leading-relaxed">
                  <p className="font-bold">QRIS Standar Nasional Bank Indonesia & Gateway</p>
                  <p className="text-brand-700 mt-0.5">
                    Mendukung pembayaran scan QR dari seluruh aplikasi mobile banking (BCA, Mandiri, BRI, BNI) dan dompet digital (GoPay, OVO, ShopeePay, DANA).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Select
                  label="Mode Generate QRIS"
                  required
                  value={configData.qris_mode || 'dynamic'}
                  onChange={(e) => setConfigData({ ...configData, qris_mode: e.target.value })}
                  options={[
                    { value: 'dynamic', label: 'Dinamis (Unik per Transaksi + Nominal Otomatis)' },
                    { value: 'static', label: 'Statis (QR Kasir Tetap + Input Manual)' },
                  ]}
                  helperText="QRIS Dinamis otomatis mencantumkan nominal belanja kasir."
                />

                <Select
                  label="Provider / Gateway Acquirer"
                  required
                  value={configData.gateway_provider || 'QRIS Standar Bank Indonesia'}
                  onChange={(e) => setConfigData({ ...configData, gateway_provider: e.target.value })}
                  options={[
                    { value: 'QRIS Standar Bank Indonesia', label: 'QRIS Standar Bank Indonesia' },
                    { value: 'Midtrans Core API / Snap', label: 'Midtrans (GoTo Financial)' },
                    { value: 'Xendit Payments API', label: 'Xendit Payments' },
                    { value: 'DOKU Payment Gateway', label: 'DOKU Gateway' },
                    { value: 'BCA QRIS Merchant', label: 'BCA QRIS Merchant' },
                    { value: 'Mandiri Livin Merchant', label: 'Mandiri QRIS Merchant' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Merchant ID (MID / MPAN)"
                  required
                  placeholder="Contoh: POSAN-QRIS-9921"
                  value={configData.mid || ''}
                  onChange={(e) => setConfigData({ ...configData, mid: e.target.value })}
                  helperText="ID identitas merchant resmi dari acquirer QRIS."
                />

                <Select
                  label="Settlement SLA"
                  value={configData.settlement_type || 'Instant H+0'}
                  onChange={(e) => setConfigData({ ...configData, settlement_type: e.target.value })}
                  options={[
                    { value: 'Instant H+0', label: 'Instant Real-time (H+0)' },
                    { value: 'H+1 Hari Kerja', label: 'H+1 Hari Kerja' },
                    { value: 'H+2 Hari Kerja', label: 'H+2 Hari Kerja' },
                  ]}
                  helperText="Waktu pencairan dana transaksi ke rekening operasional."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      API Server Key / Secret Key
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-[11px] text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
                    >
                      {showApiKey ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {showApiKey ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </div>
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="Contoh: SB-Mid-server-889104A7..."
                    value={configData.server_key || ''}
                    onChange={(e) => setConfigData({ ...configData, server_key: e.target.value })}
                  />
                </div>

                <Input
                  label="Masa Berlaku QR (Timeout Menit)"
                  type="number"
                  min="1"
                  max="60"
                  placeholder="15"
                  value={configData.timeout_minutes || 15}
                  onChange={(e) => setConfigData({ ...configData, timeout_minutes: Number(e.target.value) })}
                  helperText="Setelah batas ini, QR kedaluwarsa jika belum dibayar."
                />
              </div>

              {/* Webhook Callback Setting */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-800">Webhook Notification URL</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyWebhook(configData.webhook_url)}
                    className="text-[11px] text-brand-600 hover:text-brand-700 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copiedWebhook ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedWebhook ? 'Tersalin!' : 'Salin URL'}
                  </button>
                </div>
                <Input
                  value={configData.webhook_url || 'https://api.posan.com/api/webhooks/qris'}
                  onChange={(e) => setConfigData({ ...configData, webhook_url: e.target.value })}
                  className="font-mono text-xs"
                />

                <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Auto-Verify Webhook</p>
                    <p className="text-[11px] text-slate-500">Otomatis ubah status pesanan kasir menjadi "Lunas" begitu notifikasi diterima.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configData.auto_verify_webhook !== false}
                    onChange={(e) => setConfigData({ ...configData, auto_verify_webhook: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. TYPE === 'Tunai' (Cash) */}
          {configMethod?.type === 'Tunai' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-3">
                <Banknote className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed">
                  <p className="font-bold">Konfigurasi Transaksi Kas & Laci Tunai (Cash Drawer)</p>
                  <p className="text-emerald-800 mt-0.5">
                    Atur perilaku laci kasir otomatis, kebijakan pembulatan pecahan rupiah, dan batas maksimal uang tunai di meja kasir.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Select
                  label="Aturan Pembulatan Rupiah"
                  required
                  value={configData.rounding_rule || 'Tanpa Pembulatan'}
                  onChange={(e) => setConfigData({ ...configData, rounding_rule: e.target.value })}
                  options={[
                    { value: 'Tanpa Pembulatan', label: 'Tanpa Pembulatan (Nilai Asli)' },
                    { value: 'Bulatkan ke Rp 100 terdekat', label: 'Bulatkan ke Rp 100 terdekat' },
                    { value: 'Bulatkan ke Rp 500 terdekat', label: 'Bulatkan ke Rp 500 terdekat' },
                    { value: 'Bulatkan ke Rp 1.000 ke atas (Ceil)', label: 'Bulatkan ke Rp 1.000 ke atas (Ceil)' },
                    { value: 'Bulatkan ke Rp 1.000 ke bawah (Floor)', label: 'Bulatkan ke Rp 1.000 ke bawah (Floor)' },
                  ]}
                  helperText="Mempermudah kembalian kasir tanpa pecahan koin langka."
                />

                <Input
                  label="Batas Maksimal Kas di Laci (Threshold)"
                  type="number"
                  placeholder="5000000"
                  value={configData.max_cash_limit || '5000000'}
                  onChange={(e) => setConfigData({ ...configData, max_cash_limit: e.target.value })}
                  prefix="Rp"
                  helperText="Notifikasi setor kas otomatis jika uang di laci melebihi batas ini."
                />
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Buka Laci Kasir Otomatis (Cash Drawer Kick)</p>
                    <p className="text-[11px] text-slate-500">Kirim sinyal trigger pin RJ11 ke printer kasir untuk membuka laci saat simpan transaksi.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configData.cash_drawer_auto_open !== false}
                    onChange={(e) => setConfigData({ ...configData, cash_drawer_auto_open: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Hitung Kembalian Otomatis</p>
                    <p className="text-[11px] text-slate-500">Tampilkan kalkulator nominal uang diterima & kembalian di layar kasir.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configData.allow_change !== false}
                    onChange={(e) => setConfigData({ ...configData, allow_change: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Wajib Cetak Struk Tunai</p>
                    <p className="text-[11px] text-slate-500">Otomatis mencetak struk fisik thermal kasir untuk setiap transaksi tunai.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={configData.require_receipt_print !== false}
                    onChange={(e) => setConfigData({ ...configData, require_receipt_print: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. TYPE === 'Kartu' OR 'Transfer' */}
          {(configMethod?.type === 'Kartu' || configMethod?.type === 'Transfer') && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-950 leading-relaxed">
                  <p className="font-bold">Konfigurasi Terminal EDC & Rekening Bank</p>
                  <p className="text-blue-800 mt-0.5">
                    Atur informasi rekening bank tujuan transfer, Terminal ID (TID) EDC, dan verifikasi upload struk bukti pembayaran.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Select
                  label="Nama Bank / Institusi"
                  required
                  value={configData.bank_name || 'BCA / Mandiri / BRI'}
                  onChange={(e) => setConfigData({ ...configData, bank_name: e.target.value })}
                  options={[
                    { value: 'BCA / Mandiri / BRI', label: 'Multi Bank (BCA, Mandiri, BRI, BNI)' },
                    { value: 'Bank Central Asia (BCA)', label: 'Bank Central Asia (BCA)' },
                    { value: 'Bank Mandiri', label: 'Bank Mandiri' },
                    { value: 'Bank Rakyat Indonesia (BRI)', label: 'Bank Rakyat Indonesia (BRI)' },
                    { value: 'Bank Negara Indonesia (BNI)', label: 'Bank Negara Indonesia (BNI)' },
                    { value: 'Bank Syariah Indonesia (BSI)', label: 'Bank Syariah Indonesia (BSI)' },
                    { value: 'CIMB Niaga', label: 'CIMB Niaga' },
                  ]}
                />

                <Input
                  label="Nomor Rekening / Virtual Account"
                  required
                  placeholder="Contoh: 8820-1928-3310"
                  value={configData.account_number || ''}
                  onChange={(e) => setConfigData({ ...configData, account_number: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Nama Pemilik Rekening (A/N)"
                  required
                  placeholder="Contoh: POSAN OPERATIONAL CAFE"
                  value={configData.account_holder || ''}
                  onChange={(e) => setConfigData({ ...configData, account_holder: e.target.value })}
                />

                <Input
                  label="Terminal ID EDC (TID)"
                  placeholder="Contoh: TID-882910"
                  value={configData.edc_tid || ''}
                  onChange={(e) => setConfigData({ ...configData, edc_tid: e.target.value })}
                  helperText="Nomor TID yang tertera pada mesin EDC kasir."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Instruksi Pembayaran untuk Pelanggan / Kasir
                </label>
                <textarea
                  rows={2}
                  value={configData.payment_instructions || ''}
                  onChange={(e) => setConfigData({ ...configData, payment_instructions: e.target.value })}
                  placeholder="Tunjukkan bukti transfer atau gesek kartu pada terminal EDC kasir."
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-800 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Wajib Upload / Konfirmasi Bukti Transfer</p>
                  <p className="text-[11px] text-slate-500">Kasir wajib melampirkan foto struk EDC atau resi transfer sebelum pesanan diproses.</p>
                </div>
                <input
                  type="checkbox"
                  checked={configData.require_proof_upload !== false}
                  onChange={(e) => setConfigData({ ...configData, require_proof_upload: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 4. TYPE === 'E-Wallet' OR 'PayLater' OR 'Lainnya' */}
          {configMethod?.type !== 'QRIS' && configMethod?.type !== 'Tunai' && configMethod?.type !== 'Kartu' && configMethod?.type !== 'Transfer' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-800 leading-relaxed">
                  <p className="font-bold">Konfigurasi Gateway & Parameter Tambahan</p>
                  <p className="text-slate-600 mt-0.5">
                    Sesuaikan parameter koneksi API, webhook callback, dan lingkungan (Sandbox vs Production).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Provider / Gateway Name"
                  value={configData.provider_name || configMethod?.provider || ''}
                  onChange={(e) => setConfigData({ ...configData, provider_name: e.target.value })}
                />

                <Select
                  label="Environment"
                  value={configData.environment || 'production'}
                  onChange={(e) => setConfigData({ ...configData, environment: e.target.value })}
                  options={[
                    { value: 'production', label: 'Production (Live)' },
                    { value: 'sandbox', label: 'Sandbox (Testing Mode)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="API Key / Client ID"
                  placeholder="Kunci otorisasi API..."
                  value={configData.api_key || ''}
                  onChange={(e) => setConfigData({ ...configData, api_key: e.target.value })}
                />

                <Input
                  label="Minimum Transaksi"
                  type="number"
                  placeholder="10000"
                  value={configData.min_amount || '10000'}
                  onChange={(e) => setConfigData({ ...configData, min_amount: e.target.value })}
                  prefix="Rp"
                />
              </div>

              <Input
                label="Webhook Notification Endpoint"
                placeholder="https://api.posan.com/api/webhooks/payment"
                value={configData.webhook_url || ''}
                onChange={(e) => setConfigData({ ...configData, webhook_url: e.target.value })}
              />
            </div>
          )}
        </form>
      </Modal>

      {/* Modal: Tambah Payment Method */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !submitting && setIsAddModalOpen(false)}
        title="Tambah Payment Method Baru"
        description="Integrasikan kanal atau metode pembayaran baru ke seluruh ekosistem POSAN."
        icon={CreditCard}
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
              {submitting ? 'Menyimpan...' : 'Simpan Payment Method'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
              {errorMessage}
            </div>
          )}

          <div className="space-y-3">
            <Input
              label="Nama Payment Method"
              required
              placeholder="Contoh: QRIS Dynamic, BCA Virtual Account"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Tipe Kanal"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={[
                  { value: 'Tunai', label: 'Tunai (Cash)' },
                  { value: 'QRIS', label: 'QRIS' },
                  { value: 'E-Wallet', label: 'E-Wallet' },
                  { value: 'Kartu', label: 'Kartu (EDC)' },
                  { value: 'Transfer', label: 'Transfer Bank / VA' },
                  { value: 'PayLater', label: 'PayLater' },
                ]}
              />

              <Select
                label="Status Default"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'Active', label: 'Aktif (Active)' },
                  { value: 'Inactive', label: 'Nonaktif (Inactive)' },
                ]}
              />
            </div>

            <Input
              label="Provider / Gateway"
              placeholder="Contoh: Bank Indonesia, Midtrans, Xendit, BCA"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            />

            <Input
              label="Biaya / MDR"
              placeholder="Contoh: 0%, 0.3% MDR, Rp 4.000 / trx"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Deskripsi
              </label>
              <textarea
                rows={2}
                placeholder="Catatan atau instruksi pembayaran untuk kasir..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-800 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Payment Method */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !submitting && setIsEditModalOpen(false)}
        title={`Edit Payment Method - ${selectedMethod?.name}`}
        description="Perbarui informasi umum dan nama kanal pembayaran POSAN."
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
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
              {errorMessage}
            </div>
          )}

          <div className="space-y-3">
            <Input
              label="Nama Payment Method"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Tipe Kanal"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={[
                  { value: 'Tunai', label: 'Tunai (Cash)' },
                  { value: 'QRIS', label: 'QRIS' },
                  { value: 'E-Wallet', label: 'E-Wallet' },
                  { value: 'Kartu', label: 'Kartu (EDC)' },
                  { value: 'Transfer', label: 'Transfer Bank / VA' },
                  { value: 'PayLater', label: 'PayLater' },
                ]}
              />

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'Active', label: 'Aktif (Active)' },
                  { value: 'Inactive', label: 'Nonaktif (Inactive)' },
                ]}
              />
            </div>

            <Input
              label="Provider / Gateway"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            />

            <Input
              label="Biaya / MDR"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Deskripsi
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-800 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal: Toggle Status Confirm */}
      <Modal
        isOpen={isToggleConfirmOpen}
        onClose={() => !submitting && setIsToggleConfirmOpen(false)}
        title={
          selectedMethod?.status === 'Active'
            ? 'Nonaktifkan Payment Method?'
            : 'Aktifkan Payment Method?'
        }
        description={
          selectedMethod?.status === 'Active'
            ? `Metode pembayaran "${selectedMethod?.name}" tidak akan dapat dipilih di kasir selama berstatus nonaktif.`
            : `Metode pembayaran "${selectedMethod?.name}" akan kembali tersedia untuk seluruh transaksi kasir POSAN.`
        }
        icon={AlertTriangle}
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
              variant={selectedMethod?.status === 'Active' ? 'danger' : 'primary'}
              size="md"
              disabled={submitting}
              icon={submitting ? Loader2 : null}
              onClick={handleToggleStatus}
            >
              {submitting
                ? 'Memproses...'
                : selectedMethod?.status === 'Active'
                ? 'Ya, Nonaktifkan'
                : 'Ya, Aktifkan'}
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Apakah Anda yakin ingin mengubah status metode pembayaran{' '}
          <strong className="text-slate-900">{selectedMethod?.name}</strong> menjadi{' '}
          <span
            className={`font-semibold ${
              selectedMethod?.status === 'Active' ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {selectedMethod?.status === 'Active' ? 'Nonaktif' : 'Aktif'}
          </span>
          ?
        </p>
      </Modal>

      {/* Modal: Delete Confirm */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !submitting && setIsDeleteModalOpen(false)}
        title="Hapus Payment Method?"
        description={`Metode pembayaran "${selectedMethod?.name}" akan dihapus permanen dari sistem POSAN.`}
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
              {submitting ? 'Menghapus...' : 'Ya, Hapus Metode'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
              {errorMessage}
            </div>
          )}
          <p className="text-xs text-slate-600 leading-relaxed">
            Metode pembayaran hanya dapat dihapus jika belum memiliki riwayat transaksi penjualan yang tertaut.
          </p>
        </div>
      </Modal>
    </div>
  );
}
