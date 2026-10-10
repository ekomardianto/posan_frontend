import { apiRequest } from './apiClient';
import { fetchTransactions, parseTrxDate } from './transactionService.js';

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function formatDuration(seconds) {
  if (isNaN(seconds) || seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

export function formatStaffName(name) {
  if (!name) return 'Staf Outlet';
  const clean = name.trim();
  if (clean.length <= 2) return clean.toUpperCase(); // e.g. 'df' -> 'DF'
  return clean
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function formatDateKey(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatIndonesianDate(d) {
  const dayName = DAYS_ID[d.getDay()];
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}

/**
 * Fetch Staff Performance Report from backend API or local transactions fallback
 */
export async function fetchStaffPerformanceReport(
  periodId = '7days',
  staffFilter = 'all',
  roleFilter = 'all',
  customStart = null,
  customEnd = null
) {
  try {
    const params = new URLSearchParams();
    if (periodId) params.append('period', periodId);
    if (staffFilter && staffFilter !== 'all') params.append('staff', staffFilter);
    if (roleFilter && roleFilter !== 'all') params.append('role', roleFilter);
    if (customStart) params.append('startDate', customStart);
    if (customEnd) params.append('endDate', customEnd);

    const queryStr = params.toString();
    const endpoint = `/orders/staff-performance${queryStr ? `?${queryStr}` : ''}`;
    
    const backendData = await apiRequest(endpoint, { method: 'GET' });
    if (backendData && backendData.staffPerformanceTable) {
      return backendData;
    }
    throw new Error('Fallback to local calculation');
  } catch (err) {
    console.warn('API /orders/staff-performance fallback to local calculation:', err?.message || err);
    return calculateLocalStaffReport(periodId, staffFilter, roleFilter, customStart, customEnd);
  }
}

/**
 * Robust Local Client-Side Calculation Fallback
 */
async function calculateLocalStaffReport(periodId, staffFilter, roleFilter, customStart, customEnd) {
  const [rawTransactions, usersRes] = await Promise.all([
    fetchTransactions(),
    apiRequest('/users', { method: 'GET' }).catch(() => []),
  ]);

  const rawUsers = Array.isArray(usersRes) ? usersRes : (usersRes?.data || []);
  const staffUsers = rawUsers.filter((u) => ['barista', 'kitchen', 'kasir', 'admin'].includes(u.role));

  const baristas = staffUsers.filter((u) => u.role === 'barista');
  const kitchens = staffUsers.filter((u) => u.role === 'kitchen');
  const cashiers = staffUsers.filter((u) => u.role === 'kasir');

  const now = new Date();
  const refYear = now.getFullYear();
  const refMonth = now.getMonth();
  const refDate = now.getDate();

  // 1. Filter transactions by date
  let dateFiltered = [];
  if (periodId === 'today') {
    const todayKey = formatDateKey(now);
    dateFiltered = rawTransactions.filter((t) => formatDateKey(parseTrxDate(t.created_at)) === todayKey);
  } else if (periodId === '7days' || periodId === 'week') {
    const start7 = new Date(refYear, refMonth, refDate - 6);
    start7.setHours(0, 0, 0, 0);
    dateFiltered = rawTransactions.filter((t) => parseTrxDate(t.created_at) >= start7);
  } else if (periodId === '30days' || periodId === 'month') {
    const start30 = new Date(refYear, refMonth, refDate - 29);
    start30.setHours(0, 0, 0, 0);
    dateFiltered = rawTransactions.filter((t) => parseTrxDate(t.created_at) >= start30);
  } else if (periodId === 'custom' && customStart && customEnd) {
    const cStart = new Date(customStart);
    cStart.setHours(0, 0, 0, 0);
    const cEnd = new Date(customEnd);
    cEnd.setHours(23, 59, 59, 999);
    dateFiltered = rawTransactions.filter((t) => {
      const d = parseTrxDate(t.created_at);
      return d >= cStart && d <= cEnd;
    });
  } else {
    // thisMonth
    const startMonth = new Date(refYear, refMonth, 1);
    startMonth.setHours(0, 0, 0, 0);
    dateFiltered = rawTransactions.filter((t) => parseTrxDate(t.created_at) >= startMonth);
  }

  // 2. Initialize Staff Map with all REAL registered staff
  const staffMap = {};

  staffUsers.forEach((u) => {
    const fName = formatStaffName(u.name);
    staffMap[fName] = {
      userId: u.id,
      name: fName,
      role: u.role,
      station: u.role === 'barista' ? 'barista' : u.role === 'kitchen' ? 'kitchen' : u.role === 'kasir' ? 'kasir' : 'all',
      dailyStats: {},
    };
  });

  const ensureStaffDay = (staffName, staffRole, dateKey, dateObj) => {
    const formattedName = formatStaffName(staffName);
    if (!staffMap[formattedName]) {
      staffMap[formattedName] = {
        name: formattedName,
        role: staffRole,
        dailyStats: {},
      };
    }
    if (!staffMap[formattedName].dailyStats[dateKey]) {
      staffMap[formattedName].dailyStats[dateKey] = {
        dateKey,
        dateObj,
        completedItems: [],
        processingItems: [],
        allDetails: [],
      };
    }
    return staffMap[formattedName].dailyStats[dateKey];
  };

  // Helper to resolve real staff name for an item
  const resolveRealStaffName = (it, trx, idx = 0) => {
    if (it.processed_by && it.processed_by.trim()) {
      const pName = it.processed_by.trim();
      const matched = staffUsers.find((u) => u.name.toLowerCase().trim() === pName.toLowerCase());
      return formatStaffName(matched ? matched.name : pName);
    }
    const station = (it.station || 'barista').toLowerCase();
    if (station === 'barista') {
      if (baristas.length > 0) {
        return formatStaffName(baristas[idx % baristas.length].name);
      }
      return 'Barista';
    }
    if (station === 'kitchen') {
      if (kitchens.length > 0) {
        return formatStaffName(kitchens[idx % kitchens.length].name);
      }
      return 'Kitchen Chef';
    }
    if (trx.cashierName) {
      return formatStaffName(trx.cashierName);
    }
    if (cashiers.length > 0) {
      return formatStaffName(cashiers[0].name);
    }
    return 'Staf Outlet';
  };

  dateFiltered.forEach((trx, trxIdx) => {
    const trxDate = parseTrxDate(trx.created_at);
    const dateKey = formatDateKey(trxDate);

    // Kasir attribution
    const cashierName = trx.cashierName || (cashiers.length > 0 ? cashiers[0].name : 'Kasir Utama');
    const cashierDay = ensureStaffDay(cashierName, 'kasir', dateKey, trxDate);

    const isTrxCompleted = trx.status === 'PAID' || trx.status === 'COMPLETED';
    const trxDetail = {
      itemId: `trx-${trx.receiptNumber || trx.id}`,
      transactionId: trx.numericId || trx.id,
      receiptNumber: trx.receiptNumber || `#TRX-${trx.id}`,
      customerName: trx.customerName || 'Pelanggan POSAN',
      productName: `Transaksi Total (${trx.itemCount || (trx.items && trx.items.length) || 1} item)`,
      quantity: trx.itemCount || 1,
      unitPrice: trx.total || 0,
      subtotal: trx.total || 0,
      station: 'kasir',
      stationLabel: 'Kasir / POS',
      status: isTrxCompleted ? 'completed' : 'processing',
      statusLabel: isTrxCompleted ? 'Selesai' : 'Sedang Diproses',
      statusVariant: isTrxCompleted ? 'success' : 'warning',
      orderTime: trx.time || '10:00 WIB',
      processingTime: trx.time || '10:00 WIB',
      completedTime: isTrxCompleted ? trx.time : '-',
      durationSeconds: 90,
      formattedDuration: isTrxCompleted ? '1m 30s' : 'Sedang Proses',
      notes: trx.notes || '',
    };
    cashierDay.allDetails.push(trxDetail);
    if (isTrxCompleted) {
      cashierDay.completedItems.push({ ...trxDetail, durationSec: 90 });
    } else {
      cashierDay.processingItems.push(trxDetail);
    }

    // Barista & Kitchen items attribution
    (trx.items || []).forEach((it, itIdx) => {
      const station = (it.station || 'barista').toLowerCase();
      const staffName = resolveRealStaffName(it, trx, trxIdx + itIdx);
      const staffRole = station === 'kitchen' ? 'kitchen' : station === 'barista' ? 'barista' : 'kasir';

      const staffDay = ensureStaffDay(staffName, staffRole, dateKey, trxDate);
      const isCompleted = (it.status || '').toLowerCase() === 'completed' || isTrxCompleted;

      let durationSec = station === 'kitchen' ? 320 : 160;
      if (it.completed_at_millis && it.processing_at_millis) {
        durationSec = Math.max(15, Math.round((it.completed_at_millis - it.processing_at_millis) / 1000));
      }

      const itDetail = {
        itemId: it.id || `item-${it.name}-${itIdx}`,
        transactionId: trx.numericId || trx.id,
        receiptNumber: trx.receiptNumber || `#TRX-${trx.id}`,
        customerName: trx.customerName || 'Pelanggan POSAN',
        productName: it.name || 'Menu Kafe',
        quantity: it.qty || 1,
        unitPrice: it.price || 0,
        subtotal: it.subtotal || 0,
        station: station,
        stationLabel: station === 'kitchen' ? 'Kitchen (Dapur)' : 'Barista (Bar)',
        status: isCompleted ? 'completed' : 'processing',
        statusLabel: isCompleted ? 'Selesai' : 'Sedang Diproses',
        statusVariant: isCompleted ? 'success' : 'warning',
        orderTime: trx.time || '10:00 WIB',
        processingTime: trx.time || '10:00 WIB',
        completedTime: isCompleted ? trx.time : '-',
        durationSeconds: durationSec,
        formattedDuration: isCompleted ? formatDuration(durationSec) : 'Sedang Dikerjakan',
        notes: it.notes || '',
      };

      staffDay.allDetails.push(itDetail);
      if (isCompleted) {
        staffDay.completedItems.push({ ...itDetail, durationSec });
      } else {
        staffDay.processingItems.push(itDetail);
      }
    });
  });

  // Flatten table rows
  const tableRows = [];
  let totalCompletedAll = 0;
  let totalProcessingAll = 0;
  let totalDurationAll = 0;
  let totalCompletedCountAll = 0;
  const activeStaffSet = new Set();

  Object.values(staffMap).forEach((st) => {
    const staffName = st.name;
    const staffRole = st.role;

    if (roleFilter && roleFilter !== 'all' && staffRole.toLowerCase() !== roleFilter.toLowerCase()) {
      return;
    }
    if (staffFilter && staffFilter !== 'all') {
      const target = staffFilter.toLowerCase().trim();
      if (!staffName.toLowerCase().includes(target) && !target.includes(staffName.toLowerCase())) {
        return;
      }
    }

    const dailyEntries = Object.entries(st.dailyStats);
    if (dailyEntries.length === 0) {
      tableRows.push({
        id: `row-${staffName}-${formatDateKey(now)}`,
        dateKey: formatDateKey(now),
        dayName: DAYS_ID[now.getDay()],
        formattedDate: formatIndonesianDate(now),
        staffName,
        staffRole,
        roleBadgeLabel: staffRole === 'barista' ? 'Barista' : staffRole === 'kitchen' ? 'Kitchen (Koki)' : staffRole === 'kasir' ? 'Kasir' : 'Admin',
        completedCount: 0,
        formattedCompleted: '0 pesanan',
        processingCount: 0,
        formattedProcessing: '0 pesanan',
        avgDurationSeconds: 0,
        formattedAvgDuration: '0s',
        efficiencyRating: 'Standar ✓',
        efficiencyVariant: 'normal',
        detail: [],
      });
      return;
    }

    dailyEntries.forEach(([dateKey, dayStat]) => {
      const completedCount = dayStat.completedItems.length;
      const processingCount = dayStat.processingItems.length;
      const totalDuration = dayStat.completedItems.reduce((acc, it) => acc + (it.durationSec || 0), 0);
      const avgSec = completedCount > 0 ? Math.round(totalDuration / completedCount) : 0;

      let efficiencyRating = 'Standar ✓';
      let efficiencyVariant = 'normal';
      if (completedCount > 0) {
        if (avgSec <= 180) {
          efficiencyRating = 'Sangat Cepat ⭐';
          efficiencyVariant = 'fast';
        } else if (avgSec <= 360) {
          efficiencyRating = 'Optimal ✨';
          efficiencyVariant = 'optimal';
        }
      }

      activeStaffSet.add(staffName);
      totalCompletedAll += completedCount;
      totalProcessingAll += processingCount;
      if (completedCount > 0) {
        totalDurationAll += totalDuration;
        totalCompletedCountAll += completedCount;
      }

      tableRows.push({
        id: `row-${staffName}-${dateKey}`,
        dateKey,
        dayName: DAYS_ID[dayStat.dateObj.getDay()],
        formattedDate: formatIndonesianDate(dayStat.dateObj),
        staffName,
        staffRole,
        roleBadgeLabel: staffRole === 'barista' ? 'Barista' : staffRole === 'kitchen' ? 'Kitchen (Koki)' : staffRole === 'kasir' ? 'Kasir' : 'Admin',
        completedCount,
        formattedCompleted: `${completedCount} pesanan selesai`,
        processingCount,
        formattedProcessing: `${processingCount} sedang diproses`,
        avgDurationSeconds: avgSec,
        formattedAvgDuration: formatDuration(avgSec),
        efficiencyRating,
        efficiencyVariant,
        detail: dayStat.allDetails,
      });
    });
  });

  tableRows.sort((a, b) => {
    if (b.dateKey !== a.dateKey) {
      return b.dateKey.localeCompare(a.dateKey);
    }
    return b.completedCount - a.completedCount;
  });

  const overallAvgSec = totalCompletedCountAll > 0 ? Math.round(totalDurationAll / totalCompletedCountAll) : 0;

  const kpi = {
    totalActiveStaff: {
      label: 'TOTAL STAF BERTUGAS',
      value: activeStaffSet.size || staffUsers.length,
      formattedValue: `${activeStaffSet.size || staffUsers.length} Orang`,
      comparisonText: 'Barista, Kitchen & Kasir',
      iconType: 'users',
    },
    totalCompletedOrders: {
      label: 'TOTAL PESANAN SELESAI',
      value: totalCompletedAll,
      formattedValue: `${totalCompletedAll} Item`,
      comparisonText: 'Terselesaikan Tepat Waktu',
      iconType: 'check-circle',
    },
    totalProcessingOrders: {
      label: 'PESANAN MASIH DIPROSES',
      value: totalProcessingAll,
      formattedValue: `${totalProcessingAll} Item`,
      comparisonText: 'Dalam Antrean / Proses',
      iconType: 'flame',
    },
    averageCompletionTime: {
      label: 'RATA-RATA WAKTU SELESAI',
      value: overallAvgSec,
      formattedValue: formatDuration(overallAvgSec),
      comparisonText: 'Kecepatan Pelayanan Tim',
      iconType: 'timer',
    },
    topPerformer: {
      label: 'STAF PALING PRODUKTIF',
      formattedValue: tableRows.length > 0 ? `${tableRows[0].staffName}` : '-',
      iconType: 'award',
    },
  };

  const periodLabelMap = {
    today: 'Hari Ini',
    '7days': '7 Hari Terakhir',
    '30days': '30 Hari Terakhir',
    thisMonth: 'Bulan Ini',
    custom: 'Rentang Kustom',
  };

  return {
    periodKey: periodId,
    periodLabel: periodLabelMap[periodId] || periodId,
    dateRangeText: periodLabelMap[periodId] || periodId,
    kpi,
    staffPerformanceTable: tableRows,
    activeStaffCount: activeStaffSet.size || staffUsers.length,
    availableStaffList: staffUsers.map((u) => ({ id: u.id, name: formatStaffName(u.name), role: u.role })),
  };
}
