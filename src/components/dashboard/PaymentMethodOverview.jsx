import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Banknote,
  QrCode,
  Smartphone,
  Building2,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { paymentMethodService } from '../../services/paymentMethodService';
import { useAlert } from '../../context/AlertContext';

const iconLookup = {
  Banknote: Banknote,
  QrCode: QrCode,
  Smartphone: Smartphone,
  CreditCard: CreditCard,
  Building2: Building2,
  Clock: Clock,
};

export default function PaymentMethodOverview({ onDataChange }) {
  const navigate = useNavigate();
  const alert = useAlert();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const loadMethods = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentMethodService.getPaymentMethods();
      setMethods(data);
    } catch (err) {
      console.error('Error loading payment methods in overview:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  // Allow Super Admin to toggle active/inactive status live to Posan Server
  const handleToggle = async (method) => {
    try {
      setTogglingId(method.id);
      await paymentMethodService.togglePaymentMethodStatus(method.id, method.status, method.name);
      await loadMethods();
      alert.success(`Status metode "${method.name}" berhasil diubah.`);
      if (onDataChange) onDataChange();
    } catch (err) {
      alert.error(`Gagal mengubah status: ${err.message || err}`);
    } finally {
      setTogglingId(null);
    }
  };

  const activeCount = methods.filter((m) => m.status === 'Active').length;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Payment Method</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activeCount} Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Status gateway & kanal pembayaran global POSAN dari database
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            iconRight={ArrowRight}
            onClick={() => navigate('/superadmin/payment-method')}
            className="text-brand-700 hover:text-brand-800 p-0 text-xs"
          >
            Kelola
          </Button>
        </div>

        {/* List of Payment Methods */}
        <div className="mt-4 space-y-3">
          {loading && methods.length === 0 ? (
            <div className="p-6 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
              <span className="text-xs">Memuat data metode pembayaran...</span>
            </div>
          ) : (
            methods.slice(0, 5).map((method) => {
              const Icon = iconLookup[method.iconType] || CreditCard;
              const isActive = method.status === 'Active';
              const isBusy = togglingId === method.id;

              return (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors group"
                >
                  {/* Icon & Method Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-600 border border-brand-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-slate-900">
                        {method.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{method.provider}</p>
                    </div>
                  </div>

                  {/* Status Toggle & Badge */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <Badge status={method.status} size="xs" />

                    {/* Interactive Toggle Switch */}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggle(method)}
                      className={`w-10 h-6 rounded-full transition-colors p-0.5 flex items-center focus:outline-none cursor-pointer ${
                        isActive ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'
                      } ${isBusy ? 'opacity-50' : ''}`}
                      title={`Klik untuk ubah status ${method.name}`}
                      aria-label={`Toggle ${method.name}`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-2xs"></div>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Footer Button */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <Button
          variant="secondary"
          size="md"
          icon={CreditCard}
          onClick={() => navigate('/superadmin/payment-method')}
          className="w-full text-slate-700 bg-slate-100 hover:bg-slate-200/80"
        >
          Kelola Payment Method
        </Button>
      </div>
    </div>
  );
}
