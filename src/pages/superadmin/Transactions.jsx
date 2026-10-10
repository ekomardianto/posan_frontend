import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Receipt,
  Search,
  Eye,
  Calendar,
  CreditCard,
  UserRound,
  CheckCircle2,
  Clock,
  Coffee,
  ChefHat,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Banknote,
  DollarSign,
  Plus,
  Trash2,
  ShoppingBag
} from 'lucide-react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { transactionService } from '../../services/transactionService';
import { productService } from '../../services/productService';
import { generateTransactionCode } from '../../utils/transactionCodeGenerator';
import { paymentMethodService } from '../../services/paymentMethodService';

export default function Transactions() {
  const { role, user } = useAuth();
  const canCreateTransaction = role === 'kasir' || role === 'admin';
  const isSuperAdmin = role === 'super_admin';

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Detail Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add Transaction Modal (Kasir & Admin Cafe only)
  const [isAddTrxModalOpen, setIsAddTrxModalOpen] = useState(false);
  const [submittingTrx, setSubmittingTrx] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  
  const [trxCustomerName, setTrxCustomerName] = useState('');
  const [trxNotes, setTrxNotes] = useState('');
  const [trxPaymentMethodId, setTrxPaymentMethodId] = useState('');
  const [trxAmountPaid, setTrxAmountPaid] = useState('');
  const [trxItems, setTrxItems] = useState([
    { product_id: '', quantity: 1, notes: '', unit_price: 0, subtotal: 0, station: 'barista', product_name: '' }
  ]);

  // Load transactions from PostgreSQL
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setErrorMessage(err.message || 'Gagal memuat riwayat transaksi dari database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Open Detail Modal
  const handleOpenDetail = async (trx) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const fullDetail = await transactionService.getTransactionById(trx.id);
      setSelectedTransaction(fullDetail);
    } catch {
      setSelectedTransaction(trx);
    } finally {
      setDetailLoading(false);
    }
  };

  // Filtered dataset
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        (t.receipt_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.cashier_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.payment_method_name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' || (t.status || '').toUpperCase() === statusFilter.toUpperCase();

      return matchSearch && matchStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  // Statistics
  const totalRevenue = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (Number(t.total_amount) || 0), 0);
  }, [transactions]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

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
      key: 'receipt_number',
      title: 'Nomor Struk & Pelanggan',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <p className="font-mono font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              #{row.receipt_number}
            </p>
            <p className="text-[11px] text-slate-500">
              Pelanggan: <span className="font-semibold text-slate-700">{row.customer_name || 'Umum'}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'cashier_name',
      title: 'Kasir Petugas',
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-800 font-medium">
          <UserRound className="w-3.5 h-3.5 text-slate-400" />
          <span>{val || 'Kasir Utama'}</span>
        </span>
      ),
    },
    {
      key: 'payment_method_name',
      title: 'Metode Bayar',
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          <span>{val || 'Tunai'}</span>
        </span>
      ),
    },
    {
      key: 'total_amount',
      title: 'Total Bayar',
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-xs text-emerald-700">
            Rp {Number(val).toLocaleString('id-ID')}
          </span>
          <p className="text-[10px] text-slate-400">{row.item_count || 1} item menu</p>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (val) => <Badge status={val || 'completed'} />,
    },
    {
      key: 'created_at',
      title: 'Waktu Transaksi',
      render: (val) => (
        <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {val
            ? new Date(val).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }) + ' WIB'
            : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Action',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="icon"
            size="sm"
            onClick={() => handleOpenDetail(row)}
            title="Lihat Detail Transaksi & Item"
          >
            <Eye className="w-4 h-4 text-slate-500 hover:text-slate-800" />
          </Button>
        </div>
      ),
    },
  ];

  // Open Add Transaction Modal
  const handleOpenAddTrx = async () => {
    try {
      setErrorMessage('');
      const [prods, pms] = await Promise.all([
        productService.getProducts().catch(() => []),
        paymentMethodService.getPaymentMethods().catch(() => []),
      ]);

      setAvailableProducts(prods);
      setAvailablePaymentMethods(pms);

      const firstProd = prods[0];
      setTrxItems([
        {
          product_id: firstProd ? String(firstProd.id) : '',
          product_name: firstProd ? firstProd.name : '',
          quantity: 1,
          unit_price: firstProd ? Number(firstProd.price) : 0,
          subtotal: firstProd ? Number(firstProd.price) : 0,
          notes: '',
          station: firstProd?.station || (firstProd?.category_name?.toLowerCase().includes('makan') ? 'kitchen' : 'barista'),
        },
      ]);

      const activePm = pms.find((p) => p.is_active || p.status === 'Active') || pms[0];
      setTrxPaymentMethodId(activePm ? String(activePm.id) : '');
      setTrxCustomerName('');
      setTrxNotes('');
      setTrxAmountPaid(firstProd ? String(firstProd.price) : '');
      setIsAddTrxModalOpen(true);
    } catch (err) {
      setErrorMessage('Gagal memuat produk dan metode pembayaran untuk transaksi.');
    }
  };

  const handleProductChange = (index, prodId) => {
    const prod = availableProducts.find((p) => String(p.id) === String(prodId));
    if (!prod) return;

    setTrxItems((prev) => {
      const copy = [...prev];
      const qty = copy[index].quantity || 1;
      const price = Number(prod.price) || 0;
      copy[index] = {
        ...copy[index],
        product_id: String(prod.id),
        product_name: prod.name,
        unit_price: price,
        subtotal: qty * price,
        station: prod.station || (prod.category_name?.toLowerCase().includes('makan') ? 'kitchen' : 'barista'),
      };
      return copy;
    });
  };

  const handleQtyChange = (index, qtyVal) => {
    const qty = Math.max(1, Number(qtyVal) || 1);
    setTrxItems((prev) => {
      const copy = [...prev];
      const item = copy[index];
      copy[index] = {
        ...item,
        quantity: qty,
        subtotal: qty * (Number(item.unit_price) || 0),
      };
      return copy;
    });
  };

  const handleItemNoteChange = (index, noteVal) => {
    setTrxItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], notes: noteVal };
      return copy;
    });
  };

  const handleAddItemRow = () => {
    const firstProd = availableProducts[0];
    setTrxItems((prev) => [
      ...prev,
      {
        product_id: firstProd ? String(firstProd.id) : '',
        product_name: firstProd ? firstProd.name : '',
        quantity: 1,
        unit_price: firstProd ? Number(firstProd.price) : 0,
        subtotal: firstProd ? Number(firstProd.price) : 0,
        notes: '',
        station: firstProd?.station || 'barista',
      },
    ]);
  };

  const handleRemoveItemRow = (index) => {
    if (trxItems.length <= 1) return;
    setTrxItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const calculatedTotal = useMemo(() => {
    return trxItems.reduce((acc, it) => acc + (Number(it.subtotal) || 0), 0);
  }, [trxItems]);

  const calculatedChange = useMemo(() => {
    const paid = Number(trxAmountPaid) || calculatedTotal;
    return Math.max(0, paid - calculatedTotal);
  }, [trxAmountPaid, calculatedTotal]);

  const handleSubmitNewTrx = async (e) => {
    if (e) e.preventDefault();
    if (submittingTrx || trxItems.length === 0) return;

    try {
      setSubmittingTrx(true);
      setErrorMessage('');

      const receiptNumber = generateTransactionCode();
      const payload = {
        receipt_number: receiptNumber,
        payment_method_id: trxPaymentMethodId ? Number(trxPaymentMethodId) : null,
        total_amount: calculatedTotal,
        amount_paid: Number(trxAmountPaid) || calculatedTotal,
        change_amount: calculatedChange,
        customer_name: trxCustomerName.trim() || 'Pelanggan Umum',
        notes: trxNotes.trim() || null,
        items: trxItems.map((it) => ({
          product_id: it.product_id ? Number(it.product_id) : null,
          product_name: it.product_name,
          quantity: Number(it.quantity) || 1,
          unit_price: Number(it.unit_price) || 0,
          subtotal: Number(it.subtotal) || 0,
          station: it.station || 'barista',
          notes: it.notes?.trim() || null,
        })),
      };

      await transactionService.createTransaction(payload);
      setIsAddTrxModalOpen(false);
      await loadTransactions();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal membuat transaksi baru.');
    } finally {
      setSubmittingTrx(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Riwayat Transaksi & Penjualan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data transaksi penjualan dan item pengerjaan stasiun dari database PostgreSQL <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">posan_db</code>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={loadTransactions}
            title="Muat ulang data"
          >
            {loading ? 'Menyinkronkan...' : 'Refresh'}
          </Button>

          {canCreateTransaction && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenAddTrx}
            >
              + Catat Transaksi POS
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadTransactions}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Omzet Penjualan
            </span>
            <p className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Struk Transaksi
            </span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              {transactions.length} Transaksi
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Status Database
            </span>
            <p className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>PostgreSQL Synchronized</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full sm:w-80">
          <Input
            placeholder="Cari nomor struk, pelanggan, kasir..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'ALL', label: 'Semua Status' },
              { value: 'COMPLETED', label: 'Selesai (Completed)' },
              { value: 'PENDING', label: 'Pending' },
            ]}
            className="w-44 text-xs"
          />
        </div>
      </div>

      {/* 3. Table of Transactions */}
      {loading && transactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-slate-700">Mengambil data transaksi dari database PostgreSQL...</p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={paginatedData}
          keyField="id"
          onRowClick={handleOpenDetail}
          emptyMessage="Belum ada transaksi ditemukan di database PostgreSQL."
          emptySubtext="Transaksi yang diproses oleh kasir akan otomatis muncul di sini."
          pagination={{
            currentPage,
            totalPages,
            totalItems: filteredTransactions.length,
            itemsPerPage,
            onPageChange: setCurrentPage,
          }}
        />
      )}

      {/* Modal: Detail Transaksi & Item Pengerjaan */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Detail Transaksi #${selectedTransaction?.receipt_number || ''}`}
        description="Rincian pesanan, pembagian stasiun barista/kitchen, dan status pembayaran."
        icon={Receipt}
        size="lg"
        footer={
          <Button variant="outline" size="md" onClick={() => setIsDetailModalOpen(false)}>
            Tutup
          </Button>
        }
      >
        {detailLoading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">Memuat detail item pesanan...</span>
          </div>
        ) : selectedTransaction ? (
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Nomor Struk
                </span>
                <h4 className="text-base font-extrabold text-slate-900 font-mono">
                  #{selectedTransaction.receipt_number}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pelanggan: <strong className="text-slate-800">{selectedTransaction.customer_name || 'Umum'}</strong> • Kasir: {selectedTransaction.cashier_name || 'Kasir'}
                </p>
              </div>

              <div className="text-right">
                <Badge status={selectedTransaction.status || 'completed'} />
                <p className="text-xs font-bold text-emerald-700 font-mono mt-1">
                  Rp {Number(selectedTransaction.total_amount).toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Payment Summary Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">
                  Metode Pembayaran
                </span>
                <p className="font-bold text-slate-800">
                  {selectedTransaction.payment_method_name || 'Tunai'}
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">
                  Jumlah Dibayar
                </span>
                <p className="font-mono font-bold text-slate-800">
                  Rp {Number(selectedTransaction.amount_paid || selectedTransaction.total_amount).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">
                  Kembalian
                </span>
                <p className="font-mono font-bold text-slate-800">
                  Rp {Number(selectedTransaction.change_amount || 0).toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Items List Table */}
            <div>
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Item Menu yang Dipesan ({selectedTransaction.items?.length || 0})
              </h5>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Item Menu</th>
                      <th className="py-2.5 px-3 text-center">Stasiun</th>
                      <th className="py-2.5 px-3 text-center">Status Item</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                      selectedTransaction.items.map((it) => (
                        <tr key={it.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {it.product_name}
                            {it.notes && (
                              <p className="text-[10px] text-amber-600 font-normal">
                                Catatan: {it.notes}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                it.station === 'kitchen'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {it.station === 'kitchen' ? (
                                <ChefHat className="w-3 h-3" />
                              ) : (
                                <Coffee className="w-3 h-3" />
                              )}
                              <span>{it.station === 'kitchen' ? 'Kitchen' : 'Barista'}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                it.item_status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : it.item_status === 'processing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {it.item_status || 'pending'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                            {it.quantity}x
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            Rp {Number(it.unit_price).toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            Rp {Number(it.subtotal).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-400">
                          Data rincian item transaksi tidak tersedia.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Modal: Catat Transaksi Baru (Kasir & Admin Cafe) */}
      <Modal
        isOpen={isAddTrxModalOpen}
        onClose={() => !submittingTrx && setIsAddTrxModalOpen(false)}
        title="Catat Transaksi Penjualan Baru (POS)"
        description="Pilih item menu pesanan, metode pembayaran, dan otomatis kirim tiket ke stasiun Barista & Kitchen."
        icon={ShoppingBag}
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              disabled={submittingTrx}
              onClick={() => setIsAddTrxModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={submittingTrx || calculatedTotal <= 0}
              icon={submittingTrx ? Loader2 : CheckCircle2}
              onClick={handleSubmitNewTrx}
            >
              {submittingTrx ? 'Memproses Transaksi...' : `Bayar Rp ${calculatedTotal.toLocaleString('id-ID')}`}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitNewTrx} className="space-y-4">
          {/* Customer & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nama Pelanggan / Nomor Meja"
              placeholder="Contoh: Meja 05 / Kak Sarah"
              value={trxCustomerName}
              onChange={(e) => setTrxCustomerName(e.target.value)}
            />

            <Input
              label="Catatan Struk (Opsional)"
              placeholder="Contoh: Dine In / Take Away"
              value={trxNotes}
              onChange={(e) => setTrxNotes(e.target.value)}
            />
          </div>

          {/* Items selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Item Menu yang Dipesan ({trxItems.length})
              </label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {trxItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                >
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Pilih Menu #{idx + 1}
                    </label>
                    <Select
                      value={item.product_id}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      options={availableProducts.map((p) => ({
                        value: String(p.id),
                        label: `${p.name} - Rp ${Number(p.price).toLocaleString('id-ID')}`,
                      }))}
                      className="text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Qty
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQtyChange(idx, e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Catatan Rasa / Suhu
                    </label>
                    <Input
                      placeholder="Less sweet, extra ice..."
                      value={item.notes}
                      onChange={(e) => handleItemNoteChange(idx, e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      disabled={trxItems.length <= 1}
                      className="p-2 text-rose-500 hover:text-rose-700 disabled:opacity-30 cursor-pointer"
                      title="Hapus baris item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method & Amount Paid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <Select
              label="Metode Pembayaran"
              value={trxPaymentMethodId}
              onChange={(e) => setTrxPaymentMethodId(e.target.value)}
              options={availablePaymentMethods.map((pm) => ({
                value: String(pm.id),
                label: `${pm.name} (${pm.type || 'Gateway'})`,
              }))}
            />

            <Input
              label="Uang Diterima / Dibayar (Rp)"
              type="number"
              placeholder={`Contoh: ${calculatedTotal}`}
              value={trxAmountPaid}
              onChange={(e) => setTrxAmountPaid(e.target.value)}
            />
          </div>

          {/* Total & Change Summary Pill */}
          <div className="p-3.5 bg-brand-50 border border-brand-200/80 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-medium">Total Tagihan:</span>
              <p className="text-base font-extrabold text-brand-900 font-mono">
                Rp {calculatedTotal.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="text-right">
              <span className="text-slate-500 font-medium">Kembalian:</span>
              <p className="text-base font-extrabold text-emerald-700 font-mono">
                Rp {calculatedChange.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

