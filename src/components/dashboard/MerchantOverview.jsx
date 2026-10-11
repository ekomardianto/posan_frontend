import React from 'react';
import { useProgressRouter } from '../../context/NavigationProgressContext';
import { ArrowRight, Users, UserRound, Utensils } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function MerchantOverview({ merchants = [], loading = false }) {
  const router = useProgressRouter();

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Ringkasan Kafe & Gerai</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {merchants.length} Kafe Aktif
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Informasi gerai kafe, akun admin, serta kuota staf kasir & stasiun
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          iconRight={ArrowRight}
          onClick={() => router.push('/superadmin/merchant')}
          className="self-start sm:self-auto text-brand-700 bg-brand-50/50 border-brand-200 hover:bg-brand-100/60"
        >
          Lihat Profil Kafe
        </Button>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto">
        {loading && merchants.length === 0 ? (
          <div className="p-5 sm:p-6 space-y-4" aria-label="Memuat data gerai">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex items-center gap-4 animate-pulse" aria-hidden="true">
                <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2"><div className="h-3 w-1/3 rounded bg-slate-100" /><div className="h-3 w-1/2 rounded bg-slate-100" /></div>
                <div className="hidden sm:block h-6 w-16 rounded-lg bg-slate-100" />
                <div className="hidden md:block h-6 w-20 rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        ) : merchants.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Belum ada data di database.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5 sm:px-6">Nama Kafe / Gerai</th>
                <th className="py-3.5 px-4 text-center sm:text-left">Admin Café</th>
                <th className="py-3.5 px-4 text-center sm:text-left">Kasir & Staf</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 sm:px-6">Katalog Menu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {merchants.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  onClick={() => router.push('/superadmin/merchant')}
                >
                  {/* Merchant Name & Avatar */}
                  <td className="py-3.5 px-5 sm:px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl ${item.color || 'bg-brand-100 text-brand-700'} font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        {item.logoText || 'PO'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60">
                            {item.category || 'Specialty Coffee'}
                          </span>
                          <span className="text-[11px] text-slate-400">• {item.city}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Admin Count */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 text-blue-800 font-semibold bg-blue-50/80 px-2.5 py-1 rounded-lg">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>{item.adminCount} Admin</span>
                    </div>
                  </td>

                  {/* Cashier Count */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 text-slate-700 font-medium bg-slate-100/70 px-2.5 py-1 rounded-lg">
                      <UserRound className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.cashierCount} Staf</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge status={item.status} />
                  </td>

                  {/* Menu / Catalog Count */}
                  <td className="py-3.5 px-5 sm:px-6 whitespace-nowrap text-slate-600 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-700 font-medium">
                        {item.totalProducts || 0} Menu Terdaftar
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
