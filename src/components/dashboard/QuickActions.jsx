import React from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Users, Sparkles, ReceiptText, Store, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function QuickActions({ onAddUser }) {
  const router = useRouter();
  const { role } = useAuth();
  const isSuperAdmin = role === 'super_admin';

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {isSuperAdmin ? 'Quick Monitoring Super Admin' : 'Quick Actions Admin Café'}
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Pintasan Manajemen Kafe</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Slot 1 */}
        {isSuperAdmin ? (
          <button
            type="button"
            onClick={() => router.push('/superadmin/users/admin')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200/60 hover:border-indigo-300 text-indigo-800 font-semibold text-xs transition-all group shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="font-bold block truncate">Data User & Staf</span>
              <span className="text-[10px] text-indigo-700 font-normal">Semua Akun & Asal Kafe</span>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={onAddUser || (() => router.push('/superadmin/users/admin'))}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-brand-50/60 hover:bg-brand-50 border border-brand-200/60 hover:border-brand-300 text-brand-800 font-semibold text-xs transition-all group shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="font-bold block truncate">+ Tambah Pengguna</span>
              <span className="text-[10px] text-brand-600 font-normal">Staf Gerai Baru</span>
            </div>
          </button>
        )}

        {/* Slot 2 */}
        <button
          type="button"
          onClick={() => router.push('/superadmin/users/kasir')}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/60 hover:border-emerald-300 text-emerald-800 font-semibold text-xs transition-all group shadow-2xs hover:shadow-xs cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <span className="font-bold block truncate">Akun Kasir</span>
            <span className="text-[10px] text-emerald-700 font-normal">Sub Menu Staf Kasir</span>
          </div>
        </button>

        {/* Slot 3 */}
        {isSuperAdmin ? (
          <button
            type="button"
          onClick={() => router.push('/superadmin/merchant')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/60 hover:bg-blue-50 border border-blue-200/60 hover:border-blue-300 text-blue-800 font-semibold text-xs transition-all group shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Store className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="font-bold block truncate">Profil Kafe & Gerai</span>
              <span className="text-[10px] text-blue-600 font-normal">Informasi Gerai Kafe</span>
            </div>
          </button>
        ) : (
          <button
            type="button"
          onClick={() => router.push('/superadmin/transactions')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/60 hover:bg-blue-50 border border-blue-200/60 hover:border-blue-300 text-blue-800 font-semibold text-xs transition-all group shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <ReceiptText className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <span className="font-bold block truncate">Riwayat Transaksi</span>
              <span className="text-[10px] text-blue-600 font-normal">Laporan & POS Kafe</span>
            </div>
          </button>
        )}

        {/* Slot 4 */}
        <button
          type="button"
          onClick={() => router.push('/superadmin/payment-method')}
          className="flex items-center gap-2.5 p-3 rounded-xl bg-violet-50/60 hover:bg-violet-50 border border-violet-200/60 hover:border-violet-300 text-violet-800 font-semibold text-xs transition-all group hover:border-violet-300 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <span className="font-bold block truncate">Payment Method</span>
            <span className="text-[10px] text-violet-600 font-normal">QRIS, EDC, Tunai</span>
          </div>
        </button>
      </div>
    </div>
  );
}
