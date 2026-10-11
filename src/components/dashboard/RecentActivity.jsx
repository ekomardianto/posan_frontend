import React from 'react';
import {
  Clock,
  Store,
  UserPlus,
  CreditCard,
  UserRound,
  ShieldCheck,
  Loader2
} from 'lucide-react';

const typeIcons = {
  merchant: {
    icon: Store,
    bg: 'bg-amber-100 text-amber-700',
  },
  admin: {
    icon: UserPlus,
    bg: 'bg-blue-100 text-blue-700',
  },
  payment: {
    icon: CreditCard,
    bg: 'bg-emerald-100 text-emerald-700',
  },
  cashier: {
    icon: UserRound,
    bg: 'bg-teal-100 text-teal-700',
  },
  system: {
    icon: ShieldCheck,
    bg: 'bg-slate-100 text-slate-700',
  },
};

export default function RecentActivity({ activities = [], loading = false }) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 shadow-sm p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Aktivitas Terkini</h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">Aktivitas database</span>
      </div>

      {/* Timeline List */}
      <div className="mt-4 relative">
        {loading && activities.length === 0 ? (
          <div className="p-6 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
            <span className="text-xs">Memuat aktivitas dari database...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            Belum ada catatan aktivitas di database.
          </div>
        ) : (
          <>
            <div className="absolute top-3 bottom-3 left-4 w-px bg-slate-100 -z-0"></div>

            <div className="space-y-4 relative z-10">
              {activities.map((act) => {
                const typeConfig = typeIcons[act.type] || typeIcons.system;
                const Icon = typeConfig.icon;

                return (
                  <div key={act.id} className="flex items-start gap-3 group">
                    <div
                      className={`w-8 h-8 rounded-xl ${typeConfig.bg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 leading-snug truncate">
                          {act.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {act.time}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                        {act.details}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
